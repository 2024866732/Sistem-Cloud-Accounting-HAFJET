import { useState, useEffect } from 'react'
import { formatMYR } from '../utils'

interface DashboardData {
  revenue: { total: number; growth: number; thisMonth: number }
  expenses: { total: number; growth: number; thisMonth: number }
  profit: { total: number; margin: number; growth: number }
  tax: { sstCollected: number; sstPayable: number; taxRate: number }
  einvoice: { submitted: number; approved: number; complianceRate: number }
  customers: { total: number; active: number; newThisMonth: number }
  invoices: { total: number; paid: number; pending: number; overdue: number; comingDue: number }
  bills: { total: number; paid: number; pending: number; overdue: number; comingDue: number }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    amount?: number
    date: string
    status: string
  }>
  monthlyRevenue: Array<{ month: string; amount: number }>
}

// Futuristic Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  trend = 'up',
  subtitle
}: {
  title: string
  value: string
  change?: string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'cyan' | 'pink'
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-futuristic-blue-500/20 to-futuristic-blue-600/20',
      border: 'border-futuristic-blue-400/30',
      glow: 'shadow-neon-blue',
      text: 'text-futuristic-blue-400'
    },
    green: {
      bg: 'from-futuristic-neon-green/20 to-green-500/20',
      border: 'border-futuristic-neon-green/30',
      glow: 'shadow-neon',
      text: 'text-futuristic-neon-green'
    },
    purple: {
      bg: 'from-futuristic-purple-500/20 to-futuristic-purple-600/20',
      border: 'border-futuristic-purple-400/30',
      glow: 'shadow-neon-purple',
      text: 'text-futuristic-purple-400'
    },
    cyan: {
      bg: 'from-futuristic-cyan-500/20 to-futuristic-cyan-600/20',
      border: 'border-futuristic-cyan-400/30',
      glow: 'shadow-neon-blue',
      text: 'text-futuristic-cyan-400'
    },
    pink: {
      bg: 'from-futuristic-neon-pink/20 to-pink-500/20',
      border: 'border-futuristic-neon-pink/30',
      glow: 'shadow-neon-purple',
      text: 'text-futuristic-neon-pink'
    }
  }

  const currentColor = colorClasses[color]

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6
      bg-gradient-to-br ${currentColor.bg} backdrop-blur-xl
      border ${currentColor.border} hover:${currentColor.glow}
      transition-all duration-300 hover:scale-105 animate-fade-in-up
      cyber-card group cursor-pointer
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-float" />
      </div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${currentColor.bg}
            flex items-center justify-center text-2xl
            border ${currentColor.border} group-hover:animate-glow-pulse
          `}>
            {icon}
          </div>
          {change && (
            <div className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold
              ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 
                trend === 'down' ? 'bg-red-500/20 text-red-400' : 
                'bg-gray-500/20 text-gray-400'}
            `}>
              <span>{trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="text-futuristic-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${currentColor.text} mb-1 text-glow`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-futuristic-gray-500 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Quick Action Button Component
const QuickActionButton = ({ 
  icon, 
  label, 
  onClick,
  color = 'blue' 
}: {
  icon: string
  label: string
  onClick: () => void
  color?: 'blue' | 'green' | 'purple' | 'cyan'
}) => {
  const colorClasses = {
    blue: 'from-futuristic-blue-500 to-futuristic-blue-600 hover:from-futuristic-blue-400 hover:to-futuristic-blue-500',
    green: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
    purple: 'from-futuristic-purple-500 to-futuristic-purple-600 hover:from-futuristic-purple-400 hover:to-futuristic-purple-500',
    cyan: 'from-futuristic-cyan-500 to-futuristic-cyan-600 hover:from-futuristic-cyan-400 hover:to-futuristic-cyan-500'
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative group w-full p-4 rounded-xl 
        bg-gradient-to-r ${colorClasses[color]}
        border border-white/20 text-white font-semibold
        transition-all duration-300 hover:scale-105 hover:shadow-neon-blue
        overflow-hidden
      `}
    >
      <div className="relative flex items-center space-x-3">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="text-sm">{label}</span>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  )
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // First try to fetch from backend API
        console.log('🔄 Fetching dashboard data from backend...')
        
        try {
          const response = await fetch('http://localhost:3001/api/dashboard', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          })

          if (response.ok) {
            const backendData = await response.json()
            console.log('✅ Dashboard data from backend:', backendData)
            
            if (backendData.success) {
              // Transform backend data to match frontend interface
              const transformedData = {
                revenue: { 
                  total: backendData.data.revenue, 
                  growth: 12.5, 
                  thisMonth: backendData.data.revenue * 0.22,
                },
                expenses: { 
                  total: backendData.data.expenses, 
                  growth: -8.2, 
                  thisMonth: backendData.data.expenses * 0.19,
                },
                profit: { 
                  total: backendData.data.profit, 
                  margin: backendData.data.profitMargin || 64.2, 
                  growth: 22.1 
                },
                tax: { 
                  sstCollected: backendData.data.sstCollected, 
                  sstPayable: backendData.data.sstCollected * 0.36, 
                  taxRate: 6,
                },
                einvoice: { 
                  submitted: backendData.data.invoices.total, 
                  approved: backendData.data.invoices.paid, 
                  complianceRate: backendData.data.einvoiceCompliance 
                },
                customers: { 
                  total: 48, 
                  active: 35, 
                  newThisMonth: 8 
                },
                invoices: backendData.data.invoices,
                bills: backendData.data.bills,
                recentActivity: backendData.data.recentActivity || [],
                monthlyRevenue: backendData.data.monthlyRevenue || []
              }
              
              setDashboardData(transformedData)
              setError(null)
              console.log('✅ Dashboard data processed successfully')
              return
            }
          }
        } catch (backendError) {
          console.log('⚠️ Backend not available, using mock data')
        }

        // Fallback to mock data
        const mockData: DashboardData = {
          revenue: { total: 2845670, growth: 12.5, thisMonth: 625850 },
          expenses: { total: 1542330, growth: -8.2, thisMonth: 295120 },
          profit: { total: 1303340, margin: 64.2, growth: 22.1 },
          tax: { sstCollected: 170740, sstPayable: 61467, taxRate: 6 },
          einvoice: { submitted: 156, approved: 148, complianceRate: 94.9 },
          customers: { total: 48, active: 35, newThisMonth: 8 },
          invoices: { total: 156, paid: 132, pending: 18, overdue: 6, comingDue: 12 },
          bills: { total: 89, paid: 76, pending: 8, overdue: 5, comingDue: 7 },
          recentActivity: [
            { id: '1', type: 'invoice', description: 'Invoice #INV-2024-001 paid by Syarikat ABC Sdn Bhd', amount: 12500, date: '2024-10-01', status: 'completed' },
            { id: '2', type: 'expense', description: 'Office rent payment for October 2024', amount: -8500, date: '2024-10-01', status: 'completed' },
            { id: '3', type: 'einvoice', description: 'E-Invoice submitted to LHDN - INV-2024-002', date: '2024-09-30', status: 'approved' },
            { id: '4', type: 'payment', description: 'Customer payment received via FPX', amount: 5600, date: '2024-09-30', status: 'completed' },
            { id: '5', type: 'tax', description: 'SST return filed for September 2024', date: '2024-09-29', status: 'submitted' }
          ],
          monthlyRevenue: [
            { month: 'Jan', amount: 245000 },
            { month: 'Feb', amount: 267000 },
            { month: 'Mar', amount: 234000 },
            { month: 'Apr', amount: 289000 },
            { month: 'May', amount: 298000 },
            { month: 'Jun', amount: 312000 }
          ]
        }
        
        setDashboardData(mockData)
        setError(null)
        
      } catch (err) {
        console.error('❌ Dashboard error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-futuristic-dark via-futuristic-gray-900 to-futuristic-darker flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-futuristic-neon-blue/30 rounded-full animate-spin border-t-futuristic-neon-blue"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-futuristic-neon-purple/30 rounded-full animate-spin border-t-futuristic-neon-purple animate-reverse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white animate-pulse">Memuat Data Dashboard</h2>
            <p className="text-futuristic-gray-400 animate-pulse">Menghubung ke sistem perakaunan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-futuristic-dark via-futuristic-gray-900 to-futuristic-darker flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-400">Ralat Sistem</h2>
            <p className="text-futuristic-gray-400">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-futuristic"
          >
            🔄 Cuba Semula
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-futuristic-blue-600/20 to-futuristic-purple-600/20 backdrop-blur-xl border border-futuristic-blue-400/20 p-8">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-futuristic-neon-blue/10 to-transparent animate-data-flow"></div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-futuristic-neon-blue via-futuristic-neon-purple to-futuristic-neon-green bg-clip-text text-transparent mb-2">
                Dashboard Futuristik
              </h1>
              <p className="text-futuristic-gray-400 text-lg">
                Sistem Perakaunan Cloud Malaysia - Kawalan Pusat
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30 animate-glow-pulse">
                ✅ Sistem Aktif
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30 animate-glow-pulse">
                🇲🇾 LHDN Patuh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Jumlah Hasil"
          value={formatMYR(dashboardData.revenue.total)}
          change={`+${dashboardData.revenue.growth}%`}
          trend="up"
          icon="💰"
          color="green"
          subtitle={`Bulan ini: ${formatMYR(dashboardData.revenue.thisMonth)}`}
        />
        <StatsCard
          title="Jumlah Perbelanjaan"
          value={formatMYR(dashboardData.expenses.total)}
          change={`${dashboardData.expenses.growth}%`}
          trend="down"
          icon="📊"
          color="blue"
          subtitle={`Bulan ini: ${formatMYR(dashboardData.expenses.thisMonth)}`}
        />
        <StatsCard
          title="Keuntungan Bersih"
          value={formatMYR(dashboardData.profit.total)}
          change={`+${dashboardData.profit.growth}%`}
          trend="up"
          icon="📈"
          color="purple"
          subtitle={`Margin: ${dashboardData.profit.margin}%`}
        />
        <StatsCard
          title="SST Terkumpul"
          value={formatMYR(dashboardData.tax.sstCollected)}
          change={`${dashboardData.tax.taxRate}%`}
          trend="neutral"
          icon="🏛️"
          color="cyan"
          subtitle={`Perlu Bayar: ${formatMYR(dashboardData.tax.sstPayable)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3 text-2xl">⚡</span>
              Tindakan Pantas
            </h3>
            <div className="space-y-4">
              <QuickActionButton
                icon="🧾"
                label="Buat Invois Baharu"
                onClick={() => console.log('Create Invoice')}
                color="blue"
              />
              <QuickActionButton
                icon="💳"
                label="Rekod Perbelanjaan"
                onClick={() => console.log('Record Expense')}
                color="purple"
              />
              <QuickActionButton
                icon="🇲🇾"
                label="Hantar E-Invoice LHDN"
                onClick={() => console.log('Submit E-Invoice')}
                color="green"
              />
              <QuickActionButton
                icon="📊"
                label="Jana Laporan"
                onClick={() => console.log('Generate Report')}
                color="cyan"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="cyber-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3 text-2xl">🔄</span>
              Aktiviti Terkini
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dashboardData.recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-futuristic-gray-800/50 border border-futuristic-gray-700/50 hover:border-futuristic-blue-500/30 transition-all duration-300 animate-fade-in-up space-y-2 sm:space-y-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm mb-1 break-words">
                      {activity.description}
                    </p>
                    <p className="text-futuristic-gray-400 text-xs">
                      {new Date(activity.date).toLocaleDateString('ms-MY')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-auto">
                    {activity.amount && (
                      <span className={`font-semibold text-sm whitespace-nowrap ${
                        activity.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {activity.amount > 0 ? '+' : ''}{formatMYR(Math.abs(activity.amount))}
                      </span>
                    )}
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                      ${activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        activity.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        activity.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* E-Invoice & Compliance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="cyber-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3 text-2xl">🇲🇾</span>
            Status E-Invoice LHDN
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-futuristic-gray-400">Dihantar Bulan Ini:</span>
              <span className="text-white font-bold text-xl">{dashboardData.einvoice.submitted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-futuristic-gray-400">Diluluskan:</span>
              <span className="text-green-400 font-bold text-xl">{dashboardData.einvoice.approved}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-futuristic-gray-400">Kadar Kepatuhan:</span>
                <span className="text-futuristic-neon-green font-bold">{dashboardData.einvoice.complianceRate}%</span>
              </div>
              <div className="w-full bg-futuristic-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-futuristic-neon-green to-green-500 h-3 rounded-full transition-all duration-1000 animate-glow-pulse"
                  style={{ width: `${dashboardData.einvoice.complianceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3 text-2xl">📋</span>
            Ringkasan Invois & Bil
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-futuristic-blue-500/10 border border-futuristic-blue-500/20">
              <div className="text-2xl font-bold text-futuristic-blue-400 mb-1">
                {dashboardData.invoices.paid}
              </div>
              <div className="text-xs text-futuristic-gray-400">Invois Dibayar</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {dashboardData.invoices.pending}
              </div>
              <div className="text-xs text-futuristic-gray-400">Invois Tertunggak</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {dashboardData.bills.paid}
              </div>
              <div className="text-xs text-futuristic-gray-400">Bil Dibayar</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {dashboardData.bills.overdue}
              </div>
              <div className="text-xs text-futuristic-gray-400">Bil Tertunggak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}