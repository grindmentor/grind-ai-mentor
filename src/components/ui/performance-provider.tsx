
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePerformanceOptimization, useLowDataMode, useConnectionQuality } from '@/hooks/usePerformanceOptimization';

interface PerformanceContextType {
  lowDataMode: boolean;
  toggleLowDataMode: () => void;
  connectionType: 'slow' | 'fast' | 'unknown';
  optimizeImage: (src: string, options?: { width?: number; quality?: number }) => string;
  createDebouncedFunction: (fn: Function, delay?: number) => Function;
  preloadResource: (url: string, type?: 'script' | 'style' | 'image') => void;
  measurePerformance: (name: string, fn: Function) => any;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { optimizeImage, createDebouncedFunction, measurePerformance } = usePerformanceOptimization();
  const { lowDataMode, toggleLowDataMode } = useLowDataMode();
  const connectionType = useConnectionQuality();
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced resource preloading with priority
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (lowDataMode) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        link.crossOrigin = 'anonymous';
        break;
    }
    
    // Add fetchpriority for better performance
    (link as any).fetchPriority = 'low';
    
    document.head.appendChild(link);
  }, [lowDataMode]);

  // Optimized initialization with minimal impact
  useEffect(() => {
    if (isInitialized) return;
    
    const initializePerformance = () => {
      // Only preload absolutely critical resources
      if (!lowDataMode && connectionType === 'fast') {
        const criticalResources = [
          '/src/components/Dashboard.tsx'
        ];
        
        criticalResources.forEach(resource => {
          preloadResource(resource, 'script');
        });
      }

      // Minimal performance monitoring
      if ('performance' in window && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                if (entry.startTime > 2500) {
                  console.log('[Performance] LCP needs optimization:', entry.startTime, 'ms');
                }
              }
            });
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          // Silent fail - performance monitoring is optional
        }
      }

      setIsInitialized(true);
    };

    // Use the most efficient scheduling available
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(initializePerformance, { priority: 'background' });
    } else if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initializePerformance, { timeout: 1000 });
    } else {
      setTimeout(initializePerformance, 0);
    }
  }, [isInitialized, lowDataMode, connectionType, preloadResource]);

  // Optimized performance mode application
  useEffect(() => {
    const root = document.documentElement;
    
    if (lowDataMode || connectionType === 'slow') {
      // Ultra-aggressive performance mode
      root.style.setProperty('--animation-duration', '0.05s');
      root.style.setProperty('--transition-duration', '0.05s');
      root.style.setProperty('--image-quality', '50');
      root.classList.add('performance-mode');
    } else {
      // Balanced performance mode
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--transition-duration', '0.2s');
      root.style.setProperty('--image-quality', '75');
      root.classList.remove('performance-mode');
    }
  }, [lowDataMode, connectionType]);

  return (
    <PerformanceContext.Provider value={{
      lowDataMode,
      toggleLowDataMode,
      connectionType,
      optimizeImage,
      createDebouncedFunction,
      preloadResource,
      measurePerformance
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
};
