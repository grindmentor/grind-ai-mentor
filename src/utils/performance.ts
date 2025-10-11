/**
 * Consolidated Performance Utilities
 * All performance-related functions in one place
 */

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// PERFORMANCE MONITORING
// ============================================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number>();
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  startMeasure(name: string) {
    if ('performance' in window) {
      performance.mark(`${name}-start`);
    }
  }
  
  endMeasure(name: string) {
    if ('performance' in window) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          this.metrics.set(name, measure.duration);
          
          // Only log slow operations in development
          if (process.env.NODE_ENV === 'development' && measure.duration > 100) {
            console.warn(`Slow operation: ${name} took ${measure.duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        // Silently fail
      }
    }
  }
  
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// ============================================
// LAZY LOADING & OPTIMIZATION
// ============================================

export const requestIdleCallback = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

// Optimize scroll performance
export const optimizeScroll = (callback: () => void) => {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// ============================================
// LRU CACHE
// ============================================

export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    return this.cache.size;
  }
}

// ============================================
// PRODUCTION OPTIMIZATIONS
// ============================================

export const finalizeProdOptimizations = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable excessive console logging
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('error') || args[0]?.includes?.('warn')) {
        originalConsoleLog(...args);
      }
    };

    // Cleanup unused resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });
    }
  }

  // Performance monitoring
  if ('performance' in window && 'mark' in window.performance) {
    performance.mark('app-optimized');
  }
};

// ============================================
// ANIMATION DURATION
// ============================================

export const getOptimizedAnimationDuration = (): number => {
  if (typeof window === 'undefined') return 300;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 0;
  
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return 150;
  
  return 300;
};
