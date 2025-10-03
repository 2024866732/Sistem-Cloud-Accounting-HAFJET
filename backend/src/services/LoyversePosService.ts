import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/config';
import PosSale, { IPosSale } from '../models/PosSale';
import MetricsService from './MetricsService';
import PosSyncState from '../models/PosSyncState';
import StoreLocation from '../models/StoreLocation';
import NotificationService from './NotificationService';

interface RawLoyverseSaleItem {
  line: number;
  sku?: string;
  name: string;
  qty: number;
  price: number; // unit price
  discount?: number;
  tax?: number;
  category?: string;
}

interface RawLoyverseSale {
  id: string;
  store_id: string;
  store_name?: string;
  currency?: string;
  datetime: string; // ISO
  items: RawLoyverseSaleItem[];
  refund?: boolean;
  original_sale_id?: string; // if refund
}

export class LoyversePosService {
  private apiKey?: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.LOYVERSE_API_KEY;
    this.apiUrl = config.LOYVERSE_API_URL || 'https://api.loyverse.com';
  }

  isEnabled() { return !!this.apiKey; }

  private async fetchRecentRawSales(_companyId: string, _since?: Date): Promise<RawLoyverseSale[]> {
    if (!this.apiKey) return [];
    // For now: return mock payload; real call would use axios.get with Authorization header
    const now = new Date();
    return [
      {
        id: 'SAMPLE_SALE_1',
        store_id: 'STORE_A',
        store_name: 'Main Store',
        currency: 'MYR',
        datetime: now.toISOString(),
        items: [
          { line: 1, name: 'Item A', qty: 2, price: 10.0, tax: 1.2 },
          { line: 2, name: 'Item B', qty: 1, price: 5.0, discount: 0.5, tax: 0.3 }
        ]
      },
      {
        id: 'REFUND_1',
        store_id: 'STORE_A',
        store_name: 'Main Store',
        currency: 'MYR',
        datetime: now.toISOString(),
        refund: true,
        original_sale_id: 'SAMPLE_SALE_1',
        items: [
          { line: 1, name: 'Item A', qty: 1, price: 10.0, tax: 0.6 }
        ]
      }
    ];
  }

  private async upsertStore(companyId: string, raw: RawLoyverseSale): Promise<string | undefined> {
    if (!raw.store_id) return undefined;
    const existing = await StoreLocation.findOne({ companyId, externalId: raw.store_id });
    if (existing) return String(existing._id);
    const created = await StoreLocation.create({ companyId, externalId: raw.store_id, name: raw.store_name || raw.store_id, currency: raw.currency || 'MYR' });
    return String(created._id);
  }

  private normalize(raw: RawLoyverseSale, companyId: string, storeLocationId?: string) {
    const saleDate = new Date(raw.datetime);
    const businessDate = new Date(Date.UTC(saleDate.getUTCFullYear(), saleDate.getUTCMonth(), saleDate.getUTCDate()));
    let totalGross = 0, totalDiscount = 0, totalTax = 0;
    const items = raw.items.map(i => {
      const gross = i.qty * i.price;
      totalGross += gross;
      const discount = i.discount || 0;
      totalDiscount += discount;
      const tax = i.tax || 0;
      totalTax += tax;
      const net = gross - discount + tax;
      return {
        lineNumber: i.line,
        sku: i.sku,
        description: i.name,
        quantity: i.qty,
        unitPrice: i.price,
        grossAmount: +gross.toFixed(2),
        discountAmount: discount ? +discount.toFixed(2) : undefined,
        taxAmount: tax ? +tax.toFixed(2) : undefined,
        netAmount: +net.toFixed(2),
        category: i.category
      };
    });
    let totalNet = totalGross - totalDiscount + totalTax;
    let type: 'sale' | 'refund' = 'sale';
    if (raw.refund) {
      type = 'refund';
      // Invert monetary values for refunds
      totalGross = -totalGross;
      if (totalDiscount) totalDiscount = -totalDiscount;
      if (totalTax) totalTax = -totalTax;
      totalNet = -totalNet;
      for (const it of items) {
        it.grossAmount = -it.grossAmount;
        if (it.discountAmount) it.discountAmount = -it.discountAmount;
        if (it.taxAmount) it.taxAmount = -it.taxAmount;
        if (it.netAmount) it.netAmount = -it.netAmount;
        it.quantity = -Math.abs(it.quantity);
      }
    }
    const hashSource = JSON.stringify({ id: raw.id, companyId, totalGross, items: items.length });
    const hash = crypto.createHash('sha256').update(hashSource).digest('hex');
    return {
      companyId,
      storeLocationId,
      externalId: raw.id,
      type,
      originalSaleExternalId: raw.refund ? raw.original_sale_id : undefined,
      businessDate,
      saleDateTime: saleDate,
      currency: raw.currency || 'MYR',
      totalGross: +totalGross.toFixed(2),
      totalDiscount: totalDiscount ? +totalDiscount.toFixed(2) : undefined,
      totalTax: totalTax ? +totalTax.toFixed(2) : undefined,
      totalNet: +totalNet.toFixed(2),
      items,
      status: 'normalized',
      hash,
      meta: { source: 'loyverse', refund: raw.refund || false }
    };
  }

  async syncRecentSales(companyId: string, options?: { full?: boolean }) {
    if (!this.isEnabled()) throw new Error('Loyverse integration disabled');
    // Load or create sync state
    const beforeErrors = MetricsService.snapshot().counters['pos.sync.errors'] || 0;
    let state = await PosSyncState.findOne({ companyId, provider: 'loyverse' });
    const since = options?.full ? undefined : state?.lastSyncAt;
    const rawSales = await this.fetchRecentRawSales(companyId, since);
    const results: { created: number; skipped: number; errors: number; } = { created: 0, skipped: 0, errors: 0 };
    MetricsService.inc('pos.sync.runs');
    MetricsService.inc(options?.full ? 'pos.sync.full_runs' : 'pos.sync.incremental_runs');
    for (const raw of rawSales) {
      try {
        // dedupe by externalId
        const exists = await PosSale.findOne({ companyId, externalId: raw.id });
        if (exists) { results.skipped++; MetricsService.inc('pos.sync.skipped'); continue; }
        const storeLocationId = await this.upsertStore(companyId, raw);
        const normalized = this.normalize(raw, companyId, storeLocationId);
        await PosSale.create(normalized as any);
        results.created++; MetricsService.inc('pos.sync.created');
      } catch (err) {
        results.errors++; MetricsService.inc('pos.sync.errors');
      }
    }
    const afterErrors = MetricsService.snapshot().counters['pos.sync.errors'] || 0; // since we haven't yet mutated snapshot when we took before.
    const delta = afterErrors - beforeErrors;
    if (config.POS_SYNC_ERROR_ALERT_THRESHOLD && delta >= config.POS_SYNC_ERROR_ALERT_THRESHOLD && delta > 0) {
      try {
        await NotificationService.sendCompanyNotification(companyId, {
          type: 'system_alert',
            title: 'POS Sync Error Spike',
            message: `Detected ${delta} POS sync errors in latest run (threshold ${config.POS_SYNC_ERROR_ALERT_THRESHOLD}). Investigate Loyverse integration or network issues.`,
            priority: delta >= config.POS_SYNC_ERROR_ALERT_THRESHOLD * 2 ? 'high' : 'medium',
            companyId,
            data: { delta, threshold: config.POS_SYNC_ERROR_ALERT_THRESHOLD, totalErrors: afterErrors }
        });
      } catch (alertErr) {
        console.error('Failed to create POS sync error spike notification', alertErr);
      }
    }
    const now = new Date();
    if (!state) {
      state = await PosSyncState.create({ companyId, provider: 'loyverse', lastSyncAt: now, meta: { version: 1 } });
    } else {
      state.lastSyncAt = now;
      await state.save();
    }
    return { ...results, syncState: { lastSyncAt: state.lastSyncAt } };
  }
}

export const loyversePosService = new LoyversePosService();
export default loyversePosService;
