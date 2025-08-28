// Performance optimization utilities for Myotopia

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const start = this.metrics.get(name);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    this.metrics.delete(name);
    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => this.endMeasure(name));
  }
}

// Debounce utility for performance-critical operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
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
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory-efficient lazy loading
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  fallback: T
): () => Promise<T> {
  let cached: T | null = null;
  let loading = false;
  let promise: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cached) return cached;
    if (loading && promise) return promise;

    loading = true;
    promise = loader()
      .then(result => {
        cached = result;
        loading = false;
        return result;
      })
      .catch(error => {
        loading = false;
        console.error('Lazy load error:', error);
        return fallback;
      });

    return promise;
  };
}

// Optimized image compression for uploads
export function compressImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Memory]', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
}

// Connection speed detection
export function detectConnectionSpeed(): 'slow' | 'fast' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    return ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
  }
  
  return 'fast'; // Default to fast if can't detect
}

// Preload critical resources
export function preloadCriticalResources(): void {
  const criticalUrls = [
    '/fonts/inter.woff2',
    '/fonts/orbitron.woff2',
  ];

  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}