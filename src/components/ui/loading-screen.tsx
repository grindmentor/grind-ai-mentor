
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
      {/* Darker branded background */}
      <div className="fixed inset-0 bg-black z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 z-0" />
      
      <div className="text-center space-y-6 relative z-10">
        {/* Branded logo with subtle animation */}
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>
        
        {/* Dimmed loading indicator */}
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500/80" />
          <span className="text-white/90 text-lg font-medium">{message}</span>
        </div>
        
        {/* Subtle description */}
        <div className="text-sm text-gray-400/80 max-w-xs">
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
      <Loader2 className={`animate-spin text-orange-500/80 ${sizeClasses[size]}`} />
      {message && (
        <span className="text-sm text-gray-400/80">{message}</span>
      )}
    </div>
  );
};
