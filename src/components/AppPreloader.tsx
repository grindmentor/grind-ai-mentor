
import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';

interface AppPreloaderProps {
  onComplete: () => void;
  minDuration?: number;
}

const AppPreloader: React.FC<AppPreloaderProps> = ({ 
  onComplete, 
  minDuration = 500 // Reduced from 1000ms
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
    // Much shorter duration for mobile devices
    const baseDuration = isMobile() ? 400 : minDuration;
    const adjustedDuration = isIOSPWA() ? baseDuration * 1.2 : baseDuration;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Minimal delay for completion
          const completionDelay = isMobile() ? 100 : 200;
          setTimeout(onComplete, completionDelay);
          return 100;
        }
        // Faster progress increments for mobile
        return prev + (isMobile() ? 25 : 20);
      });
    }, adjustedDuration / (isMobile() ? 4 : 5));

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-white">GrindMentor</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-gray-400 text-sm">
          {isMobile() ? 'Optimizing for mobile...' : 'Initializing your AI fitness coach...'}
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;
