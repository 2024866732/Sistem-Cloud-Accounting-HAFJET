import mongoose, { Schema, Document } from 'mongoose';

// Transaction Document Interface
export interface ITransaction extends Document {
  companyId: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  referenceNumber: string;
  paymentMethod: string;
  taxAmount: number;
  taxType: string;
  taxRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  accountId?: mongoose.Types.ObjectId;  // Bank account or cash account
  contactId?: mongoose.Types.ObjectId;  // Customer or supplier
  invoiceId?: mongoose.Types.ObjectId;  // Related invoice
  billId?: mongoose.Types.ObjectId;     // Related bill
  receiptId?: mongoose.Types.ObjectId;  // Related receipt
  attachments?: string[];
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  reconciled?: boolean;
  reconciledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Schema
const TransactionSchema = new Schema<ITransaction>({
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true, 
    index: true 
  },
  category: { 
    type: String, 
    required: true,
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'MYR',
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    index: true 
  },
  referenceNumber: { 
    type: String, 
    unique: true, 
    required: true,
    index: true 
  },
  paymentMethod: { 
    type: String,
    required: true 
  },
  taxAmount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  taxType: { 
    type: String 
  },
  taxRate: { 
    type: Number, 
    min: 0, 
    max: 1 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'pending',
    index: true 
  },
  accountId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Account',
    index: true 
  },
  contactId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Contact',
    index: true 
  },
  invoiceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Invoice',
    index: true 
  },
  billId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Bill',
    index: true 
  },
  receiptId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Receipt',
    index: true 
  },
  attachments: [{ type: String }],
  metadata: { 
    type: Schema.Types.Mixed,
    default: {} 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  approvedAt: { 
    type: Date 
  },
  reconciled: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  reconciledAt: { 
    type: Date 
  },
  notes: { 
    type: String 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
TransactionSchema.index({ companyId: 1, date: -1, type: 1 });
TransactionSchema.index({ companyId: 1, category: 1, date: -1 });
TransactionSchema.index({ companyId: 1, status: 1, date: -1 });
TransactionSchema.index({ companyId: 1, type: 1, status: 1, date: -1 });
TransactionSchema.index({ companyId: 1, contactId: 1, date: -1 });
TransactionSchema.index({ companyId: 1, reconciled: 1 });

// Virtual for net amount (amount - taxAmount for income, amount + taxAmount for expense)
TransactionSchema.virtual('netAmount').get(function(this: ITransaction) {
  if (this.type === 'income') {
    return this.amount - this.taxAmount;
  }
  return this.amount + this.taxAmount;
});

// Virtual for total amount
TransactionSchema.virtual('totalAmount').get(function(this: ITransaction) {
  return this.amount + this.taxAmount;
});

// Pre-save hook to generate reference number if not provided
TransactionSchema.pre('save', async function(next) {
  if (!this.referenceNumber || this.referenceNumber === '') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referenceNumber = `TXN-${timestamp}-${random}`;
  }
  next();
});

// Static method to generate reference number
TransactionSchema.statics.generateReferenceNumber = function(type: 'income' | 'expense'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString(36).toUpperCase();
  const prefix = type === 'income' ? 'INC' : 'EXP';
  
  return `${prefix}-${year}${month}-${timestamp}`;
};

// Static method to get transaction statistics
TransactionSchema.statics.getStatistics = async function(
  companyId: string, 
  filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense';
    category?: string;
  }
) {
  const match: any = { companyId, status: 'completed' };
  
  if (filters?.startDate || filters?.endDate) {
    match.date = {};
    if (filters.startDate) match.date.$gte = filters.startDate;
    if (filters.endDate) match.date.$lte = filters.endDate;
  }
  
  if (filters?.type) {
    match.type = filters.type;
  }
  
  if (filters?.category) {
    match.category = filters.category;
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalTax: { $sum: '$taxAmount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  const result = {
    income: {
      count: 0,
      total: 0,
      tax: 0,
      average: 0
    },
    expense: {
      count: 0,
      total: 0,
      tax: 0,
      average: 0
    },
    net: 0
  };
  
  stats.forEach(stat => {
    if (stat._id === 'income') {
      result.income.count = stat.count;
      result.income.total = stat.totalAmount;
      result.income.tax = stat.totalTax;
      result.income.average = stat.avgAmount;
    } else if (stat._id === 'expense') {
      result.expense.count = stat.count;
      result.expense.total = stat.totalAmount;
      result.expense.tax = stat.totalTax;
      result.expense.average = stat.avgAmount;
    }
  });
  
  result.net = result.income.total - result.expense.total;
  
  return result;
};

// Static method to get transactions by category
TransactionSchema.statics.getCategoryBreakdown = async function(
  companyId: string,
  type: 'income' | 'expense',
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { companyId, type, status: 'completed' };
  
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalTax: { $sum: '$taxAmount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// Static method to mark transaction as completed
TransactionSchema.statics.markAsCompleted = async function(id: string, userId: string) {
  return this.findByIdAndUpdate(
    id,
    { 
      $set: { 
        status: 'completed',
        approvedBy: userId,
        approvedAt: new Date()
      } 
    },
    { new: true }
  );
};

// Static method to reconcile transaction
TransactionSchema.statics.reconcile = async function(id: string) {
  return this.findByIdAndUpdate(
    id,
    { 
      $set: { 
        reconciled: true,
        reconciledAt: new Date()
      } 
    },
    { new: true }
  );
};

// Define interface for model with static methods
interface ITransactionModel extends mongoose.Model<ITransaction> {
  generateReferenceNumber(type: 'income' | 'expense'): string;
  getStatistics(companyId: string, filters?: { startDate?: Date; endDate?: Date; type?: 'income' | 'expense'; category?: string }): Promise<any>;
  getCategoryBreakdown(companyId: string, type: 'income' | 'expense', startDate?: Date, endDate?: Date): Promise<any>;
  markAsCompleted(id: string, userId: string): Promise<any>;
  reconcile(id: string): Promise<any>;
}

// Export the model
export const TransactionModel = mongoose.model<ITransaction, ITransactionModel>('Transaction', TransactionSchema);

// Type guard
export function isTransactionDocument(doc: any): doc is ITransaction {
  return doc && doc.companyId && doc.type && doc.amount !== undefined;
}

