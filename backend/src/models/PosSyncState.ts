import mongoose, { Schema, Document } from 'mongoose';

export interface IPosSyncState extends Document {
  companyId: mongoose.Types.ObjectId;
  provider: string; // e.g. 'loyverse'
  lastSyncAt?: Date; // last successful completed sync time (UTC)
  meta?: Record<string, any>; // can store cursors, pagination tokens, etc.
  createdAt: Date;
  updatedAt: Date;
}

const PosSyncStateSchema = new Schema<IPosSyncState>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  provider: { type: String, required: true },
  lastSyncAt: { type: Date },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

PosSyncStateSchema.index({ companyId: 1, provider: 1 }, { unique: true });

export const PosSyncState = mongoose.model<IPosSyncState>('PosSyncState', PosSyncStateSchema);
export default PosSyncState;
