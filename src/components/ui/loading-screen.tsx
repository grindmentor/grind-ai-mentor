
import React from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  fullScreen = true 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-black flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      {/* Black background with subtle orange fade */}
      <div className="fixed inset-0 bg-black z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/20 to-orange-800/30 z-0" />
      
      <div className="text-center space-y-6 relative z-10">
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-white text-lg font-medium">{message}</span>
        </div>
        <div className="text-sm text-gray-400 max-w-xs">
          {message === "Loading..." ? "Initializing Myotopia..." : message}
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({ 
  size = 'md', 
  message 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`animate-spin text-orange-500 ${sizeClasses[size]}`} />
      {message && (
        <span className="text-sm text-gray-400">{message}</span>
      )}
    </div>
  );
};
