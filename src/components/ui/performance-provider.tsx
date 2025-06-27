
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { usePerformanceOptimization, useLowDataMode, useConnectionQuality } from '@/hooks/usePerformanceOptimization';

interface PerformanceContextType {
  lowDataMode: boolean;
  toggleLowDataMode: () => void;
  connectionType: 'slow' | 'fast' | 'unknown';
  optimizeImage: (src: string, options?: { width?: number; quality?: number }) => string;
  createDebouncedFunction: (fn: Function, delay?: number) => Function;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { optimizeImage, createDebouncedFunction } = usePerformanceOptimization();
  const { lowDataMode, toggleLowDataMode } = useLowDataMode();
  const connectionType = useConnectionQuality();

  // Memoized performance settings
  const performanceSettings = useMemo(() => ({
    lowDataMode,
    toggleLowDataMode,
    connectionType,
    optimizeImage,
    createDebouncedFunction
  }), [lowDataMode, connectionType, optimizeImage, createDebouncedFunction, toggleLowDataMode]);

  // Apply performance optimizations based on connection and settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties for animations based on performance mode
    const animationDuration = lowDataMode || connectionType === 'slow' ? '0.1s' : '0.3s';
    const transitionDuration = lowDataMode || connectionType === 'slow' ? '0.1s' : '0.3s';
    
    root.style.setProperty('--animation-duration', animationDuration);
    root.style.setProperty('--transition-duration', transitionDuration);

    // Preload critical resources only on fast connections
    if (connectionType === 'fast' && !lowDataMode) {
      const preloadCriticalResources = () => {
        const criticalLinks = ['/src/index.css'];
        
        criticalLinks.forEach(href => {
          const existingLink = document.querySelector(`link[href="${href}"]`);
          if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
          }
        });
      };
      preloadCriticalResources();
    }
  }, [lowDataMode, connectionType]);

  return (
    <PerformanceContext.Provider value={performanceSettings}>
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
