import React, { useState, useEffect } from 'react';
import { Building2, Plus, Settings, BarChart3, ArrowRightLeft, Users, MapPin, ChevronDown, Search } from 'lucide-react';
import BranchPerformanceAnalytics from '../components/multicompany/BranchPerformanceAnalytics';

interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  taxNumber: string;
  logo?: string;
  type: 'parent' | 'subsidiary' | 'branch';
  parentId?: string;
  isActive: boolean;
  branches: Branch[];
  financialSummary: {
    revenue: number;
    expenses: number;
    profit: number;
    employees: number;
  };
  location: {
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
}

interface Branch {
  id: string;
  name: string;
  code: string;
  companyId: string;
  managerId?: string;
  isActive: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
  financialSummary: {
    revenue: number;
    expenses: number;
    profit: number;
    employees: number;
  };
}

interface InterCompanyTransaction {
  id: string;
  fromCompanyId: string;
  toCompanyId: string;
  amount: number;
  description: string;
  type: 'transfer' | 'loan' | 'service' | 'goods';
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  approvedBy?: string;
}

const MultiCompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [interCompanyTransactions, setInterCompanyTransactions] = useState<InterCompanyTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: 'comp_1',
        name: 'HAFJET Holdings Sdn Bhd',
        registrationNumber: '202301234567',
        taxNumber: 'C12345678901',
        type: 'parent',
        isActive: true,
        branches: [],
        financialSummary: {
          revenue: 2500000,
          expenses: 1800000,
          profit: 700000,
          employees: 45
        },
        location: {
          address: 'Level 15, Menara Landmark',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50450'
        }
      },
      {
        id: 'comp_2',
        name: 'HAFJET Technology Sdn Bhd',
        registrationNumber: '202301234568',
        taxNumber: 'C12345678902',
        type: 'subsidiary',
        parentId: 'comp_1',
        isActive: true,
        branches: [
          {
            id: 'branch_1',
            name: 'KL Branch',
            code: 'KL001',
            companyId: 'comp_2',
            managerId: 'user_1',
            isActive: true,
            location: {
              address: 'Plaza Mont Kiara',
              city: 'Kuala Lumpur',
              state: 'Kuala Lumpur',
              postcode: '50480'
            },
            financialSummary: {
              revenue: 800000,
              expenses: 600000,
              profit: 200000,
              employees: 15
            }
          },
          {
            id: 'branch_2',
            name: 'Penang Branch',
            code: 'PG001',
            companyId: 'comp_2',
            managerId: 'user_2',
            isActive: true,
            location: {
              address: 'Gurney Plaza',
              city: 'George Town',
              state: 'Penang',
              postcode: '10250'
            },
            financialSummary: {
              revenue: 450000,
              expenses: 350000,
              profit: 100000,
              employees: 8
            }
          }
        ],
        financialSummary: {
          revenue: 1250000,
          expenses: 950000,
          profit: 300000,
          employees: 23
        },
        location: {
          address: 'Menara PGRM',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50400'
        }
      },
      {
        id: 'comp_3',
        name: 'HAFJET Consulting Sdn Bhd',
        registrationNumber: '202301234569',
        taxNumber: 'C12345678903',
        type: 'subsidiary',
        parentId: 'comp_1',
        isActive: true,
        branches: [
          {
            id: 'branch_3',
            name: 'Johor Branch',
            code: 'JB001',
            companyId: 'comp_3',
            managerId: 'user_3',
            isActive: true,
            location: {
              address: 'Johor Bahru City Square',
              city: 'Johor Bahru',
              state: 'Johor',
              postcode: '80000'
            },
            financialSummary: {
              revenue: 320000,
              expenses: 250000,
              profit: 70000,
              employees: 6
            }
          }
        ],
        financialSummary: {
          revenue: 650000,
          expenses: 480000,
          profit: 170000,
          employees: 12
        },
        location: {
          address: 'Wisma UOA II',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50450'
        }
      }
    ];

    const mockTransactions: InterCompanyTransaction[] = [
      {
        id: 'ict_1',
        fromCompanyId: 'comp_1',
        toCompanyId: 'comp_2',
        amount: 100000,
        description: 'Quarterly management fee',
        type: 'service',
        date: '2024-10-01',
        status: 'completed',
        approvedBy: 'admin'
      },
      {
        id: 'ict_2',
        fromCompanyId: 'comp_2',
        toCompanyId: 'comp_3',
        amount: 50000,
        description: 'Software licensing fee',
        type: 'service',
        date: '2024-10-01',
        status: 'pending'
      },
      {
        id: 'ict_3',
        fromCompanyId: 'comp_1',
        toCompanyId: 'comp_3',
        amount: 200000,
        description: 'Working capital loan',
        type: 'loan',
        date: '2024-09-30',
        status: 'approved'
      }
    ];

    setCompanies(mockCompanies);
    setSelectedCompany('comp_1');
    setInterCompanyTransactions(mockTransactions);
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || company.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTotalConsolidated = () => {
    return companies.reduce((total, company) => ({
      revenue: total.revenue + company.financialSummary.revenue,
      expenses: total.expenses + company.financialSummary.expenses,
      profit: total.profit + company.financialSummary.profit,
      employees: total.employees + company.financialSummary.employees
    }), { revenue: 0, expenses: 0, profit: 0, employees: 0 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown Company';
  };

  const consolidated = getTotalConsolidated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Company Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Multi-Company Management</h1>
                <p className="text-gray-600 text-lg">Manage multiple companies and branches efficiently</p>
              </div>
            </div>

            {/* Company Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCompanySelector(!showCompanySelector)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border hover:shadow-lg transition-all"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-medium">
                  {companies.find(c => c.id === selectedCompany)?.name || 'Select Company'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showCompanySelector && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-4">
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mb-3">
                      {['all', 'parent', 'subsidiary', 'branch'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            filterType === type
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {filteredCompanies.map(company => (
                        <button
                          key={company.id}
                          onClick={() => {
                            setSelectedCompany(company.id);
                            setShowCompanySelector(false);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-xs text-gray-500">{company.type} • {company.location.city}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              company.type === 'parent' ? 'bg-purple-100 text-purple-700' :
                              company.type === 'subsidiary' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {company.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consolidated Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">RM {(consolidated.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">RM {(consolidated.profit / 1000000).toFixed(1)}M</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-purple-600">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-orange-600">{consolidated.employees}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Company Overview', icon: Building2 },
                { id: 'branches', label: 'Branch Management', icon: MapPin },
                { id: 'consolidated', label: 'Consolidated Reports', icon: BarChart3 },
                { id: 'intercompany', label: 'Inter-Company Transactions', icon: ArrowRightLeft },
                { id: 'settings', label: 'Group Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Company Structure</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Company</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companies.map(company => (
                    <div key={company.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            company.type === 'parent' ? 'bg-purple-100' :
                            company.type === 'subsidiary' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <Building2 className={`w-5 h-5 ${
                              company.type === 'parent' ? 'text-purple-600' :
                              company.type === 'subsidiary' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{company.type}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">RM {(company.financialSummary.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit:</span>
                          <span className="font-medium">RM {(company.financialSummary.profit / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-medium">{company.financialSummary.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branches:</span>
                          <span className="font-medium">{company.branches.length}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                          Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'branches' && (
              <BranchPerformanceAnalytics />
            )}

            {activeTab === 'consolidated' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Consolidated Financial Reports</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h4 className="font-medium mb-4">Group Revenue by Company</h4>
                    <div className="space-y-3">
                      {companies.map(company => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-gray-500">{company.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">RM {(company.financialSummary.revenue / 1000).toFixed(0)}K</p>
                            <p className="text-sm text-gray-500">
                              {((company.financialSummary.revenue / consolidated.revenue) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h4 className="font-medium mb-4">Group Profit Margins</h4>
                    <div className="space-y-3">
                      {companies.map(company => {
                        const margin = (company.financialSummary.profit / company.financialSummary.revenue) * 100;
                        return (
                          <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-gray-500">Profit: RM {(company.financialSummary.profit / 1000).toFixed(0)}K</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${margin >= 20 ? 'text-green-600' : margin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {margin.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-500">margin</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h4 className="font-medium mb-4">Consolidated Financial Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">RM {(consolidated.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-600">Total Group Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">RM {(consolidated.profit / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-600">Total Group Profit</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{((consolidated.profit / consolidated.revenue) * 100).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Overall Profit Margin</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intercompany' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Inter-Company Transactions</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Transaction</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {interCompanyTransactions.map(transaction => (
                    <div key={transaction.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{transaction.description}</h4>
                            <p className="text-sm text-gray-500">
                              {getCompanyName(transaction.fromCompanyId)} → {getCompanyName(transaction.toCompanyId)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">RM {transaction.amount.toLocaleString()}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Transaction Type:</span>
                          <p className="font-medium capitalize">{transaction.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Approved By:</span>
                          <p className="font-medium">{transaction.approvedBy || 'Pending'}</p>
                        </div>
                      </div>

                      {transaction.status === 'pending' && (
                        <div className="flex space-x-2 mt-4">
                          <button className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm hover:bg-green-200 transition-colors">
                            Approve
                          </button>
                          <button className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Group Settings & Configuration</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h4 className="font-medium mb-4">Company Hierarchy</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <p className="font-medium text-purple-900">Parent Company Settings</p>
                        <p className="text-sm text-purple-700">Configure group-level policies and standards</p>
                        <button className="mt-2 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors">
                          Configure
                        </button>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-blue-900">Subsidiary Management</p>
                        <p className="text-sm text-blue-700">Manage subsidiary permissions and access</p>
                        <button className="mt-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                          Manage
                        </button>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <p className="font-medium text-green-900">Branch Permissions</p>
                        <p className="text-sm text-green-700">Set branch-level access and reporting</p>
                        <button className="mt-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                          Setup
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h4 className="font-medium mb-4">Consolidation Rules</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-Consolidation</p>
                          <p className="text-sm text-gray-600">Automatically consolidate financial reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Inter-Company Elimination</p>
                          <p className="text-sm text-gray-600">Eliminate inter-company transactions in reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Currency Conversion</p>
                          <p className="text-sm text-gray-600">Auto-convert foreign currency transactions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h4 className="font-medium mb-4">Access Control & Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Group Admin</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full access to all companies</li>
                        <li>• Create/modify companies</li>
                        <li>• Manage inter-company transactions</li>
                        <li>• View consolidated reports</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Company Manager</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Access to assigned company</li>
                        <li>• Manage company branches</li>
                        <li>• View company reports</li>
                        <li>• Limited inter-company access</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Branch User</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Access to assigned branch only</li>
                        <li>• View branch transactions</li>
                        <li>• Create basic entries</li>
                        <li>• No inter-company access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add other tab contents here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCompanyManagement;