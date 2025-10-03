import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, AlertTriangle, Clock, Download, Upload, Settings, RefreshCw } from 'lucide-react';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  reference: string;
  balance: number;
}

interface SystemTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  reference?: string;
}

interface MatchResult {
  id: string;
  bankTransaction: BankTransaction;
  systemTransaction?: SystemTransaction;
  matchScore: number;
  status: 'matched' | 'unmatched' | 'disputed' | 'manual';
  confidence: number;
}

interface ReconciliationSummary {
  totalBankTransactions: number;
  totalSystemTransactions: number;
  matched: number;
  unmatched: number;
  disputed: number;
  variance: number;
}

const AutoReconciliation: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('maybank_current');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationDate, setReconciliationDate] = useState('2024-10-01');

  const accounts = [
    { id: 'maybank_current', name: 'Maybank Current Account', number: '****1234' },
    { id: 'cimb_savings', name: 'CIMB Savings Account', number: '****5678' },
    { id: 'public_business', name: 'Public Bank Business Account', number: '****9012' }
  ];

  // Mock data
  useEffect(() => {
    const mockMatches: MatchResult[] = [
      {
        id: 'match_1',
        bankTransaction: {
          id: 'bank_1',
          date: '2024-10-01',
          description: 'ONLINE TRANSFER ABC TECHNOLOGIES SDN BHD',
          amount: 2500.00,
          type: 'credit',
          reference: 'INV001234',
          balance: 15750.00
        },
        systemTransaction: {
          id: 'sys_1',
          date: '2024-10-01',
          description: 'Payment received from ABC Technologies Sdn Bhd',
          amount: 2500.00,
          type: 'income',
          category: 'Sales Revenue',
          reference: 'INV001234'
        },
        matchScore: 1.0,
        status: 'matched',
        confidence: 0.98
      },
      {
        id: 'match_2',
        bankTransaction: {
          id: 'bank_2',
          date: '2024-10-01',
          description: 'PETROL STATION SHELL BUKIT BINTANG',
          amount: -45.50,
          type: 'debit',
          reference: 'TXN789456',
          balance: 13204.50
        },
        systemTransaction: {
          id: 'sys_2',
          date: '2024-10-01',
          description: 'Petrol expense - Shell Bukit Bintang',
          amount: 45.50,
          type: 'expense',
          category: 'Transportation'
        },
        matchScore: 0.92,
        status: 'matched',
        confidence: 0.88
      },
      {
        id: 'match_3',
        bankTransaction: {
          id: 'bank_3',
          date: '2024-10-01',
          description: 'INTERBANK GIRO TM UNIFI BERHAD',
          amount: -199.00,
          type: 'debit',
          reference: 'DG654321',
          balance: 13005.50
        },
        systemTransaction: {
          id: 'sys_3',
          date: '2024-10-01',
          description: 'Unifi internet bill - September 2024',
          amount: 199.00,
          type: 'expense',
          category: 'Utilities'
        },
        matchScore: 0.95,
        status: 'matched',
        confidence: 0.94
      },
      {
        id: 'match_4',
        bankTransaction: {
          id: 'bank_4',
          date: '2024-10-01',
          description: 'ATM WITHDRAWAL KLCC',
          amount: -300.00,
          type: 'debit',
          reference: 'ATM123456',
          balance: 12705.50
        },
        matchScore: 0.0,
        status: 'unmatched',
        confidence: 0.0
      },
      {
        id: 'match_5',
        bankTransaction: {
          id: 'bank_5',
          date: '2024-10-01',
          description: 'ONLINE PURCHASE SHOPEE MALAYSIA',
          amount: -127.80,
          type: 'debit',
          reference: 'SP789012',
          balance: 12577.70
        },
        systemTransaction: {
          id: 'sys_5',
          date: '2024-10-01',
          description: 'Office supplies from Popular Bookstore',
          amount: 127.80,
          type: 'expense',
          category: 'Office Supplies'
        },
        matchScore: 0.65,
        status: 'disputed',
        confidence: 0.45
      }
    ];

    const mockSummary: ReconciliationSummary = {
      totalBankTransactions: 15,
      totalSystemTransactions: 13,
      matched: 11,
      unmatched: 2,
      disputed: 2,
      variance: 173.80
    };

    setMatches(mockMatches);
    setSummary(mockSummary);
  }, [selectedAccount]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'text-green-600 bg-green-100';
      case 'unmatched': return 'text-red-600 bg-red-100';
      case 'disputed': return 'text-yellow-600 bg-yellow-100';
      case 'manual': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unmatched': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'manual': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const runReconciliation = async () => {
    setIsReconciling(true);
    // Simulate reconciliation process
    setTimeout(() => {
      setIsReconciling(false);
      // Update some matches after reconciliation
      setMatches(prev => prev.map(match => ({
        ...match,
        confidence: Math.min(match.confidence + 0.1, 1.0)
      })));
    }, 3000);
  };

  const approveMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'matched' as const, confidence: 1.0 }
        : match
    ));
  };

  const rejectMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'manual' as const }
        : match
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Auto Bank Reconciliation</h1>
              <p className="text-gray-600 text-lg">Intelligent matching of bank statements with system transactions</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.number})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reconciliation Date</label>
                <input
                  type="date"
                  value={reconciliationDate}
                  onChange={(e) => setReconciliationDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import Statement</span>
              </button>
              
              <button
                onClick={runReconciliation}
                disabled={isReconciling}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isReconciling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Reconciling...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Run Reconciliation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Bank Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalBankTransactions}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">System Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{summary.totalSystemTransactions}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Matched</p>
                <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Unmatched</p>
                <p className="text-2xl font-bold text-red-600">{summary.unmatched}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Variance</p>
                <p className="text-2xl font-bold text-orange-600">RM {summary.variance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Matching Results */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Transaction Matching Results</h3>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
                <button className="flex items-center space-x-2 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(match.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                      </span>
                      {match.confidence > 0 && (
                        <span className="text-xs text-gray-500">
                          {Math.round(match.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    
                    {match.status === 'disputed' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveMatch(match.id)}
                          className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMatch(match.id)}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bank Transaction */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Bank Transaction</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{match.bankTransaction.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="text-right">{match.bankTransaction.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className={`font-bold ${match.bankTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            RM {Math.abs(match.bankTransaction.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span>{match.bankTransaction.reference}</span>
                        </div>
                      </div>
                    </div>

                    {/* System Transaction */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">System Transaction</h4>
                      {match.systemTransaction ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span>{match.systemTransaction.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Description:</span>
                            <span className="text-right">{match.systemTransaction.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-bold text-gray-900">
                              RM {match.systemTransaction.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span>{match.systemTransaction.category}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                          <p>No matching system transaction found</p>
                          <button className="mt-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                            Create Manual Entry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {match.matchScore > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Match Score: {(match.matchScore * 100).toFixed(1)}%</span>
                        <span>Last Updated: {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoReconciliation;