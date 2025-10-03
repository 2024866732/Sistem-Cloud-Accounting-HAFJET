import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramChatLink extends Document {
  chatId: string;                // Telegram chat/group ID (string form)
  companyId: mongoose.Types.ObjectId;
  defaultUserId?: mongoose.Types.ObjectId; // Optional user associated for auditing
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>;
}

const TelegramChatLinkSchema = new Schema<ITelegramChatLink>({
  chatId: { type: String, required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  defaultUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true, index: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

TelegramChatLinkSchema.index({ chatId: 1, companyId: 1 }, { unique: true });

export const TelegramChatLink = mongoose.model<ITelegramChatLink>('TelegramChatLink', TelegramChatLinkSchema);
export default TelegramChatLink;
