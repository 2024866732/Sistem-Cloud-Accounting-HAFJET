import mongoose from 'mongoose';
import { Receipt } from '../models/Receipt.js';
import { LedgerEntry, ILedgerEntry, ILedgerSplit } from '../models/LedgerEntry.js';

// Temporary chart of accounts mapping (should be centralized later)
const Accounts = {
  Cash: '1000',
  Bank: '1010',
  AccountsPayable: '2000',
  SSTInput: '2105',
  ExpenseGeneric: '6000',
  ExpenseMeals: '6010',
  ExpenseFuel: '6020',
  ExpenseSupplies: '6030'
};

function pickExpenseAccount(category?: string) {
  if (!category) return { code: Accounts.ExpenseGeneric, name: 'Expense' };
  const c = category.toLowerCase();
  if (c.includes('fuel')) return { code: Accounts.ExpenseFuel, name: 'Fuel Expense' };
  if (c.includes('meal') || c.includes('entertain')) return { code: Accounts.ExpenseMeals, name: 'Meals & Entertainment' };
  if (c.includes('suppl')) return { code: Accounts.ExpenseSupplies, name: 'Supplies' };
  return { code: Accounts.ExpenseGeneric, name: 'Expense' };
}

export class ReceiptPostingService {
  private static period(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  static async postFromReceipt(receiptId: string, userId: string) {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) throw new Error('Receipt not found');
    if (!['approved','review_pending'].includes(receipt.status)) throw new Error('Receipt not approved or ready for posting');
    if (!receipt.grossAmount) throw new Error('Receipt missing grossAmount');

    const date = receipt.documentDate || receipt.createdAt;
    const expenseAcct = pickExpenseAccount(receipt.category);
    const gross = receipt.grossAmount;
    const tax = receipt.taxAmount || 0;
    const net = receipt.netAmount || (gross - tax);

    // Splits: Debit Expense (net), Debit Tax Input (tax), Credit Cash/Bank (gross)
    const splits: ILedgerSplit[] = [];
    if (net > 0) {
      splits.push({ accountCode: expenseAcct.code, accountName: expenseAcct.name, type: 'debit', amount: +net.toFixed(2) });
    }
    if (tax > 0) {
      splits.push({ accountCode: Accounts.SSTInput, accountName: 'SST Input Tax', type: 'debit', amount: +tax.toFixed(2), taxCode: 'SST', taxAmount: +tax.toFixed(2) });
    }
    splits.push({ accountCode: Accounts.Cash, accountName: 'Cash', type: 'credit', amount: +gross.toFixed(2) });

    const receiptIdStr = (receipt._id as unknown as mongoose.Types.ObjectId).toString();
    const entry: Partial<ILedgerEntry> = {
      companyId: receipt.companyId,
      sourceType: 'adjustment',
      sourceId: receiptIdStr,
      reference: `RCPT-${receiptIdStr.slice(-6)}`,
      description: `Receipt ${receipt.vendorName || receipt.originalFilename}`,
      date,
      period: this.period(date),
      splits,
      totalDebit: 0,
      totalCredit: 0,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
      meta: { origin: 'receipt.auto', version: 1 }
    } as any;

    const ledger = await LedgerEntry.create(entry);
  receipt.relatedLedgerEntryId = ledger._id as unknown as mongoose.Types.ObjectId;
    receipt.status = 'approved';
    await receipt.save();
    return { receipt, ledger };
  }
}

export const receiptPostingService = ReceiptPostingService;
export default ReceiptPostingService;