
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useConnectionOptimization } from '@/hooks/useConnectionOptimization';

interface PerformanceContextType {
  lowDataMode: boolean;
  toggleLowDataMode: () => void;
  connectionType: 'slow' | 'fast' | 'unknown';
  bandwidth: number;
  optimizeImage: (src: string, options?: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' }) => string;
  createDebouncedFunction: (fn: Function, delay?: number) => Function;
  createThrottledFunction: (fn: Function, delay?: number) => Function;
  preloadResource: (url: string, type?: 'script' | 'style' | 'image') => void;
  measurePerformance: (name: string, fn: Function) => any;
  prefetchResource: (url: string, type?: 'script' | 'style' | 'image' | 'fetch') => void;
  optimizedSettings: any;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    optimizeImage, 
    createDebouncedFunction, 
    createThrottledFunction, 
    measurePerformance, 
    prefetchResource 
  } = usePerformanceOptimization();
  
  const { 
    connectionInfo, 
    optimizedSettings, 
    toggleLowDataMode, 
    lowDataMode 
  } = useConnectionOptimization();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Optimized resource preloading utility
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (optimizedSettings.lowDataMode) return; // Skip preloading on slow connections
    
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
  }, [optimizedSettings.lowDataMode]);

  // Performance initialization with connection awareness
  useEffect(() => {
    if (isInitialized) return;
    
    const initializePerformance = () => {
      // Critical resource preloading based on connection quality
      if (!optimizedSettings.lowDataMode && optimizedSettings.preloadNext) {
        const criticalResources = [
          '/src/components/Dashboard.tsx',
          '/src/components/ui/loading-screen.tsx'
        ];
        
        criticalResources.forEach((resource, index) => {
          setTimeout(() => {
            preloadResource(resource, 'script');
          }, index * 50); // Reduced delay for faster preloading
        });
      }

      // Performance monitoring setup
      if ('performance' in window && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                console.log(`[Performance] LCP: ${entry.startTime}ms`);
                if (entry.startTime > 1500) { // Reduced threshold
                  console.warn('[Performance Warning] LCP is slow (>1.5s)');
                }
              }
            });
          });
          
          observer.observe({ 
            entryTypes: ['largest-contentful-paint', 'first-input-delay'] 
          });
        } catch (error) {
          console.log('[Performance] Observer not fully supported');
        }
      }

      setIsInitialized(true);
    };

    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initializePerformance, { timeout: 2000 });
    } else {
      setTimeout(initializePerformance, 50);
    }
  }, [isInitialized, optimizedSettings, preloadResource]);

  // Connection-aware performance CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    if (optimizedSettings.lowDataMode) {
      // Ultra-aggressive performance mode
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.style.setProperty('--image-quality', '40');
      root.style.setProperty('--blur-amount', '0px'); // Disable blur effects
      
      document.body.classList.add('ultra-performance-mode');
      document.body.classList.remove('high-performance-mode');
    } else if (optimizedSettings.connectionQuality === 'fast') {
      // High-performance mode
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--transition-duration', '0.2s');
      root.style.setProperty('--image-quality', '80');
      root.style.setProperty('--blur-amount', '4px');
      
      document.body.classList.remove('ultra-performance-mode');
      document.body.classList.add('high-performance-mode');
    } else {
      // Standard performance mode
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
      root.style.setProperty('--image-quality', '75');
      root.style.setProperty('--blur-amount', '2px');
      
      document.body.classList.remove('ultra-performance-mode', 'high-performance-mode');
    }
  }, [optimizedSettings]);

  // Memory management (reduced frequency)
  useEffect(() => {
    const handleMemoryPressure = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 80) { // Reduced threshold
          console.warn('[Performance] High memory usage detected:', usedPercent.toFixed(1) + '%');
          if (window.gc && typeof window.gc === 'function') {
            window.gc();
          }
        }
      }
    };

    // Check memory every 60 seconds (reduced frequency)
    const memoryCheckInterval = setInterval(handleMemoryPressure, 60000);
    return () => clearInterval(memoryCheckInterval);
  }, []);

  // Properly type the connectionType
  const getConnectionType = (): 'slow' | 'fast' | 'unknown' => {
    const quality = optimizedSettings.connectionQuality;
    if (quality === 'slow' || quality === 'fast') {
      return quality;
    }
    return 'unknown';
  };

  return (
    <PerformanceContext.Provider value={{
      lowDataMode,
      toggleLowDataMode,
      connectionType: getConnectionType(),
      bandwidth: connectionInfo.downlink,
      optimizeImage,
      createDebouncedFunction,
      createThrottledFunction,
      preloadResource,
      measurePerformance,
      prefetchResource,
      optimizedSettings
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    // Return safe defaults instead of throwing - allows components to work outside provider
    console.warn('usePerformanceContext used outside PerformanceProvider - using defaults');
    return {
      lowDataMode: false,
      toggleLowDataMode: () => {},
      connectionType: 'unknown' as const,
      bandwidth: 10,
      optimizeImage: (src: string) => src,
      createDebouncedFunction: (fn: Function) => fn,
      createThrottledFunction: (fn: Function) => fn,
      preloadResource: () => {},
      measurePerformance: (_name: string, fn: Function) => fn(),
      prefetchResource: () => {},
      optimizedSettings: {
        lowDataMode: false,
        reduceAnimations: false,
        maxTokens: 600,
        connectionQuality: 'fast',
        preloadNext: true
      }
    };
  }
  return context;
};
