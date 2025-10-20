import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  companyId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  category: string;
  type: 'product' | 'service';
  unit: string;
  price: number;
  cost?: number;
  currency: string;
  taxRate?: number;
  taxType?: string;
  trackInventory: boolean;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  reorderLevel?: number;
  supplier?: string;
  supplierId?: mongoose.Types.ObjectId;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  code: { type: String, index: true },
  name: { type: String, required: true, index: true },
  description: { type: String },
  category: { type: String, default: 'General', index: true },
  type: { type: String, enum: ['product', 'service'], default: 'product', required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, min: 0 },
  currency: { type: String, default: 'MYR', required: true },
  taxRate: { type: Number, min: 0, max: 1 },
  taxType: { type: String },
  trackInventory: { type: Boolean, default: true },
  currentStock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 0, min: 0 },
  maxStock: { type: Number, min: 0 },
  reorderLevel: { type: Number, min: 0 },
  supplier: { type: String },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  barcode: { type: String, index: true },
  sku: { type: String, unique: true, sparse: true, index: true },
  imageUrl: { type: String },
  active: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ProductSchema.index({ companyId: 1, code: 1 }, { unique: true });
ProductSchema.index({ companyId: 1, name: 1 });
ProductSchema.index({ companyId: 1, category: 1, active: 1 });

// Pre-save hook to generate product code if not provided
ProductSchema.pre('save', function(next) {
  if (!this.code || this.code === '') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.code = `PRD-${timestamp}-${random}`;
  }
  next();
});

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

