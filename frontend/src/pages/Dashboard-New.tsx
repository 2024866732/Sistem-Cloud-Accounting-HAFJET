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
                  taxRate: 6
                },
                einvoice: { 
                  submitted: backendData.data.invoices.total, 
                  approved: backendData.data.invoices.paid, 
                  complianceRate: backendData.data.einvoiceCompliance 
                },
                customers: { 
                  total: 48, 
                  active: 35, 
                  newThisMonth: 5
                },
                invoices: { 
                  total: backendData.data.invoices.total, 
                  paid: backendData.data.invoices.paid, 
                  pending: backendData.data.invoices.pending, 
                  overdue: backendData.data.invoices.overdue, 
                  comingDue: 15
                },
                bills: {
                  total: 18,
                  paid: 12,
                  pending: 4,
                  overdue: 2,
                  comingDue: 8
                },
                recentActivity: backendData.data.recentTransactions.map((tx: { id?: string; type: string; description: string; amount: number; date: string; category?: string }, index: number) => ({
                  id: tx.id || `activity-${index}`,
                  type: tx.type === 'income' ? 'invoice_paid' : 'expense',
                  description: tx.description,
                  amount: Math.abs(tx.amount),
                  date: tx.date,
                  status: tx.type === 'income' ? 'completed' : 'pending'
                })),
                monthlyRevenue: backendData.data.monthlyRevenue || []
              }
              
              setDashboardData(transformedData)
              setError(null)
              console.log('✅ Dashboard data transformed and loaded from backend')
              return
            }
          } else {
            console.log('❌ Backend dashboard request failed:', response.status)
          }
        } catch (backendError) {
          console.log('🔄 Backend connection failed, using mock data:', backendError)
        }

        // Fallback: Use mock data
        console.log('📊 Loading mock dashboard data...')
        const mockDashboardData = {
          revenue: { total: 127500, growth: 12.5, thisMonth: 28400 },
          expenses: { total: 45600, growth: -8.2, thisMonth: 8900 },
          profit: { total: 81900, margin: 64.2, growth: 22.1 },
          tax: { sstCollected: 7650, sstPayable: 2736, taxRate: 6 },
          einvoice: { submitted: 24, approved: 22, complianceRate: 91.7 },
          customers: { total: 48, active: 35, newThisMonth: 5 },
          invoices: { total: 28, paid: 22, pending: 4, overdue: 2, comingDue: 15 },
          bills: { total: 18, paid: 12, pending: 4, overdue: 2, comingDue: 8 },
          monthlyRevenue: [
            { month: 'Jan', amount: 95000 },
            { month: 'Feb', amount: 87000 },
            { month: 'Mar', amount: 102000 },
            { month: 'Apr', amount: 118000 },
            { month: 'May', amount: 127500 }
          ],
          recentActivity: [
            { id: '1', type: 'payment_received', description: 'Payment from ABC Sdn Bhd', amount: 5300, date: '2024-10-15T14:30:00Z', status: 'completed' },
            { id: '2', type: 'einvoice_approved', description: 'E-Invoice approved by LHDN', amount: 2400, date: '2024-10-12T09:15:00Z', status: 'approved' },
            { id: '3', type: 'invoice_created', description: 'New invoice for XYZ Trading', amount: 2400, date: '2024-10-10T16:45:00Z', status: 'draft' },
            { id: '4', type: 'expense_recorded', description: 'Office supplies purchase', amount: 850, date: '2024-10-08T11:20:00Z', status: 'completed' }
          ]
        }
        
        setDashboardData(mockDashboardData)
      } catch (err) {
        console.error('Dashboard data error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error || 'No data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Inspired by Bukku.my */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Malaysian Cloud Accounting System</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-MY')}
        </div>
      </div>

      {/* Top Cards Grid - Bukku.my Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Invoices Coming Due */}
        <div className="bg-blue-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <span className="text-white text-xl">📄</span>
            </div>
            <span className="text-xs font-medium opacity-90">INVOICES</span>
          </div>
          <div className="text-2xl font-bold mb-1">{formatMYR(0)}</div>
          <div className="text-sm opacity-90">Coming Due</div>
        </div>

        {/* Invoices Overdue */}
        <div className="bg-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <span className="text-white text-xl">📄</span>
            </div>
            <span className="text-xs font-medium opacity-90">INVOICES</span>
          </div>
          <div className="text-2xl font-bold mb-1">{formatMYR(1908)}</div>
          <div className="text-sm opacity-90">Overdue</div>
        </div>

        {/* Bills Coming Due */}
        <div className="bg-blue-700 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <span className="text-white text-xl">📋</span>
            </div>
            <span className="text-xs font-medium opacity-90">BILLS</span>
          </div>
          <div className="text-2xl font-bold mb-1">{formatMYR(0)}</div>
          <div className="text-sm opacity-90">Coming Due</div>
        </div>

        {/* Bills Overdue */}
        <div className="bg-blue-800 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <span className="text-white text-xl">📋</span>
            </div>
            <span className="text-xs font-medium opacity-90">BILLS</span>
          </div>
          <div className="text-2xl font-bold mb-1">{formatMYR(0)}</div>
          <div className="text-sm opacity-90">Overdue</div>
        </div>
      </div>

      {/* Outstanding Sections - Bukku.my Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Invoices */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Invoices</h3>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">1-30 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-gray-600">31-60 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">61-90 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-600">91+ Days</span>
            </div>
          </div>
          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">No data to display</p>
          </div>
        </div>

        {/* Outstanding Bills */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Bills</h3>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">1-30 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-gray-600">31-60 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">61-90 Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-600">91+ Days</span>
            </div>
          </div>
          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">No data to display</p>
          </div>
        </div>
      </div>

      {/* Charts Section - Bukku.my Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Income</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>7-Day</option>
              <option>30-Day</option>
              <option>90-Day</option>
            </select>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-4">
            NET {formatMYR(dashboardData.revenue.total)} / 7-DAY
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 text-2xl">📊</span>
              </div>
              <p className="text-gray-500 text-sm">Income trend visualization</p>
            </div>
          </div>
        </div>

        {/* Profit & Loss Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profit & Loss</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>7-Day</option>
              <option>30-Day</option>
              <option>90-Day</option>
            </select>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-4">
            NET {formatMYR(dashboardData.profit.total)} / 7-DAY
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 text-2xl">📈</span>
              </div>
              <p className="text-gray-500 text-sm">P&L trend visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts - Bukku.my Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cashflow Trend</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>14 Day</option>
              <option>30 Day</option>
              <option>90 Day</option>
            </select>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-2xl">💰</span>
              </div>
              <p className="text-gray-500 text-sm">Cash flow analysis</p>
            </div>
          </div>
        </div>

        {/* Cashflow Forecast */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cashflow Forecast</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>14 Day</option>
              <option>30 Day</option>
              <option>90 Day</option>
            </select>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-2xl">🔮</span>
              </div>
              <p className="text-gray-500 text-sm">Cash flow forecast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Malaysian Compliance Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🇲🇾 Malaysian Tax Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium text-gray-900">SST Compliance</span>
            </div>
            <p className="text-sm text-gray-600">Collected: {formatMYR(dashboardData.tax.sstCollected)}</p>
            <p className="text-xs text-gray-500">Rate: {dashboardData.tax.taxRate}%</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium text-gray-900">E-Invoice LHDN</span>
            </div>
            <p className="text-sm text-gray-600">{dashboardData.einvoice.complianceRate}% compliance</p>
            <p className="text-xs text-gray-500">{dashboardData.einvoice.approved} approved</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600">📊</span>
              <span className="font-medium text-gray-900">Business Growth</span>
            </div>
            <p className="text-sm text-gray-600">{dashboardData.customers.active} active customers</p>
            <p className="text-xs text-gray-500">+{dashboardData.customers.newThisMonth} this month</p>
          </div>
        </div>
      </div>
    </div>
  )
}