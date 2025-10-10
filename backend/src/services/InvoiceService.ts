import fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Invoice, CreateInvoicePayload, InvoiceItem } from '../models/Invoice';

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const DATA_DIR = join(process.cwd(), 'backend-data');
const INVOICES_FILE = join(DATA_DIR, 'invoices.json');

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function readAll(): Promise<Invoice[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(INVOICES_FILE, 'utf-8');
    return JSON.parse(raw) as Invoice[];
  } catch (e) {
    return [];
  }
}

async function writeAll(items: Invoice[]) {
  await ensureDataDir();
  await writeFile(INVOICES_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function calcLine(it: InvoiceItem) {
  const quantity = Number(it.quantity || 0);
  const unitPrice = Number(it.unitPrice || 0);
  const amount = +(quantity * unitPrice);
  const taxRate = Number(it.taxRate || 0);
  const taxAmount = +(amount * taxRate);
  return { ...it, amount, taxAmount } as InvoiceItem;
}

function calcTotals(items: InvoiceItem[]) {
  const lines = items.map(calcLine);
  const subtotal = +lines.reduce((s, l) => s + (l.amount || 0), 0).toFixed(2);
  const taxAmount = +lines.reduce((s, l) => s + (l.taxAmount || 0), 0).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);
  const taxRate = subtotal ? +(taxAmount / subtotal) : 0;
  return { lines, subtotal, taxAmount, total, taxRate };
}

class InvoiceService {
  async list(page = 1, limit = 20) {
    const all = await readAll();
    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);
    return {
      data: paged,
      pagination: {
        total: all.length,
        page,
        limit,
        pages: Math.ceil(all.length / limit) || 1
      }
    };
  }

  async get(id: string) {
    const all = await readAll();
    return all.find(i => i.id === id) || null;
  }

  private generateInvoiceNumber(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `INV${year}${month}${seq}`;
  }

  async create(payload: CreateInvoicePayload, opts?: { userId?: string; companyId?: string }) {
    const { lines, subtotal, taxAmount, total, taxRate } = calcTotals(payload.items || []);
    const now = new Date().toISOString();
    const inv: Invoice = {
      id: randomUUID(),
      invoiceNumber: this.generateInvoiceNumber(),
      customerName: payload.customerName || 'Unnamed Customer',
      customerEmail: payload.customerEmail || '',
      issueDate: now.split('T')[0],
      dueDate: payload.dueDate || now.split('T')[0],
      status: 'draft',
      currency: payload.currency || 'MYR',
      items: lines,
      subtotal,
      taxAmount,
      total,
      malaysianTax: {
        taxType: taxAmount > 0 ? 'SST' : 'NONE',
        taxRate: +(taxRate || 0),
        taxableAmount: subtotal,
        taxAmount,
        exemptAmount: 0,
        sstNumber: taxAmount > 0 ? `SST-${Math.floor(Math.random() * 90000000) + 10000000}` : ''
      },
      einvoice: { status: 'pending', submissionDate: null, uuid: null },
      createdAt: now,
      updatedAt: now
    };

    const all = await readAll();
    all.unshift(inv);
    await writeAll(all);
    return inv;
  }

  async update(id: string, patch: Partial<Invoice>) {
    const all = await readAll();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const existing = all[idx];
    const merged: Invoice = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    } as Invoice;

    // If items changed, recalc totals
    if (patch.items) {
      const { lines, subtotal, taxAmount, total, taxRate } = calcTotals(patch.items as InvoiceItem[]);
      merged.items = lines;
      merged.subtotal = subtotal;
      merged.taxAmount = taxAmount;
      merged.total = total;
      merged.malaysianTax = {
        taxType: taxAmount > 0 ? 'SST' : 'NONE',
        taxRate,
        taxableAmount: subtotal,
        taxAmount,
        exemptAmount: 0,
        sstNumber: merged.malaysianTax?.sstNumber || (taxAmount > 0 ? `SST-${Math.floor(Math.random() * 90000000) + 10000000}` : '')
      };
    }

    all[idx] = merged;
    await writeAll(all);
    return merged;
  }

  async patch(id: string, patch: Partial<Invoice>) {
    // Alias for update that accepts partial patches and preserves fields
    return this.update(id, patch);
  }

  async delete(id: string) {
    const all = await readAll();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const [removed] = all.splice(idx, 1);
    await writeAll(all);
    return removed;
  }

  async upsertEinvoice(id: string, einvoice: Partial<Invoice['einvoice']>) {
    const all = await readAll();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return null;
    all[idx].einvoice = { ...all[idx].einvoice, ...einvoice } as any;
    all[idx].updatedAt = new Date().toISOString();
    await writeAll(all);
    return all[idx];
  }
}

export default new InvoiceService();
