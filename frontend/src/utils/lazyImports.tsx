import React, { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export function createLazyComponent<P extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: ComponentType | null = LoadingSpinner
) {
  const LazyComponent = lazy(importFunc) as unknown as ComponentType<P>;

  function Wrapped(props: P) {
    return (
      <Suspense fallback={fallback ? React.createElement(fallback) : null}>
        {/* @ts-ignore */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  }

  return Wrapped as ComponentType<P>;
}

export const preloadComponent = (importFunc: () => Promise<any>) => importFunc();

export const useLazyLoad = () => ({ preload: (importFunc: () => Promise<any>) => importFunc() });

export const trackLoadTime = (componentName: string) => {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    if (typeof window !== 'undefined') {
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      metrics.push({ component: componentName, loadTime, timestamp: new Date().toISOString() });
      if (metrics.length > 100) metrics.splice(0, metrics.length - 100);
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }
  };
};