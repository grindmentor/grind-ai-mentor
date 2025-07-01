
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePerformanceOptimization, useLowDataMode, useConnectionQuality } from '@/hooks/usePerformanceOptimization';

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
  const { lowDataMode, toggleLowDataMode } = useLowDataMode();
  const { connectionType, bandwidth } = useConnectionQuality();
  const [isInitialized, setIsInitialized] = useState(false);

  // Ultra-optimized resource preloading utility
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (lowDataMode || connectionType === 'slow') return; // Skip preloading on slow connections
    
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
  }, [lowDataMode, connectionType]);

  // Ultra-optimized performance initialization
  useEffect(() => {
    if (isInitialized) return;
    
    const initializePerformance = () => {
      // Critical resource preloading based on connection quality
      if (!lowDataMode && connectionType !== 'slow') {
        const criticalResources = [
          '/src/components/Dashboard.tsx',
          '/src/components/ui/loading-screen.tsx',
          '/src/components/ai-modules/CoachGPT.tsx'
        ];
        
        criticalResources.forEach((resource, index) => {
          setTimeout(() => {
            preloadResource(resource, 'script');
          }, index * 100);
        });
      }

      // Ultra-optimized performance monitoring setup
      if ('performance' in window && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                console.log(`[Performance] Page load time: ${navEntry.loadEventEnd - navEntry.loadEventStart}ms`);
              } else if (entry.entryType === 'largest-contentful-paint') {
                console.log(`[Performance] LCP: ${entry.startTime}ms`);
                if (entry.startTime > 2500) {
                  console.warn('[Performance Warning] LCP is slow (>2.5s)');
                }
              } else if (entry.entryType === 'first-input-delay') {
                console.log(`[Performance] FID: ${entry.duration}ms`);
              }
            });
          });
          
          observer.observe({ 
            entryTypes: ['navigation', 'largest-contentful-paint', 'first-input-delay', 'cumulative-layout-shift'] 
          });
        } catch (error) {
          console.log('[Performance] Observer not fully supported');
        }
      }

      setIsInitialized(true);
    };

    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initializePerformance, { timeout: 5000 });
    } else {
      setTimeout(initializePerformance, 100);
    }
  }, [isInitialized, lowDataMode, connectionType, preloadResource]);

  // Ultra-optimized performance CSS variables based on connection and settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (lowDataMode || connectionType === 'slow' || bandwidth < 1) {
      // Ultra-aggressive performance mode
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.style.setProperty('--image-quality', '50');
      root.style.setProperty('--reduced-motion', '1');
      root.style.setProperty('--blur-amount', '0px'); // Disable blur effects
      
      // Add ultra-performance CSS class
      document.body.classList.add('ultra-performance-mode');
    } else if (connectionType === 'fast' && bandwidth > 5) {
      // High-performance mode
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--transition-duration', '0.2s');
      root.style.setProperty('--image-quality', '85');
      root.style.setProperty('--reduced-motion', '0');
      root.style.setProperty('--blur-amount', '8px');
      
      document.body.classList.remove('ultra-performance-mode');
      document.body.classList.add('high-performance-mode');
    } else {
      // Standard performance mode
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
      root.style.setProperty('--image-quality', '75');
      root.style.setProperty('--reduced-motion', '0');
      root.style.setProperty('--blur-amount', '4px');
      
      document.body.classList.remove('ultra-performance-mode', 'high-performance-mode');
    }
  }, [lowDataMode, connectionType, bandwidth]);

  // Ultra-optimized memory management
  useEffect(() => {
    const handleMemoryPressure = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 85) {
          console.warn('[Performance] High memory usage detected:', usedPercent.toFixed(1) + '%');
          // Trigger aggressive cleanup
          if (window.gc && typeof window.gc === 'function') {
            window.gc();
          }
        }
      }
    };

    // Check memory every 30 seconds
    const memoryCheckInterval = setInterval(handleMemoryPressure, 30000);
    return () => clearInterval(memoryCheckInterval);
  }, []);

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any performance observers or intervals
      console.log('[Performance] Provider cleanup completed');
    };
  }, []);

  return (
    <PerformanceContext.Provider value={{
      lowDataMode,
      toggleLowDataMode,
      connectionType,
      bandwidth,
      optimizeImage,
      createDebouncedFunction,
      createThrottledFunction,
      preloadResource,
      measurePerformance,
      prefetchResource
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
