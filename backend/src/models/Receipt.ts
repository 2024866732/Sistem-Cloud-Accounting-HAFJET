import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptExtractionField {
  key: string;              // field name (vendor, total, tax, etc.)
  value: any;               // extracted value
  confidence?: number;      // 0..1
  source?: string;          // ocr | ai | rule
}

export interface IReceipt extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;        // uploader
  originalFilename: string;
  storagePath: string;                     // where file is stored (local or cloud key)
  mimeType: string;
  size: number;
  hash?: string;                           // file hash for dedupe
  status: 'uploaded' | 'ocr_processed' | 'classified' | 'review_pending' | 'approved' | 'posted' | 'error';
  errorMessage?: string;
  vendorName?: string;
  documentDate?: Date;
  currency?: string;
  grossAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  category?: string;                       // expense category guess
  type?: 'expense' | 'income' | 'refund' | 'other';
  extractedText?: string;                  // raw OCR text
  extractionFields?: IReceiptExtractionField[];
  relatedLedgerEntryId?: mongoose.Types.ObjectId;
  ocrProvider?: string;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>;
}

const ExtractionFieldSchema = new Schema<IReceiptExtractionField>({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
  confidence: { type: Number, min: 0, max: 1 },
  source: { type: String }
}, { _id: false });

const ReceiptSchema = new Schema<IReceipt>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  originalFilename: { type: String, required: true },
  storagePath: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  hash: { type: String, index: true },
  status: { type: String, enum: ['uploaded','ocr_processed','classified','review_pending','approved','posted','error'], default: 'uploaded', index: true },
  errorMessage: { type: String },
  vendorName: { type: String, index: true },
  documentDate: { type: Date, index: true },
  currency: { type: String, default: 'MYR' },
  grossAmount: { type: Number },
  taxAmount: { type: Number },
  netAmount: { type: Number },
  category: { type: String, index: true },
  type: { type: String, enum: ['expense','income','refund','other'] },
  extractedText: { type: String },
  extractionFields: { type: [ExtractionFieldSchema], default: [] },
  relatedLedgerEntryId: { type: Schema.Types.ObjectId, ref: 'LedgerEntry' },
  ocrProvider: { type: String },
  aiModel: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

ReceiptSchema.index({ companyId: 1, status: 1, documentDate: -1 });
ReceiptSchema.index({ companyId: 1, category: 1 });

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
export default Receipt;