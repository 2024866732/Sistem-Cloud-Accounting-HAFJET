import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  registrationNumber?: string; // Optional
  taxNumber?: string; // Optional
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  contact: {
    phone?: string;
    email: string; // Required
    website?: string;
  };
  settings: {
    currency: string;
    language: string;
    taxType: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: false }, // Optional during registration
  taxNumber: { type: String, required: false }, // Can be added later
  address: {
    street: { type: String, required: false, default: '' },
    city: { type: String, required: false, default: '' },
    state: { type: String, required: false, default: '' },
    postalCode: { type: String, required: false, default: '' },
    country: { type: String, default: 'Malaysia' }
  },
  contact: {
    phone: { type: String, required: false, default: '' },
    email: { type: String, required: true }, // Keep email required
    website: { type: String }
  },
  settings: {
    currency: { type: String, default: 'MYR' },
    language: { type: String, default: 'en' },
    taxType: { type: String, default: 'SST' }
  }
}, { timestamps: true });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);