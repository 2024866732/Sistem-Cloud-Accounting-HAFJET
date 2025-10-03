import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PosSalesPostingService from '../services/PosSalesPostingService';
import { LedgerEntry } from '../models/LedgerEntry';
import PosSale from '../models/PosSale';

jest.mock('../models/LedgerEntry', () => ({
  LedgerEntry: {
    create: jest.fn(async (doc: any) => {
      const debit = doc.splits.filter((s: any) => s.type === 'debit').reduce((a: number, b: any) => a + b.amount, 0);
      const credit = doc.splits.filter((s: any) => s.type === 'credit').reduce((a: number, b: any) => a + b.amount, 0);
      return { ...doc, totalDebit: debit, totalCredit: credit, _id: 'ledger-mock' };
    })
  }
}));

jest.mock('../models/PosSale', () => ({
  __esModule: true,
  default: {
    find: jest.fn(async (q: any) => []),
    updateMany: jest.fn(async () => ({ modifiedCount: 0 }))
  }
}));

const mockedPosSale: any = PosSale;

describe('PosSalesPostingService.postDaily', () => {
  const companyId = '000000000000000000000001';
  const userId = '000000000000000000000002';
  const businessDate = '2025-10-03';

  beforeEach(() => {
    (LedgerEntry.create as jest.Mock).mockClear();
    mockedPosSale.find.mockClear();
    mockedPosSale.updateMany.mockClear();
  });

  it('throws when no unposted sales', async () => {
    mockedPosSale.find.mockResolvedValueOnce([]);
    await expect(PosSalesPostingService.postDaily({ companyId, userId, businessDate })).rejects.toThrow('No unposted');
  });

  it('aggregates sale + refund into balanced entry (positive net)', async () => {
    // Sale: gross 100, discount 10, tax 6, net 96
    // Refund: values negative (gross -40, discount -0, tax -2.4, net -42.4)
    mockedPosSale.find.mockResolvedValueOnce([
      { _id: 's1', type: 'sale', totalGross: 100, totalDiscount: 10, totalTax: 6, totalNet: 96 },
      { _id: 's2', type: 'refund', totalGross: -40, totalDiscount: 0, totalTax: -2.4, totalNet: -42.4 }
    ]);

    mockedPosSale.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

    const result = await PosSalesPostingService.postDaily({ companyId, userId, businessDate, status: 'draft' });
    expect(result.counts.sales).toBe(1);
    expect(result.counts.refunds).toBe(1);
    expect(result.totals.gross).toBe(60); // 100 + (-40)
    expect(result.totals.tax).toBe(3.6); // 6 + (-2.4)
    expect(result.totals.net).toBeCloseTo(53.6); // 96 + (-42.4)

    const arg: any = (LedgerEntry.create as jest.Mock).mock.calls[0][0];
    // Expect splits: debit cash 53.6, credit revenue 50, credit tax 3.6
    const debit = arg.splits.filter((s: any) => s.type === 'debit').reduce((a: number, b: any) => a + b.amount, 0);
    const credit = arg.splits.filter((s: any) => s.type === 'credit').reduce((a: number, b: any) => a + b.amount, 0);
    expect(debit).toBeCloseTo(53.6);
    expect(credit).toBeCloseTo(53.6);
    const revenueSplit = arg.splits.find((s: any) => s.accountCode === '4000');
    expect(revenueSplit.amount).toBe(50); // (gross - discount) = (60 - 10)
  });

  it('handles negative net day (refund heavy)', async () => {
    // Sale small, refund large -> net negative
    mockedPosSale.find.mockResolvedValueOnce([
      { _id: 's1', type: 'sale', totalGross: 50, totalDiscount: 0, totalTax: 3, totalNet: 53 },
      { _id: 's2', type: 'refund', totalGross: -120, totalDiscount: 0, totalTax: -7.2, totalNet: -127.2 }
    ]);

    mockedPosSale.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

    const result = await PosSalesPostingService.postDaily({ companyId, userId, businessDate });
    expect(result.totals.net).toBeCloseTo(-74.2);
    const arg: any = (LedgerEntry.create as jest.Mock).mock.calls[0][0];
    // Expect debit revenue + debit tax, credit cash
    const revenueDebit = arg.splits.find((s: any) => s.accountCode === '4000' && s.type === 'debit');
    expect(revenueDebit).toBeTruthy();
    const cashCredit = arg.splits.find((s: any) => s.accountCode === '1000' && s.type === 'credit');
    expect(cashCredit.amount).toBeCloseTo(74.2);
  });
});
