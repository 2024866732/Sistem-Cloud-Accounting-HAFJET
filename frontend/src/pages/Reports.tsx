import React, { useState, useEffect } from 'react'
import { 
  FileBarChart, Download, Filter, Calendar, TrendingUp, 
  PieChart, BarChart3, LineChart, FileText, Receipt,
  Building, Calculator, Banknote, FileCheck,
  Clock, Share2
} from 'lucide-react'

interface ReportData {
  profitLoss: {
    revenue: { sales: number; services: number; other: number }
    expenses: { cogs: number; operating: number; tax: number }
    netProfit: number
    grossMargin: number
  }
  balanceSheet: {
    assets: { current: number; fixed: number }
    liabilities: { current: number; longTerm: number }
    equity: number
  }
  cashFlow: {
    operating: number
    investing: number
    financing: number
    netChange: number
  }
  sstReport: {
    salesSubjectToSST: number
    sstCollected: number
    sstPaid: number
    netSSTPayable: number
  }
  eInvoiceCompliance: {
    totalInvoices: number
    submittedToLHDN: number
    pendingSubmission: number
    rejected: number
    complianceRate: number
  }
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('overview')
  const [dateRange, setDateRange] = useState<string>('thisMonth')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReportData({
        profitLoss: {
          revenue: { sales: 850000, services: 320000, other: 45000 },
          expenses: { cogs: 425000, operating: 285000, tax: 38000 },
          netProfit: 467000,
          grossMargin: 38.8
        },
        balanceSheet: {
          assets: { current: 1250000, fixed: 890000 },
          liabilities: { current: 320000, longTerm: 180000 },
          equity: 1640000
        },
        cashFlow: {
          operating: 425000,
          investing: -125000,
          financing: -85000,
          netChange: 215000
        },
        sstReport: {
          salesSubjectToSST: 850000,
          sstCollected: 51000,
          sstPaid: 15300,
          netSSTPayable: 35700
        },
        eInvoiceCompliance: {
          totalInvoices: 1247,
          submittedToLHDN: 1195,
          pendingSubmission: 42,
          rejected: 10,
          complianceRate: 95.8
        }
      })
      setLoading(false)
    }

    fetchReportData()
  }, [dateRange])

  const formatMYR = (amount: number) => {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
  }

  const reportTypes = [
    { id: 'overview', name: 'Overview Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-600' },
    { id: 'profit-loss', name: 'Profit & Loss', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: PieChart, color: 'from-purple-500 to-violet-600' },
    { id: 'cash-flow', name: 'Cash Flow', icon: LineChart, color: 'from-orange-500 to-red-600' },
    { id: 'sst-report', name: 'SST Report', icon: Calculator, color: 'from-yellow-500 to-orange-600' },
    { id: 'einvoice-compliance', name: 'E-Invoice Compliance', icon: FileCheck, color: 'from-indigo-500 to-blue-600' },
    { id: 'aged-receivables', name: 'Aged Receivables', icon: Clock, color: 'from-pink-500 to-rose-600' },
    { id: 'trial-balance', name: 'Trial Balance', icon: FileBarChart, color: 'from-teal-500 to-cyan-600' }
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: Download },
    { value: 'csv', label: 'CSV Data', icon: Download }
  ]

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">+12.5%</span>
          </div>
          <h3 className="text-white/80 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">{formatMYR((reportData?.profitLoss.revenue.sales || 0) + (reportData?.profitLoss.revenue.services || 0) + (reportData?.profitLoss.revenue.other || 0))}</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Banknote className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-medium">+8.3%</span>
          </div>
          <h3 className="text-white/80 text-sm font-medium">Net Profit</h3>
          <p className="text-2xl font-bold text-white">{formatMYR(reportData?.profitLoss.netProfit || 0)}</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-xl">
              <Calculator className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">SST</span>
          </div>
          <h3 className="text-white/80 text-sm font-medium">SST Payable</h3>
          <p className="text-2xl font-bold text-white">{formatMYR(reportData?.sstReport.netSSTPayable || 0)}</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <FileCheck className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-medium">{reportData?.eInvoiceCompliance.complianceRate}%</span>
          </div>
          <h3 className="text-white/80 text-sm font-medium">E-Invoice Compliance</h3>
          <p className="text-2xl font-bold text-white">{reportData?.eInvoiceCompliance.submittedToLHDN || 0} / {reportData?.eInvoiceCompliance.totalInvoices || 0}</p>
        </div>
      </div>

      {/* Financial Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <h3 className="text-xl font-bold text-white mb-6">Revenue vs Expenses</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Revenue</span>
              <span className="text-green-400 font-semibold">{formatMYR((reportData?.profitLoss.revenue.sales || 0) + (reportData?.profitLoss.revenue.services || 0) + (reportData?.profitLoss.revenue.other || 0))}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full" style={{width: '75%'}}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Expenses</span>
              <span className="text-red-400 font-semibold">{formatMYR((reportData?.profitLoss.expenses.cogs || 0) + (reportData?.profitLoss.expenses.operating || 0) + (reportData?.profitLoss.expenses.tax || 0))}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-red-400 to-orange-500 h-3 rounded-full" style={{width: '62%'}}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <h3 className="text-xl font-bold text-white mb-6">Cash Flow Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Operating</span>
              <span className="text-green-400 font-semibold">{formatMYR(reportData?.cashFlow.operating || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Investing</span>
              <span className="text-red-400 font-semibold">{formatMYR(reportData?.cashFlow.investing || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Financing</span>
              <span className="text-red-400 font-semibold">{formatMYR(reportData?.cashFlow.financing || 0)}</span>
            </div>
            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Net Cash Flow</span>
                <span className="text-green-400 font-bold text-lg">{formatMYR(reportData?.cashFlow.netChange || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Malaysian Compliance Status */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">🇲🇾 Malaysian Compliance Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-500/20 p-4 rounded-xl mb-4 inline-block">
              <Receipt className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">SST Returns</h4>
            <p className="text-green-400 text-2xl font-bold">On Time</p>
            <p className="text-white/60 text-sm">Next due: 30 Oct 2025</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500/20 p-4 rounded-xl mb-4 inline-block">
              <FileCheck className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">E-Invoice LHDN</h4>
            <p className="text-blue-400 text-2xl font-bold">95.8%</p>
            <p className="text-white/60 text-sm">Compliance Rate</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-500/20 p-4 rounded-xl mb-4 inline-block">
              <Building className="h-8 w-8 text-yellow-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">SSM Filing</h4>
            <p className="text-yellow-400 text-2xl font-bold">Current</p>
            <p className="text-white/60 text-sm">Annual return filed</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfitLossReport = () => (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
      <h3 className="text-xl font-bold text-white mb-6">Profit & Loss Statement</h3>
      <div className="space-y-6">
        {/* Revenue Section */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Revenue</h4>
          <div className="space-y-3 pl-4">
            <div className="flex justify-between">
              <span className="text-white/80">Sales Revenue</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.revenue.sales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Service Revenue</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.revenue.services || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Other Income</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.revenue.other || 0)}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Revenue</span>
                <span className="text-green-400">{formatMYR((reportData?.profitLoss.revenue.sales || 0) + (reportData?.profitLoss.revenue.services || 0) + (reportData?.profitLoss.revenue.other || 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Expenses</h4>
          <div className="space-y-3 pl-4">
            <div className="flex justify-between">
              <span className="text-white/80">Cost of Goods Sold</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.expenses.cogs || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Operating Expenses</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.expenses.operating || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Tax Expenses</span>
              <span className="text-white font-medium">{formatMYR(reportData?.profitLoss.expenses.tax || 0)}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Expenses</span>
                <span className="text-red-400">{formatMYR((reportData?.profitLoss.expenses.cogs || 0) + (reportData?.profitLoss.expenses.operating || 0) + (reportData?.profitLoss.expenses.tax || 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="border-t-2 border-white/30 pt-6">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-white">Net Profit</span>
            <span className="text-green-400">{formatMYR(reportData?.profitLoss.netProfit || 0)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-white/80">Gross Margin</span>
            <span className="text-white/80">{reportData?.profitLoss.grossMargin || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSSTReport = () => (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
      <h3 className="text-xl font-bold text-white mb-6">🇲🇾 SST (Sales & Service Tax) Report</h3>
      <div className="space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h4 className="text-yellow-400 font-semibold mb-3">Current Period Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm">SST Registration Number</p>
              <p className="text-white font-semibold">SST-123456789</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Reporting Period</p>
              <p className="text-white font-semibold">October 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Sales Subject to SST</span>
            <span className="text-white font-semibold">{formatMYR(reportData?.sstReport.salesSubjectToSST || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">SST Collected (6%)</span>
            <span className="text-green-400 font-semibold">{formatMYR(reportData?.sstReport.sstCollected || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">SST Paid on Purchases</span>
            <span className="text-red-400 font-semibold">{formatMYR(reportData?.sstReport.sstPaid || 0)}</span>
          </div>
          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-lg">Net SST Payable to Government</span>
              <span className="text-yellow-400 font-bold text-xl">{formatMYR(reportData?.sstReport.netSSTPayable || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold mb-3">Next Actions Required</h4>
          <ul className="space-y-2 text-white/80">
            <li>• Submit SST return by 30th October 2025</li>
            <li>• Pay SST amount by 30th October 2025</li>
            <li>• Maintain proper SST records for audit</li>
            <li>• Issue tax invoices for all taxable supplies</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderEInvoiceCompliance = () => (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
      <h3 className="text-xl font-bold text-white mb-6">🇲🇾 E-Invoice LHDN Compliance Report</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{reportData?.eInvoiceCompliance.submittedToLHDN || 0}</div>
            <div className="text-white/80 text-sm">Submitted to LHDN</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{reportData?.eInvoiceCompliance.pendingSubmission || 0}</div>
            <div className="text-white/80 text-sm">Pending Submission</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{reportData?.eInvoiceCompliance.rejected || 0}</div>
            <div className="text-white/80 text-sm">Rejected</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{reportData?.eInvoiceCompliance.complianceRate || 0}%</div>
            <div className="text-white/80 text-sm">Compliance Rate</div>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <h4 className="text-purple-400 font-semibold mb-3">E-Invoice Status Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Invoices Generated</span>
              <span className="text-white font-semibold">{reportData?.eInvoiceCompliance.totalInvoices || 0}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" 
                style={{width: `${((reportData?.eInvoiceCompliance.submittedToLHDN || 0) / (reportData?.eInvoiceCompliance.totalInvoices || 1)) * 100}%`}}
              ></div>
            </div>
            <div className="text-white/60 text-sm">
              {reportData?.eInvoiceCompliance.submittedToLHDN || 0} successfully submitted, 
              {reportData?.eInvoiceCompliance.pendingSubmission || 0} pending, 
              {reportData?.eInvoiceCompliance.rejected || 0} rejected
            </div>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <h4 className="text-orange-400 font-semibold mb-3">Action Items</h4>
          <ul className="space-y-2 text-white/80">
            <li>• Resubmit {reportData?.eInvoiceCompliance.rejected || 0} rejected invoices</li>
            <li>• Process {reportData?.eInvoiceCompliance.pendingSubmission || 0} pending submissions</li>
            <li>• Ensure TIN number validation for all invoices</li>
            <li>• Maintain XML format compliance</li>
            <li>• Regular sync with LHDN MyInvois system</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full"></div>
        </div>
      )
    }

    switch (selectedReport) {
      case 'overview': return renderOverviewDashboard()
      case 'profit-loss': return renderProfitLossReport()
      case 'sst-report': return renderSSTReport()
      case 'einvoice-compliance': return renderEInvoiceCompliance()
      default: return renderOverviewDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Advanced Financial Reports
          </h1>
          <p className="text-white/80 text-lg">
            🇲🇾 Comprehensive Malaysian accounting reports with SST & E-Invoice compliance
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Date Range Selector */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Date Range
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value} className="bg-gray-800">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type Filter */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Filter className="inline h-4 w-4 mr-2" />
                Report Type
              </label>
              <select 
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id} className="bg-gray-800">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Download className="inline h-4 w-4 mr-2" />
                Export Format
              </label>
              <select className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {exportFormats.map(format => (
                  <option key={format.value} value={format.value} className="bg-gray-800">
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Download className="inline h-4 w-4 mr-2" />
                Export
              </button>
              <button className="bg-white/20 text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {reportTypes.map((type) => {
            const Icon = type.icon
            const isActive = selectedReport === type.id
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border ${
                  isActive 
                    ? `bg-gradient-to-r ${type.color} text-white border-white/50 scale-105 shadow-lg` 
                    : 'bg-white/20 backdrop-blur-sm text-white/80 border-white/30 hover:bg-white/30'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xs font-medium text-center">{type.name}</div>
              </button>
            )
          })}
        </div>

        {/* Report Content */}
        <div className="mb-8">
          {renderReportContent()}
        </div>

        {/* Footer Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            📋 Reports generated on {new Date().toLocaleDateString('en-MY')} | 
            🇲🇾 Compliant with Malaysian Financial Reporting Standards | 
            🔒 All data encrypted and secure
          </p>
        </div>
      </div>
    </div>
  )
}

export default Reports