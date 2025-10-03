import React from 'react'

interface FinancialHealthProps {
  healthScore: number
  totalRevenue: number
  totalExpenses: number
  profitMargin: number
  cashFlow: number
  quickRatio: number
}

const FinancialHealthCard: React.FC<FinancialHealthProps> = ({
  healthScore,
  totalRevenue,
  totalExpenses,
  profitMargin,
  cashFlow,
  quickRatio
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', icon: '🟢' }
    if (score >= 60) return { status: 'Good', icon: '🟡' }
    return { status: 'Needs Attention', icon: '🔴' }
  }

  const health = getHealthStatus(healthScore)

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">💊 Financial Health Score</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthScore)}`}>
          {health.icon} {health.status}
        </div>
      </div>

      {/* Health Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="2"
              strokeDasharray={`${healthScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{healthScore}%</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Revenue</div>
          <div className="text-lg font-semibold text-green-600">
            RM {totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Expenses</div>
          <div className="text-lg font-semibold text-red-600">
            RM {totalExpenses.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Profit Margin</div>
          <div className={`text-lg font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Cash Flow</div>
          <div className={`text-lg font-semibold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RM {cashFlow.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
          <div className="text-sm text-gray-600">Quick Ratio</div>
          <div className={`text-lg font-semibold ${quickRatio >= 1 ? 'text-green-600' : 'text-yellow-600'}`}>
            {quickRatio.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {quickRatio >= 1 ? 'Good liquidity' : 'Monitor liquidity'}
          </div>
        </div>
      </div>

      {/* Health Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {profitMargin < 10 && (
            <li>• Consider reducing operational costs to improve profit margin</li>
          )}
          {quickRatio < 1 && (
            <li>• Improve cash position by collecting receivables faster</li>
          )}
          {cashFlow < 0 && (
            <li>• Focus on cash flow management and payment terms</li>
          )}
          {healthScore >= 80 && (
            <li>• Excellent financial health! Consider expansion opportunities</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default FinancialHealthCard