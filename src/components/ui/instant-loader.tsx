
import React, { useState, useEffect } from 'react';
import { Dumbbell, Zap, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstantLoaderProps {
  isLoading: boolean;
  message?: string;
  variant?: 'minimal' | 'engaging' | 'module';
  onComplete?: () => void;
}

const motivationalMessages = [
  "Activating your AI coach...",
  "Loading scientific insights...",
  "Preparing personalized data...",
  "Optimizing your experience...",
  "Almost ready to crush goals..."
];

export const InstantLoader: React.FC<InstantLoaderProps> = ({
  isLoading,
  message,
  variant = 'engaging',
  onComplete
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || motivationalMessages[0]);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setShowContent(false);
        onComplete?.();
      }, 200);
      return () => clearTimeout(timer);
    }

    // Fast progress simulation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15 + 5;
      });
    }, 50);

    // Message rotation for longer loads
    const messageTimer = setInterval(() => {
      if (!message) {
        setCurrentMessage(prev => {
          const currentIndex = motivationalMessages.indexOf(prev);
          return motivationalMessages[(currentIndex + 1) % motivationalMessages.length];
        });
      }
    }, 1200);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [isLoading, message, onComplete]);

  if (!showContent) return null;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2 py-2">
        <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-600 rounded animate-pulse">
          <Zap className="w-3 h-3 text-white m-0.5" />
        </div>
        <span className="text-sm text-gray-400 animate-pulse">{currentMessage}</span>
      </div>
    );
  }

  if (variant === 'module') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md border border-orange-500/30 rounded-2xl p-8 max-w-sm mx-4">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-white animate-bounce" />
            </div>
            
            <div className="space-y-3">
              <p className="text-white font-medium">{currentMessage}</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Engaging variant
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/5 to-red-900/10 flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Dumbbell className="w-12 h-12 text-white animate-bounce" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-60"
                style={{
                  top: `${10 + Math.random() * 80}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-white text-lg font-medium">{currentMessage}</p>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
