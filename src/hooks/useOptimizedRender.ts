import React, { useCallback, useRef, useMemo } from 'react';

// Advanced render optimization hook
export const useOptimizedRender = () => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  const trackRender = useCallback((componentName?: string) => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development' && timeSinceLastRender < 100) {
      console.warn(`[Performance] ${componentName || 'Component'} rendered ${renderCountRef.current} times in quick succession`);
    }
    
    lastRenderTime.current = now;
  }, []);

  const memoizedValue = useMemo(() => ({
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTime.current
  }), []);

  return { trackRender, ...memoizedValue };
};

// Debounced callback hook for performance
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
};

// Memoized component wrapper
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// Performance measurement hook
export const usePerformanceMeasure = (measureName: string) => {
  const startMeasure = useCallback(() => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${measureName}-start`);
    }
  }, [measureName]);

  const endMeasure = useCallback(() => {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      try {
        performance.mark(`${measureName}-end`);
        performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
        
        const measure = performance.getEntriesByName(measureName)[0];
        if (measure) {
          console.info(`[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`);
        }
      } catch (error) {
        console.warn(`[Performance] Failed to measure ${measureName}:`, error);
      }
    }
  }, [measureName]);

  return { startMeasure, endMeasure };
};