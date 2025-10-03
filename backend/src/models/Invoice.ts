import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number; // SST rate (usually 6%)
  taxAmount: number;
  taxType: 'SST' | 'GST' | 'NONE';
  category?: string; // For SST exemption checking
}

export interface IMalaysianTax {
  taxType: 'SST' | 'GST' | 'NONE';
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  exemptAmount: number;
  sstNumber?: string;
}

export interface IEInvoice {
  uuid?: string;
  submissionId?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submissionDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  xmlData?: string;
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  items: IInvoiceItem[];
  malaysianTax: IMalaysianTax;
  einvoice: IEInvoice;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  terms?: string;
  eInvoiceId?: string;
  eInvoiceStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, min: 0, max: 1 },
  taxAmount: { type: Number, min: 0 }
});

const InvoiceSchema = new Schema<IInvoice>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  currency: {
    type: String,
    default: 'MYR'
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: String,
  terms: String,
  eInvoiceId: String,
  eInvoiceStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
InvoiceSchema.index({ companyId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ dueDate: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);