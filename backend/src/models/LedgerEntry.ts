import mongoose, { Schema, Document } from 'mongoose';

export interface ILedgerSplit {
  accountCode: string;            // e.g. 4000 (Revenue), 5000 (COGS), 1000 (Cash)
  accountName?: string;           // cached friendly name
  type: 'debit' | 'credit';       // posting direction
  amount: number;                 // positive numeric amount (MYR base)
  currency?: string;              // original currency
  fxRate?: number;                // applied rate to convert to MYR
  amountMYR?: number;             // normalized base amount
  taxCode?: string;               // e.g. SST6, WHT10
  taxAmount?: number;             // tax portion if this line represents tax
  meta?: Record<string, any>;
}

export interface ILedgerEntry extends Document {
  companyId: mongoose.Types.ObjectId;
  sourceType: 'invoice' | 'payment' | 'bank_sync' | 'adjustment' | 'einvoice' | 'reconciliation' | 'pos_daily';
  sourceId?: string;               // reference to document id (Invoice._id, etc.)
  reference?: string;              // human readable reference (INV-2025-0001)
  description: string;
  date: Date;                      // posting date
  period: string;                  // YYYY-MM (for fast aggregation)
  splits: ILedgerSplit[];          // must balance (sum debits = sum credits)
  totalDebit: number;
  totalCredit: number;
  currency?: string;               // primary currency of source
  status: 'draft' | 'posted' | 'reversed';
  reversalOf?: mongoose.Types.ObjectId; // if this entry reverses another
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];                 // audit/categorization
  meta?: Record<string, any>;      // flexible additional data
}

const LedgerSplitSchema = new Schema<ILedgerSplit>({
  accountCode: { type: String, required: true, index: true },
  accountName: { type: String },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String },
  fxRate: { type: Number },
  amountMYR: { type: Number },
  taxCode: { type: String },
  taxAmount: { type: Number, min: 0 },
  meta: { type: Schema.Types.Mixed }
}, { _id: false })

const LedgerEntrySchema = new Schema<ILedgerEntry>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  sourceType: { type: String, enum: ['invoice', 'payment', 'bank_sync', 'adjustment', 'einvoice', 'reconciliation', 'pos_daily'], required: true, index: true },
  sourceId: { type: String, index: true },
  reference: { type: String, index: true },
  description: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  period: { type: String, required: true, index: true },
  splits: { type: [LedgerSplitSchema], validate: [(arr: ILedgerSplit[]) => arr.length > 0, 'At least one split required'] },
  totalDebit: { type: Number, required: true, min: 0 },
  totalCredit: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'MYR' },
  status: { type: String, enum: ['draft', 'posted', 'reversed'], default: 'draft', index: true },
  reversalOf: { type: Schema.Types.ObjectId, ref: 'LedgerEntry' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: { type: [String], index: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true })

// Compound indexes for reporting speed
LedgerEntrySchema.index({ companyId: 1, period: 1, status: 1 })
LedgerEntrySchema.index({ companyId: 1, accountCode: 1, date: 1 }, { name: 'company_account_date', partialFilterExpression: { status: 'posted' } })
// Quick source trace
LedgerEntrySchema.index({ companyId: 1, sourceType: 1, sourceId: 1 })

// Pre-validate balancing rule
LedgerEntrySchema.pre('validate', function(next) {
  const entry = this as ILedgerEntry
  const debit = entry.splits.filter(s => s.type === 'debit').reduce((a, b) => a + b.amount, 0)
  const credit = entry.splits.filter(s => s.type === 'credit').reduce((a, b) => a + b.amount, 0)
  entry.totalDebit = debit
  entry.totalCredit = credit
  if (debit !== credit) {
    return next(new Error('Ledger entry not balanced: debit != credit'))
  }
  return next()
})

export const LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema)
