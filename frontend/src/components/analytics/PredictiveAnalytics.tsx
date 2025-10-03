import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface PredictiveAnalyticsProps {
  historicalData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  forecastData: Array<{
    month: string
    predictedRevenue: number
    predictedExpenses: number
    predictedProfit: number
    confidence: number
  }>
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  historicalData,
  forecastData
}) => {
  // Combine historical and forecast data
  const combinedData = [
    ...historicalData.map(item => ({
      ...item,
      isHistorical: true,
      predictedRevenue: null,
      predictedExpenses: null,
      predictedProfit: null
    })),
    ...forecastData.map(item => ({
      month: item.month,
      revenue: null,
      expenses: null,
      profit: null,
      isHistorical: false,
      predictedRevenue: item.predictedRevenue,
      predictedExpenses: item.predictedExpenses,
      predictedProfit: item.predictedProfit,
      confidence: item.confidence
    }))
  ]

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{
      payload: {
        month: string
        revenue?: number
        expenses?: number
        profit?: number
        predictedRevenue?: number
        predictedExpenses?: number
        predictedProfit?: number
        confidence?: number
        isHistorical: boolean
      }
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {data.isHistorical ? (
            <>
              <p className="text-green-600">Revenue: RM {data.revenue?.toLocaleString()}</p>
              <p className="text-red-600">Expenses: RM {data.expenses?.toLocaleString()}</p>
              <p className="text-blue-600">Profit: RM {data.profit?.toLocaleString()}</p>
            </>
          ) : (
            <>
              <p className="text-green-400">Predicted Revenue: RM {data.predictedRevenue?.toLocaleString()}</p>
              <p className="text-red-400">Predicted Expenses: RM {data.predictedExpenses?.toLocaleString()}</p>
              <p className="text-blue-400">Predicted Profit: RM {data.predictedProfit?.toLocaleString()}</p>
              <p className="text-gray-500">Confidence: {data.confidence}%</p>
            </>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🔮 Predictive Analytics</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Historical</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-300 rounded mr-2 border-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Predicted</span>
          </div>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-800 mb-4">📈 Revenue Forecast</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={combinedData}>
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
              tickFormatter={(value) => `RM ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="predictedRevenue"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeDasharray="5 5"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Trend Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-4">💰 Profit Trend Analysis</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData}>
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
              tickFormatter={(value) => `RM ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              name="Historical Profit"
            />
            <Line
              type="monotone"
              dataKey="predictedProfit"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              connectNulls={false}
              name="Predicted Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Next Month Revenue</div>
          <div className="text-2xl font-bold text-green-800">
            RM {forecastData[0]?.predictedRevenue.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-green-600">
            {forecastData[0]?.confidence}% confidence
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">Next Month Profit</div>
          <div className="text-2xl font-bold text-blue-800">
            RM {forecastData[0]?.predictedProfit.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-blue-600">
            {forecastData[0]?.confidence}% confidence
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium">Growth Trend</div>
          <div className="text-2xl font-bold text-purple-800">
            {(() => {
              const lastHistorical = historicalData[historicalData.length - 1]?.revenue || 0
              const nextPredicted = forecastData[0]?.predictedRevenue || 0
              const growth = ((nextPredicted - lastHistorical) / lastHistorical * 100)
              return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
            })()}
          </div>
          <div className="text-xs text-purple-600">
            Month-over-month
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">🤖 AI Insights</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            <span>Revenue trend shows {(() => {
              const growth = forecastData[0]?.predictedRevenue > historicalData[historicalData.length - 1]?.revenue
              return growth ? 'positive growth' : 'declining pattern'
            })()} for next quarter</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Seasonal patterns indicate peak performance in {(() => {
              // Simple seasonal analysis
              const revenues = historicalData.map(d => d.revenue)
              const maxIndex = revenues.indexOf(Math.max(...revenues))
              return historicalData[maxIndex]?.month || 'Q4'
            })()}</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span>Predictive model confidence is {forecastData[0]?.confidence}% based on 12 months of data</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalytics