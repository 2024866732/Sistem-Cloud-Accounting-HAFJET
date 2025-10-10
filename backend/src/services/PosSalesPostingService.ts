import mongoose from 'mongoose';
import PosSale from '../models/PosSale.js';
import { LedgerEntry, ILedgerSplit } from '../models/LedgerEntry.js';
import MetricsService from './MetricsService.js';

interface PostDailyPosOptions {
  companyId: string;
  userId: string;
  businessDate: string; // YYYY-MM-DD
  storeLocationId?: string;
  status?: 'draft' | 'posted';
}

interface PostDailyResult {
  ledgerEntryId: string;
  businessDate: string;
  storeLocationId?: string;
  counts: { sales: number; refunds: number; total: number };
  totals: { gross: number; discount: number; tax: number; net: number };
}

// Simple account map (reuse existing codes from LedgerPostingService conventions)
const Accounts = {
  Cash: '1000',
  Revenue: '4000',
  SSTOutput: '2100'
};

export class PosSalesPostingService {
  static async postDaily(opts: PostDailyPosOptions): Promise<PostDailyResult> {
    const { companyId, userId, businessDate, storeLocationId, status = 'posted' } = opts;

    const dateObj = new Date(businessDate + 'T00:00:00.000Z');
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid businessDate');
    }

    const match: any = {
      companyId: new mongoose.Types.ObjectId(companyId),
      businessDate: dateObj,
      status: 'normalized'
    };
    if (storeLocationId) {
      match.storeLocationId = new mongoose.Types.ObjectId(storeLocationId);
    }

    const sales = await PosSale.find(match);
    if (sales.length === 0) {
      throw new Error('No unposted normalized POS sales for given criteria');
    }

    // Aggregate
    let gross = 0, discount = 0, tax = 0, net = 0;
    let salesCount = 0, refundCount = 0;
    for (const s of sales) {
      if (s.type === 'refund') refundCount++; else salesCount++;
      gross += s.totalGross || 0;
      discount += s.totalDiscount || 0;
      tax += s.totalTax || 0;
      net += s.totalNet || 0;
    }

    // Build splits dynamically to support negative net days
    // Normal (net > 0): Dr Cash (net) | Cr Revenue (gross-discount) | Cr Tax (tax) 
    // Negative day (net < 0): Dr Revenue (abs(gross-discount)) | Dr Tax (abs(tax)) | Cr Cash (abs(net))
    const revenuePortion = gross - discount; // could be negative if dominated by refunds

    const splits: ILedgerSplit[] = [];
    if (net >= 0) {
      // Debit Cash
      splits.push({ accountCode: Accounts.Cash, accountName: 'Cash / Undeposited Funds', type: 'debit', amount: Math.abs(net) });
      // Credit Revenue (can be zero/negative theoretically; guard)
      if (revenuePortion !== 0) {
        const revAmount = Math.abs(revenuePortion);
        splits.push({ accountCode: Accounts.Revenue, accountName: 'Sales Revenue', type: 'credit', amount: revAmount });
      }
      if (tax !== 0) {
        splits.push({ accountCode: Accounts.SSTOutput, accountName: 'SST Output Tax', type: 'credit', amount: Math.abs(tax), taxCode: 'SST', taxAmount: Math.abs(tax) });
      }
    } else {
      // Negative day (net < 0) treat as net outflow (refund heavy)
      // Debit Revenue reversal
      if (revenuePortion !== 0) {
        splits.push({ accountCode: Accounts.Revenue, accountName: 'Sales Revenue (Return)', type: 'debit', amount: Math.abs(revenuePortion) });
      }
      if (tax !== 0) {
        splits.push({ accountCode: Accounts.SSTOutput, accountName: 'SST Output Tax (Return)', type: tax > 0 ? 'debit' : 'debit', amount: Math.abs(tax), taxCode: 'SST', taxAmount: Math.abs(tax) });
      }
      // Credit Cash for amount paid out
      splits.push({ accountCode: Accounts.Cash, accountName: 'Cash / Undeposited Funds', type: 'credit', amount: Math.abs(net) });
    }

    // Balance validation
    const debit = splits.filter(s => s.type === 'debit').reduce((a, b) => a + b.amount, 0);
    const credit = splits.filter(s => s.type === 'credit').reduce((a, b) => a + b.amount, 0);
    if (debit !== credit) {
      throw new Error(`Unbalanced POS posting: debit ${debit} != credit ${credit}`);
    }

    const entry = await LedgerEntry.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      sourceType: 'pos_daily',
      sourceId: `${businessDate}${storeLocationId ? ':' + storeLocationId : ''}`,
      reference: `POS-${businessDate}${storeLocationId ? '-' + storeLocationId : ''}`,
      description: `Daily POS posting ${businessDate}${storeLocationId ? ' store ' + storeLocationId : ''}`,
      date: dateObj,
      period: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2,'0')}`,
      splits,
      totalDebit: 0,
      totalCredit: 0,
      status,
      createdBy: new mongoose.Types.ObjectId(userId),
      meta: { version: 1, posAggregation: { gross, discount, tax, net, salesCount, refundCount } }
    } as any);

  // Update PosSales to posted
    const ledgerEntryId = (entry as any)._id;
    await PosSale.updateMany({ _id: { $in: sales.map(s => s._id) } }, { $set: { status: 'posted', ledgerEntryId } });

  // Metrics
  MetricsService.inc('pos.post.success');
  if (net < 0) MetricsService.inc('pos.post.negative_day');

    return {
      ledgerEntryId: String(ledgerEntryId),
      businessDate,
      storeLocationId,
      counts: { sales: salesCount, refunds: refundCount, total: sales.length },
      totals: { gross, discount, tax, net }
    };
  }
}

export default PosSalesPostingService;
