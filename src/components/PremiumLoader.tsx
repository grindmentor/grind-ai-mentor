
import React, { useState, useEffect } from 'react';
import { Dumbbell, Activity, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumLoaderProps {
  message?: string;
  progress?: number;
  showMetrics?: boolean;
  variant?: 'minimal' | 'detailed' | 'splash';
}

const loadingMessages = [
  "Optimizing your AI coach...",
  "Loading scientific data...",
  "Preparing personalized insights...",
  "Calibrating workout algorithms...",
  "Syncing your progress data...",
  "Activating premium features..."
];

const PremiumLoader: React.FC<PremiumLoaderProps> = ({ 
  message, 
  progress = 0, 
  showMetrics = false,
  variant = 'detailed' 
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [particlesVisible, setParticlesVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    const timer = setTimeout(() => setParticlesVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-lg animate-pulse">
          <Dumbbell className="w-4 h-4 text-white m-1 animate-bounce" />
        </div>
        <span className="text-sm text-gray-400">{currentMessage}</span>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        {/* Black background with subtle orange fade */}
        <div className="fixed inset-0 bg-black z-0" />
        <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/20 to-orange-800/30 z-0" />
        
        <div className="text-center space-y-8 max-w-md mx-auto px-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Dumbbell className="w-12 h-12 text-white animate-bounce" />
            </div>
            {particlesVisible && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute w-2 h-2 bg-orange-400/60 rounded-full animate-ping"
                    )}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">GrindMentor</h2>
            <p className="text-gray-400 animate-fade-in">{currentMessage}</p>
            
            <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-xl flex items-center justify-center">
          <Dumbbell className="w-8 h-8 text-white animate-bounce" />
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-green-500/80 rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-white">{currentMessage}</h3>
          <div className="w-full bg-gray-800/50 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>
      </div>

      {showMetrics && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <Activity className="w-4 h-4" />
            <span>Performance</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Target className="w-4 h-4" />
            <span>Precision</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Speed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumLoader;
