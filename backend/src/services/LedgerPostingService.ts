import { LedgerEntry, ILedgerEntry, ILedgerSplit } from '../models/LedgerEntry.js';
import mongoose from 'mongoose';

interface PostInvoiceOptions {
  companyId: string;
  userId: string;
  invoice: {
    _id?: string;
    invoiceNumber?: string;
    customerName?: string;
    currency?: string;
    subtotal: number;
    taxAmount?: number;
    total: number;
    date?: string | Date;
  };
  status?: 'draft' | 'posted';
}

// Temporary simple chart mapping (to be externalized later)
const Accounts = {
  AccountsReceivable: '1100',
  Revenue: '4000',
  SSTOutput: '2100',
  Cash: '1000'
};

export class LedgerPostingService {
  // Build period string YYYY-MM
  private static period(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  static async postInvoice(opts: PostInvoiceOptions) {
    const { companyId, userId, invoice, status = 'draft' } = opts;
    const date = invoice.date ? new Date(invoice.date) : new Date();

    // Splits: Debit A/R, Credit Revenue (+ tax liability)
    const splits: ILedgerSplit[] = [];

    // Debit Accounts Receivable for total
    splits.push({
      accountCode: Accounts.AccountsReceivable,
      accountName: 'Accounts Receivable',
      type: 'debit',
      amount: invoice.total,
    });

    // Credit Revenue for subtotal
    splits.push({
      accountCode: Accounts.Revenue,
      accountName: 'Revenue',
      type: 'credit',
      amount: invoice.subtotal,
    });

    // If tax present, credit Output Tax
    if (invoice.taxAmount && invoice.taxAmount > 0) {
      splits.push({
        accountCode: Accounts.SSTOutput,
        accountName: 'SST Output Tax',
        type: 'credit',
        amount: invoice.taxAmount,
        taxCode: 'SST',
        taxAmount: invoice.taxAmount,
      });
    }

    // Persist entry
    const entry: Partial<ILedgerEntry> = {
      companyId: new mongoose.Types.ObjectId(companyId),
      sourceType: 'invoice',
      sourceId: invoice._id,
      reference: invoice.invoiceNumber,
      description: `Invoice ${invoice.invoiceNumber || ''} for ${invoice.customerName || 'customer'}`.trim(),
      date,
      period: this.period(date),
      splits,
      totalDebit: 0, // will be computed by pre-validate
      totalCredit: 0,
      status,
      createdBy: new mongoose.Types.ObjectId(userId),
      meta: { version: 1 }
    } as any;

    return LedgerEntry.create(entry);
  }
}

// TODO: Add transactional guarantees (two-phase commit or outbox pattern) for ledger posting
// TODO: Externalize accounts mapping to Chart of Accounts service; handle currency conversions

export default LedgerPostingService;