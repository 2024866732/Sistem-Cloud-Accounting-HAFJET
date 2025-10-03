import React, { useState, useEffect } from 'react';
import { Activity, Clock, Database, Cpu, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getPerformanceMetrics, clearPerformanceData } from '../utils/performance';
import { cacheMetrics } from '../utils/cache';

interface PerformanceMetric {
  component: string;
  loadTime: number;
  timestamp: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  errorRate: number;
}

const PerformanceMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: 150,
    errorRate: 0.1
  });
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadMetrics = () => {
    const performanceData = getPerformanceMetrics();
    setMetrics(performanceData.slice(-50)); // Keep last 50 entries
    
    // Simulate system health check
    const avgLoadTime = performanceData.length > 0 
      ? performanceData.reduce((sum: number, m: PerformanceMetric) => sum + m.loadTime, 0) / performanceData.length 
      : 0;
    
    setSystemHealth(prev => ({
      ...prev,
      responseTime: Math.round(avgLoadTime),
      status: avgLoadTime > 3000 ? 'critical' : avgLoadTime > 1000 ? 'warning' : 'healthy'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const avgLoadTime = metrics.length > 0 
    ? Math.round(metrics.reduce((sum: number, m: PerformanceMetric) => sum + m.loadTime, 0) / metrics.length) 
    : 0;

  const cacheStats = cacheMetrics.getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Monitoring</h1>
          <p className="text-gray-600">Real-time performance metrics and system health monitoring</p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(systemHealth.status)}`}>
                  {getStatusIcon(systemHealth.status)}
                  <span className="ml-1 capitalize">{systemHealth.status}</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.responseTime}ms</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.uptime}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.errorRate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Component Load Times */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Component Load Times</h2>
              <Cpu className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {metrics.slice(-10).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{metric.component}</p>
                    <p className="text-sm text-gray-500">{new Date(metric.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${metric.loadTime > 1000 ? 'text-red-600' : metric.loadTime > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {metric.loadTime.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cache Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cache Performance</h2>
              <Database className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">API Cache</span>
                <span className="font-bold text-blue-600">{cacheStats.api.size}/{cacheStats.api.maxSize}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Component Cache</span>
                <span className="font-bold text-green-600">{cacheStats.component.size}/{cacheStats.component.maxSize}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">User Data Cache</span>
                <span className="font-bold text-purple-600">{cacheStats.userData.size}/{cacheStats.userData.maxSize}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
            <div className="flex space-x-2">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
              <button
                onClick={() => {
                  clearPerformanceData();
                  setMetrics([]);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Clear Data
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{metrics.length}</p>
              <p className="text-sm text-gray-600">Total Measurements</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{avgLoadTime}ms</p>
              <p className="text-sm text-gray-600">Average Load Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.max(...metrics.map(m => m.loadTime), 0).toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">Peak Load Time</p>
            </div>
          </div>
        </div>

        {/* Real-time Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Real-time performance chart</p>
              <p className="text-sm text-gray-400">Chart integration available with Chart.js</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;