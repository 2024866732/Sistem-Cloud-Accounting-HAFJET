import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: 'invoice_payment' | 'einvoice_approved' | 'sst_update' | 'system_alert' | 'payment_received' | 'document_uploaded';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date }
}, { timestamps: true });

NotificationSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;