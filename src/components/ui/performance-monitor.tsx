
import React, { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Database, Wifi } from 'lucide-react';

export const PerformanceMonitor: React.FC<{ isVisible?: boolean }> = ({ isVisible = false }) => {
  const metrics = usePerformanceMonitor();
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isVisible && process.env.NODE_ENV === 'production') {
    return null;
  }

  const getPerformanceStatus = (metric: number, thresholds: [number, number]) => {
    if (metric <= thresholds[0]) return { color: 'bg-green-500', text: 'Excellent' };
    if (metric <= thresholds[1]) return { color: 'bg-yellow-500', text: 'Good' };
    return { color: 'bg-red-500', text: 'Needs Attention' };
  };

  const loadTimeStatus = getPerformanceStatus(metrics.loadTime, [1000, 3000]);
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, [50, 100]);
  const renderTimeStatus = getPerformanceStatus(metrics.renderTime, [16, 33]);

  if (!showDetails) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 left-4 z-50 bg-gray-900/80 hover:bg-gray-800/80 text-white"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-white flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Performance Monitor
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Load Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${loadTimeStatus.color} text-white text-xs`}>
              {loadTimeStatus.text}
            </Badge>
            <span className="text-xs text-gray-400">
              {Math.round(metrics.loadTime)}ms
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Memory</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${memoryStatus.color} text-white text-xs`}>
              {memoryStatus.text}
            </Badge>
            <span className="text-xs text-gray-400">
              {Math.round(metrics.memoryUsage)}MB
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">Render</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${renderTimeStatus.color} text-white text-xs`}>
              {renderTimeStatus.text}
            </Badge>
            <span className="text-xs text-gray-400">
              {Math.round(metrics.renderTime)}ms
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Network</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {Math.round(metrics.networkLatency)}ms
            </span>
          </div>
        </div>

        {metrics.frameDrops > 0 && (
          <div className="text-xs text-red-400">
            Frame drops detected: {Math.round(metrics.frameDrops)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
