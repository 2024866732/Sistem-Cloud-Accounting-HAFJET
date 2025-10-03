import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import LedgerPostingService from '../services/LedgerPostingService';
import { LedgerEntry } from '../models/LedgerEntry';

jest.mock('../models/LedgerEntry', () => {
  return {
    LedgerEntry: {
      create: jest.fn(async (doc: any) => {
        // Simulate pre-validate balancing (what schema hook would do)
        const debit = doc.splits.filter((s: any) => s.type === 'debit').reduce((a: number, b: any) => a + b.amount, 0)
        const credit = doc.splits.filter((s: any) => s.type === 'credit').reduce((a: number, b: any) => a + b.amount, 0)
        return { ...doc, totalDebit: debit, totalCredit: credit, _id: 'mock-id' }
      })
    }
  }
});

describe('LedgerPostingService.postInvoice', () => {
  const baseInvoice = {
    _id: 'INV001',
    invoiceNumber: 'INV001',
    customerName: 'Customer A',
    subtotal: 1000,
    taxAmount: 60,
    total: 1060,
    currency: 'MYR',
    date: new Date().toISOString().split('T')[0]
  };

  beforeEach(() => {
    (LedgerEntry.create as jest.Mock).mockClear();
  });

  it('creates balanced entry with tax split when taxAmount > 0', async () => {
    const result = await LedgerPostingService.postInvoice({
      companyId: '000000000000000000000001',
      userId: '000000000000000000000002',
      invoice: baseInvoice,
      status: 'draft'
    });

    expect(LedgerEntry.create).toHaveBeenCalledTimes(1);
  const arg: any = (LedgerEntry.create as jest.Mock).mock.calls[0][0];
    expect(arg.splits).toHaveLength(3); // AR, Revenue, Tax
    const debit = arg.splits.filter((s: any) => s.type === 'debit').reduce((a: number, b: any) => a + b.amount, 0);
    const credit = arg.splits.filter((s: any) => s.type === 'credit').reduce((a: number, b: any) => a + b.amount, 0);
    expect(debit).toBe(1060);
    expect(credit).toBe(1060);
    expect(result.totalDebit).toBe(1060);
    expect(result.totalCredit).toBe(1060);
  });

  it('creates balanced entry without tax split when taxAmount = 0', async () => {
    const invoiceNoTax = { ...baseInvoice, _id: 'INV002', invoiceNumber: 'INV002', taxAmount: 0, total: 1000 };
    const result = await LedgerPostingService.postInvoice({
      companyId: '000000000000000000000001',
      userId: '000000000000000000000002',
      invoice: invoiceNoTax,
      status: 'posted'
    });
  const arg: any = (LedgerEntry.create as jest.Mock).mock.calls[0][0];
    expect(arg.status).toBe('posted');
    expect(arg.splits).toHaveLength(2); // AR, Revenue only
    const debit = arg.splits.filter((s: any) => s.type === 'debit').reduce((a: number, b: any) => a + b.amount, 0);
    const credit = arg.splits.filter((s: any) => s.type === 'credit').reduce((a: number, b: any) => a + b.amount, 0);
    expect(debit).toBe(1000);
    expect(credit).toBe(1000);
    expect(result.totalDebit).toBe(1000);
    expect(result.totalCredit).toBe(1000);
  });
});
