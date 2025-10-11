import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesItem {
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISalesOrder extends Document {
  companyId: string;
  orderNumber: string;
  customerName?: string;
  items: ISalesItem[];
  subtotal: number;
  sstAmount: number;
  total: number;
  status: 'draft' | 'posted' | 'cancelled' | 'paid';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalesItemSchema = new Schema<ISalesItem>({
  productId: { type: String },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 }
}, { _id: false });

const SalesOrderSchema = new Schema<ISalesOrder>({
  companyId: { type: String, required: true, index: true },
  orderNumber: { type: String, required: true, index: true },
  customerName: { type: String },
  items: { type: [SalesItemSchema], default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  sstAmount: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: 'draft' },
  createdBy: { type: String }
}, { timestamps: true });

SalesOrderSchema.index({ companyId: 1, orderNumber: 1 }, { unique: false });

export const SalesOrder = mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);
