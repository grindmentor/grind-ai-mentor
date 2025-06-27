
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { Wifi, WifiOff } from 'lucide-react';

export const LowDataToggle: React.FC = () => {
  const { lowDataMode, toggleLowDataMode, connectionType } = usePerformanceContext();

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <div className="flex items-center space-x-2">
        {lowDataMode ? (
          <WifiOff className="w-4 h-4 text-orange-400" />
        ) : (
          <Wifi className="w-4 h-4 text-green-400" />
        )}
        <span className="text-sm font-medium text-white">
          Low Data Mode
        </span>
      </div>
      
      <Switch
        checked={lowDataMode}
        onCheckedChange={toggleLowDataMode}
        className="data-[state=checked]:bg-orange-500"
      />
      
      {connectionType !== 'unknown' && (
        <span className="text-xs text-gray-400">
          {connectionType === 'slow' ? 'Slow connection detected' : 'Fast connection'}
        </span>
      )}
    </div>
  );
};
