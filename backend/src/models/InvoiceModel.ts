import mongoose, { Schema, Document } from 'mongoose';

// Invoice Item Interface
export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  taxType?: string;
}

// Malaysian Tax Interface
export interface IMalaysianTax {
  taxType: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  exemptAmount: number;
  sstNumber?: string;
}

// E-Invoice State Interface
export interface IEInvoiceState {
  status: string;
  submissionDate?: Date;
  uuid?: string;
}

// Main Invoice Document Interface
export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerId?: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  currency: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  malaysianTax: IMalaysianTax;
  einvoice: IEInvoiceState;
  notes?: string;
  terms?: string;
  paidAmount?: number;
  paidDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Item Schema
const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, min: 0, max: 1 },
  taxAmount: { type: Number, min: 0, default: 0 },
  taxType: { type: String }
}, { _id: false });

// Malaysian Tax Schema
const MalaysianTaxSchema = new Schema<IMalaysianTax>({
  taxType: { type: String, required: true },
  taxRate: { type: Number, required: true, min: 0, max: 1 },
  taxableAmount: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, required: true, min: 0 },
  exemptAmount: { type: Number, default: 0, min: 0 },
  sstNumber: { type: String }
}, { _id: false });

// E-Invoice State Schema
const EInvoiceStateSchema = new Schema<IEInvoiceState>({
  status: { type: String, default: 'not_submitted' },
  submissionDate: { type: Date },
  uuid: { type: String }
}, { _id: false });

// Main Invoice Schema
const InvoiceSchema = new Schema<IInvoice>({
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  customerName: { 
    type: String, 
    required: true,
    index: true 
  },
  customerEmail: { type: String },
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Contact',
    index: true 
  },
  issueDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  dueDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'cancelled'], 
    default: 'draft',
    index: true 
  },
  currency: { 
    type: String, 
    default: 'MYR',
    required: true 
  },
  items: { 
    type: [InvoiceItemSchema], 
    required: true,
    validate: [(val: IInvoiceItem[]) => val && val.length > 0, 'At least one item required']
  },
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  taxAmount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  total: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  malaysianTax: { 
    type: MalaysianTaxSchema, 
    required: true 
  },
  einvoice: { 
    type: EInvoiceStateSchema, 
    default: () => ({ status: 'not_submitted' }) 
  },
  notes: { type: String },
  terms: { type: String },
  paidAmount: { type: Number, min: 0, default: 0 },
  paidDate: { type: Date },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
InvoiceSchema.index({ companyId: 1, status: 1, issueDate: -1 });
InvoiceSchema.index({ companyId: 1, customerName: 1, issueDate: -1 });
InvoiceSchema.index({ companyId: 1, dueDate: 1, status: 1 });
InvoiceSchema.index({ 'einvoice.uuid': 1 }, { sparse: true });
InvoiceSchema.index({ 'einvoice.status': 1 });

// Virtual for balance (remaining amount)
InvoiceSchema.virtual('balance').get(function(this: IInvoice) {
  return this.total - (this.paidAmount || 0);
});

// Virtual for overdue status
InvoiceSchema.virtual('isOverdue').get(function(this: IInvoice) {
  if (this.status === 'paid' || this.status === 'cancelled') return false;
  return new Date() > this.dueDate;
});

// Pre-save hook to validate totals
InvoiceSchema.pre('save', function(next) {
  // Recalculate amounts from items
  const itemsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const itemsTax = this.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  
  // Validate subtotal
  const calculatedSubtotal = Number(itemsTotal.toFixed(2));
  if (Math.abs(this.subtotal - calculatedSubtotal) > 0.01) {
    this.subtotal = calculatedSubtotal;
  }
  
  // Validate tax amount
  const calculatedTax = Number(itemsTax.toFixed(2));
  if (Math.abs(this.taxAmount - calculatedTax) > 0.01) {
    this.taxAmount = calculatedTax;
  }
  
  // Validate total
  const calculatedTotal = Number((this.subtotal + this.taxAmount).toFixed(2));
  if (Math.abs(this.total - calculatedTotal) > 0.01) {
    this.total = calculatedTotal;
  }
  
  next();
});

// Static method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function(companyId: string): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Find the last invoice for this company and month
  const lastInvoice = await this.findOne({
    companyId,
    invoiceNumber: new RegExp(`^INV-${year}${month}-`)
  }).sort({ invoiceNumber: -1 }).lean();
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
    sequence = lastSeq + 1;
  }
  
  return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

// Static method to get invoice statistics
InvoiceSchema.statics.getStatistics = async function(companyId: string, period?: string) {
  const match: any = { companyId };
  
  if (period) {
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    match.issueDate = { $gte: startDate, $lte: endDate };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalTax: { $sum: '$taxAmount' }
      }
    }
  ]);
  
  const result = {
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    cancelled: 0,
    totalAmount: 0,
    totalTax: 0,
    paidAmount: 0,
    draftAmount: 0,
    sentAmount: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    result.totalAmount += stat.totalAmount;
    result.totalTax += stat.totalTax;
    
    if (stat._id === 'draft') {
      result.draft = stat.count;
      result.draftAmount = stat.totalAmount;
    } else if (stat._id === 'sent') {
      result.sent = stat.count;
      result.sentAmount = stat.totalAmount;
    } else if (stat._id === 'paid') {
      result.paid = stat.count;
      result.paidAmount = stat.totalAmount;
    } else if (stat._id === 'cancelled') {
      result.cancelled = stat.count;
    }
  });
  
  return result;
};

// Export the model
export const InvoiceModel = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// Type guard
export function isInvoiceDocument(doc: any): doc is IInvoice {
  return doc && doc.invoiceNumber && doc.companyId && doc.items;
}

