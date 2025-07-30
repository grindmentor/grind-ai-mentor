// Critical performance monitoring
class PerformanceMonitor {
  private metrics = new Map();
  
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
          
          // Log slow operations only
          if (measure.duration > 100) {
            console.warn(`Slow operation: ${name} took ${measure.duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const performanceMonitor = new PerformanceMonitor();