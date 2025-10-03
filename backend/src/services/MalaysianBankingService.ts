import { logger } from '../utils/logger'

// Malaysian Bank Interfaces
export interface MalaysianBank {
  code: string
  name: string
  type: 'major' | 'islamic' | 'investment' | 'foreign'
  features: string[]
  supportedAccountTypes: string[]
  isSupported: boolean
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
  iban?: string
  swiftCode?: string
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
    gst?: number
    paymentMethod?: string
    merchant?: string
    location?: string
  }
}

export interface BankConnectionCredentials {
  username?: string
  password?: string
  clientId?: string
  clientSecret?: string
  apiKey?: string
  twoFactorCode?: string
}

export interface ReconciliationResult {
  matched: Array<{
    bankTransactionId: string
    companyTransactionId: string
    confidence: number
    matchReason: string
  }>
  unmatched: Array<{
    transactionId: string
    source: 'bank' | 'company'
    amount: number
    date: Date
    description: string
  }>
  suggestions: Array<{
    bankTransactionId: string
    possibleMatches: Array<{
      companyTransactionId: string
      confidence: number
      reason: string
    }>
  }>
  summary: {
    totalBankTransactions: number
    totalCompanyTransactions: number
    matchedCount: number
    unmatchedCount: number
    reconciliationRate: number
  }
}

// Malaysian Banking Service Implementation
export class MalaysianBankingService {
  private readonly supportedBanks: MalaysianBank[] = [
    {
      code: 'MBB',
      name: 'Malayan Banking Berhad (Maybank)',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA', 'Online Banking'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'CIMB',
      name: 'CIMB Bank Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA', 'Mobile Banking'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'PBB',
      name: 'Public Bank Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'RHB',
      name: 'RHB Bank Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA', 'RHB Now'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'HLB',
      name: 'Hong Leong Bank Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA', 'HLB Connect'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'BIMB',
      name: 'Bank Islam Malaysia Berhad',
      type: 'islamic',
      features: ['FPX', 'DuitNow', 'JomPAY', 'Islamic Banking'],
      supportedAccountTypes: ['savings', 'current', 'business', 'islamic'],
      isSupported: true
    },
    {
      code: 'BSN',
      name: 'Bank Simpanan Nasional',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'Government Banking'],
      supportedAccountTypes: ['savings', 'current'],
      isSupported: true
    },
    {
      code: 'AMB',
      name: 'AmBank (M) Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY', 'CASA'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'ABMB',
      name: 'Alliance Bank Malaysia Berhad',
      type: 'major',
      features: ['FPX', 'DuitNow', 'JomPAY'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    },
    {
      code: 'UOB',
      name: 'United Overseas Bank (Malaysia) Bhd',
      type: 'foreign',
      features: ['FPX', 'DuitNow', 'JomPAY', 'International Banking'],
      supportedAccountTypes: ['savings', 'current', 'business'],
      isSupported: true
    }
  ]

  private connectedBanks: Map<string, { 
    credentials: BankConnectionCredentials
    connectionDate: Date
    lastSync: Date
    status: 'connected' | 'disconnected' | 'error'
  }> = new Map()

  // Get all supported Malaysian banks
  getSupportedBanks(): MalaysianBank[] {
    return this.supportedBanks
  }

  // Connect to a Malaysian bank
  async connectBank(
    bankCode: string, 
    credentials: BankConnectionCredentials,
    companyId: string
  ): Promise<BankAccount[]> {
    try {
      logger.info(`Attempting to connect to bank: ${bankCode}`)

      // Validate bank code
      const bank = this.supportedBanks.find(b => b.code === bankCode)
      if (!bank) {
        throw new Error(`Unsupported bank code: ${bankCode}`)
      }

      // Validate credentials based on bank requirements
      this.validateCredentials(bankCode, credentials)

      // In real implementation, this would connect to actual bank APIs
      // For now, simulate connection and return mock accounts
      const accounts = await this.simulateBankConnection(bankCode, credentials)

      // Store connection information
      this.connectedBanks.set(bankCode, {
        credentials,
        connectionDate: new Date(),
        lastSync: new Date(),
        status: 'connected'
      })

      logger.info(`Successfully connected to ${bank.name}, found ${accounts.length} accounts`)
      return accounts

    } catch (error) {
      logger.error(`Failed to connect to bank ${bankCode}:`, error)
      this.connectedBanks.set(bankCode, {
        credentials,
        connectionDate: new Date(),
        lastSync: new Date(),
        status: 'error'
      })
      throw error
    }
  }

  // Sync transactions from bank
  async syncTransactions(
    accountId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<BankTransaction[]> {
    try {
      logger.info(`Syncing transactions for account: ${accountId}`)

      // Get account information
      const account = await this.getAccountById(accountId)
      if (!account) {
        throw new Error(`Account not found: ${accountId}`)
      }

      // Check if bank is connected
      const connection = this.connectedBanks.get(account.bankCode)
      if (!connection || connection.status !== 'connected') {
        throw new Error(`Bank ${account.bankCode} is not connected`)
      }

      // Set default date range if not provided
      const endDate = toDate || new Date()
      const startDate = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

      // In real implementation, this would fetch from actual bank APIs
      const transactions = await this.simulateTransactionSync(account, startDate, endDate)

      // Update last sync date
      connection.lastSync = new Date()

      logger.info(`Successfully synced ${transactions.length} transactions for account ${accountId}`)
      return transactions

    } catch (error) {
      logger.error(`Failed to sync transactions for account ${accountId}:`, error)
      throw error
    }
  }

  // Perform bank reconciliation
  async performReconciliation(
    accountId: string,
    companyTransactions: Array<{
      id: string
      date: Date
      amount: number
      description: string
      type: 'income' | 'expense'
    }>
  ): Promise<ReconciliationResult> {
    try {
      logger.info(`Performing reconciliation for account: ${accountId}`)

      // Get bank transactions
      const bankTransactions = await this.syncTransactions(accountId)

      // Perform intelligent matching
      const result = this.matchTransactions(bankTransactions, companyTransactions)

      logger.info(`Reconciliation completed: ${result.summary.matchedCount}/${result.summary.totalBankTransactions} matched`)
      return result

    } catch (error) {
      logger.error(`Failed to perform reconciliation for account ${accountId}:`, error)
      throw error
    }
  }

  // Get bank connection status
  getBankConnectionStatus(bankCode: string): {
    isConnected: boolean
    lastSync?: Date
    status: string
  } {
    const connection = this.connectedBanks.get(bankCode)
    
    return {
      isConnected: connection?.status === 'connected' || false,
      lastSync: connection?.lastSync,
      status: connection?.status || 'disconnected'
    }
  }

  // Private helper methods
  private validateCredentials(bankCode: string, credentials: BankConnectionCredentials): void {
    const bank = this.supportedBanks.find(b => b.code === bankCode)
    if (!bank) {
      throw new Error(`Bank not found: ${bankCode}`)
    }

    // Basic validation - in real implementation, this would be more sophisticated
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required')
    }

    if (credentials.username.length < 3 || credentials.password.length < 6) {
      throw new Error('Invalid credentials format')
    }
  }

  private async simulateBankConnection(
    bankCode: string, 
    credentials: BankConnectionCredentials
  ): Promise<BankAccount[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const bank = this.supportedBanks.find(b => b.code === bankCode)!
    
    // Return realistic mock accounts based on bank type
    const accounts: BankAccount[] = []

    if (bank.supportedAccountTypes.includes('savings')) {
      accounts.push({
        id: `${bankCode}_SAV_${Date.now()}`,
        bankCode,
        bankName: bank.name,
        accountNumber: this.generateAccountNumber(bankCode),
        accountType: 'savings',
        balance: Math.random() * 50000 + 5000,
        currency: 'MYR',
        lastSyncDate: new Date(),
        isActive: true,
        iban: `MY${Math.floor(Math.random() * 90) + 10}${bankCode}${Math.floor(Math.random() * 1000000000000)}`,
        swiftCode: `${bankCode}MYKL`
      })
    }

    if (bank.supportedAccountTypes.includes('current')) {
      accounts.push({
        id: `${bankCode}_CUR_${Date.now() + 1}`,
        bankCode,
        bankName: bank.name,
        accountNumber: this.generateAccountNumber(bankCode),
        accountType: 'current',
        balance: Math.random() * 100000 + 10000,
        currency: 'MYR',
        lastSyncDate: new Date(),
        isActive: true,
        iban: `MY${Math.floor(Math.random() * 90) + 10}${bankCode}${Math.floor(Math.random() * 1000000000000)}`,
        swiftCode: `${bankCode}MYKL`
      })
    }

    return accounts
  }

  private async simulateTransactionSync(
    account: BankAccount,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const transactions: BankTransaction[] = []
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    const transactionCount = Math.floor(daysDiff * 2) + Math.floor(Math.random() * 10)

    let currentBalance = account.balance

    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(
        fromDate.getTime() + Math.random() * (toDate.getTime() - fromDate.getTime())
      )

      const isCredit = Math.random() > 0.6
      const amount = Math.round((Math.random() * 2000 + 50) * 100) / 100

      if (isCredit) {
        currentBalance += amount
      } else {
        currentBalance -= amount
      }

      transactions.push({
        id: `${account.id}_TXN_${Date.now()}_${i}`,
        accountId: account.id,
        date: transactionDate,
        description: this.generateTransactionDescription(isCredit),
        amount: isCredit ? amount : -amount,
        type: isCredit ? 'credit' : 'debit',
        balance: Math.round(currentBalance * 100) / 100,
        category: this.categorizeTransaction(isCredit),
        reference: `REF${Math.floor(Math.random() * 1000000)}`,
        malaysianMetadata: {
          isGovPayment: Math.random() < 0.1,
          sst: isCredit ? 0 : Math.round(amount * 0.06 * 100) / 100,
          paymentMethod: isCredit ? 'Transfer' : this.getRandomPaymentMethod(),
          merchant: !isCredit ? this.getRandomMerchant() : undefined,
          location: 'Kuala Lumpur, Malaysia'
        }
      })
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

    return transactions
  }

  private matchTransactions(
    bankTransactions: BankTransaction[],
    companyTransactions: Array<{
      id: string
      date: Date
      amount: number
      description: string
      type: 'income' | 'expense'
    }>
  ): ReconciliationResult {
    const matched: ReconciliationResult['matched'] = []
    const unmatched: ReconciliationResult['unmatched'] = []
    const suggestions: ReconciliationResult['suggestions'] = []

    const usedCompanyTransactions = new Set<string>()

    // Simple matching algorithm - can be enhanced with ML
    for (const bankTxn of bankTransactions) {
      let bestMatch: any = null
      let bestScore = 0

      for (const companyTxn of companyTransactions) {
        if (usedCompanyTransactions.has(companyTxn.id)) continue

        let score = 0

        // Amount matching (most important)
        if (Math.abs(Math.abs(bankTxn.amount) - companyTxn.amount) < 0.01) {
          score += 50
        }

        // Date matching (within 3 days)
        const daysDiff = Math.abs(bankTxn.date.getTime() - companyTxn.date.getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff <= 3) {
          score += Math.max(0, 30 - daysDiff * 10)
        }

        // Description similarity
        const similarity = this.calculateStringSimilarity(
          bankTxn.description.toLowerCase(),
          companyTxn.description.toLowerCase()
        )
        score += similarity * 20

        if (score > bestScore) {
          bestScore = score
          bestMatch = companyTxn
        }
      }

      if (bestScore > 60) { // Threshold for automatic matching
        matched.push({
          bankTransactionId: bankTxn.id,
          companyTransactionId: bestMatch.id,
          confidence: bestScore,
          matchReason: bestScore > 80 ? 'High confidence match' : 'Probable match'
        })
        usedCompanyTransactions.add(bestMatch.id)
      } else {
        unmatched.push({
          transactionId: bankTxn.id,
          source: 'bank',
          amount: bankTxn.amount,
          date: bankTxn.date,
          description: bankTxn.description
        })

        // Add suggestions if there are potential matches
        if (bestMatch && bestScore > 30) {
          suggestions.push({
            bankTransactionId: bankTxn.id,
            possibleMatches: [{
              companyTransactionId: bestMatch.id,
              confidence: bestScore,
              reason: 'Partial match - please review'
            }]
          })
        }
      }
    }

    // Add unmatched company transactions
    for (const companyTxn of companyTransactions) {
      if (!usedCompanyTransactions.has(companyTxn.id)) {
        unmatched.push({
          transactionId: companyTxn.id,
          source: 'company',
          amount: companyTxn.amount,
          date: companyTxn.date,
          description: companyTxn.description
        })
      }
    }

    return {
      matched,
      unmatched,
      suggestions,
      summary: {
        totalBankTransactions: bankTransactions.length,
        totalCompanyTransactions: companyTransactions.length,
        matchedCount: matched.length,
        unmatchedCount: unmatched.length,
        reconciliationRate: Math.round((matched.length / bankTransactions.length) * 100 * 100) / 100
      }
    }
  }

  private generateAccountNumber(bankCode: string): string {
    const prefix = {
      'MBB': '1',
      'CIMB': '2',
      'PBB': '3',
      'RHB': '4',
      'HLB': '5',
      'BIMB': '6',
      'BSN': '7',
      'AMB': '8',
      'ABMB': '9',
      'UOB': '0'
    }[bankCode] || '1'

    return `${prefix}${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`
  }

  private generateTransactionDescription(isCredit: boolean): string {
    const creditDescriptions = [
      'Salary Credit',
      'Business Revenue',
      'Interest Payment',
      'Dividend Payment',
      'Refund from Merchant',
      'Transfer from Client',
      'Investment Return',
      'Rental Income'
    ]

    const debitDescriptions = [
      'TNG EWALLET TOPUP',
      'GRAB*MALAYSIA',
      'SHOPEE PAY',
      'LAZADA PAYMENT',
      'PETRONAS FUEL',
      'ASTRO MONTHLY',
      'UNIFI BROADBAND',
      'TNB ELECTRICITY',
      'MYEG SERVICES',
      'TOUCH N GO PLUS',
      'FOODPANDA ORDER',
      'MAYBANK CARD PAYMENT',
      'GOVERNMENT TAX PAYMENT',
      'INSURANCE PREMIUM',
      'LOAN INSTALLMENT'
    ]

    const descriptions = isCredit ? creditDescriptions : debitDescriptions
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  private categorizeTransaction(isCredit: boolean): string {
    if (isCredit) {
      return ['salary', 'business_income', 'investment', 'other_income'][Math.floor(Math.random() * 4)]
    } else {
      return ['food', 'transport', 'utilities', 'shopping', 'entertainment', 'fuel', 'tax'][Math.floor(Math.random() * 7)]
    }
  }

  private getRandomPaymentMethod(): string {
    return ['Debit Card', 'Online Banking', 'FPX', 'DuitNow', 'Touch n Go', 'Mobile App'][Math.floor(Math.random() * 6)]
  }

  private getRandomMerchant(): string {
    return ['Shopee', 'Lazada', 'Grab', 'FoodPanda', 'Petronas', 'Shell', 'KFC', 'McDonald\'s', 'Guardian', 'Watson\'s'][Math.floor(Math.random() * 10)]
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  private async getAccountById(accountId: string): Promise<BankAccount | null> {
    // In real implementation, this would query the database
    // For now, return a mock account
    return {
      id: accountId,
      bankCode: 'MBB',
      bankName: 'Malayan Banking Berhad',
      accountNumber: '1234567890',
      accountType: 'current',
      balance: 50000,
      currency: 'MYR',
      lastSyncDate: new Date(),
      isActive: true
    }
  }
}

export default MalaysianBankingService