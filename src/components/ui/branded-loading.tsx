
import React from 'react';
import { Dumbbell } from 'lucide-react';
import Logo from './logo';
import { usePerformanceContext } from './performance-provider';

interface BrandedLoadingProps {
  message?: string;
  compact?: boolean;
  showLogo?: boolean;
}

export const BrandedLoading: React.FC<BrandedLoadingProps> = ({
  message = "Loading...",
  compact = false,
  showLogo = true
}) => {
  const { optimizedSettings } = usePerformanceContext();

  if (compact) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-6 h-6 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-lg flex items-center justify-center",
            !optimizedSettings.reduceAnimations && "animate-pulse"
          )}>
            <Dumbbell className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-sm text-gray-400">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {showLogo && (
        <div className={!optimizedSettings.reduceAnimations ? "animate-pulse" : ""}>
          <Logo size="md" />
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-8 h-8 bg-gradient-to-r from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center",
          !optimizedSettings.reduceAnimations && "animate-bounce"
        )}>
          <Dumbbell className="w-5 h-5 text-orange-500" />
        </div>
        <span className="text-white/90 font-medium">{message}</span>
      </div>
      
      <div className="flex space-x-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 bg-orange-500/60 rounded-full",
              !optimizedSettings.reduceAnimations && "animate-pulse"
            )}
            style={!optimizedSettings.reduceAnimations ? {
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            } : {}}
          />
        ))}
      </div>
    </div>
  );
};
