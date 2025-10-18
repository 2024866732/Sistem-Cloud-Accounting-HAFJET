import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  companyId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  unit: string;
  cost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: mongoose.Types.ObjectId;
  referenceNumber?: string;
  date: Date;
  notes?: string;
  locationFrom?: string;
  locationTo?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { 
    type: String, 
    enum: ['purchase', 'sale', 'adjustment', 'return', 'transfer'], 
    required: true,
    index: true 
  },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  unit: { type: String, required: true },
  cost: { type: Number, min: 0 },
  totalCost: { type: Number, min: 0 },
  referenceType: { type: String },
  referenceId: { type: Schema.Types.ObjectId },
  referenceNumber: { type: String },
  date: { type: Date, required: true, default: Date.now, index: true },
  notes: { type: String },
  locationFrom: { type: String },
  locationTo: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

StockMovementSchema.index({ companyId: 1, productId: 1, date: -1 });
StockMovementSchema.index({ companyId: 1, type: 1, date: -1 });

export const StockMovementModel = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);

