export type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  taxRate?: number; // decimal (0.06 for 6%)
  taxAmount?: number;
  taxType?: string;
};

export type MalaysianTax = {
  taxType: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  exemptAmount: number;
  sstNumber?: string;
};

export type EInvoiceState = {
  status: string;
  submissionDate: string | null;
  uuid: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  malaysianTax: MalaysianTax;
  einvoice: EInvoiceState;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInvoicePayload = Partial<Invoice> & {
  items: InvoiceItem[];
};

// Keep this file as type-only model definitions for the lightweight file-backed service.
// Production builds should replace with a proper Mongoose model connected to MongoDB.