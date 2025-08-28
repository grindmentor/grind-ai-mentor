
import React, { useEffect } from 'react';
import { Dumbbell } from 'lucide-react';

interface AppPreloaderProps {
  onComplete: () => void;
}

const AppPreloader: React.FC<AppPreloaderProps> = ({ onComplete }) => {

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
    // Much faster loading - complete immediately for better UX
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 300); // Only 300ms total

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
      {/* Black background with subtle orange fade */}
      <div className="fixed inset-0 bg-background z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-orange-900/20 to-orange-800/30 z-0" />
      
      <div className="text-center space-y-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-foreground animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-foreground">Myotopia</span>
        </div>

        {/* Simple loading indicator */}
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />

        {/* Loading Text */}
        <p className="text-muted-foreground text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;
