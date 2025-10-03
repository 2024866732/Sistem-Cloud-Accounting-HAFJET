import React, { useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, TrendingDown, BarChart3, Plus, Edit, Archive, Eye } from 'lucide-react';

interface BranchPerformance {
  branchId: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  employees: number;
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    customers: number;
  }[];
  currentMonth: {
    revenue: number;
    expenses: number;
    profit: number;
    customers: number;
    growth: {
      revenue: number;
      profit: number;
    };
  };
  isActive: boolean;
}

const BranchPerformanceAnalytics: React.FC = () => {
  const [branchData, setBranchData] = useState<BranchPerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock branch performance data
    const mockData: BranchPerformance[] = [
      {
        branchId: 'branch_1',
        name: 'KL Branch',
        code: 'KL001',
        location: 'Kuala Lumpur',
        manager: 'Ahmad Rahman',
        employees: 15,
        monthlyData: [
          { month: 'Jan', revenue: 75000, expenses: 55000, profit: 20000, customers: 120 },
          { month: 'Feb', revenue: 78000, expenses: 56000, profit: 22000, customers: 125 },
          { month: 'Mar', revenue: 82000, expenses: 58000, profit: 24000, customers: 130 },
          { month: 'Apr', revenue: 85000, expenses: 60000, profit: 25000, customers: 135 },
          { month: 'May', revenue: 88000, expenses: 62000, profit: 26000, customers: 140 },
          { month: 'Jun', revenue: 92000, expenses: 64000, profit: 28000, customers: 145 }
        ],
        currentMonth: {
          revenue: 92000,
          expenses: 64000,
          profit: 28000,
          customers: 145,
          growth: { revenue: 12.5, profit: 15.2 }
        },
        isActive: true
      },
      {
        branchId: 'branch_2',
        name: 'Penang Branch',
        code: 'PG001',
        location: 'George Town, Penang',
        manager: 'Lim Wei Ming',
        employees: 8,
        monthlyData: [
          { month: 'Jan', revenue: 42000, expenses: 32000, profit: 10000, customers: 80 },
          { month: 'Feb', revenue: 44000, expenses: 33000, profit: 11000, customers: 82 },
          { month: 'Mar', revenue: 46000, expenses: 34000, profit: 12000, customers: 85 },
          { month: 'Apr', revenue: 48000, expenses: 35000, profit: 13000, customers: 88 },
          { month: 'May', revenue: 50000, expenses: 36000, profit: 14000, customers: 90 },
          { month: 'Jun', revenue: 52000, expenses: 37000, profit: 15000, customers: 95 }
        ],
        currentMonth: {
          revenue: 52000,
          expenses: 37000,
          profit: 15000,
          customers: 95,
          growth: { revenue: 8.7, profit: 11.3 }
        },
        isActive: true
      },
      {
        branchId: 'branch_3',
        name: 'Johor Branch',
        code: 'JB001',
        location: 'Johor Bahru',
        manager: 'Siti Nurhaliza',
        employees: 6,
        monthlyData: [
          { month: 'Jan', revenue: 28000, expenses: 22000, profit: 6000, customers: 50 },
          { month: 'Feb', revenue: 29000, expenses: 23000, profit: 6000, customers: 52 },
          { month: 'Mar', revenue: 30000, expenses: 24000, profit: 6000, customers: 54 },
          { month: 'Apr', revenue: 31000, expenses: 24500, profit: 6500, customers: 56 },
          { month: 'May', revenue: 32000, expenses: 25000, profit: 7000, customers: 58 },
          { month: 'Jun', revenue: 34000, expenses: 26000, profit: 8000, customers: 62 }
        ],
        currentMonth: {
          revenue: 34000,
          expenses: 26000,
          profit: 8000,
          customers: 62,
          growth: { revenue: 5.2, profit: 7.8 }
        },
        isActive: true
      }
    ];

    setTimeout(() => {
      setBranchData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTotalMetrics = () => {
    return branchData.reduce((total, branch) => ({
      revenue: total.revenue + branch.currentMonth.revenue,
      expenses: total.expenses + branch.currentMonth.expenses,
      profit: total.profit + branch.currentMonth.profit,
      customers: total.customers + branch.currentMonth.customers,
      employees: total.employees + branch.employees
    }), { revenue: 0, expenses: 0, profit: 0, customers: 0, employees: 0 });
  };

  const getBestPerformer = (metric: string) => {
    if (branchData.length === 0) return null;
    return branchData.reduce((best, current) => {
      const currentValue = current.currentMonth[metric as keyof typeof current.currentMonth];
      const bestValue = best.currentMonth[metric as keyof typeof best.currentMonth];
      return (currentValue as number) > (bestValue as number) ? current : best;
    });
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totals = getTotalMetrics();
  const bestRevenue = getBestPerformer('revenue');
  const bestProfit = getBestPerformer('profit');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Branch Performance Analytics</h3>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current_month">Current Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="year_to_date">Year to Date</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">RM {totals.revenue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-xl font-bold text-blue-600">RM {totals.profit.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Branches</p>
              <p className="text-xl font-bold text-purple-600">{branchData.filter(b => b.isActive).length}</p>
            </div>
            <MapPin className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-xl font-bold text-orange-600">{totals.employees}</p>
            </div>
            <Users className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-bold text-pink-600">{totals.customers}</p>
            </div>
            <Users className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="font-medium mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Top Revenue Performer</span>
          </h4>
          {bestRevenue && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bestRevenue.name}</p>
                  <p className="text-sm text-gray-500">{bestRevenue.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">RM {bestRevenue.currentMonth.revenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1">
                    {getGrowthIcon(bestRevenue.currentMonth.growth.revenue)}
                    <span className={`text-sm ${getGrowthColor(bestRevenue.currentMonth.growth.revenue)}`}>
                      {bestRevenue.currentMonth.growth.revenue.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="font-medium mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Top Profit Performer</span>
          </h4>
          {bestProfit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bestProfit.name}</p>
                  <p className="text-sm text-gray-500">{bestProfit.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">RM {bestProfit.currentMonth.profit.toLocaleString()}</p>
                  <div className="flex items-center space-x-1">
                    {getGrowthIcon(bestProfit.currentMonth.growth.profit)}
                    <span className={`text-sm ${getGrowthColor(bestProfit.currentMonth.growth.profit)}`}>
                      {bestProfit.currentMonth.growth.profit.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Branch Details Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-medium">Branch Performance Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branchData.map((branch) => (
                <tr key={branch.branchId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                        <div className="text-sm text-gray-500">{branch.code} • {branch.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{branch.manager}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{branch.employees}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">RM {branch.currentMonth.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">RM {branch.currentMonth.profit.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getGrowthIcon(branch.currentMonth.growth.revenue)}
                      <span className={`text-sm font-medium ${getGrowthColor(branch.currentMonth.growth.revenue)}`}>
                        {branch.currentMonth.growth.revenue.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchPerformanceAnalytics;