import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface KPIData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossMargin: number
  operatingMargin: number
  currentRatio: number
  debtToEquity: number
  returnOnAssets: number
  customerAcquisitionCost: number
  customerLifetimeValue: number
  monthlyRecurringRevenue: number
  churnRate: number
}

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
  customers: number
}

interface KPIMonitoringProps {
  kpiData: KPIData
  monthlyData: MonthlyData[]
  comparisonData: {
    industry: KPIData
    previousPeriod: KPIData
  }
}

const KPIMonitoring: React.FC<KPIMonitoringProps> = ({
  kpiData,
  monthlyData,
  comparisonData
}) => {
  const pieData = [
    { name: 'Operating Expenses', value: kpiData.totalExpenses * 0.7, color: '#ef4444' },
    { name: 'Marketing', value: kpiData.totalExpenses * 0.15, color: '#f59e0b' },
    { name: 'Admin', value: kpiData.totalExpenses * 0.10, color: '#8b5cf6' },
    { name: 'Other', value: kpiData.totalExpenses * 0.05, color: '#6b7280' }
  ]

  const getKPITrend = (current: number, previous: number, metricType?: string): {
    value: string
    isGood: boolean
    icon: string
    color: string
  } => {
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0
    
    // Determine if positive change is good based on metric type
    const isGoodChange = metricType === 'expense' || metricType === 'debt' || metricType === 'churn' 
      ? !isPositive  // For expenses, debt, churn: decrease is good
      : isPositive   // For revenue, profit, margins: increase is good

    return {
      value: Math.abs(change).toFixed(1),
      isGood: isGoodChange,
      icon: isPositive ? '↗️' : '↘️',
      color: isGoodChange ? 'text-green-600' : 'text-red-600'
    }
  }

  const KPICard = ({ 
    title, 
    value, 
    format = 'currency',
    current, 
    previous, 
    icon,
    description,
    metricType
  }: {
    title: string
    value: number
    format?: 'currency' | 'percentage' | 'number' | 'ratio'
    current: number
    previous: number
    icon: string
    description: string
    metricType?: string
  }) => {
    const trend = getKPITrend(current, previous, metricType)
    
    const formatValue = (val: number, fmt: string) => {
      switch (fmt) {
        case 'currency':
          return `RM ${val.toLocaleString()}`
        case 'percentage':
          return `${val.toFixed(1)}%`
        case 'ratio':
          return val.toFixed(2)
        default:
          return val.toLocaleString()
      }
    }

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{icon}</span>
            <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          </div>
          <div className={`flex items-center text-sm ${trend.color}`}>
            <span className="mr-1">{trend.icon}</span>
            <span>{trend.value}%</span>
          </div>
        </div>
        
        <div className="mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(value, format)}
          </span>
        </div>
        
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Key Performance Indicators</h3>
        <p className="text-gray-600">Real-time monitoring of critical business metrics</p>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={kpiData.totalRevenue}
          current={kpiData.totalRevenue}
          previous={comparisonData.previousPeriod.totalRevenue}
          icon="💰"
          description="Monthly recurring revenue"
          format="currency"
        />
        
        <KPICard
          title="Net Profit"
          value={kpiData.netProfit}
          current={kpiData.netProfit}
          previous={comparisonData.previousPeriod.netProfit}
          icon="🎯"
          description="After all expenses"
          format="currency"
        />
        
        <KPICard
          title="Gross Margin"
          value={kpiData.grossMargin}
          current={kpiData.grossMargin}
          previous={comparisonData.previousPeriod.grossMargin}
          icon="📈"
          description="Revenue minus COGS"
          format="percentage"
        />
        
        <KPICard
          title="Operating Margin"
          value={kpiData.operatingMargin}
          current={kpiData.operatingMargin}
          previous={comparisonData.previousPeriod.operatingMargin}
          icon="⚙️"
          description="Operating efficiency"
          format="percentage"
        />
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Current Ratio"
          value={kpiData.currentRatio}
          current={kpiData.currentRatio}
          previous={comparisonData.previousPeriod.currentRatio}
          icon="⚖️"
          description="Short-term liquidity"
          format="ratio"
        />
        
        <KPICard
          title="Debt to Equity"
          value={kpiData.debtToEquity}
          current={kpiData.debtToEquity}
          previous={comparisonData.previousPeriod.debtToEquity}
          icon="🏦"
          description="Financial leverage"
          format="ratio"
        />
        
        <KPICard
          title="Return on Assets"
          value={kpiData.returnOnAssets}
          current={kpiData.returnOnAssets}
          previous={comparisonData.previousPeriod.returnOnAssets}
          icon="🎲"
          description="Asset efficiency"
          format="percentage"
        />
        
        <KPICard
          title="Churn Rate"
          value={kpiData.churnRate}
          current={kpiData.churnRate}
          previous={comparisonData.previousPeriod.churnRate}
          icon="🚪"
          description="Customer retention"
          format="percentage"
        />
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Customer Acquisition Cost"
          value={kpiData.customerAcquisitionCost}
          current={kpiData.customerAcquisitionCost}
          previous={comparisonData.previousPeriod.customerAcquisitionCost}
          icon="🎯"
          description="Cost to acquire new customer"
          format="currency"
        />
        
        <KPICard
          title="Customer Lifetime Value"
          value={kpiData.customerLifetimeValue}
          current={kpiData.customerLifetimeValue}
          previous={comparisonData.previousPeriod.customerLifetimeValue}
          icon="💎"
          description="Total customer value"
          format="currency"
        />
        
        <KPICard
          title="Monthly Recurring Revenue"
          value={kpiData.monthlyRecurringRevenue}
          current={kpiData.monthlyRecurringRevenue}
          previous={comparisonData.previousPeriod.monthlyRecurringRevenue}
          icon="🔄"
          description="Predictable revenue stream"
          format="currency"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">📊 Monthly Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `RM ${value.toLocaleString()}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">🥧 Expense Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={false}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`RM ${value.toLocaleString()}`, 'Amount']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Industry Comparison */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">🏭 Industry Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {kpiData.grossMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Your Gross Margin</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {comparisonData.industry.grossMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Industry Average</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              kpiData.grossMargin > comparisonData.industry.grossMargin ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpiData.grossMargin > comparisonData.industry.grossMargin ? '👍' : '👎'}
              {Math.abs(kpiData.grossMargin - comparisonData.industry.grossMargin).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {kpiData.grossMargin > comparisonData.industry.grossMargin ? 'Above' : 'Below'} Industry
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KPIMonitoring