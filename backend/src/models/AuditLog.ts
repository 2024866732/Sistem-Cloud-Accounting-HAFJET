import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  companyId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;                 // e.g. invoice.create, einvoice.submit
  entityType?: string;            // Invoice, ReconciliationSession, etc.
  entityId?: string;              // Document ID or business key
  before?: Record<string, any>;   // Optional snapshot
  after?: Record<string, any>;    // Optional snapshot
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String, index: true },
  entityId: { type: String, index: true },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;