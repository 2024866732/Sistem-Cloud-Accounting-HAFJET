import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  CreditCard,
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
  BarChart3
} from 'lucide-react'
import bankingService from '../services/bankingService'
import type { MalaysianBank, BankAccount, BankTransaction } from '../services/bankingService'

interface BankingProps {
  className?: string
}

// Futuristic Bank Card Component
const BankCard = ({ 
  bank, 
  account, 
  onConnect, 
  onSync,
  isConnected,
  isSyncing 
}: {
  bank: MalaysianBank
  account?: BankAccount
  onConnect: () => void
  onSync: () => void
  isConnected: boolean
  isSyncing: boolean
}) => {
  return (
    <div className="cyber-card group hover:scale-105 transition-all duration-300 rounded-2xl p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-futuristic-neon-blue/30 to-transparent animate-float" />
      </div>
      
      <div className="relative">
        {/* Bank Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-futuristic-blue-500/20 to-futuristic-purple-500/20 flex items-center justify-center border border-futuristic-blue-400/30">
              <Building2 className="w-6 h-6 text-futuristic-blue-400" />
            </div>
            <div>
        <h3 className="text-white font-bold text-lg">{bankingService.getBankDisplayName(bank.code)}</h3>
              <p className="text-futuristic-gray-400 text-sm">{bank.code}</p>
            </div>
          </div>
          <div className={`
            w-3 h-3 rounded-full animate-pulse
            ${isConnected ? 'bg-futuristic-neon-green shadow-neon' : 'bg-futuristic-gray-500'}
          `} />
        </div>

        {/* Account Info */}
        {account && (
          <div className="mb-4 p-4 rounded-xl bg-futuristic-gray-800/50 border border-futuristic-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-futuristic-gray-400 text-sm">Baki Semasa</span>
              <span className="text-2xl font-bold text-futuristic-neon-green">
                RM {account.balance?.toLocaleString() || '0.00'}
              </span>
            </div>
            <div className="text-xs text-futuristic-gray-500">
              A/C: {account.accountNumber?.replace(/(.{4})/g, '$1 ') || 'N/A'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isConnected ? (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`
                w-full btn-cyber flex items-center justify-center space-x-2
                ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neon-blue'}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyelaras...' : 'Selaras Data'}</span>
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="w-full btn-futuristic flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Sambung Bank</span>
            </button>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-futuristic-neon-green" />
              <span className="text-xs text-futuristic-neon-green">Tersambung</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-futuristic-gray-500" />
              <span className="text-xs text-futuristic-gray-500">Tidak Tersambung</span>
            </>
          )}
          {/* Placeholder: determine FPX support via feature list */}
          {bank.features?.includes?.('fpx') && (
            <div className="ml-auto">
              <span className="px-2 py-1 bg-futuristic-neon-blue/20 text-futuristic-neon-blue text-xs rounded-full border border-futuristic-neon-blue/30">
                FPX
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Transaction Row Component
const TransactionRow = ({ transaction }: { transaction: BankTransaction }) => {
  const isCredit = transaction.type === 'credit'
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-futuristic-gray-800/30 border border-futuristic-gray-700/30 hover:border-futuristic-blue-500/30 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isCredit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
        `}>
          {isCredit ? '↗️' : '↙️'}
        </div>
        <div>
          <p className="text-white font-medium">{transaction.description}</p>
          <div className="flex items-center space-x-2 text-xs text-futuristic-gray-400">
            <span>{new Date(transaction.date).toLocaleDateString('ms-MY')}</span>
            <span>•</span>
            <span>{transaction.reference || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
          {isCredit ? '+' : '-'}RM {Math.abs(transaction.amount).toLocaleString()}
        </p>
        <p className="text-xs text-futuristic-gray-400">Baki: RM {transaction.balance?.toLocaleString() ?? 'N/A'}</p>
      </div>
    </div>
  )
}

// Main Banking Component
const Banking: React.FC<BankingProps> = ({ className = '' }) => {
  const [banks, setBanks] = useState<MalaysianBank[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<MalaysianBank | null>(null)
  // Placeholder for future credential form state (currently unused)
  // const [credentials, setCredentials] = useState<BankConnectionCredentials>({})
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'analytics'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [banksData, accountsData] = await Promise.all([
          bankingService.getSupportedBanks(),
          bankingService.getBankAccounts()
        ])
        // For transactions we reuse first account if exists to get history
        let transactionsData: BankTransaction[] = []
        if (accountsData[0]) {
          try {
            const history = await bankingService.getTransactionHistory(accountsData[0].id, { limit: 50 })
            transactionsData = history.transactions
          } catch (err) {
            console.warn('Unable to load transaction history:', err)
          }
        }
        
        setBanks(banksData)
        setAccounts(accountsData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error('Failed to load banking data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleConnectBank = useCallback(async (bank: MalaysianBank) => {
    setSelectedBank(bank)
    setShowConnectModal(true)
  }, [])

  const handleSyncAccount = useCallback(async (accountId: string) => {
    try {
      setSyncingAccount(accountId)
      await bankingService.syncTransactions(accountId)
      
      // Refresh data after sync
      const updatedAccounts = await bankingService.getBankAccounts()
      setAccounts(updatedAccounts)
      if (updatedAccounts[0]) {
        try {
          const history = await bankingService.getTransactionHistory(updatedAccounts[0].id, { limit: 50 })
          setTransactions(history.transactions)
        } catch (e) {
          console.warn('Failed to refresh transaction history after sync', e)
        }
      }
    } catch (error) {
      console.error('Failed to sync account:', error)
    } finally {
      setSyncingAccount(null)
    }
  }, [])

  // Use isActive to represent active/connected accounts (service does not expose isConnected)
  const connectedAccounts = accounts.filter(acc => acc.isActive)
  const totalBalance = connectedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  const recentTransactions = transactions.slice(0, 10)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-futuristic-dark via-futuristic-gray-900 to-futuristic-darker flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-futuristic-neon-blue/30 rounded-full animate-spin border-t-futuristic-neon-blue"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-futuristic-neon-green/30 rounded-full animate-spin border-t-futuristic-neon-green animate-reverse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white animate-pulse">Memuat Sistem Perbankan</h2>
            <p className="text-futuristic-gray-400 animate-pulse">Menghubung ke bank-bank Malaysia...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 animate-fade-in-up ${className}`}>
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-futuristic-cyan-600/20 to-futuristic-blue-600/20 backdrop-blur-xl border border-futuristic-cyan-400/20 p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-futuristic-neon-blue/10 to-transparent animate-data-flow"></div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-futuristic-neon-cyan via-futuristic-neon-blue to-futuristic-neon-green bg-clip-text text-transparent mb-2">
                Sistem Perbankan Malaysia
              </h1>
              <p className="text-futuristic-gray-400 text-lg">
                Pengurusan akaun bank dan transaksi secara real-time
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30 animate-glow-pulse">
                🏦 {connectedAccounts.length} Bank Tersambung
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30 animate-glow-pulse">
                💳 FPX Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-futuristic-neon-green/20 to-green-500/20 flex items-center justify-center border border-futuristic-neon-green/30">
              <DollarSign className="w-6 h-6 text-futuristic-neon-green" />
            </div>
            <span className="text-futuristic-neon-green text-sm animate-pulse">Live</span>
          </div>
          <p className="text-futuristic-gray-400 text-sm mb-2">Jumlah Baki</p>
          <p className="text-3xl font-bold text-futuristic-neon-green text-glow">
            RM {totalBalance.toLocaleString()}
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-futuristic-blue-500/20 to-futuristic-blue-600/20 flex items-center justify-center border border-futuristic-blue-400/30">
              <Building2 className="w-6 h-6 text-futuristic-blue-400" />
            </div>
          </div>
          <p className="text-futuristic-gray-400 text-sm mb-2">Akaun Aktif</p>
          <p className="text-3xl font-bold text-futuristic-blue-400">
            {connectedAccounts.length}
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-futuristic-purple-500/20 to-futuristic-purple-600/20 flex items-center justify-center border border-futuristic-purple-400/30">
              <Activity className="w-6 h-6 text-futuristic-purple-400" />
            </div>
          </div>
          <p className="text-futuristic-gray-400 text-sm mb-2">Transaksi Hari Ini</p>
          <p className="text-3xl font-bold text-futuristic-purple-400">
            {transactions.filter(t => 
              new Date(t.date).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-futuristic-cyan-500/20 to-futuristic-cyan-600/20 flex items-center justify-center border border-futuristic-cyan-400/30">
              <CheckCircle className="w-6 h-6 text-futuristic-cyan-400" />
            </div>
          </div>
          <p className="text-futuristic-gray-400 text-sm mb-2">Status Sistem</p>
          <p className="text-lg font-bold text-futuristic-neon-green">
            Operasi Normal
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-futuristic-gray-800/50 backdrop-blur-sm rounded-2xl border border-futuristic-gray-700/50">
        {([
          { id: 'dashboard', label: '🏠 Dashboard', icon: Activity },
          { id: 'accounts', label: '🏦 Akaun Bank', icon: Building2 },
          { id: 'transactions', label: '💳 Transaksi', icon: CreditCard },
          { id: 'analytics', label: '📊 Analisis', icon: BarChart3 }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-futuristic-neon-blue/20 to-futuristic-neon-purple/20 text-futuristic-neon-blue border border-futuristic-neon-blue/30 shadow-glow'
                : 'text-futuristic-gray-400 hover:text-white hover:bg-futuristic-gray-700/50'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-futuristic-neon-blue" />
              Transaksi Terkini
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <TransactionRow transaction={transaction} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-futuristic-neon-green" />
              Tindakan Pantas
            </h3>
            <div className="space-y-4">
              <button className="w-full btn-futuristic flex items-center justify-center space-x-3">
                <Plus className="w-5 h-5" />
                <span>Sambung Bank Baharu</span>
              </button>
              <button className="w-full btn-cyber flex items-center justify-center space-x-3">
                <RefreshCw className="w-5 h-5" />
                <span>Selaras Semua Akaun</span>
              </button>
              <button className="w-full btn-cyber flex items-center justify-center space-x-3">
                <Download className="w-5 h-5" />
                <span>Muat Turun Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-futuristic-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari bank atau akaun..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-futuristic-gray-800/50 border border-futuristic-gray-700/50 rounded-xl text-white placeholder-futuristic-gray-400 focus:border-futuristic-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Banks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks
              .filter(bank => 
                bankingService.getBankDisplayName(bank.code).toLowerCase().includes(searchTerm.toLowerCase()) ||
                bank.code.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((bank, index) => {
                const account = accounts.find(acc => acc.bankCode === bank.code)
                return (
                  <div key={bank.code} style={{ animationDelay: `${index * 100}ms` }}>
                    <BankCard
                      bank={bank}
                      account={account}
                      onConnect={() => handleConnectBank(bank)}
                      onSync={() => account && handleSyncAccount(account.id)}
                      isConnected={!!account?.isActive}
                      isSyncing={syncingAccount === account?.id}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-futuristic-neon-purple" />
              Semua Transaksi
            </h3>
            <button className="btn-cyber">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <div key={transaction.id} style={{ animationDelay: `${index * 50}ms` }}>
                <TransactionRow transaction={transaction} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-futuristic-neon-cyan" />
              Analisis Aliran Tunai
            </h3>
            <div className="h-64 bg-gradient-to-br from-futuristic-gray-800/50 to-futuristic-gray-700/50 rounded-xl flex items-center justify-center border border-futuristic-gray-600/50">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-futuristic-gray-500 mx-auto mb-4" />
                <p className="text-futuristic-gray-400">Carta analisis akan dipaparkan di sini</p>
              </div>
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-futuristic-neon-purple" />
              Trend Bulanan
            </h3>
            <div className="h-64 bg-gradient-to-br from-futuristic-gray-800/50 to-futuristic-gray-700/50 rounded-xl flex items-center justify-center border border-futuristic-gray-600/50">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-futuristic-gray-500 mx-auto mb-4" />
                <p className="text-futuristic-gray-400">Carta trend akan dipaparkan di sini</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Bank Modal */}
      {showConnectModal && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
          <div className="relative bg-gradient-to-br from-futuristic-gray-900/95 to-futuristic-dark/95 backdrop-blur-xl border border-futuristic-blue-400/20 rounded-2xl p-8 max-w-md w-full shadow-cyber">
            <h3 className="text-2xl font-bold text-white mb-6">Sambung ke {bankingService.getBankDisplayName(selectedBank.code)}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-futuristic-gray-400 text-sm mb-2">ID Pengguna</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-futuristic-gray-800/50 border border-futuristic-gray-700/50 rounded-xl text-white focus:border-futuristic-blue-500 focus:outline-none"
                  placeholder="Masukkan ID pengguna bank"
                />
              </div>
              <div>
                <label className="block text-futuristic-gray-400 text-sm mb-2">Kata Laluan</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-futuristic-gray-800/50 border border-futuristic-gray-700/50 rounded-xl text-white focus:border-futuristic-blue-500 focus:outline-none"
                  placeholder="Masukkan kata laluan"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-6 py-3 bg-futuristic-gray-700 text-white rounded-xl hover:bg-futuristic-gray-600 transition-colors"
              >
                Batal
              </button>
              <button className="flex-1 btn-futuristic">
                Sambung
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banking