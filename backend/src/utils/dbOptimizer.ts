// Database optimization utilities for HAFJET Cloud Accounting System backend
import { performance } from 'perf_hooks';

// Query performance tracking
interface QueryMetric {
  query: string;
  duration: number;
  timestamp: Date;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

class DatabaseOptimizer {
  private queryMetrics: QueryMetric[] = [];
  private slowQueryThreshold = 1000; // 1 second
  private maxMetrics = 1000;

  // Track query performance
  trackQuery(query: string, table: string, operation: QueryMetric['operation']) {
    const startTime = performance.now();
    
    return {
      finish: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const metric: QueryMetric = {
          query: query.substring(0, 200), // Truncate long queries
          duration,
          timestamp: new Date(),
          table,
          operation
        };
        
        this.queryMetrics.push(metric);
        
        // Keep only recent metrics
        if (this.queryMetrics.length > this.maxMetrics) {
          this.queryMetrics = this.queryMetrics.slice(-this.maxMetrics);
        }
        
        // Log slow queries
        if (duration > this.slowQueryThreshold) {
          console.warn(`🐌 Slow query detected (${duration.toFixed(2)}ms):`, {
            table,
            operation,
            query: metric.query
          });
        }
        
        return duration;
      }
    };
  }

  // Get performance analytics
  getAnalytics() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentMetrics = this.queryMetrics.filter(m => m.timestamp > hourAgo);
    
    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageTime: 0,
        slowQueries: 0,
        queryBreakdown: {},
        tableBreakdown: {}
      };
    }
    
    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageTime = totalTime / recentMetrics.length;
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    
    // Query type breakdown
    const queryBreakdown = recentMetrics.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Table breakdown
    const tableBreakdown = recentMetrics.reduce((acc, m) => {
      acc[m.table] = (acc[m.table] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalQueries: recentMetrics.length,
      averageTime: Math.round(averageTime),
      slowQueries,
      queryBreakdown,
      tableBreakdown,
      recentQueries: recentMetrics.slice(-10)
    };
  }

  // Get slow queries for optimization
  getSlowQueries(limit = 10) {
    return this.queryMetrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Clear metrics
  clearMetrics() {
    this.queryMetrics = [];
  }
}

// Connection pool simulation
class ConnectionPool {
  private activeConnections = 0;
  private maxConnections = 10;
  private waitingQueue: (() => void)[] = [];

  async getConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++;
        resolve();
      } else {
        this.waitingQueue.push(() => {
          this.activeConnections++;
          resolve();
        });
      }
    });
  }

  releaseConnection(): void {
    this.activeConnections--;
    
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      if (next) {
        next();
      }
    }
  }

  getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      waiting: this.waitingQueue.length,
      utilization: (this.activeConnections / this.maxConnections) * 100
    };
  }
}

// Query caching system
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 300000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Database optimization recommendations
export const getOptimizationRecommendations = (analytics: any) => {
  const recommendations = [];

  if (analytics.slowQueries > analytics.totalQueries * 0.1) {
    recommendations.push({
      type: 'warning',
      title: 'High Slow Query Rate',
      description: `${analytics.slowQueries} out of ${analytics.totalQueries} queries are slow`,
      action: 'Consider adding indexes or optimizing query structure'
    });
  }

  if (analytics.queryBreakdown.SELECT > analytics.totalQueries * 0.8) {
    recommendations.push({
      type: 'info',
      title: 'High SELECT Query Volume',
      description: 'Majority of queries are SELECT operations',
      action: 'Consider implementing read replicas or query caching'
    });
  }

  if (analytics.averageTime > 500) {
    recommendations.push({
      type: 'warning',
      title: 'High Average Query Time',
      description: `Average query time is ${analytics.averageTime}ms`,
      action: 'Review database schema and query optimization'
    });
  }

  return recommendations;
};

// Export instances
export const dbOptimizer = new DatabaseOptimizer();
export const connectionPool = new ConnectionPool();
export const queryCache = new QueryCache();

// Performance monitoring middleware for Express
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`📊 ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    
    // Track API performance
    if (typeof global !== 'undefined') {
      (global as any).apiMetrics = (global as any).apiMetrics || [];
      (global as any).apiMetrics.push({
        method: req.method,
        path: req.path,
        duration,
        timestamp: new Date(),
        statusCode: res.statusCode
      });
      
      // Keep only recent metrics
      if ((global as any).apiMetrics.length > 1000) {
        (global as any).apiMetrics = (global as any).apiMetrics.slice(-1000);
      }
    }
  });
  
  next();
};