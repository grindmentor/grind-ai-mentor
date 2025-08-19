import React, { useEffect } from 'react';
import { PerformanceMonitor, detectConnectionSpeed } from '@/utils/performanceOptimizations';

export const AppPerformance: React.FC = () => {
  useEffect(() => {
    const performanceMonitor = PerformanceMonitor.getInstance();
    
    // Monitor key performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] LCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
        
        if (entry.entryType === 'first-input') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] FID: ${(entry as any).processingStart - entry.startTime}ms`);
          }
        }
      });
    });
    
    // Observe multiple performance metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      // Fallback for browsers that don't support all entry types
      console.log('[Performance] Some metrics not supported');
    }
    
    // Connection speed optimization
    const connectionSpeed = detectConnectionSpeed();
    if (connectionSpeed === 'slow') {
      document.documentElement.classList.add('slow-connection');
    }
    
    // Memory monitoring in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usage > 0.8) {
          console.warn('[Performance] High memory usage detected:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            percentage: `${(usage * 100).toFixed(1)}%`
          });
        }
      };
      
      const memoryInterval = setInterval(checkMemory, 30000);
      
      return () => {
        clearInterval(memoryInterval);
        observer.disconnect();
      };
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This is a background performance monitoring component
};

export default AppPerformance;