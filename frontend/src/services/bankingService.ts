import api from './api'

export interface MalaysianBank {
  code: string
  name: string
  logo: string
  isSupported: boolean
  authType: 'oauth2' | 'credentials'
  description?: string
  features: string[]
}

export interface BankAccount {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountType: 'savings' | 'current' | 'business' | 'islamic'
  balance: number
  currency: string
  lastSyncDate: Date
  isActive: boolean
}

export interface BankTransaction {
  id: string
  accountId: string
  date: Date
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance: number
  category?: string
  reference?: string
  malaysianMetadata?: {
    isGovPayment?: boolean
    sst?: number
    paymentMethod?: string
  }
}

export interface CompanyTransaction {
  id: string
  date: Date
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  reference?: string
}

export interface BankConnectionCredentials {
  username?: string
  password?: string
  clientId?: string
  clientSecret?: string
  apiKey?: string
}

export interface ReconciliationResult {
  matched: Array<{
    bankTransaction: BankTransaction
    companyTransaction: CompanyTransaction
    confidence: number
  }>
  unmatched: Array<{
    transaction: BankTransaction | CompanyTransaction
    source: 'bank' | 'company'
  }>
  suggestions: Array<{
    bankTransaction: BankTransaction
    possibleMatches: CompanyTransaction[]
    reason: string
  }>
  summary: {
    totalBankTransactions: number
    totalCompanyTransactions: number
    matchedCount: number
    unmatchedCount: number
    reconciliationRate: number
  }
}

export interface SyncHistoryItem {
  id: string
  accountId: string
  syncDate: Date
  transactionCount: number
  status: 'success' | 'partial' | 'failed'
  errorMessage?: string
}

export interface TransactionCategory {
  code: string
  name: string
  description: string
}

export interface BankStatus {
  bankCode: string
  isConnected: boolean
  lastSync: Date | null
}

export interface ReconciliationReport {
  accountId: string
  reportPeriod: {
    start: Date
    end: Date
  }
  summary: {
    totalBankTransactions: number
    totalCompanyTransactions: number
    matchedTransactions: number
    unmatchedTransactions: number
    reconciliationRate: number
  }
  issues: Array<{
    type: string
    description: string
    amount: number
    date: Date
    suggestions: string[]
  }>
  recommendations: string[]
}

class BankingService {
  // Get supported Malaysian banks
  async getSupportedBanks(): Promise<MalaysianBank[]> {
    const response = await api.get('/banking/banks')
    return response.data.data
  }

  // Connect to a Malaysian bank
  async connectBank(bankCode: string, credentials: BankConnectionCredentials): Promise<BankAccount[]> {
    const response = await api.post('/banking/connect', {
      bankCode,
      credentials
    })
    return response.data.data
  }

  // Get connected bank accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await api.get('/banking/accounts')
    return response.data.data
  }

  // Sync transactions from bank
  async syncTransactions(
    accountId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<BankTransaction[]> {
    const response = await api.post(`/banking/sync/${accountId}`, {
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString()
    })
    return response.data.data
  }

  // Perform bank reconciliation
  async performReconciliation(
    accountId: string,
    companyTransactions: CompanyTransaction[]
  ): Promise<ReconciliationResult> {
    const response = await api.post(`/banking/reconcile/${accountId}`, {
      companyTransactions
    })
    return response.data.data
  }

  // Get Malaysian transaction categories
  async getTransactionCategories(): Promise<{
    income: TransactionCategory[]
    expenses: TransactionCategory[]
  }> {
    const response = await api.get('/banking/categories')
    return response.data.data
  }

  // Get bank connection status
  async getBankStatus(bankCode: string): Promise<BankStatus> {
    const response = await api.get(`/banking/status/${bankCode}`)
    return response.data.data
  }

  // Generate reconciliation report
  async generateReconciliationReport(
    accountId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReconciliationReport> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    const response = await api.get(`/banking/reconciliation-report/${accountId}?${params}`)
    return response.data.data
  }

  // Disconnect bank
  async disconnectBank(bankCode: string): Promise<void> {
    await api.delete(`/banking/disconnect/${bankCode}`)
  }

  // Get transaction sync history
  async getSyncHistory(accountId: string): Promise<SyncHistoryItem[]> {
    const response = await api.get(`/banking/sync-history/${accountId}`)
    return response.data.data
  }

  // Update transaction category
  async updateTransactionCategory(
    transactionId: string,
    category: string
  ): Promise<void> {
    await api.patch(`/banking/transactions/${transactionId}/category`, {
      category
    })
  }

  // Get Malaysian banking statistics
  async getBankingStatistics(): Promise<{
    totalAccounts: number
    totalBalance: number
    monthlyTransactions: number
    lastSyncDate: Date
    bankDistribution: Array<{
      bankCode: string
      bankName: string
      accountCount: number
      totalBalance: number
    }>
  }> {
    const response = await api.get('/banking/statistics')
    return response.data.data
  }

  // Get account balance
  async getAccountBalance(accountId: string): Promise<{
    accountId: string
    balance: number
    currency: string
    lastUpdated: Date
    availableBalance: number
    pendingTransactions: BankTransaction[]
  }> {
    const response = await api.get(`/banking/balance/${accountId}`)
    return response.data.data
  }

  // Get transaction history with pagination
  async getTransactionHistory(
    accountId: string,
    options?: {
      page?: number
      limit?: number
      fromDate?: Date
      toDate?: Date
      category?: string
    }
  ): Promise<{
    transactions: BankTransaction[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams()
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.fromDate) params.append('fromDate', options.fromDate.toISOString())
    if (options?.toDate) params.append('toDate', options.toDate.toISOString())
    if (options?.category) params.append('category', options.category)

    const response = await api.get(`/banking/transactions/${accountId}?${params}`)
    return response.data.data
  }

  // Export transactions
  async exportTransactions(
    accountId: string,
    format: 'csv' | 'excel' = 'csv',
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    filename: string
    url: string
    recordCount: number
    generatedAt: Date
  }> {
    const params = new URLSearchParams()
    params.append('format', format)
    if (fromDate) params.append('fromDate', fromDate.toISOString())
    if (toDate) params.append('toDate', toDate.toISOString())

    const response = await api.get(`/banking/export/${accountId}?${params}`)
    return response.data.data
  }

  // Malaysian bank utilities
  formatCurrency(amount: number, currency: string = 'MYR'): string {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  getBankLogo(bankCode: string): string {
    const logoMap: Record<string, string> = {
      'MBB': '🏦',
      'CIMB': '🏛️',
      'PBB': '🏪',
      'RHB': '🏬',
      'HLB': '🏢',
      'BIMB': '🕌',
      'BSN': '🏛️',
      'AMB': '💼',
      'ABMB': '🌟',
      'UOB': '🌏'
    }
    return logoMap[bankCode] || '🏦'
  }

  getBankDisplayName(bankCode: string): string {
    const bankNames: Record<string, string> = {
      'MBB': 'Maybank',
      'CIMB': 'CIMB Bank',
      'PBB': 'Public Bank',
      'RHB': 'RHB Bank',
      'HLB': 'Hong Leong Bank',
      'BIMB': 'Bank Islam',
      'BSN': 'BSN',
      'AMB': 'AmBank',
      'ABMB': 'Alliance Bank',
      'UOB': 'UOB Malaysia'
    }
    return bankNames[bankCode] || bankCode
  }

  validateAccountNumber(bankCode: string, accountNumber: string): boolean {
    // Basic validation for Malaysian bank account numbers
    const patterns: Record<string, RegExp> = {
      'MBB': /^[0-9]{12}$/,
      'CIMB': /^[0-9]{10,14}$/,
      'PBB': /^[0-9]{10,12}$/,
      'RHB': /^[0-9]{12}$/,
      'HLB': /^[0-9]{10,14}$/,
      'BIMB': /^[0-9]{10,14}$/,
      'BSN': /^[0-9]{10,12}$/,
      'AMB': /^[0-9]{12}$/,
      'ABMB': /^[0-9]{12}$/,
      'UOB': /^[0-9]{10,14}$/
    }

    const pattern = patterns[bankCode]
    return pattern ? pattern.test(accountNumber) : true
  }
}

export const bankingService = new BankingService()
export default bankingService