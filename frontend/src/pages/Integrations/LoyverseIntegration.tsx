import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  AlertCircle,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Zap,
  Lock,
  Key,
} from 'lucide-react';

interface SyncStatus {
  type: 'products' | 'customers' | 'sales' | 'inventory';
  label: string;
  lastSync: string;
  status: 'success' | 'syncing' | 'error';
  count: number;
}

const LoyverseIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const syncStatuses: SyncStatus[] = [
    {
      type: 'products',
      label: 'Products & Services',
      lastSync: '2 minutes ago',
      status: 'success',
      count: 234,
    },
    {
      type: 'customers',
      label: 'Customers',
      lastSync: '5 minutes ago',
      status: 'success',
      count: 892,
    },
    {
      type: 'sales',
      label: 'Sales Transactions',
      lastSync: '1 minute ago',
      status: 'syncing',
      count: 1547,
    },
    {
      type: 'inventory',
      label: 'Inventory Levels',
      lastSync: '3 minutes ago',
      status: 'success',
      count: 189,
    },
  ];

  const features = [
    {
      icon: <ShoppingCart className="text-blue-500" size={24} />,
      title: 'Real-time Sales Sync',
      description: 'Automatically sync all POS sales to your accounting system instantly',
    },
    {
      icon: <Package className="text-green-500" size={24} />,
      title: 'Product Management',
      description: 'Sync products, prices, and inventory between Loyverse and HAFJET',
    },
    {
      icon: <Users className="text-purple-500" size={24} />,
      title: 'Customer Data',
      description: 'Keep customer information synchronized across both platforms',
    },
    {
      icon: <TrendingUp className="text-orange-500" size={24} />,
      title: 'Financial Reports',
      description: 'Generate comprehensive reports combining POS and accounting data',
    },
  ];

  const handleConnect = () => {
    if (apiKey.trim()) {
      setIsSyncing(true);
      // Simulate API connection
      setTimeout(() => {
        setIsConnected(true);
        setIsSyncing(false);
      }, 2000);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Loyverse POS Integration</h1>
              <p className="text-sm text-slate-600 mt-1">
                Connect your Loyverse POS system with HAFJET Cloud Accounting
              </p>
            </div>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {/* Connection Status Card */}
      {!isConnected ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Connect Your Loyverse Account
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Integrate your Loyverse POS system to automatically sync sales, products, customers,
                and inventory data with HAFJET Cloud Accounting. Get real-time financial insights
                from your retail operations.
              </p>

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Loyverse API Key
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Key
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Loyverse API key"
                        className="
                          w-full pl-10 pr-4 py-2.5
                          border border-slate-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        "
                      />
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Get your API key from{' '}
                    <a
                      href="https://loyverse.com/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Loyverse Settings → API
                    </a>
                  </p>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={!apiKey.trim() || isSyncing}
                  className={`
                    px-6 py-2.5 rounded-lg font-medium
                    flex items-center space-x-2
                    ${
                      !apiKey.trim() || isSyncing
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    }
                    transition-all
                  `}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Connect to Loyverse</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected State - Sync Dashboard */
        <div className="space-y-6">
          {/* Sync Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Synchronization</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage data sync between Loyverse and HAFJET
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`
                    px-4 py-2 rounded-lg font-medium
                    flex items-center space-x-2
                    ${
                      isSyncing
                        ? 'bg-slate-300 text-slate-500'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }
                    transition-colors
                  `}
                >
                  <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Sync Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {syncStatuses.map((sync) => (
              <div key={sync.type} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${
                        sync.status === 'success'
                          ? 'bg-green-100'
                          : sync.status === 'syncing'
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                      }
                    `}
                  >
                    {sync.status === 'success' ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : sync.status === 'syncing' ? (
                      <RefreshCw size={20} className="text-blue-600 animate-spin" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{sync.count}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">{sync.label}</h3>
                <p className="text-xs text-slate-500">Last sync: {sync.lastSync}</p>
              </div>
            ))}
          </div>

          {/* Sync Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Settings size={20} />
                <span>Sync Settings</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Auto-sync Sales</p>
                  <p className="text-sm text-slate-600">
                    Automatically sync sales every 5 minutes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Sync Products</p>
                  <p className="text-sm text-slate-600">
                    Keep product catalog synchronized
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Sync Customers</p>
                  <p className="text-sm text-slate-600">
                    Synchronize customer database
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Inventory Sync</p>
                  <p className="text-sm text-slate-600">
                    Real-time inventory level updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Integration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Lock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Secure Connection</h3>
          <p className="text-sm text-blue-800">
            Your API credentials are encrypted and stored securely. All data transfers use
            industry-standard SSL/TLS encryption. We never share your data with third parties.
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-3">
              Check our comprehensive integration guide or contact our support team for assistance.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                View Integration Guide →
              </a>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyverseIntegration;
