import React, { useState, useEffect } from 'react';
import { Brain, Zap, Settings, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
  keywords: string[];
  taxRate: number;
  color: string;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  confidence: number;
  status: 'auto' | 'manual' | 'reviewed';
  vendor?: string;
}

interface CategoryRule {
  id: string;
  name: string;
  keywords: string[];
  category: string;
  taxRate: number;
  confidence: number;
  isActive: boolean;
}

const SmartExpenseCategorization: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  useEffect(() => {
    const mockCategories: ExpenseCategory[] = [
      { id: 'office', name: 'Office Supplies', keywords: ['stationery', 'paper', 'pen'], taxRate: 0.06, color: 'blue' },
      { id: 'transport', name: 'Transportation', keywords: ['petrol', 'toll', 'parking'], taxRate: 0.06, color: 'green' },
      { id: 'meals', name: 'Meals & Entertainment', keywords: ['restaurant', 'lunch', 'dinner'], taxRate: 0.06, color: 'orange' },
      { id: 'utilities', name: 'Utilities', keywords: ['electricity', 'water', 'internet'], taxRate: 0.00, color: 'purple' },
      { id: 'rent', name: 'Rent & Premises', keywords: ['rent', 'office space'], taxRate: 0.00, color: 'red' },
      { id: 'marketing', name: 'Marketing & Advertising', keywords: ['facebook ads', 'google ads'], taxRate: 0.06, color: 'pink' }
    ];

    const mockExpenses: ExpenseItem[] = [
      {
        id: 'exp_1',
        description: 'Petrol station - Shell Bukit Bintang',
        amount: 45.50,
        date: '2024-10-01',
        category: 'transport',
        confidence: 0.95,
        status: 'auto',
        vendor: 'Shell Malaysia'
      },
      {
        id: 'exp_2',
        description: 'Office stationery purchase from Popular Bookstore',
        amount: 127.80,
        date: '2024-10-01',
        category: 'office',
        confidence: 0.89,
        status: 'auto',
        vendor: 'Popular Bookstore'
      },
      {
        id: 'exp_3',
        description: 'Facebook Ads campaign - October 2024',
        amount: 250.00,
        date: '2024-10-01',
        category: 'marketing',
        confidence: 0.98,
        status: 'auto',
        vendor: 'Meta Platforms'
      },
      {
        id: 'exp_4',
        description: 'Business lunch with client at KLCC',
        amount: 89.50,
        date: '2024-10-01',
        category: 'meals',
        confidence: 0.76,
        status: 'manual',
        vendor: 'Restaurant XYZ'
      },
      {
        id: 'exp_5',
        description: 'Unifi internet bill - September 2024',
        amount: 199.00,
        date: '2024-09-30',
        category: 'utilities',
        confidence: 0.92,
        status: 'auto',
        vendor: 'TM Unifi'
      }
    ];

    const mockRules: CategoryRule[] = [
      {
        id: 'rule_1',
        name: 'Petrol Station Recognition',
        keywords: ['petrol', 'shell', 'petronas', 'esso', 'caltex'],
        category: 'transport',
        taxRate: 0.06,
        confidence: 0.90,
        isActive: true
      },
      {
        id: 'rule_2',
        name: 'Online Advertising',
        keywords: ['facebook ads', 'google ads', 'instagram ads', 'campaign'],
        category: 'marketing',
        taxRate: 0.06,
        confidence: 0.95,
        isActive: true
      },
      {
        id: 'rule_3',
        name: 'Utilities Bills',
        keywords: ['unifi', 'astro', 'electricity', 'water', 'bill'],
        category: 'utilities',
        taxRate: 0.00,
        confidence: 0.85,
        isActive: true
      }
    ];

    setCategories(mockCategories);
    setExpenses(mockExpenses);
    setRules(mockRules);
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'auto': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'manual': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  const processNewExpenses = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      // Add some new processed expenses
      const newExpenses: ExpenseItem[] = [
        {
          id: 'exp_new_1',
          description: 'Touch n Go reload - PLUS Highway',
          amount: 50.00,
          date: '2024-10-02',
          category: 'transport',
          confidence: 0.88,
          status: 'auto',
          vendor: 'Touch n Go'
        },
        {
          id: 'exp_new_2',
          description: 'Zoom Pro subscription - October',
          amount: 59.90,
          date: '2024-10-02',
          category: 'utilities',
          confidence: 0.94,
          status: 'auto',
          vendor: 'Zoom Video Communications'
        }
      ];
      setExpenses(prev => [...newExpenses, ...prev]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Smart Expense Categorization</h1>
              <p className="text-gray-600 text-lg">AI-powered automatic expense categorization and tax classification</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Categorized</p>
                <p className="text-2xl font-bold text-green-600">
                  {expenses.filter(e => e.status === 'auto').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manual Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {expenses.filter(e => e.status === 'manual').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(expenses.reduce((sum, e) => sum + e.confidence, 0) / expenses.length * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rules.filter(r => r.isActive).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'expenses', label: 'Recent Expenses', icon: Brain },
                { id: 'categories', label: 'Categories', icon: Settings },
                { id: 'rules', label: 'Categorization Rules', icon: Zap }
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
            {activeTab === 'expenses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Recent Expenses</h3>
                  <button
                    onClick={processNewExpenses}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 inline mr-2" />
                        Process New Expenses
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(expense.status)}
                          <div>
                            <h4 className="font-medium">{expense.description}</h4>
                            <p className="text-sm text-gray-500">
                              {expense.vendor} • {expense.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">RM {expense.amount.toFixed(2)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(expense.confidence)}`}>
                            {Math.round(expense.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 bg-${getCategoryColor(expense.category)}-500 rounded-full`}></span>
                          <span className="text-sm font-medium capitalize">
                            {categories.find(c => c.id === expense.category)?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            • SST: {(categories.find(c => c.id === expense.category)?.taxRate || 0) * 100}%
                          </span>
                        </div>
                        
                        {expense.status === 'manual' && (
                          <div className="flex space-x-2">
                            <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                              Approve
                            </button>
                            <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Expense Categories</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-4 h-4 bg-${category.color}-500 rounded-full`}></div>
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">SST Rate:</span>
                          <span className="font-medium">{(category.taxRate * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {category.keywords.slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                            {category.keywords.length > 3 && (
                              <span className="text-gray-500 text-xs">+{category.keywords.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Categorization Rules</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Rule
                  </button>
                </div>

                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-500">
                            Target: {categories.find(c => c.id === rule.category)?.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rule.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rule.confidence)}`}>
                            {Math.round(rule.confidence * 100)}% accuracy
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {rule.keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartExpenseCategorization;