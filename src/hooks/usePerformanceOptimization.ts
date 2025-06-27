import { useEffect, useCallback, useMemo, useState } from 'react';
import { debounce } from 'lodash';

// Performance monitoring and optimization utilities
export const usePerformanceOptimization = () => {
  // Debounced function factory with proper typing
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => void>(fn: T, delay: number = 300): T => {
    return debounce(fn, delay, { leading: false, trailing: true }) as T;
  }, []);

  // Image optimization utilities
  const optimizeImage = useCallback((src: string, options: { width?: number; quality?: number } = {}) => {
    const { width = 800, quality = 80 } = options;
    
    // Check for WebP support
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    // Return optimized image URL or fallback
    if (supportsWebP()) {
      return `${src}?w=${width}&q=${quality}&fm=webp`;
    }
    return `${src}?w=${width}&q=${quality}`;
  }, []);

  // Memory cleanup utilities
  const cleanupResources = useCallback(() => {
    // Clean up event listeners, timers, etc.
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  }, []);

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: Function) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Performance: ${name} took ${end - start} milliseconds`);
    return result;
  }, []);

  return {
    createDebouncedFunction,
    optimizeImage,
    cleanupResources,
    measurePerformance
  };
};

// Low data mode hook
export const useLowDataMode = () => {
  const [lowDataMode, setLowDataMode] = useState(() => {
    try {
      return localStorage.getItem('lowDataMode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleLowDataMode = useCallback(() => {
    const newMode = !lowDataMode;
    setLowDataMode(newMode);
    try {
      localStorage.setItem('lowDataMode', newMode.toString());
    } catch {
      // Silent fail for localStorage issues
    }
  }, [lowDataMode]);

  return { lowDataMode, toggleLowDataMode };
};

// Connection quality detection
export const useConnectionQuality = () => {
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionInfo = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionType('slow');
        } else {
          setConnectionType('fast');
        }
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }, []);

  return connectionType;
};
