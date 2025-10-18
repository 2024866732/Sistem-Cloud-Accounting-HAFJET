import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  companyId: mongoose.Types.ObjectId;
  type: 'customer' | 'supplier' | 'both';
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  taxNumber?: string;
  registrationNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactPerson?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  paymentTerms?: number;
  creditLimit?: number;
  currency?: string;
  notes?: string;
  tags?: string[];
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  type: { type: String, enum: ['customer', 'supplier', 'both'], required: true, index: true },
  name: { type: String, required: true, index: true },
  email: { type: String, index: true },
  phone: { type: String },
  website: { type: String },
  taxNumber: { type: String },
  registrationNumber: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'Malaysia' }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'Malaysia' }
  },
  contactPerson: String,
  contactPersonEmail: String,
  contactPersonPhone: String,
  paymentTerms: { type: Number, default: 30 },
  creditLimit: { type: Number, min: 0 },
  currency: { type: String, default: 'MYR' },
  notes: String,
  tags: [String],
  active: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ContactSchema.index({ companyId: 1, name: 1 });
ContactSchema.index({ companyId: 1, type: 1, active: 1 });
ContactSchema.index({ companyId: 1, email: 1 });

export const ContactModel = mongoose.model<IContact>('Contact', ContactSchema);

