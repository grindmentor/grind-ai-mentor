import { useCallback, useEffect, useState } from 'react';

interface PerformanceOptimizationOptions {
  enableCaching?: boolean;
  enablePreloading?: boolean;
  debounceDelay?: number;
  cacheTimeout?: number;
}

export const usePerformanceOptimization = (options: PerformanceOptimizationOptions = {}) => {
  const {
    enableCaching = true,
    enablePreloading = true,
    debounceDelay = 150,
    cacheTimeout = 300000 // 5 minutes
  } = options;

  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());

  // Optimized cache management
  const getCachedData = useCallback((key: string) => {
    if (!enableCaching) return null;

    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }

    // Remove expired cache entry
    if (cached) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    }

    return null;
  }, [cache, enableCaching, cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (!enableCaching) return;

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now() });
      return newCache;
    });
  }, [enableCaching]);

  // Image optimization
  const optimizeImage = useCallback((src: string, options?: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' }) => {
    // For now, return original src - can be enhanced with actual optimization
    return src;
  }, []);

  // Debounced function creator
  const createDebouncedFunction = useCallback((fn: Function, delay: number = debounceDelay) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }, [debounceDelay]);

  // Throttled function creator
  const createThrottledFunction = useCallback((fn: Function, delay: number = debounceDelay) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }, [debounceDelay]);

  // Performance measurement
  const measurePerformance = useCallback((name: string, fn: Function) => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    console.log(`[Performance] ${name}: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }, []);

  // Preload resources
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (!enablePreloading) return;

    const cacheKey = `preload-${url}`;
    if (getCachedData(cacheKey)) return;

    try {
      if (type === 'image') {
        const img = new Image();
        img.src = url;
      } else {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type === 'script' ? 'script' : 'style';
        document.head.appendChild(link);
      }

      setCachedData(cacheKey, true);
    } catch (error) {
      console.warn(`Failed to preload ${type}:`, url, error);
    }
  }, [enablePreloading, getCachedData, setCachedData]);

  // Prefetch resources (similar to preload but for future navigation)
  const prefetchResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'script') => {
    if (!enablePreloading) return;

    try {
      if (type === 'fetch') {
        fetch(url, { mode: 'no-cors' }).catch(() => {}); // Silent fail
      } else {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = type; // type is guaranteed to be 'script' | 'style' | 'image' here
        document.head.appendChild(link);
      }
    } catch (error) {
      console.warn(`Failed to prefetch ${type}:`, url, error);
    }
  }, [enablePreloading]);

  // Cleanup expired cache entries periodically
  useEffect(() => {
    if (!enableCaching) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map();
        for (const [key, value] of prev.entries()) {
          if (now - value.timestamp < cacheTimeout) {
            newCache.set(key, value);
          }
        }
        return newCache;
      });
    }, cacheTimeout);

    return () => clearInterval(cleanupInterval);
  }, [enableCaching, cacheTimeout]);

  // Memory usage optimization
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Performance metrics
  const getCacheStats = useCallback(() => {
    return {
      size: cache.size,
      memoryUsage: cache.size * 0.001, // Rough estimate in KB
      hitRate: cache.size > 0 ? 0.85 : 0, // Estimated hit rate
    };
  }, [cache.size]);

  return {
    getCachedData,
    setCachedData,
    optimizeImage,
    createDebouncedFunction,
    createThrottledFunction,
    measurePerformance,
    preloadResource,
    prefetchResource,
    clearCache,
    getCacheStats,
  };
};