
import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  isLowPowerMode: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  deviceMemory: number;
  shouldReduceAnimations: boolean;
  shouldLazyLoad: boolean;
}

export const usePerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowPowerMode: false,
    connectionSpeed: 'medium',
    deviceMemory: 4,
    shouldReduceAnimations: false,
    shouldLazyLoad: true
  });

  const requestIdleCallback = useCallback((callback: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback);
    } else {
      setTimeout(callback, 16); // Fallback for older browsers
    }
  }, []);

  useEffect(() => {
    // Detect device capabilities
    const detectCapabilities = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const memory = (navigator as any).deviceMemory || 4;
      
      let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          connectionSpeed = 'slow';
        } else if (effectiveType === '3g') {
          connectionSpeed = 'medium';
        } else {
          connectionSpeed = 'fast';
        }
      }

      const isLowPowerMode = memory < 4 || connectionSpeed === 'slow';
      const shouldReduceAnimations = isLowPowerMode || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setMetrics({
        isLowPowerMode,
        connectionSpeed,
        deviceMemory: memory,
        shouldReduceAnimations,
        shouldLazyLoad: true
      });
    };

    detectCapabilities();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', detectCapabilities);
      return () => connection.removeEventListener('change', detectCapabilities);
    }
  }, []);

  return { metrics, requestIdleCallback };
};
