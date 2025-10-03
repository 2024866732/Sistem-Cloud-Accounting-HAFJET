import React, { useState, useEffect, useCallback } from 'react'
import { 
  Building2, 
  CreditCard, 
  Banknote, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
  Shield,
  Download,
  Search,
  Wifi,
  WifiOff,
  DollarSign,
  PieChart,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  BarChart3
} from 'lucide-react'
import bankingService from '../services/bankingService'
import type { 
  MalaysianBank, 
  BankAccount, 
  BankTransaction,
  BankConnectionCredentials,
  ReconciliationResult
} from '../services/bankingService'

interface BankingProps {
  className?: string
}

const Banking: React.FC<BankingProps> = ({ className = '' }) => {
  const [banks, setBanks] = useState<MalaysianBank[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showReconciliationModal, setShowReconciliationModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<MalaysianBank | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [credentials, setCredentials] = useState<BankConnectionCredentials>({})
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'reconciliation' | 'analytics'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null)
  const [bankingStats, setBankingStats] = useState<any>(null)

  useEffect(() => {
    loadBankingData()
  }, [])

  const loadBankingData = async () => {
    try {
      setLoading(true)
      const [banksData, accountsData, statsData] = await Promise.all([
        bankingService.getSupportedBanks(),
        bankingService.getBankAccounts(),
        loadBankingStats()
      ])
      setBanks(banksData)
      setAccounts(accountsData)
      setBankingStats(statsData)
    } catch (error) {
      console.error('Failed to load banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBankingStats = async () => {
    try {
      // Mock stats - in real implementation, this would come from the API
      return {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
        monthlyTransactions: 156,
        lastSyncDate: new Date(),
        bankDistribution: []
      }
    } catch (error) {
      console.error('Failed to load banking stats:', error)
      return null
    }
  }

  const handleConnectBank = async () => {
    if (!selectedBank) return

    try {
      setLoading(true)
      const newAccounts = await bankingService.connectBank(selectedBank.code, credentials)
      setAccounts(prev => [...prev, ...newAccounts])
      setShowConnectModal(false)
      setSelectedBank(null)
      setCredentials({})
      await loadBankingData() // Refresh data
    } catch (error) {
      console.error('Failed to connect bank:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncTransactions = async (accountId: string) => {
    try {
      setSyncingAccount(accountId)
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      const syncedTransactions = await bankingService.syncTransactions(accountId, fromDate)
      setTransactions(prev => [...prev, ...syncedTransactions])
    } catch (error) {
      console.error('Failed to sync transactions:', error)
    } finally {
      setSyncingAccount(null)
    }
  }

  const handleDisconnectBank = async (bankCode: string) => {
    try {
      await bankingService.disconnectBank(bankCode)
      setAccounts(prev => prev.filter(acc => acc.bankCode !== bankCode))
    } catch (error) {
      console.error('Failed to disconnect bank:', error)
    }
  }

  const handleReconciliation = async (accountId: string) => {
    try {
      // Mock company transactions for demo
      const companyTransactions = [
        {
          id: 'comp_1',
          date: new Date(),
          amount: 1500.00,
          description: 'Client Payment',
          type: 'income' as const
        }
      ]
      
      const result = await bankingService.performReconciliation(accountId, companyTransactions)
      setReconciliationResult(result)
      setShowReconciliationModal(true)
    } catch (error) {
      console.error('Failed to perform reconciliation:', error)
    }
  }

  const handleExportTransactions = async (accountId: string, format: 'csv' | 'excel' = 'csv') => {
    try {
      const exportData = await bankingService.exportTransactions(accountId, format)
      // In real implementation, trigger download
      console.log('Export data:', exportData)
    } catch (error) {
      console.error('Failed to export transactions:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return bankingService.formatCurrency(amount)
  }

  const getBankLogo = (bankCode: string) => {
    return bankingService.getBankLogo(bankCode)
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return '💰'
      case 'current': return '💳'
      case 'business': return '🏢'
      case 'islamic': return '☪️'
      default: return '💰'
    }
  }

  const getConnectionStatusIcon = (bankCode: string) => {
    const status = bankingService.getBankConnectionStatus ? 
      bankingService.getBankConnectionStatus(bankCode) : 
      { isConnected: accounts.some(acc => acc.bankCode === bankCode) }
    
    return status.isConnected ? 
      <div className="flex items-center gap-1 text-green-600"><Wifi className="w-4 h-4" />Connected</div> :
      <div className="flex items-center gap-1 text-red-600"><WifiOff className="w-4 h-4" />Disconnected</div>
  }

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = transactionFilter === 'all' || txn.type === transactionFilter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                🇲🇾 Malaysian Banking Integration
              </h1>
              <p className="text-gray-600">
                Comprehensive bank management with real-time sync, reconciliation & analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadBankingData}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowConnectModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Connect Bank
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Connected Banks</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {accounts.length > 0 ? new Set(accounts.map(a => a.bankCode)).size : '0'}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {banks.filter(b => b.isSupported).length} available
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total Accounts</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{accounts.length}</div>
                <p className="text-sm text-gray-600 mt-1">
                  {accounts.filter(a => a.isActive).length} active
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total Balance</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Across all accounts
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Monthly Txns</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {transactions.length || 156}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This month
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('accounts')}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-600">Add Bank Account</span>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">Sync Transactions</span>
                </button>
                <button
                  onClick={() => setActiveTab('reconciliation')}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-600">Reconcile Accounts</span>
                </button>
              </div>
            </div>

            {/* Connected Banks Overview */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Connected Banks</h3>
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No banks connected yet</p>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Your First Bank
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(new Set(accounts.map(a => a.bankCode))).map(bankCode => {
                    const bankAccounts = accounts.filter(a => a.bankCode === bankCode)
                    const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
                    
                    return (
                      <div key={bankCode} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getBankLogo(bankCode)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-800">{bankAccounts[0].bankName}</h4>
                              <p className="text-sm text-gray-500">{bankAccounts.length} accounts</p>
                            </div>
                          </div>
                          {getConnectionStatusIcon(bankCode)}
                        </div>
                        <div className="text-lg font-bold text-gray-800 mb-2">
                          {formatCurrency(totalBalance)}
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleSyncTransactions(bankAccounts[0].id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Sync Now
                          </button>
                          <button
                            onClick={() => handleDisconnectBank(bankCode)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Bank Accounts</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadBankingData}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Account
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {accounts.map(account => (
                <div key={account.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getBankLogo(account.bankCode)}</span>
                        <span className="text-lg">{getAccountTypeIcon(account.accountType)}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{account.bankName}</h4>
                        <p className="text-gray-600">
                          {account.accountNumber} • {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last sync: {new Date(account.lastSyncDate).toLocaleString()}
                        </p>
                        {account.iban && (
                          <p className="text-xs text-gray-400">IBAN: {account.iban}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800 mb-2">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSyncTransactions(account.id)}
                          disabled={syncingAccount === account.id}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {syncingAccount === account.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              Sync
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReconciliation(account.id)}
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Reconcile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value as typeof transactionFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Credits Only</option>
                  <option value="debit">Debits Only</option>
                </select>
                <button
                  onClick={() => handleExportTransactions(accounts[0]?.id || '')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Banknote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No transactions found</p>
                <p className="text-sm text-gray-400">
                  {transactions.length === 0 
                    ? 'Sync your bank accounts to see transactions here'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.slice(0, 20).map(transaction => (
                  <div key={transaction.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{transaction.description}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.reference}
                        </p>
                        {transaction.category && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mt-1">
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <p className="text-sm text-gray-500">
                          Balance: {formatCurrency(transaction.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reconciliation Tab */}
        {activeTab === 'reconciliation' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Bank Reconciliation</h3>
              <button 
                onClick={() => accounts.length > 0 && handleReconciliation(accounts[0].id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Reconciliation
              </button>
            </div>

            {reconciliationResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Matched</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {reconciliationResult.summary.matchedCount}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">Unmatched</span>
                    </div>
                    <div className="text-2xl font-bold text-red-800">
                      {reconciliationResult.summary.unmatchedCount}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {reconciliationResult.summary.reconciliationRate}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Ready to reconcile your accounts</p>
                <p className="text-sm text-gray-400">Compare your company records with bank statements for accuracy</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Banking Analytics</h3>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Advanced banking analytics</p>
                <p className="text-sm text-gray-400">Transaction patterns, cash flow analysis, and forecasting</p>
              </div>
            </div>
          </div>
        )}

        {/* Connect Bank Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Connect Malaysian Bank</h2>
                <p className="text-gray-600 mt-1">Choose your bank and provide connection details</p>
              </div>

              <div className="p-6">
                {!selectedBank ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banks.map(bank => (
                      <button
                        key={bank.code}
                        onClick={() => setSelectedBank(bank)}
                        disabled={!bank.isSupported}
                        className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                          bank.isSupported 
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className="text-3xl">{getBankLogo(bank.code)}</span>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-800">{bank.name}</h3>
                          <p className="text-sm text-gray-500">{bank.type} bank</p>
                          <div className="flex items-center gap-2 mt-1">
                            {bank.isSupported ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">Supported</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-orange-600">Coming Soon</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {bank.features.slice(0, 3).map(feature => (
                              <span key={feature} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-3xl">{getBankLogo(selectedBank.code)}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{selectedBank.name}</h3>
                        <p className="text-sm text-gray-500">Authentication required</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username/Customer ID
                        </label>
                        <input
                          type="text"
                          value={credentials.username || ''}
                          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your username or customer ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password/PIN
                        </label>
                        <input
                          type="password"
                          value={credentials.password || ''}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your password or PIN"
                        />
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Secure Connection</p>
                            <p className="text-sm text-blue-700">Your banking credentials are encrypted and never stored on our servers.</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleConnectBank}
                        disabled={!credentials.username || !credentials.password}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Connect Bank Account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowConnectModal(false)
                    setSelectedBank(null)
                    setCredentials({})
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reconciliation Results Modal */}
        {showReconciliationModal && reconciliationResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Reconciliation Results</h2>
                <p className="text-gray-600 mt-1">Review matched and unmatched transactions</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Matched Transactions</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {reconciliationResult.summary.matchedCount}
                    </div>
                    <p className="text-sm text-green-700">
                      {reconciliationResult.summary.reconciliationRate}% success rate
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">Unmatched</span>
                    </div>
                    <div className="text-2xl font-bold text-red-800">
                      {reconciliationResult.summary.unmatchedCount}
                    </div>
                    <p className="text-sm text-red-700">
                      Require review
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Suggestions</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {reconciliationResult.suggestions.length}
                    </div>
                    <p className="text-sm text-yellow-700">
                      Potential matches
                    </p>
                  </div>
                </div>

                {reconciliationResult.unmatched.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Unmatched Transactions</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {reconciliationResult.unmatched.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{item.description}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(item.date).toLocaleDateString()} • {item.source}
                              </p>
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              {formatCurrency(item.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowReconciliationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Banking