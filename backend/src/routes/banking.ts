import express, { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import MalaysianBankingService from '../services/MalaysianBankingService'
import { logger } from '../utils/logger'
import { notificationService } from '../index'

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    company: string;
  };
}

const router = express.Router()
const bankingService = new MalaysianBankingService()

// Get supported Malaysian banks
router.get('/banks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const banks = bankingService.getSupportedBanks()
    res.json({
      success: true,
      data: banks,
      message: 'Supported Malaysian banks retrieved successfully'
    })
  } catch (error) {
    logger.error('Failed to get supported banks:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supported banks',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Connect to a Malaysian bank
router.post('/connect', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bankCode, credentials } = req.body
    const userId = req.user?.id
    const companyId = req.user?.company

    if (!bankCode || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Bank code and credentials are required'
      })
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      })
    }

    // Connect to bank and retrieve accounts
    const accounts = await bankingService.connectBank(bankCode, credentials, companyId)

    // Send notification about successful bank connection
    if (notificationService && userId) {
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: 'Bank Connected',
        message: `Successfully connected to ${bankCode}. Found ${accounts.length} accounts.`,
        priority: 'medium',
        companyId: companyId || 'default'
      })
    }

    res.json({
      success: true,
      data: accounts,
      message: `Successfully connected to ${bankCode}`
    })

  } catch (error) {
    logger.error('Failed to connect bank:', error)
    
    // Send error notification
    if (notificationService && req.user?.id) {
      await notificationService.sendNotification(req.user.id, {
        type: 'system_alert',
        title: 'Bank Connection Failed',
        message: `Failed to connect to ${req.body.bankCode}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        priority: 'high',
        companyId: req.user.company || 'default'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to connect to bank',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get bank accounts for a company
router.get('/accounts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In real implementation, fetch from database
    const mockAccounts = [
      {
        id: 'MBB_savings_001',
        bankCode: 'MBB',
        bankName: 'Malayan Banking Berhad',
        accountNumber: '****7890',
        accountType: 'savings',
        balance: 25450.75,
        currency: 'MYR',
        lastSyncDate: new Date(),
        isActive: true
      },
      {
        id: 'CIMB_current_001',
        bankCode: 'CIMB',
        bankName: 'CIMB Bank Berhad',
        accountNumber: '****3210',
        accountType: 'current',
        balance: 87322.50,
        currency: 'MYR',
        lastSyncDate: new Date(),
        isActive: true
      }
    ]

    res.json({
      success: true,
      data: mockAccounts,
      message: 'Bank accounts retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get bank accounts:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bank accounts',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Sync transactions from bank
router.post('/sync/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params
    const { fromDate, toDate } = req.body
    const userId = req.user?.id
    const companyId = req.user?.company

    const transactions = await bankingService.syncTransactions(
      accountId,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    )

    // Send notification about sync completion
    if (notificationService && userId) {
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: 'Transactions Synced',
        message: `Synced ${transactions.length} transactions from your bank account`,
        priority: 'medium',
        companyId: req.user?.company || 'default'
      })
    }

    res.json({
      success: true,
      data: transactions,
      message: `Successfully synced ${transactions.length} transactions`
    })

  } catch (error) {
    logger.error('Failed to sync transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to sync transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Perform bank reconciliation
router.post('/reconcile/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params
    const { companyTransactions } = req.body
    const userId = req.user?.id
    const companyId = req.user?.company

    if (!companyTransactions || !Array.isArray(companyTransactions)) {
      return res.status(400).json({
        success: false,
        message: 'Company transactions array is required'
      })
    }

    const reconciliation = await bankingService.performReconciliation(
      accountId,
      companyTransactions
    )

    // Send notification about reconciliation results
    if (notificationService && userId) {
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: 'Reconciliation Complete',
        message: `Reconciliation completed: ${reconciliation.summary.matchedCount} matched, ${reconciliation.summary.unmatchedCount} unmatched transactions`,
        priority: 'medium',
        companyId: req.user?.company || 'default'
      })
    }

    res.json({
      success: true,
      data: reconciliation,
      message: 'Bank reconciliation completed successfully'
    })

  } catch (error) {
    logger.error('Failed to perform reconciliation:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to perform bank reconciliation',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get transaction categories (Malaysian specific)
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const malaysianCategories = {
      income: [
        { code: 'income_salary', name: 'Salary/Gaji', description: 'Monthly salary payments' },
        { code: 'income_dividend', name: 'Dividend', description: 'Investment dividends from KLSE' },
        { code: 'income_rental', name: 'Rental Income', description: 'Property rental income' },
        { code: 'income_business', name: 'Business Income', description: 'Business revenue' },
        { code: 'income_other', name: 'Other Income', description: 'Other income sources' }
      ],
      expenses: [
        { code: 'taxes', name: 'Taxes', description: 'GST, SST, Income Tax payments' },
        { code: 'transport', name: 'Transport', description: 'Touch n Go, Grab, fuel' },
        { code: 'food_delivery', name: 'Food Delivery', description: 'Grab Food, FoodPanda, etc.' },
        { code: 'online_shopping', name: 'Online Shopping', description: 'Shopee, Lazada, Zalora' },
        { code: 'utilities_telecom', name: 'Utilities & Telecom', description: 'Astro, Unifi, electricity' },
        { code: 'insurance', name: 'Insurance/Takaful', description: 'Insurance and Takaful premiums' },
        { code: 'loan_payment', name: 'Loan Payments', description: 'Bank loan installments' },
        { code: 'retirement_fund', name: 'EPF/KWSP', description: 'Employee Provident Fund' },
        { code: 'social_security', name: 'SOCSO/PERKESO', description: 'Social Security Organisation' },
        { code: 'postal_services', name: 'Postal Services', description: 'Pos Malaysia, Poslaju' },
        { code: 'expense_other', name: 'Other Expenses', description: 'Other business expenses' }
      ]
    }

    res.json({
      success: true,
      data: malaysianCategories,
      message: 'Malaysian transaction categories retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get categories:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get bank connection status
router.get('/status/:bankCode', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bankCode } = req.params
    const status = bankingService.getBankConnectionStatus(bankCode)

    res.json({
      success: true,
      data: {
        bankCode,
        isConnected: status.isConnected,
        lastSync: status.lastSync,
        status: status.status
      },
      message: `Bank connection status for ${bankCode}`
    })

  } catch (error) {
    logger.error('Failed to get bank status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get bank connection status',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Generate reconciliation report
router.get('/reconciliation-report/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params
    const { startDate, endDate } = req.query

    // In real implementation, generate detailed reconciliation report
    const mockReport = {
      accountId,
      reportPeriod: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate || new Date()
      },
      summary: {
        totalBankTransactions: 145,
        totalCompanyTransactions: 132,
        matchedTransactions: 128,
        unmatchedTransactions: 4,
        reconciliationRate: 97.0
      },
      issues: [
        {
          type: 'unmatched_bank',
          description: 'Bank transaction not found in company records',
          amount: 450.00,
          date: new Date(),
          suggestions: ['Check if transaction was recorded with different amount', 'Verify transaction date']
        }
      ],
      recommendations: [
        'Review unmatched transactions for potential data entry errors',
        'Consider setting up automatic transaction categorization',
        'Schedule regular reconciliation (weekly recommended)'
      ]
    }

    res.json({
      success: true,
      data: mockReport,
      message: 'Reconciliation report generated successfully'
    })

  } catch (error) {
    logger.error('Failed to generate reconciliation report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate reconciliation report',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Disconnect from a bank
router.delete('/disconnect/:bankCode', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bankCode } = req.params
    const userId = req.user?.id

    // In real implementation, this would revoke bank connection
    logger.info(`Disconnecting from bank: ${bankCode}`)

    // Send notification about disconnection
    if (notificationService && userId) {
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: 'Bank Disconnected',
        message: `Successfully disconnected from ${bankCode}`,
        priority: 'low',
        companyId: req.user?.company || 'default'
      })
    }

    res.json({
      success: true,
      message: `Successfully disconnected from ${bankCode}`
    })

  } catch (error) {
    logger.error('Failed to disconnect bank:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect from bank',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get bank account balance
router.get('/balance/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params

    // In real implementation, fetch real-time balance from bank
    const mockBalance = {
      accountId,
      balance: 45678.90,
      currency: 'MYR',
      lastUpdated: new Date(),
      availableBalance: 45678.90,
      pendingTransactions: []
    }

    res.json({
      success: true,
      data: mockBalance,
      message: 'Account balance retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get account balance:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve account balance',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get transaction history with pagination
router.get('/transactions/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params
    const { page = 1, limit = 50, fromDate, toDate, category } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    // In real implementation, this would fetch from bank and apply filters
    const mockTransactions = Array.from({ length: limitNum }, (_, i) => ({
      id: `txn_${Date.now()}_${i}`,
      accountId,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      description: `Transaction ${i + 1}`,
      amount: Math.round((Math.random() * 2000 - 1000) * 100) / 100,
      type: Math.random() > 0.5 ? 'credit' : 'debit',
      balance: 45000 + Math.random() * 10000,
      category: category || 'general',
      reference: `REF${Math.floor(Math.random() * 1000000)}`
    }))

    res.json({
      success: true,
      data: {
        transactions: mockTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 500,
          totalPages: Math.ceil(500 / limitNum)
        }
      },
      message: 'Transaction history retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get transaction history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction history',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Export transactions to CSV/Excel
router.get('/export/:accountId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId } = req.params
    const { format = 'csv', fromDate, toDate } = req.query

    // In real implementation, this would generate actual file
    const mockExportData = {
      filename: `transactions_${accountId}_${new Date().toISOString().split('T')[0]}.${format}`,
      url: `/downloads/transactions_${accountId}.${format}`,
      recordCount: 150,
      generatedAt: new Date()
    }

    res.json({
      success: true,
      data: mockExportData,
      message: `Transaction export prepared in ${format} format`
    })

  } catch (error) {
    logger.error('Failed to export transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router