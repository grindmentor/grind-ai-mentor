// Advanced performance profiler for production monitoring
class PerformanceProfiler {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Monitor Long Tasks (>50ms)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
            this.recordMetric('long-tasks', entry.duration);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Monitor Layout Shifts
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any; // Type assertion for layout shift entries
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value > 0.1) {
            console.warn(`[Performance] Layout shift detected: ${layoutShiftEntry.value.toFixed(4)}`);
            this.recordMetric('layout-shifts', layoutShiftEntry.value);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Monitor LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any; // Type assertion for LCP entries
        console.info(`[Performance] LCP: ${lastEntry.startTime.toFixed(0)}ms`);
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetricSummary(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      max: Math.max(...values)
    };
  }

  reportMetrics() {
    console.group('[Performance Report]');
    for (const [name] of this.metrics) {
      const summary = this.getMetricSummary(name);
      if (summary) {
        console.info(`${name}:`, summary);
      }
    }
    console.groupEnd();
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

export const performanceProfiler = new PerformanceProfiler();

// Auto-report metrics every 30 seconds in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceProfiler.reportMetrics();
  }, 30000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceProfiler.cleanup();
});