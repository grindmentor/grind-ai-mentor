
import React, { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export const PerformanceMonitor: React.FC = () => {
  const metrics = usePerformanceMonitor();
  const [showMetrics, setShowMetrics] = useState(false);

  // Only show in development
  useEffect(() => {
    setShowMetrics(process.env.NODE_ENV === 'development');
  }, []);

  if (!showMetrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md text-white p-3 rounded-lg text-xs z-50 space-y-1 max-w-xs">
      <div className="font-semibold text-orange-400">Performance</div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      <div>FPS: {Math.max(0, 60 - metrics.frameDrops).toFixed(0)}</div>
      {metrics.networkLatency > 0 && (
        <div>Network: {metrics.networkLatency.toFixed(0)}ms</div>
      )}
    </div>
  );
};
