
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { Wifi, WifiOff, Zap, Battery, Signal } from 'lucide-react';

export const AdvancedPerformanceToggle: React.FC = () => {
  const { lowDataMode, toggleLowDataMode, connectionType } = usePerformanceContext();

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'slow': return <Signal className="w-4 h-4 text-red-400" />;
      case 'fast': return <Wifi className="w-4 h-4 text-green-400" />;
      default: return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionType) {
      case 'slow': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'fast': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-3">
      {/* Main toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {lowDataMode ? (
              <Battery className="w-4 h-4 text-orange-400" />
            ) : (
              <Zap className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium text-white">
              Power Saver Mode
            </span>
          </div>
          
          {lowDataMode && (
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
              ACTIVE
            </Badge>
          )}
        </div>
        
        <Switch
          checked={lowDataMode}
          onCheckedChange={toggleLowDataMode}
          className="data-[state=checked]:bg-orange-500"
        />
      </div>

      {/* Connection status */}
      <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded border border-gray-700/30">
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="text-xs text-gray-300">Connection</span>
        </div>
        <Badge variant="outline" className={`${getConnectionColor()} text-xs`}>
          {connectionType.toUpperCase()}
        </Badge>
      </div>

      {/* Performance info */}
      {lowDataMode && (
        <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
          <h4 className="text-sm font-medium text-orange-200 mb-2">Active Optimizations:</h4>
          <ul className="text-xs text-orange-300/80 space-y-1">
            <li>• Reduced animations and transitions</li>
            <li>• Compressed images and assets</li>
            <li>• Limited background processing</li>
            <li>• Cached AI responses prioritized</li>
          </ul>
        </div>
      )}
    </div>
  );
};
