
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  frameDrops: number;
  networkLatency: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    frameDrops: 0,
    networkLatency: 0
  });
  
  const frameCount = useRef(0);
  const startTime = useRef(performance.now());
  const observer = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      observer.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              networkLatency: navEntry.responseStart - navEntry.requestStart
            }));
          }
          
          if (entry.entryType === 'measure') {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration
            }));
          }
        });
      });
      
      observer.current.observe({ entryTypes: ['navigation', 'measure', 'paint'] });
    }

    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1048576 // Convert to MB
        }));
      }
    };

    // Monitor frame drops
    const checkFrameRate = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - startTime.current;
      
      if (elapsed >= 1000) {
        const fps = (frameCount.current * 1000) / elapsed;
        const expectedFrames = 60;
        const frameDrops = Math.max(0, expectedFrames - fps);
        
        setMetrics(prev => ({
          ...prev,
          frameDrops
        }));
        
        frameCount.current = 0;
        startTime.current = currentTime;
      }
      
      requestAnimationFrame(checkFrameRate);
    };

    const memoryInterval = setInterval(checkMemory, 5000);
    requestAnimationFrame(checkFrameRate);

    return () => {
      if (observer.current) observer.current.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
};
