import { lazy, ComponentType, Suspense } from 'react';
import React from 'react';

// Simple lazy component creator
export function createLazyComponent<P extends Record<string, unknown>>(importFunc: () => Promise<{ default: ComponentType<P> }>) {
  const LazyComponent = lazy(importFunc) as unknown as ComponentType<P>;

  function WrappedComponent(props: P) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore - LazyComponent typing is not strict here */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  }

  return WrappedComponent as ComponentType<P>;
}

// Preload function for better UX
export const preloadComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return importFunc();
};

// Lazy load hook for dynamic imports
export const useLazyLoad = () => {
  const preload = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
    return importFunc();
  };

  return { preload };
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
