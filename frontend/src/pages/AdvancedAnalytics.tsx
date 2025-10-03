import React, { useState, useEffect } from 'react'
import FinancialHealthCard from '../components/analytics/FinancialHealthCard'
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics'
import KPIMonitoring from '../components/analytics/KPIMonitoring'

interface AnalyticsData {
  financialHealth: {
    healthScore: number
    totalRevenue: number
    totalExpenses: number
    profitMargin: number
    cashFlow: number
    quickRatio: number
  }
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
  kpiData: {
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
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
    customers: number
  }>
  comparisonData: {
    industry: {
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
    previousPeriod: {
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
  }
}

const AdvancedAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockAnalyticsData: AnalyticsData = {
      financialHealth: {
        healthScore: 78,
        totalRevenue: 125000,
        totalExpenses: 89000,
        profitMargin: 28.8,
        cashFlow: 36000,
        quickRatio: 1.45
      },
      
      historicalData: [
        { month: 'Jan 2024', revenue: 95000, expenses: 68000, profit: 27000 },
        { month: 'Feb 2024', revenue: 102000, expenses: 71000, profit: 31000 },
        { month: 'Mar 2024', revenue: 108000, expenses: 75000, profit: 33000 },
        { month: 'Apr 2024', revenue: 115000, expenses: 79000, profit: 36000 },
        { month: 'May 2024', revenue: 118000, expenses: 82000, profit: 36000 },
        { month: 'Jun 2024', revenue: 125000, expenses: 89000, profit: 36000 },
      ],
      
      forecastData: [
        { month: 'Jul 2024', predictedRevenue: 132000, predictedExpenses: 92000, predictedProfit: 40000, confidence: 85 },
        { month: 'Aug 2024', predictedRevenue: 138000, predictedExpenses: 95000, predictedProfit: 43000, confidence: 82 },
        { month: 'Sep 2024', predictedRevenue: 145000, predictedExpenses: 98000, predictedProfit: 47000, confidence: 78 },
        { month: 'Oct 2024', predictedRevenue: 152000, predictedExpenses: 102000, predictedProfit: 50000, confidence: 75 },
      ],

      kpiData: {
        totalRevenue: 125000,
        totalExpenses: 89000,
        netProfit: 36000,
        grossMargin: 65.2,
        operatingMargin: 28.8,
        currentRatio: 2.1,
        debtToEquity: 0.35,
        returnOnAssets: 12.5,
        customerAcquisitionCost: 250,
        customerLifetimeValue: 2800,
        monthlyRecurringRevenue: 85000,
        churnRate: 2.5
      },

      monthlyData: [
        { month: 'Jan', revenue: 95000, expenses: 68000, profit: 27000, customers: 145 },
        { month: 'Feb', revenue: 102000, expenses: 71000, profit: 31000, customers: 152 },
        { month: 'Mar', revenue: 108000, expenses: 75000, profit: 33000, customers: 158 },
        { month: 'Apr', revenue: 115000, expenses: 79000, profit: 36000, customers: 165 },
        { month: 'May', revenue: 118000, expenses: 82000, profit: 36000, customers: 172 },
        { month: 'Jun', revenue: 125000, expenses: 89000, profit: 36000, customers: 178 },
      ],

      comparisonData: {
        industry: {
          totalRevenue: 120000,
          totalExpenses: 92000,
          netProfit: 28000,
          grossMargin: 58.5,
          operatingMargin: 23.3,
          currentRatio: 1.8,
          debtToEquity: 0.45,
          returnOnAssets: 9.2,
          customerAcquisitionCost: 320,
          customerLifetimeValue: 2200,
          monthlyRecurringRevenue: 75000,
          churnRate: 4.1
        },
        previousPeriod: {
          totalRevenue: 118000,
          totalExpenses: 82000,
          netProfit: 36000,
          grossMargin: 62.1,
          operatingMargin: 30.5,
          currentRatio: 1.9,
          debtToEquity: 0.38,
          returnOnAssets: 11.8,
          customerAcquisitionCost: 280,
          customerLifetimeValue: 2600,
          monthlyRecurringRevenue: 82000,
          churnRate: 2.8
        }
      }
    }

    // Simulate API call
    const fetchAnalyticsData = async () => {
      try {
        // In real app: const response = await fetch('/api/analytics')
        setTimeout(() => {
          setAnalyticsData(mockAnalyticsData)
          setLoading(false)
        }, 1500)
      } catch (error) {
        console.error('Analytics fetch error:', error)
        setAnalyticsData(mockAnalyticsData)
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading advanced analytics...</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🚀 Advanced Business Analytics
              </h1>
              <p className="text-gray-600">
                AI-powered insights and predictive analytics for your business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                📊 Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Financial Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <FinancialHealthCard {...analyticsData.financialHealth} />
          </div>
          
          <div className="lg:col-span-2">
            <PredictiveAnalytics
              historicalData={analyticsData.historicalData}
              forecastData={analyticsData.forecastData}
            />
          </div>
        </div>

        {/* KPI Monitoring */}
        <KPIMonitoring
          kpiData={analyticsData.kpiData}
          monthlyData={analyticsData.monthlyData}
          comparisonData={analyticsData.comparisonData}
        />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium text-green-900">View Detailed Reports</div>
              <div className="text-sm text-green-700">Generate comprehensive analytics</div>
            </button>
            
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-blue-900">Set Business Goals</div>
              <div className="text-sm text-blue-700">Configure targets and KPIs</div>
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium text-purple-900">AI Recommendations</div>
              <div className="text-sm text-purple-700">Get smart business insights</div>
            </button>
            
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-medium text-orange-900">Schedule Reports</div>
              <div className="text-sm text-orange-700">Automated report delivery</div>
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-lg font-semibold mb-4">🧠 AI Business Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🎯 Key Opportunities</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>• Revenue growth trending 12% above industry average</li>
                <li>• Customer acquisition cost improved by 11% this quarter</li>
                <li>• Optimal time for expansion based on cash flow projections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚠️ Areas for Attention</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>• Operating expenses increasing faster than revenue</li>
                <li>• Seasonal dip expected in Q3 - prepare cash reserves</li>
                <li>• Consider diversifying revenue streams for stability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics