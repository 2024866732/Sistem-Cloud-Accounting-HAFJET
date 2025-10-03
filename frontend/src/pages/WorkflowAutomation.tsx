import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, Bell, RefreshCw, Brain, Settings, Play, Pause, Edit3 } from 'lucide-react';
import SmartExpenseCategorization from '../components/automation/SmartExpenseCategorization';
import AutoReconciliation from '../components/automation/AutoReconciliation';

interface AutomationRule {
  id: string;
  name: string;
  type: 'invoice_reminder' | 'recurring_billing' | 'expense_categorization' | 'reconciliation';
  status: 'active' | 'paused' | 'draft';
  triggers: string[];
  actions: string[];
  lastRun: string;
  nextRun: string;
  executionCount: number;
}

interface InvoiceTemplate {
  service: string;
  hours?: number;
  plan?: string;
  retainer?: boolean;
}

interface RecurringInvoice {
  id: string;
  customerName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDue: string;
  status: 'active' | 'paused';
  template: InvoiceTemplate;
}

const WorkflowAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockRules: AutomationRule[] = [
      {
        id: 'rule_1',
        name: 'Invoice Overdue Reminder',
        type: 'invoice_reminder',
        status: 'active',
        triggers: ['Invoice 7 days overdue'],
        actions: ['Send email reminder', 'Update invoice status'],
        lastRun: '2024-10-01 14:30',
        nextRun: '2024-10-02 09:00',
        executionCount: 45
      },
      {
        id: 'rule_2',
        name: 'Auto Expense Categorization',
        type: 'expense_categorization',
        status: 'active',
        triggers: ['New expense created'],
        actions: ['Analyze description', 'Auto-assign category', 'Set tax rate'],
        lastRun: '2024-10-01 16:15',
        nextRun: 'Real-time',
        executionCount: 234
      },
      {
        id: 'rule_3',
        name: 'Bank Reconciliation Check',
        type: 'reconciliation',
        status: 'active',
        triggers: ['Daily at 6:00 AM'],
        actions: ['Match transactions', 'Flag discrepancies', 'Generate report'],
        lastRun: '2024-10-02 06:00',
        nextRun: '2024-10-03 06:00',
        executionCount: 28
      },
      {
        id: 'rule_4',
        name: 'Monthly Recurring Invoices',
        type: 'recurring_billing',
        status: 'active',
        triggers: ['Monthly on 1st day'],
        actions: ['Generate invoice', 'Send to customer', 'Update records'],
        lastRun: '2024-10-01 00:00',
        nextRun: '2024-11-01 00:00',
        executionCount: 12
      }
    ];

    const mockRecurring: RecurringInvoice[] = [
      {
        id: 'recurring_1',
        customerName: 'ABC Technologies Sdn Bhd',
        amount: 2500.00,
        frequency: 'monthly',
        nextDue: '2024-11-01',
        status: 'active',
        template: { service: 'Web Development', hours: 50 }
      },
      {
        id: 'recurring_2',
        customerName: 'XYZ Marketing Sdn Bhd',
        amount: 1200.00,
        frequency: 'monthly',
        nextDue: '2024-11-15',
        status: 'active',
        template: { service: 'SEO Services', plan: 'Premium' }
      },
      {
        id: 'recurring_3',
        customerName: 'DEF Consulting',
        amount: 5000.00,
        frequency: 'quarterly',
        nextDue: '2024-12-01',
        status: 'active',
        template: { service: 'Business Consultation', retainer: true }
      }
    ];

    setTimeout(() => {
      setAutomationRules(mockRules);
      setRecurringInvoices(mockRecurring);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice_reminder': return <Bell className="w-4 h-4" />;
      case 'recurring_billing': return <RefreshCw className="w-4 h-4" />;
      case 'expense_categorization': return <Brain className="w-4 h-4" />;
      case 'reconciliation': return <Zap className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
          <p className="text-gray-600 text-lg">Automate your accounting processes for maximum efficiency</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">
                  {automationRules.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {automationRules.reduce((sum, rule) => sum + rule.executionCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recurring Invoices</p>
                <p className="text-2xl font-bold text-purple-600">{recurringInvoices.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-orange-600">42h</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Settings },
                { id: 'rules', label: 'Automation Rules', icon: Zap },
                { id: 'recurring', label: 'Recurring Billing', icon: RefreshCw },
                { id: 'reminders', label: 'Invoice Reminders', icon: Bell },
                { id: 'categorization', label: 'Smart Categorization', icon: Brain },
                { id: 'reconciliation', label: 'Auto Reconciliation', icon: Zap }
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
                <h3 className="text-xl font-semibold mb-4">Automation Overview</h3>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <Zap className="w-6 h-6 mb-2" />
                    <p className="font-medium">Create New Rule</p>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <RefreshCw className="w-6 h-6 mb-2" />
                    <p className="font-medium">Setup Recurring Invoice</p>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <Bell className="w-6 h-6 mb-2" />
                    <p className="font-medium">Configure Reminders</p>
                  </button>
                </div>

                {/* Recent Activities */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Recent Automation Activities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-white rounded">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Sent 3 invoice reminders to overdue customers</span>
                      <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-white rounded">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Auto-categorized 12 new expenses</span>
                      <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-white rounded">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Generated 5 recurring invoices</span>
                      <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Automation Rules</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Create New Rule
                  </button>
                </div>

                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            {getTypeIcon(rule.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{rule.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{rule.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                            {rule.status}
                          </span>
                          <button
                            onClick={() => toggleRuleStatus(rule.id)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Triggers:</p>
                          <ul className="text-gray-600 space-y-1">
                            {rule.triggers.map((trigger, idx) => (
                              <li key={idx}>• {trigger}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Actions:</p>
                          <ul className="text-gray-600 space-y-1">
                            {rule.actions.map((action, idx) => (
                              <li key={idx}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
                        <span>Last run: {rule.lastRun}</span>
                        <span>Next run: {rule.nextRun}</span>
                        <span>Executions: {rule.executionCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recurring' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Recurring Invoices</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Setup New Recurring Invoice
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recurringInvoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{invoice.customerName}</h4>
                          <p className="text-2xl font-bold text-blue-600">RM {invoice.amount.toFixed(2)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frequency:</span>
                          <span className="font-medium capitalize">{invoice.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Due:</span>
                          <span className="font-medium">{invoice.nextDue}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors">
                          Edit Template
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                          View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Invoice Reminder Settings</h3>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h4 className="font-medium mb-4">Reminder Schedule</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">First Reminder</p>
                        <p className="text-sm text-gray-600">Send when invoice is 3 days overdue</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Second Reminder</p>
                        <p className="text-sm text-gray-600">Send when invoice is 7 days overdue</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Final Notice</p>
                        <p className="text-sm text-gray-600">Send when invoice is 14 days overdue</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h4 className="font-medium mb-4">Email Templates</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="font-medium">Friendly Reminder Template</p>
                      <p className="text-sm text-gray-600">Professional but gentle reminder tone</p>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="font-medium">Urgent Notice Template</p>
                      <p className="text-sm text-gray-600">More formal and urgent language</p>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="font-medium">Final Warning Template</p>
                      <p className="text-sm text-gray-600">Last notice before collection action</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categorization' && (
              <SmartExpenseCategorization />
            )}

            {activeTab === 'reconciliation' && (
              <AutoReconciliation />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;