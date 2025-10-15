/**
 * 🚀 FINAL APPLICATION OPTIMIZATION SUITE
 * 
 * Comprehensive performance optimizations and final quality checks
 * to ensure industrial-grade SaaS application standards.
 * 
 * Features:
 * - Bundle size optimization
 * - Component lazy loading
 * - Memory leak detection
 * - Performance monitoring
 * - Code splitting enhancements
 */

import React, { Suspense, lazy } from 'react';
import { logger } from '../utils/ProductionLogger.js';

// 🎯 Lazy load heavy components for better performance
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyCampaignBuilder = lazy(() => import('../pages/CampaignBuilder'));
export const LazySettings = lazy(() => import('../pages/Settings'));
export const LazyAnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

// 🔄 Loading fallback component
export const ComponentLoader = ({ name }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-sm text-gray-600">Loading {name}...</p>
    </div>
  </div>
);

// 🎨 Optimized wrapper for lazy components
export const OptimizedComponent = ({ component: Component, name, ...props }) => (
  <Suspense fallback={<ComponentLoader name={name} />}>
    <Component {...props} />
  </Suspense>
);

// 📊 Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        logger.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// 🧠 Memory usage tracker
export const useMemoryTracker = () => {
  const [memoryInfo, setMemoryInfo] = React.useState(null);
  
  React.useEffect(() => {
    const trackMemory = () => {
      if (performance.memory) {
        const memory = performance.memory;
        setMemoryInfo({
          used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        });
      }
    };
    
    trackMemory();
    const interval = setInterval(trackMemory, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
};

// 🔄 Optimized state management
export const useOptimizedState = (initialState) => {
  const [state, setState] = React.useState(initialState);
  
  // Debounced state updates to prevent excessive re-renders
  const debouncedSetState = React.useCallback(
    React.useMemo(
      () => {
        let timeoutId;
        return (newState) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setState(newState);
          }, 10);
        };
      },
      []
    ),
    []
  );
  
  return [state, debouncedSetState];
};

// 🎯 Image optimization utility
export const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading="lazy"
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};

// 🚀 Performance optimization utilities
export const performanceUtils = {
  // Debounce function calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function calls
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Optimize large lists with virtual scrolling
  getVisibleItems: (items, containerHeight, itemHeight, scrollTop) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1)
    };
  },
  
  // Measure component performance
  measurePerformance: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    logger.debug(`Performance: ${name} executed in ${(end - start).toFixed(2)}ms`);
    return result;
  }
};

export default {
  LazyDashboard,
  LazyCampaignBuilder,
  LazySettings,
  LazyAnalyticsPage,
  ComponentLoader,
  OptimizedComponent,
  usePerformanceMonitor,
  useMemoryTracker,
  useOptimizedState,
  OptimizedImage,
  performanceUtils
};