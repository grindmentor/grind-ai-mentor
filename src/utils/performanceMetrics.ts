/**
 * Performance Metrics Collector
 * Collects and logs performance data for critical paths
 */

interface PerformanceEntry {
  name: string;
  start: number;
  end?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface MetricsSummary {
  initialLoad: number | null;
  routeNavigations: Map<string, number[]>;
  apiCalls: Map<string, number[]>;
  renderTimes: Map<string, number[]>;
}

class PerformanceMetrics {
  private entries: Map<string, PerformanceEntry> = new Map();
  private summary: MetricsSummary = {
    initialLoad: null,
    routeNavigations: new Map(),
    apiCalls: new Map(),
    renderTimes: new Map(),
  };
  private appStartTime: number;
  private firstMeaningfulPaint: number | null = null;

  constructor() {
    this.appStartTime = performance.now();
    this.observeWebVitals();
  }

  private observeWebVitals() {
    // Track First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.firstMeaningfulPaint = entry.startTime;
              console.log(`[PERF] FCP: ${entry.startTime.toFixed(0)}ms`);
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Track Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            console.log(`[PERF] LCP: ${lastEntry.startTime.toFixed(0)}ms`);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Observer not supported
      }
    }
  }

  // Start measuring an operation
  startMeasure(name: string, metadata?: Record<string, any>): void {
    this.entries.set(name, {
      name,
      start: performance.now(),
      metadata,
    });
  }

  // End measuring and log result
  endMeasure(name: string): number | null {
    const entry = this.entries.get(name);
    if (!entry) return null;

    const end = performance.now();
    const duration = end - entry.start;
    entry.end = end;
    entry.duration = duration;

    // Categorize and store
    if (name.startsWith('route:')) {
      const routeName = name.replace('route:', '');
      const routeTimes = this.summary.routeNavigations.get(routeName) || [];
      routeTimes.push(duration);
      this.summary.routeNavigations.set(routeName, routeTimes);
    } else if (name.startsWith('api:')) {
      const apiName = name.replace('api:', '');
      const apiTimes = this.summary.apiCalls.get(apiName) || [];
      apiTimes.push(duration);
      this.summary.apiCalls.set(apiName, apiTimes);
    } else if (name.startsWith('render:')) {
      const renderName = name.replace('render:', '');
      const renderTimes = this.summary.renderTimes.get(renderName) || [];
      renderTimes.push(duration);
      this.summary.renderTimes.set(renderName, renderTimes);
    }

    // Log performance with color coding
    const color = duration < 100 ? '🟢' : duration < 300 ? '🟡' : '🔴';
    console.log(`[PERF] ${color} ${name}: ${duration.toFixed(1)}ms`);

    return duration;
  }

  // Measure initial app load
  markAppReady(): void {
    const loadTime = performance.now() - this.appStartTime;
    this.summary.initialLoad = loadTime;
    console.log(`[PERF] 📱 App Ready: ${loadTime.toFixed(0)}ms`);
  }

  // Mark route navigation start
  startRouteNavigation(route: string): void {
    this.startMeasure(`route:${route}`);
  }

  // Mark route navigation end
  endRouteNavigation(route: string): number | null {
    return this.endMeasure(`route:${route}`);
  }

  // Measure API call
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    this.startMeasure(`api:${name}`);
    try {
      const result = await apiCall();
      this.endMeasure(`api:${name}`);
      return result;
    } catch (error) {
      this.endMeasure(`api:${name}`);
      throw error;
    }
  }

  // Get summary report
  getReport(): {
    initialLoad: number | null;
    fcp: number | null;
    avgRouteNavigation: number;
    avgApiCall: number;
    slowestRoutes: [string, number][];
    slowestApis: [string, number][];
  } {
    const avgFromMap = (map: Map<string, number[]>): number => {
      let total = 0;
      let count = 0;
      map.forEach((times) => {
        times.forEach((t) => {
          total += t;
          count++;
        });
      });
      return count > 0 ? total / count : 0;
    };

    const slowestFromMap = (map: Map<string, number[]>): [string, number][] => {
      const avgs: [string, number][] = [];
      map.forEach((times, name) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        avgs.push([name, avg]);
      });
      return avgs.sort((a, b) => b[1] - a[1]).slice(0, 5);
    };

    return {
      initialLoad: this.summary.initialLoad,
      fcp: this.firstMeaningfulPaint,
      avgRouteNavigation: avgFromMap(this.summary.routeNavigations),
      avgApiCall: avgFromMap(this.summary.apiCalls),
      slowestRoutes: slowestFromMap(this.summary.routeNavigations),
      slowestApis: slowestFromMap(this.summary.apiCalls),
    };
  }

  // Print formatted report to console
  printReport(): void {
    const report = this.getReport();
    console.group('📊 Performance Report');
    console.log(`Initial Load: ${report.initialLoad?.toFixed(0) ?? 'N/A'}ms`);
    console.log(`First Contentful Paint: ${report.fcp?.toFixed(0) ?? 'N/A'}ms`);
    console.log(`Avg Route Navigation: ${report.avgRouteNavigation.toFixed(0)}ms`);
    console.log(`Avg API Call: ${report.avgApiCall.toFixed(0)}ms`);
    
    if (report.slowestRoutes.length > 0) {
      console.log('Slowest Routes:');
      report.slowestRoutes.forEach(([name, time]) => {
        console.log(`  - ${name}: ${time.toFixed(0)}ms`);
      });
    }
    
    if (report.slowestApis.length > 0) {
      console.log('Slowest APIs:');
      report.slowestApis.forEach(([name, time]) => {
        console.log(`  - ${name}: ${time.toFixed(0)}ms`);
      });
    }
    console.groupEnd();
  }
}

// Singleton instance
export const perfMetrics = new PerformanceMetrics();

// React hook for component render timing
export function useRenderMetrics(componentName: string) {
  const startTime = performance.now();
  
  // Use effect to measure after render
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) { // Only log slow renders (>1 frame)
        console.log(`[PERF] render:${componentName}: ${renderTime.toFixed(1)}ms`);
      }
    });
  }
}

// Measure function execution
export function measureSync<T>(name: string, fn: () => T): T {
  perfMetrics.startMeasure(name);
  const result = fn();
  perfMetrics.endMeasure(name);
  return result;
}

// Measure async function execution
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  perfMetrics.startMeasure(name);
  try {
    const result = await fn();
    perfMetrics.endMeasure(name);
    return result;
  } catch (error) {
    perfMetrics.endMeasure(name);
    throw error;
  }
}
