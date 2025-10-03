import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreLocation extends Document {
  companyId: mongoose.Types.ObjectId;
  externalId: string; // POS store/location id
  name: string;
  currency: string;
  active: boolean;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const StoreLocationSchema = new Schema<IStoreLocation>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  externalId: { type: String, required: true },
  name: { type: String, required: true },
  currency: { type: String, default: 'MYR' },
  active: { type: Boolean, default: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

StoreLocationSchema.index({ companyId: 1, externalId: 1 }, { unique: true });

export const StoreLocation = mongoose.model<IStoreLocation>('StoreLocation', StoreLocationSchema);
export default StoreLocation;
