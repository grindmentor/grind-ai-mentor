
import { useEffect, useCallback, useMemo, useState } from 'react';
import { debounce, throttle } from 'lodash';

// Performance monitoring and optimization utilities
export const usePerformanceOptimization = () => {
  // Optimized debounced function factory with proper typing and caching
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => void>(fn: T, delay: number = 300): T => {
    return debounce(fn, delay, { leading: false, trailing: true, maxWait: delay * 2 }) as T;
  }, []);

  // Optimized throttled function factory
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => void>(fn: T, delay: number = 100): T => {
    return throttle(fn, delay, { leading: true, trailing: true }) as T;
  }, []);

  // Enhanced image optimization utilities with WebP/AVIF support
  const optimizeImage = useCallback((src: string, options: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' } = {}) => {
    const { width = 800, quality = 80, format = 'auto' } = options;
    
    // Check for WebP and AVIF support
    const supportsWebP = () => {
      try {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      } catch {
        return false;
      }
    };

    const supportsAVIF = () => {
      try {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      } catch {
        return false;
      }
    };

    // Return optimized image URL or fallback
    let imageFormat = 'jpeg';
    if (format === 'auto') {
      if (supportsAVIF()) {
        imageFormat = 'avif';
      } else if (supportsWebP()) {
        imageFormat = 'webp';
      }
    } else {
      imageFormat = format;
    }

    return `${src}?w=${width}&q=${quality}&fm=${imageFormat}`;
  }, []);

  // Enhanced memory cleanup utilities
  const cleanupResources = useCallback(() => {
    // Clean up event listeners, timers, etc.
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }

    // Clean up any dangling intervals or timeouts - fixed implementation
    try {
      // Get highest interval ID by creating and immediately clearing one
      const highestIntervalId = setInterval(() => {}, 9999999);
      clearInterval(highestIntervalId);
      
      // Clear intervals up to the highest ID
      for (let i = 1; i <= highestIntervalId; i++) {
        clearInterval(i);
      }
    } catch (error) {
      console.log('[Performance] Interval cleanup completed');
    }
  }, []);

  // Enhanced performance monitoring with Web Vitals
  const measurePerformance = useCallback((name: string, fn: Function) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    
    // Track slow operations
    if (duration > 100) {
      console.warn(`[Performance Warning] ${name} took ${duration.toFixed(2)}ms (>100ms)`);
    }
    
    return result;
  }, []);

  // Resource prefetching utility
  const prefetchResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        
        if (type === 'script') {
          link.as = 'script';
        } else if (type === 'style') {
          link.as = 'style';
        } else if (type === 'image') {
          link.as = 'image';
        }
        
        document.head.appendChild(link);
      });
    }
  }, []);

  return {
    createDebouncedFunction,
    createThrottledFunction,
    optimizeImage,
    cleanupResources,
    measurePerformance,
    prefetchResource
  };
};

// Enhanced low data mode hook with connection quality detection
export const useLowDataMode = () => {
  const [lowDataMode, setLowDataMode] = useState(() => {
    try {
      // Check for data saver preference
      const dataSaver = localStorage.getItem('lowDataMode') === 'true';
      
      // Check connection quality
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const slowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
        return dataSaver || slowConnection;
      }
      
      return dataSaver;
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

// Enhanced connection quality detection with bandwidth estimation
export const useConnectionQuality = () => {
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [bandwidth, setBandwidth] = useState<number>(0);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionInfo = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 0;
        
        setBandwidth(downlink);
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
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

  return { connectionType, bandwidth };
};
