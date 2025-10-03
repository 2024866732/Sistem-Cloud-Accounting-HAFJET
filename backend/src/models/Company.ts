import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  registrationNumber: string;
  taxNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
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
  registrationNumber: { type: String, required: true, unique: true },
  taxNumber: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Malaysia' }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  settings: {
    currency: { type: String, default: 'MYR' },
    language: { type: String, default: 'en' },
    taxType: { type: String, default: 'SST' }
  }
}, { timestamps: true });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);