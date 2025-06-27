
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Preload critical resources
  useEffect(() => {
    const preloadCriticalResources = () => {
      // Preload critical CSS
      const criticalLinks = [
        '/src/index.css'
      ];

      criticalLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();
  }, []);

  // Apply performance optimizations based on connection and settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (lowDataMode || connectionType === 'slow') {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
    }
  }, [lowDataMode, connectionType]);

  return (
    <PerformanceContext.Provider value={{
      lowDataMode,
      toggleLowDataMode,
      connectionType,
      optimizeImage,
      createDebouncedFunction
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
