import { InvoiceModel, IInvoice, IInvoiceItem } from '../models/InvoiceModel.js';
import { Types } from 'mongoose';

// Request payload for creating invoice
export interface CreateInvoicePayload {
  customerName: string;
  customerEmail?: string;
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  items: IInvoiceItem[];
  notes?: string;
  terms?: string;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
}

// Update payload
export interface UpdateInvoicePayload {
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  items?: IInvoiceItem[];
  notes?: string;
  terms?: string;
  paidAmount?: number;
  paidDate?: string;
}

// Calculate line item amounts
function calcLine(it: Partial<IInvoiceItem>): IInvoiceItem {
  const quantity = Number(it.quantity || 0);
  const unitPrice = Number(it.unitPrice || 0);
  const amount = Number((quantity * unitPrice).toFixed(2));
  const taxRate = Number(it.taxRate || 0);
  const taxAmount = Number((amount * taxRate).toFixed(2));
  
  return {
    description: it.description || '',
    quantity,
    unitPrice,
    amount,
    taxRate,
    taxAmount,
    taxType: it.taxType
  };
}

// Calculate totals from items
function calcTotals(items: Partial<IInvoiceItem>[]) {
  const lines = items.map(calcLine);
  const subtotal = Number(lines.reduce((s, l) => s + l.amount, 0).toFixed(2));
  const taxAmount = Number(lines.reduce((s, l) => s + (l.taxAmount || 0), 0).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));
  const taxRate = subtotal > 0 ? taxAmount / subtotal : 0;
  
  return { lines, subtotal, taxAmount, total, taxRate };
}

class InvoiceServiceDB {
  /**
   * List invoices with pagination
   */
  async list(companyId: string, page = 1, limit = 20, filters?: {
    status?: string;
    customerName?: string;
    startDate?: string;
    endDate?: string;
  }) {
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      throw new Error('Valid companyId required');
    }
    
    const query: any = { companyId };
    
    // Apply filters
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.customerName) {
      query.customerName = new RegExp(filters.customerName, 'i');
    }
    if (filters?.startDate || filters?.endDate) {
      query.issueDate = {};
      if (filters.startDate) query.issueDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.issueDate.$lte = new Date(filters.endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      InvoiceModel.find(query)
        .sort({ issueDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('customerId', 'name email')
        .lean(),
      InvoiceModel.countDocuments(query)
    ]);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Get single invoice by ID
   */
  async get(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return InvoiceModel.findById(id)
      .populate('createdBy', 'name email')
      .populate('customerId', 'name email')
      .lean();
  }

  /**
   * Get invoice by invoice number
   */
  async getByNumber(invoiceNumber: string, companyId: string) {
    return InvoiceModel.findOne({ invoiceNumber, companyId })
      .populate('createdBy', 'name email')
      .populate('customerId', 'name email')
      .lean();
  }

  /**
   * Create new invoice
   */
  async create(payload: CreateInvoicePayload, opts: { userId: string; companyId: string }) {
    if (!opts.companyId || !Types.ObjectId.isValid(opts.companyId)) {
      throw new Error('Valid companyId required');
    }
    if (!opts.userId || !Types.ObjectId.isValid(opts.userId)) {
      throw new Error('Valid userId required');
    }
    
    // Calculate totals
    const { lines, subtotal, taxAmount, total, taxRate } = calcTotals(payload.items || []);
    
    // Generate invoice number
    const invoiceNumber = await InvoiceModel.generateInvoiceNumber(opts.companyId);
    
    // Prepare dates
    const now = new Date();
    const issueDate = payload.issueDate ? new Date(payload.issueDate) : now;
    const dueDate = payload.dueDate 
      ? new Date(payload.dueDate) 
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    
    // Create invoice
    const invoice = await InvoiceModel.create({
      companyId: opts.companyId,
      createdBy: opts.userId,
      invoiceNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerId: payload.customerId && Types.ObjectId.isValid(payload.customerId) 
        ? payload.customerId 
        : undefined,
      issueDate,
      dueDate,
      status: payload.status || 'draft',
      currency: payload.currency || 'MYR',
      items: lines,
      subtotal,
      taxAmount,
      total,
      malaysianTax: {
        taxType: taxRate > 0 ? 'SST' : 'NONE',
        taxRate,
        taxableAmount: subtotal,
        taxAmount,
        exemptAmount: 0
      },
      einvoice: {
        status: 'not_submitted'
      },
      notes: payload.notes,
      terms: payload.terms
    });
    
    return invoice.toObject();
  }

  /**
   * Update existing invoice
   */
  async update(id: string, payload: UpdateInvoicePayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const updateData: any = {};
    
    // Update basic fields
    if (payload.customerName !== undefined) updateData.customerName = payload.customerName;
    if (payload.customerEmail !== undefined) updateData.customerEmail = payload.customerEmail;
    if (payload.customerId !== undefined) {
      updateData.customerId = payload.customerId && Types.ObjectId.isValid(payload.customerId)
        ? payload.customerId
        : null;
    }
    if (payload.issueDate !== undefined) updateData.issueDate = new Date(payload.issueDate);
    if (payload.dueDate !== undefined) updateData.dueDate = new Date(payload.dueDate);
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.terms !== undefined) updateData.terms = payload.terms;
    if (payload.paidAmount !== undefined) updateData.paidAmount = payload.paidAmount;
    if (payload.paidDate !== undefined) updateData.paidDate = new Date(payload.paidDate);
    
    // Recalculate totals if items changed
    if (payload.items && payload.items.length > 0) {
      const { lines, subtotal, taxAmount, total, taxRate } = calcTotals(payload.items);
      updateData.items = lines;
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
      updateData.malaysianTax = {
        taxType: taxRate > 0 ? 'SST' : 'NONE',
        taxRate,
        taxableAmount: subtotal,
        taxAmount,
        exemptAmount: 0
      };
    }
    
    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('customerId', 'name email')
      .lean();
    
    return updated;
  }

  /**
   * Partial update (patch)
   */
  async patch(id: string, payload: Partial<UpdateInvoicePayload>) {
    return this.update(id, payload);
  }

  /**
   * Delete invoice
   */
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const deleted = await InvoiceModel.findByIdAndDelete(id).lean();
    return deleted;
  }

  /**
   * Update E-Invoice status
   */
  async upsertEinvoice(id: string, einvoiceData: {
    status: string;
    submissionDate?: string;
    uuid?: string;
  }) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const update: any = {
      'einvoice.status': einvoiceData.status
    };
    
    if (einvoiceData.submissionDate) {
      update['einvoice.submissionDate'] = new Date(einvoiceData.submissionDate);
    }
    if (einvoiceData.uuid) {
      update['einvoice.uuid'] = einvoiceData.uuid;
    }
    
    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    
    return updated;
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(companyId: string, period?: string) {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new Error('Valid companyId required');
    }
    
    return InvoiceModel.getStatistics(companyId, period);
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(companyId: string) {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new Error('Valid companyId required');
    }
    
    const now = new Date();
    return InvoiceModel.find({
      companyId,
      status: { $in: ['sent', 'draft'] },
      dueDate: { $lt: now }
    })
      .sort({ dueDate: 1 })
      .limit(50)
      .lean();
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, paidAmount?: number, paidDate?: Date) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    invoice.status = 'paid';
    invoice.paidAmount = paidAmount || invoice.total;
    invoice.paidDate = paidDate || new Date();
    
    await invoice.save();
    return invoice.toObject();
  }

  /**
   * Send invoice (change status to sent)
   */
  async send(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: { status: 'sent' } },
      { new: true }
    ).lean();
    
    return updated;
  }

  /**
   * Cancel invoice
   */
  async cancel(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid invoice ID');
    }
    
    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    ).lean();
    
    return updated;
  }
}

export default new InvoiceServiceDB();

