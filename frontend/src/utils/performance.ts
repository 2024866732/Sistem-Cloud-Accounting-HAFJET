// Performance optimization utilities
import type { ComponentType } from 'react';
import { lazy } from 'react';

// Preload function for better UX
export const preloadComponent = (importFunc: () => Promise<{ default: ComponentType }>) => {
  return importFunc();
};

// Simple lazy component factory
export const createLazyComponent = (importFunc: () => Promise<{ default: ComponentType }>) => {
  return lazy(importFunc);
};

// Performance metrics tracking
export const trackLoadTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Store metrics for analysis
    if (typeof window !== 'undefined') {
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      metrics.push({
        component: componentName,
        loadTime,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 entries
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }
  };
};

// Performance monitoring hook
export const useLazyLoad = () => {
  const preload = (importFunc: () => Promise<{ default: ComponentType }>) => {
    return importFunc();
  };

  return { preload };
};

// Bundle size tracking
export const trackBundleSize = (bundleName: string, size: number) => {
  if (typeof window !== 'undefined') {
    const sizes = JSON.parse(localStorage.getItem('bundle_sizes') || '{}');
    sizes[bundleName] = {
      size,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('bundle_sizes', JSON.stringify(sizes));
  }
};

// Get performance metrics
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('performance_metrics') || '[]');
};

// Clear performance data
export const clearPerformanceData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('performance_metrics');
    localStorage.removeItem('bundle_sizes');
  }
};