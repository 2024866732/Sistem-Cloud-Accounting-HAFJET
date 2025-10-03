import mongoose, { Schema, Document } from 'mongoose';

export interface IReconciliationMatch {
  ledgerEntryId?: mongoose.Types.ObjectId; // optional until ledger entry exists
  bankTxnId?: string;                       // external bank transaction identifier
  amount: number;                           // matched amount
  status: 'proposed' | 'confirmed' | 'rejected';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUnmatchedItem {
  refId: string;                // ledgerEntryId or bankTxnId placeholder
  type: 'ledger' | 'bank';
  description?: string;
  amount: number;
  date?: Date;
}

export interface IReconciliationSession extends Document {
  companyId: mongoose.Types.ObjectId;
  bankAccountRef: string;          // placeholder until BankAccount model
  accountCode?: string;            // GL account (e.g., 1000 Cash)
  period?: string;                 // YYYY-MM convenience
  dateFrom: Date;
  dateTo: Date;
  status: 'open' | 'in_progress' | 'completed' | 'archived';
  openingBalance?: number;
  closingBalance?: number;
  systemBalance?: number;          // computed from ledger
  differences?: number;            // system vs bank
  matches: IReconciliationMatch[];
  unmatched: IUnmatchedItem[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  finalizedBy?: mongoose.Types.ObjectId;
  finalizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReconciliationMatchSchema = new Schema<IReconciliationMatch>({
  ledgerEntryId: { type: Schema.Types.ObjectId, ref: 'LedgerEntry' },
  bankTxnId: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['proposed', 'confirmed', 'rejected'], default: 'proposed' },
  notes: { type: String }
}, { timestamps: true, _id: false });

const UnmatchedItemSchema = new Schema<IUnmatchedItem>({
  refId: { type: String, required: true },
  type: { type: String, enum: ['ledger', 'bank'], required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date }
}, { _id: false });

const ReconciliationSessionSchema = new Schema<IReconciliationSession>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  bankAccountRef: { type: String, required: true, index: true },
  accountCode: { type: String },
  period: { type: String, index: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'archived'], default: 'open', index: true },
  openingBalance: { type: Number },
  closingBalance: { type: Number },
  systemBalance: { type: Number },
  differences: { type: Number },
  matches: { type: [ReconciliationMatchSchema], default: [] },
  unmatched: { type: [UnmatchedItemSchema], default: [] },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  finalizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  finalizedAt: { type: Date }
}, { timestamps: true });

ReconciliationSessionSchema.index({ companyId: 1, bankAccountRef: 1, dateFrom: 1, dateTo: 1 });

export const ReconciliationSession = mongoose.model<IReconciliationSession>('ReconciliationSession', ReconciliationSessionSchema);
export default ReconciliationSession;