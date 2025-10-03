import mongoose, { Schema, Document } from 'mongoose'

export interface ITaxRate extends Document {
  companyId?: mongoose.Types.ObjectId;      // null / undefined => global default
  code: string;                             // e.g. SST_STD, SST_SERV, WHT_10, ZERO
  name: string;                             // human readable
  type: 'SST' | 'WITHHOLDING' | 'GST' | 'OTHER';
  category?: string;                        // service, goods, professional
  rate: number;                             // expressed as decimal (0.06)
  effectiveFrom: Date;
  effectiveTo?: Date;                       // optional end
  isActive: boolean;
  jurisdiction?: string;                    // 'MY'
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaxRateSchema = new Schema<ITaxRate>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['SST', 'WITHHOLDING', 'GST', 'OTHER'], required: true },
  category: { type: String },
  rate: { type: Number, required: true, min: 0 },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: { type: Date },
  isActive: { type: Boolean, default: true, index: true },
  jurisdiction: { type: String, default: 'MY' },
  description: { type: String }
}, { timestamps: true })

TaxRateSchema.index({ code: 1, companyId: 1, effectiveFrom: -1 })
TaxRateSchema.index({ type: 1, isActive: 1 })

export const TaxRate = mongoose.model<ITaxRate>('TaxRate', TaxRateSchema)
