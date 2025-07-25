
import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';

interface AppPreloaderProps {
  onComplete: () => void;
  minDuration?: number;
}

const AppPreloader: React.FC<AppPreloaderProps> = ({ 
  onComplete, 
  minDuration = 100 // Drastically reduced
}) => {
  const [progress, setProgress] = useState(0);

  // iOS PWA detection
  const isIOSPWA = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && isStandalone;
  };

  // Mobile detection
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  useEffect(() => {
    // Minimal duration for all devices
    const baseDuration = 50; // Very fast
    const adjustedDuration = isIOSPWA() ? 100 : baseDuration;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Immediate completion
          setTimeout(onComplete, 0);
          return 100;
        }
        // Very fast progress increments
        return prev + 50;
      });
    }, adjustedDuration / 2);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      {/* Black background with subtle orange fade */}
      <div className="fixed inset-0 bg-background z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/20 to-orange-800/30 z-0" />
      
      <div className="text-center space-y-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-foreground animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-foreground">Myotopia</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 bg-gray-800/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500/80 to-orange-600/60 h-2 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-muted-foreground text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;
