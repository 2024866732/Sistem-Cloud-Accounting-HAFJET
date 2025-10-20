import mongoose, { Schema, Document } from 'mongoose';

// Bill Item Interface
export interface IBillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  taxType?: string;
}

// Bill Document Interface
export interface IBill extends Document {
  companyId: mongoose.Types.ObjectId;
  billNumber: string;
  supplierName: string;
  supplierEmail?: string;
  supplierId?: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue';
  currency: string;
  items: IBillItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  paidDate?: Date;
  referenceNumber?: string;
  notes?: string;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, min: 0, max: 1 },
  taxAmount: { type: Number, min: 0, default: 0 },
  taxType: { type: String }
}, { _id: false });

const BillSchema = new Schema<IBill>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  billNumber: { type: String, required: true, unique: true, index: true },
  supplierName: { type: String, required: true, index: true },
  supplierEmail: { type: String },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Contact', index: true },
  issueDate: { type: Date, required: true, index: true },
  dueDate: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'paid', 'cancelled', 'overdue'], 
    default: 'draft',
    index: true 
  },
  currency: { type: String, default: 'MYR', required: true },
  items: { type: [BillItemSchema], required: true },
  subtotal: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  paidAmount: { type: Number, min: 0, default: 0 },
  paidDate: { type: Date },
  referenceNumber: { type: String },
  notes: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, { timestamps: true });

BillSchema.index({ companyId: 1, status: 1, issueDate: -1 });
BillSchema.index({ companyId: 1, supplierName: 1 });

// Pre-save hook to calculate totals
BillSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    let subtotal = 0;
    let taxAmount = 0;
    
    this.items.forEach(item => {
      item.amount = item.quantity * item.unitPrice;
      subtotal += item.amount;
      if (item.taxRate && item.taxRate > 0) {
        item.taxAmount = item.amount * item.taxRate;
        taxAmount += item.taxAmount;
      }
    });
    
    this.subtotal = subtotal;
    this.taxAmount = taxAmount;
    this.total = subtotal + taxAmount;
  }
  next();
});

BillSchema.statics.generateBillNumber = async function(companyId: string): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const lastBill = await this.findOne({ companyId, billNumber: new RegExp(`^BILL-${year}${month}-`) })
    .sort({ billNumber: -1 }).lean();
  let sequence = 1;
  if (lastBill) {
    const lastSeq = parseInt(lastBill.billNumber.split('-').pop() || '0');
    sequence = lastSeq + 1;
  }
  return `BILL-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

// Define interface for model with static methods
interface IBillModel extends mongoose.Model<IBill> {
  generateBillNumber(companyId: string): Promise<string>;
}

export const BillModel = mongoose.model<IBill, IBillModel>('Bill', BillSchema);

