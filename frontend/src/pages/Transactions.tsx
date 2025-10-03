import { useState } from 'react'
import { formatMYR } from '../utils'

interface Transaction {
  id: string
  date: string
  description: string
  type: 'income' | 'expense' | 'transfer'
  category: string
  amount: number
  sstRate?: number
  sstAmount?: number
  totalAmount: number
  paymentMethod: string
  reference: string
  status: 'completed' | 'pending' | 'cancelled'
  bankAccount?: string
  supplier?: string
  customer?: string
  attachments?: string[]
}

interface BankAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  bank: string
  accountNumber: string
  balance: number
  currency: 'MYR'
}

export default function Transactions() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')

  // Mock bank accounts
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      name: 'CIMB Current Account',
      type: 'checking',
      bank: 'CIMB Bank',
      accountNumber: '1234567890',
      balance: 45750.50,
      currency: 'MYR'
    },
    {
      id: '2', 
      name: 'Maybank Savings',
      type: 'savings',
      bank: 'Maybank',
      accountNumber: '9876543210',
      balance: 125300.75,
      currency: 'MYR'
    },
    {
      id: '3',
      name: 'Public Bank Business',
      type: 'checking', 
      bank: 'Public Bank',
      accountNumber: '5555666677',
      balance: 67890.25,
      currency: 'MYR'
    }
  ])

  // Mock transactions
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-10-02',
      description: 'Bayaran dari Syarikat ABC Sdn Bhd',
      type: 'income',
      category: 'Sales Revenue',
      amount: 5000,
      sstRate: 6,
      sstAmount: 300,
      totalAmount: 5300,
      paymentMethod: 'Bank Transfer',
      reference: 'INV-2024-001',
      status: 'completed',
      bankAccount: 'CIMB Current Account',
      customer: 'Syarikat ABC Sdn Bhd'
    },
    {
      id: '2',
      date: '2024-10-01',
      description: 'Bayar bil elektrik pejabat',
      type: 'expense',
      category: 'Utilities',
      amount: 450.75,
      totalAmount: 450.75,
      paymentMethod: 'Online Banking',
      reference: 'TNB-092024',
      status: 'completed',
      bankAccount: 'CIMB Current Account',
      supplier: 'Tenaga Nasional Berhad'
    },
    {
      id: '3',
      date: '2024-09-30',
      description: 'Pembelian komputer riba untuk staf',
      type: 'expense',
      category: 'Equipment',
      amount: 2500,
      sstRate: 6,
      sstAmount: 150,
      totalAmount: 2650,
      paymentMethod: 'Company Credit Card',
      reference: 'PO-2024-045',
      status: 'completed',
      supplier: 'IT Solutions Sdn Bhd'
    },
    {
      id: '4',
      date: '2024-09-28',
      description: 'Pindahan dana antara akaun',
      type: 'transfer',
      category: 'Bank Transfer',
      amount: 10000,
      totalAmount: 10000,
      paymentMethod: 'Internal Transfer',
      reference: 'TRF-092024-001',
      status: 'completed',
      bankAccount: 'CIMB Current Account'
    },
    {
      id: '5',
      date: '2024-09-25',
      description: 'Perkhidmatan konsultasi IT',
      type: 'income',
      category: 'Service Revenue',
      amount: 12000,
      sstRate: 6,
      sstAmount: 720,
      totalAmount: 12720,
      paymentMethod: 'Bank Transfer',
      reference: 'INV-2024-002',
      status: 'completed',
      bankAccount: 'Maybank Savings',
      customer: 'Perniagaan XYZ'
    }
  ])

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800'
      case 'expense': return 'bg-red-100 text-red-800'
      case 'transfer': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0)

  const totalSST = transactions
    .filter(t => t.sstAmount && t.status === 'completed')
    .reduce((sum, t) => sum + (t.sstAmount || 0), 0)

  const netIncome = totalIncome - totalExpense

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-8 rounded-3xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">💰 Transaksi Malaysia</h1>
            <p className="text-yellow-100">Pengurusan transaksi pendapatan dan perbelanjaan dengan SST</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300"
          >
            + Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">🏦 Akaun Bank</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm opacity-90">{account.bank}</p>
                  <p className="font-semibold">{account.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Balance</p>
                  <p className="text-lg font-bold">{formatMYR(account.balance)}</p>
                </div>
              </div>
              <p className="text-xs opacity-75">**** **** **** {account.accountNumber.slice(-4)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah Pendapatan</p>
              <p className="text-2xl font-bold text-green-600">{formatMYR(totalIncome)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <span className="text-2xl">�</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah Perbelanjaan</p>
              <p className="text-2xl font-bold text-red-600">{formatMYR(totalExpense)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pendapatan Bersih</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMYR(netIncome)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah SST</p>
              <p className="text-2xl font-bold text-purple-600">{formatMYR(totalSST)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <span className="text-2xl">🧮</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'income' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendapatan ({transactions.filter(t => t.type === 'income').length})
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'expense' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Perbelanjaan ({transactions.filter(t => t.type === 'expense').length})
            </button>
            <button
              onClick={() => setFilter('transfer')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'transfer' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pindahan ({transactions.filter(t => t.type === 'transfer').length})
            </button>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="this-month">Bulan Ini</option>
            <option value="last-month">Bulan Lepas</option>
            <option value="this-quarter">Suku Tahun Ini</option>
            <option value="this-year">Tahun Ini</option>
            <option value="custom">Tempoh Khusus</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">
            Senarai Transaksi ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarikh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penerangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SST
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('ms-MY')}
                    </div>
                    <div className="text-sm text-gray-500">{transaction.reference}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.paymentMethod}
                      {transaction.bankAccount && ` • ${transaction.bankAccount}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.category}</div>
                    {(transaction.customer || transaction.supplier) && (
                      <div className="text-sm text-gray-500">
                        {transaction.customer || transaction.supplier}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'income' ? 'Pendapatan' : 
                       transaction.type === 'expense' ? 'Perbelanjaan' : 'Pindahan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      {formatMYR(transaction.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Base: {formatMYR(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {transaction.sstAmount ? formatMYR(transaction.sstAmount) : '-'}
                    </div>
                    {transaction.sstRate && (
                      <div className="text-sm text-gray-500">{transaction.sstRate}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Selesai' : 
                       transaction.status === 'pending' ? 'Belum Selesai' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-green-600 hover:text-green-900">Lihat</button>
                      <button className="text-red-600 hover:text-red-900">Padam</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Tambah Transaksi Baru</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚧</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Form Tambah Transaksi</h4>
                <p className="text-gray-600">
                  Form untuk tambah transaksi baru dengan automatic SST calculation,<br/>
                  bank reconciliation, dan expense categorization akan available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}