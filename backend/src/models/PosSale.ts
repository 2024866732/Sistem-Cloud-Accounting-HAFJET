import mongoose, { Schema, Document } from 'mongoose';

export interface IPosSaleItem {
  lineNumber: number;
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number; // quantity * unitPrice (before tax/discount)
  discountAmount?: number;
  taxAmount?: number;
  netAmount?: number; // gross - discount + tax
  category?: string;
  meta?: Record<string, any>;
}

export interface IPosSale extends Document {
  companyId: mongoose.Types.ObjectId;
  storeLocationId?: mongoose.Types.ObjectId;
  externalId: string; // POS sale id
  type?: 'sale' | 'refund';
  originalSaleExternalId?: string; // reference for refunds
  businessDate: Date; // truncated date for reporting
  saleDateTime: Date;
  currency: string;
  totalGross: number;
  totalDiscount?: number;
  totalTax?: number;
  totalNet?: number;
  items: IPosSaleItem[];
  status: 'raw' | 'normalized' | 'posted' | 'error';
  hash?: string; // dedupe hash of raw payload
  ledgerEntryId?: mongoose.Types.ObjectId; // reference to aggregated posting entry
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PosSaleItemSchema = new Schema<IPosSaleItem>({
  lineNumber: { type: Number, required: true },
  sku: { type: String },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  grossAmount: { type: Number, required: true },
  discountAmount: { type: Number },
  taxAmount: { type: Number },
  netAmount: { type: Number },
  category: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { _id: false });

const PosSaleSchema = new Schema<IPosSale>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  storeLocationId: { type: Schema.Types.ObjectId, ref: 'StoreLocation', index: true },
  externalId: { type: String, required: true },
  businessDate: { type: Date, required: true, index: true },
  saleDateTime: { type: Date, required: true },
  type: { type: String, enum: ['sale','refund'], default: 'sale', index: true },
  originalSaleExternalId: { type: String },
  currency: { type: String, default: 'MYR' },
  totalGross: { type: Number, required: true },
  totalDiscount: { type: Number },
  totalTax: { type: Number },
  totalNet: { type: Number },
  items: { type: [PosSaleItemSchema], default: [] },
  status: { type: String, enum: ['raw','normalized','posted','error'], default: 'raw', index: true },
  hash: { type: String, index: true },
  ledgerEntryId: { type: Schema.Types.ObjectId, ref: 'LedgerEntry', index: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

PosSaleSchema.index({ companyId: 1, externalId: 1 }, { unique: true });
PosSaleSchema.index({ companyId: 1, businessDate: 1 });

export const PosSale = mongoose.model<IPosSale>('PosSale', PosSaleSchema);
export default PosSale;
