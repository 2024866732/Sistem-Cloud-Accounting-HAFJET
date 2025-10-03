// User types
export interface User {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'accountant';
  companyId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

// Company types
export interface Company {
  _id: string;
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
    language: 'en' | 'ms' | 'zh';
    taxType: 'SST' | 'GST' | 'NONE';
    fiscalYearStart: string;
  };
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export interface Transaction {
  _id: string;
  companyId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  accountFrom?: string;
  accountTo?: string;
  reference?: string;
  attachments?: string[];
  taxAmount?: number;
  taxRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice types
export interface Invoice {
  _id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  terms?: string;
  eInvoiceId?: string;
  eInvoiceStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

// Contact types
export interface Contact {
  _id: string;
  companyId: string;
  type: 'customer' | 'supplier' | 'employee';
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxNumber?: string;
  paymentTerms?: number;
  creditLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory types
export interface Product {
  _id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unitOfMeasure: string;
  unitPrice: number;
  costPrice: number;
  quantityOnHand: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report types
export interface FinancialReport {
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance';
  companyId: string;
  startDate: Date;
  endDate: Date;
  data: Record<string, any>;
  generatedAt: Date;
}

// Malaysian Tax types
export interface TaxCalculation {
  subtotal: number;
  taxType: 'SST' | 'GST' | 'NONE';
  taxRate: number;
  taxAmount: number;
  total: number;
}

// E-Invoice types
export interface EInvoice {
  _id: string;
  invoiceId: string;
  lhdnId?: string;
  uuid?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
  xmlData: string;
  submissionDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}