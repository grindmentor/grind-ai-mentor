
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

  // Resource preloading utility
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (lowDataMode) return; // Skip preloading in low data mode
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
    }
    
    document.head.appendChild(link);
  }, [lowDataMode]);

  // Initialize performance optimizations
  useEffect(() => {
    if (isInitialized) return;
    
    const initializePerformance = () => {
      // Critical resource preloading
      if (!lowDataMode) {
        const criticalResources = [
          '/src/components/Dashboard.tsx',
          '/src/components/ui/loading-screen.tsx'
        ];
        
        criticalResources.forEach(resource => {
          preloadResource(resource, 'script');
        });
      }

      // Performance monitoring setup
      if ('performance' in window && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'navigation') {
                console.log('[Performance] Page load time:', entry.duration, 'ms');
              } else if (entry.entryType === 'largest-contentful-paint') {
                console.log('[Performance] LCP:', entry.startTime, 'ms');
              }
            });
          });
          
          observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
        } catch (error) {
          console.log('[Performance] Observer not supported');
        }
      }

      setIsInitialized(true);
    };

    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initializePerformance);
    } else {
      setTimeout(initializePerformance, 0);
    }
  }, [isInitialized, lowDataMode, preloadResource]);

  // Apply performance optimizations based on connection and settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (lowDataMode || connectionType === 'slow') {
      // Aggressive performance mode
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.style.setProperty('--image-quality', '60');
      
      // Reduce motion for accessibility and performance
      root.style.setProperty('--reduced-motion', '1');
      
      // Add performance-focused CSS class
      document.body.classList.add('performance-mode');
    } else {
      // Standard performance mode
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
      root.style.setProperty('--image-quality', '80');
      root.style.setProperty('--reduced-motion', '0');
      
      document.body.classList.remove('performance-mode');
    }
  }, [lowDataMode, connectionType]);

  // Memory management
  useEffect(() => {
    const handleMemoryPressure = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 80) {
          console.log('[Performance] High memory usage detected, enabling aggressive cleanup');
          // Could trigger cache cleanup or component unmounting
        }
      }
    };

    const memoryCheckInterval = setInterval(handleMemoryPressure, 30000);
    return () => clearInterval(memoryCheckInterval);
  }, []);

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
