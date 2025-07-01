
import React, { useState, useEffect } from 'react';
import { Loader2, Dumbbell } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface ModuleLoadingScreenProps {
  moduleName?: string;
  targetTime?: number; // in milliseconds
}

export const ModuleLoadingScreen: React.FC<ModuleLoadingScreenProps> = ({ 
  moduleName = "Module", 
  targetTime = 1500 
}) => {
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowLoadingMessage(true);
    }, targetTime);

    return () => clearTimeout(timer);
  }, [targetTime]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Optimized gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 z-0" />
      
      <div className="text-center space-y-6 relative z-10 px-4">
        {/* Branded logo with subtle animation */}
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
        
        {/* Module-specific loading indicator */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-orange-500 animate-bounce" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-orange-400 absolute -top-1 -right-1" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white/90 text-lg font-semibold">
              Loading {moduleName}
            </h3>
            
            {showSlowLoadingMessage ? (
              <div className="space-y-1">
                <p className="text-orange-400/80 text-sm font-medium">
                  Optimizing for your device...
                </p>
                <p className="text-gray-500/80 text-xs">
                  This may take a moment on slower connections
                </p>
              </div>
            ) : (
              <p className="text-gray-400/80 text-sm">
                Powered by science-based training
              </p>
            )}
          </div>
        </div>
        
        {/* Progress dots animation */}
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-orange-500/60 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
