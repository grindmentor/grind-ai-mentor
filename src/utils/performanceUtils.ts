// Performance utilities for optimal app performance

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
};

// Lazy loading component wrapper
import React from 'react';

export const createLazyComponent = (importFn: () => Promise<any>) => {
  return React.lazy(() => 
    importFn().catch(() => ({ default: () => React.createElement('div', null, 'Component failed to load') }))
  );
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
};

// Optimized API call batching
export class APIBatcher {
  private static instances = new Map<string, APIBatcher>();
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    data: any;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;

  static getInstance(key: string): APIBatcher {
    if (!this.instances.has(key)) {
      this.instances.set(key, new APIBatcher());
    }
    return this.instances.get(key)!;
  }

  add<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, data });
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      this.timeout = setTimeout(() => {
        this.flush();
      }, 50); // Batch requests within 50ms
    });
  }

  private flush() {
    if (this.queue.length === 0) return;
    
    const items = [...this.queue];
    this.queue = [];
    
    // Process batch - implementation depends on specific API
    console.log(`[Performance] Processing batch of ${items.length} requests`);
    
    // For now, process individually - can be optimized per API
    items.forEach(item => {
      try {
        // Process each item
        item.resolve(item.data);
      } catch (error) {
        item.reject(error);
      }
    });
  }
}

// Memory management
export const cleanupMemory = () => {
  // Clear various caches
  if (typeof window !== 'undefined') {
    // Clear service worker caches periodically
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('old')) {
            caches.delete(name);
          }
        });
      });
    }
  }
};

// Component performance wrapper  
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  name: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const start = performance.now();
      return () => {
        const end = performance.now();
        console.log(`[Component Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      };
    }, []);

    return React.createElement(Component, props as P);
  });
};