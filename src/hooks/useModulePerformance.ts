
import { useState, useEffect, useCallback } from 'react';

interface ModulePerformance {
  loadTime: number;
  renderTime: number;
  moduleName: string;
}

export const useModulePerformance = (moduleName: string) => {
  const [performance, setPerformance] = useState<ModulePerformance>({
    loadTime: 0,
    renderTime: 0,
    moduleName
  });

  const startTimer = useCallback(() => {
    return performance.now();
  }, []);

  const endTimer = useCallback((startTime: number, type: 'load' | 'render') => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    setPerformance(prev => ({
      ...prev,
      [type === 'load' ? 'loadTime' : 'renderTime']: duration
    }));

    // Log performance metrics
    console.log(`[Performance] ${moduleName} ${type} time: ${duration.toFixed(2)}ms`);
    
    return duration;
  }, [moduleName]);

  return { performance, startTimer, endTimer };
};
