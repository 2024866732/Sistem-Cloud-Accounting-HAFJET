// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'accountant'
  company?: Company
  createdAt: string
  updatedAt: string
}

// Company types
export interface Company {
  id: string
  name: string
  registrationNumber: string // SSM number
  taxNumber?: string
  address: Address
  contact: Contact
  industry: string
  currency: string
  taxSettings: TaxSettings
  einvoiceSettings?: EInvoiceSettings
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Contact {
  phone: string
  email: string
  website?: string
}

// Tax and compliance types
export interface TaxSettings {
  sstEnabled: boolean
  sstRate: number // Default 6%
  gstEnabled: boolean // For historical data
  gstRate: number // Default 6%
  withholdingTaxRates: Record<string, number>
}

export interface EInvoiceSettings {
  enabled: boolean
  lhdnApiKey?: string
  peppolId?: string
  certificatePath?: string
  testMode: boolean
}

// Transaction types
export interface Transaction {
  id: string
  companyId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  currency: string
  description: string
  category: string
  date: string
  account: Account
  contact?: Contact
  taxAmount?: number
  taxType?: 'sst' | 'gst' | 'withholding'
  attachments?: string[]
  tags?: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// Account types
export interface Account {
  id: string
  companyId: string
  name: string
  type: 'bank' | 'cash' | 'credit' | 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  currency: string
  balance: number
  bankDetails?: BankDetails
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  branchCode?: string
  swiftCode?: string
}

// Invoice types
export interface Invoice {
  id: string
  companyId: string
  invoiceNumber: string
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  taxType: 'sst' | 'gst'
  total: number
  currency: string
  dueDate: string
  issueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  paymentMethod?: string
  notes?: string
  einvoiceStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
  einvoiceUuid?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxable: boolean
  category?: string
}

export interface Customer {
  id: string
  companyId: string
  name: string
  email?: string
  phone?: string
  address?: Address
  taxNumber?: string
  customerType: 'individual' | 'business'
  creditLimit?: number
  paymentTerms?: number // Days
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Inventory types
export interface Product {
  id: string
  companyId: string
  name: string
  sku: string
  description?: string
  category: string
  unitOfMeasure: string
  costPrice: number
  salePrice: number
  quantityOnHand: number
  reorderLevel: number
  isActive: boolean
  taxable: boolean
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  unitCost: number
  totalValue: number
  reference?: string
  date: string
  createdAt: string
}

// Report types
export interface FinancialReport {
  id: string
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance' | 'aged-receivables' | 'aged-payables'
  companyId: string
  period: {
    startDate: string
    endDate: string
  }
  data: Record<string, unknown>
  generatedAt: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  acceptTerms: boolean
}

// Malaysian specific types
export interface MalaysianHoliday {
  date: string
  name: string
  type: 'public' | 'state' | 'religious'
  states?: string[] // Which states observe this holiday
}

export interface ExchangeRate {
  baseCurrency: string
  targetCurrency: string
  rate: number
  date: string
}

// Chart data types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// Dashboard types
export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingInvoices: number
  cashBalance: number
  period: {
    startDate: string
    endDate: string
  }
}

export interface DashboardChartData {
  monthlyRevenue: ChartData
  expensesByCategory: ChartData
  cashFlow: ChartData
  invoiceStatus: ChartData
}