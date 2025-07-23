import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLoadingStateProps {
  type?: 'module' | 'card' | 'page' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showProgress?: boolean;
}

export const AnimatedLoadingState: React.FC<AnimatedLoadingStateProps> = ({
  type = 'module',
  size = 'md',
  message = 'Loading...',
  showProgress = true
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64'
  };

  if (type === 'module') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center space-y-6 animate-fade-in",
        sizeClasses[size]
      )}>
        {/* Animated logo/icon */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-2 w-12 h-12 border-2 border-orange-400/30 border-b-orange-400 rounded-full animate-spin animate-pulse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        
        {/* Animated text */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-white animate-pulse">{message}</h3>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {showProgress && (
          <div className="w-64 bg-gray-800/50 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" 
                 style={{ 
                   width: '60%',
                   animation: 'progressPulse 2s ease-in-out infinite'
                 }} />
          </div>
        )}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4 animate-scale-in">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-xl" />
          <div className="w-16 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
        </div>
        <div className="space-y-3">
          <div className="w-3/4 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
          <div className="w-full h-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
          <div className="w-1/2 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded mx-auto" />
          <div className="w-full h-9 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
        </div>
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 border-r-orange-400 rounded-full animate-spin" />
            <div className="absolute inset-3 w-18 h-18 border-2 border-orange-400/30 border-b-orange-400 border-l-orange-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            <div className="absolute inset-6 w-12 h-12 border border-orange-300/40 border-t-orange-300 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white animate-pulse">Myotopia</h2>
            <p className="text-orange-300/80 text-lg animate-pulse" style={{ animationDelay: '500ms' }}>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Inline loading
  return (
    <div className="flex items-center space-x-3 animate-fade-in">
      <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      <span className="text-orange-300 animate-pulse">{message}</span>
    </div>
  );
};

// Enhanced module transition component
export const ModuleTransition: React.FC<{
  children: React.ReactNode;
  isEntering?: boolean;
  isExiting?: boolean;
}> = ({ children, isEntering = false, isExiting = false }) => {
  return (
    <div 
      className={cn(
        "transition-all duration-400 ease-out",
        isEntering && "animate-fade-in animate-scale-in",
        isExiting && "animate-fade-out animate-scale-out"
      )}
    >
      {children}
    </div>
  );
};