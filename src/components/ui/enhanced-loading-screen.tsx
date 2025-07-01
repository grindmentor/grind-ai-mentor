
import React, { useState, useEffect } from 'react';
import { Dumbbell, Zap } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface EnhancedLoadingScreenProps {
  message?: string;
  progress?: number;
  moduleName?: string;
  fullScreen?: boolean;
  theme?: 'dark' | 'branded';
}

export const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({ 
  message = "Loading...", 
  progress,
  moduleName,
  fullScreen = true,
  theme = 'branded'
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-black flex items-center justify-center z-50"
    : "flex items-center justify-center p-8 min-h-[200px]";

  return (
    <div className={containerClasses}>
      {/* Optimized background */}
      {fullScreen && (
        <>
          <div className="fixed inset-0 bg-black z-0" />
          <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 z-0" />
        </>
      )}
      
      <div className="text-center space-y-6 relative z-10 px-4 max-w-sm">
        {/* Branded logo */}
        <div className="relative">
          <div className={cn(
            "transition-opacity duration-500",
            animationPhase === 0 ? "opacity-100" : "opacity-70"
          )}>
            <Logo size={fullScreen ? "lg" : "md"} />
          </div>
        </div>
        
        {/* Dynamic loading content */}
        <div className="space-y-4">
          {/* Icon animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-xl flex items-center justify-center">
                <Dumbbell className={cn(
                  "w-6 h-6 text-orange-500 transition-transform duration-300",
                  animationPhase === 1 ? "scale-110 rotate-12" : "scale-100 rotate-0"
                )} />
              </div>
              <Zap className="w-4 h-4 text-orange-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-white/90 text-lg font-semibold">
              {moduleName ? `Loading ${moduleName}` : message}
            </h3>
            
            {/* Progress bar */}
            {progress !== undefined && (
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
            
            <p className="text-gray-400/80 text-sm">
              Powered by scientific training
            </p>
          </div>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                animationPhase === i ? "bg-orange-500" : "bg-orange-500/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
