
import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  frameDrops: number;
  networkLatency: number;
  cacheHitRate: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    frameDrops: 0,
    networkLatency: 0,
    cacheHitRate: 0
  });
  
  const frameCount = useRef(0);
  const startTime = useRef(performance.now());
  const observer = useRef<PerformanceObserver | null>(null);
  const renderStartTime = useRef<number>(0);

  // Monitor render performance
  const startRenderMeasure = useCallback((componentName: string) => {
    renderStartTime.current = performance.now();
    performance.mark(`${componentName}-render-start`);
  }, []);

  const endRenderMeasure = useCallback((componentName: string) => {
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;
    
    performance.mark(`${componentName}-render-end`);
    performance.measure(`${componentName}-render`, `${componentName}-render-start`, `${componentName}-render-end`);
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.max(prev.renderTime, renderTime)
    }));
  }, []);

  useEffect(() => {
    // Monitor Core Web Vitals and other performance metrics
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
              renderTime: Math.max(prev.renderTime, entry.duration)
            }));
          }
        });
      });
      
      try {
        observer.current.observe({ 
          entryTypes: ['navigation', 'measure', 'paint', 'largest-contentful-paint'] 
        });
      } catch (error) {
        console.warn('Performance observer not fully supported:', error);
      }
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

    // Monitor frame rate and detect frame drops
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
          frameDrops: Math.max(prev.frameDrops, frameDrops)
        }));
        
        frameCount.current = 0;
        startTime.current = currentTime;
      }
      
      requestAnimationFrame(checkFrameRate);
    };

    // Set up monitoring intervals
    const memoryInterval = setInterval(checkMemory, 5000);
    const frameMonitor = requestAnimationFrame(checkFrameRate);

    // Initial memory check
    checkMemory();

    return () => {
      if (observer.current) observer.current.disconnect();
      clearInterval(memoryInterval);
      cancelAnimationFrame(frameMonitor);
    };
  }, []);

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    const { loadTime, renderTime, memoryUsage, frameDrops } = metrics;
    
    let score = 100;
    
    // Deduct points for slow loading
    if (loadTime > 3000) score -= 30;
    else if (loadTime > 1000) score -= 15;
    
    // Deduct points for slow rendering
    if (renderTime > 100) score -= 20;
    else if (renderTime > 50) score -= 10;
    
    // Deduct points for high memory usage
    if (memoryUsage > 100) score -= 25;
    else if (memoryUsage > 50) score -= 10;
    
    // Deduct points for frame drops
    if (frameDrops > 10) score -= 15;
    else if (frameDrops > 5) score -= 5;
    
    return Math.max(0, score);
  }, [metrics]);

  return {
    metrics,
    getPerformanceScore,
    startRenderMeasure,
    endRenderMeasure
  };
};

// Export a global performance tracker
export const performanceTracker = {
  trackPageLoad: (pageName: string) => {
    performance.mark(`${pageName}-load-start`);
    return () => {
      performance.mark(`${pageName}-load-end`);
      performance.measure(`${pageName}-load`, `${pageName}-load-start`, `${pageName}-load-end`);
    };
  },
  
  trackUserAction: (actionName: string) => {
    performance.mark(`${actionName}-start`);
    return () => {
      performance.mark(`${actionName}-end`);
      performance.measure(actionName, `${actionName}-start`, `${actionName}-end`);
    };
  }
};
