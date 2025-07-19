import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  bundleSize: number;
}

export const PerformanceMonitor: React.FC<{ enabled?: boolean }> = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    bundleSize: 0
  });

  useEffect(() => {
    if (!enabled) return;

    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Network monitoring
    const originalFetch = window.fetch;
    let apiCallCount = 0;
    
    window.fetch = async (...args) => {
      apiCallCount++;
      setMetrics(prev => ({ ...prev, apiCalls: apiCallCount }));
      return originalFetch(...args);
    };

    return () => {
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }, [enabled]);

  if (!enabled) return null;

  const cacheHitRate = metrics.cacheHits + metrics.cacheMisses > 0 
    ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(1)
    : '0';

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-black/90 border-gray-700 text-white z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Load Time
          </span>
          <Badge variant={metrics.loadTime < 2000 ? 'default' : 'destructive'}>
            {metrics.loadTime.toFixed(0)}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Render Time
          </span>
          <Badge variant={metrics.renderTime < 100 ? 'default' : 'destructive'}>
            {metrics.renderTime.toFixed(0)}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span>API Calls</span>
          <Badge variant="outline">{metrics.apiCalls}</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Cache Hit Rate
          </span>
          <Badge variant={parseFloat(cacheHitRate) > 70 ? 'default' : 'secondary'}>
            {cacheHitRate}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};