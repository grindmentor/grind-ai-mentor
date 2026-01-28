import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { perfMetrics } from '@/utils/performanceMetrics';

/**
 * Hook to measure route navigation performance
 * Add to App.tsx or any route component
 */
export function useRoutePerformance() {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  const navigationStart = useRef<number>(performance.now());

  useEffect(() => {
    const currentPath = location.pathname;
    
    // End measurement for previous route
    if (previousPath.current && previousPath.current !== currentPath) {
      const duration = performance.now() - navigationStart.current;
      console.log(`[PERF] 🚀 Route ${previousPath.current} → ${currentPath}: ${duration.toFixed(0)}ms`);
      perfMetrics.endRouteNavigation(currentPath);
    }

    // Start measurement for new route
    perfMetrics.startRouteNavigation(currentPath);
    navigationStart.current = performance.now();
    previousPath.current = currentPath;

    // Measure time to interactive
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const tti = performance.now() - navigationStart.current;
        if (tti > 100) { // Only log slow transitions
          console.log(`[PERF] ⏱️ ${currentPath} interactive: ${tti.toFixed(0)}ms`);
        }
      });
    });
  }, [location.pathname]);
}

/**
 * Hook to measure component mount time
 */
export function useComponentMountTime(componentName: string) {
  const mountStart = useRef(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - mountStart.current;
    if (mountTime > 50) { // Log components taking >50ms to mount
      console.log(`[PERF] 🧩 ${componentName} mounted: ${mountTime.toFixed(0)}ms`);
    }
  }, [componentName]);
}

/**
 * Hook to detect slow re-renders
 */
export function useRenderCount(componentName: string, warnThreshold = 5) {
  const renderCount = useRef(0);
  const lastReset = useRef(Date.now());

  renderCount.current++;

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastReset.current;
    
    // Reset counter every second
    if (elapsed > 1000) {
      if (renderCount.current > warnThreshold) {
        console.warn(`[PERF] ⚠️ ${componentName} rendered ${renderCount.current}x in ${elapsed}ms`);
      }
      renderCount.current = 0;
      lastReset.current = now;
    }
  });
}
