
import React from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  compact?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  fullScreen = true,
  compact = false
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center z-50"
    : compact 
    ? "flex items-center justify-center p-4"
    : "flex items-center justify-center p-8";

  if (compact) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-white text-sm font-medium">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-6 max-w-xs mx-auto px-4">
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-white text-lg font-medium">{message}</span>
        </div>
        <div className="text-sm text-gray-400">
          {message === "Loading..." ? "Initializing Myotopia..." : message}
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  message?: string;
  color?: string;
}> = ({ 
  size = 'md', 
  message,
  color = 'text-orange-500'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`animate-spin ${color} ${sizeClasses[size]}`} />
      {message && (
        <span className="text-sm text-gray-400 text-center">{message}</span>
      )}
    </div>
  );
};

export const InlineLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center space-x-2 py-4">
    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
    <span className="text-sm text-gray-400">{message}</span>
  </div>
);
