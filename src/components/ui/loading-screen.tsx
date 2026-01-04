import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  timeoutMs?: number; // Optional timeout before showing retry option
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  fullScreen = true,
  timeoutMs = 15000 // 15 second default timeout
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeoutMs);
    
    return () => clearTimeout(timer);
  }, [timeoutMs]);
  
  const handleRetry = () => {
    window.location.reload();
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-background flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      {/* Darker branded background */}
      <div className="fixed inset-0 bg-background z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 z-0" />
      
      <div className="text-center space-y-6 relative z-10">
        {/* Branded logo with subtle animation */}
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>
        
        {showTimeout ? (
          // Timeout state - show retry option
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-medium">Taking longer than expected</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Something might have gone wrong. Try refreshing the page.
              </p>
            </div>
            <Button
              onClick={handleRetry}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        ) : (
          // Normal loading state
          <>
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500/80" />
              <span className="text-foreground/90 text-lg font-medium">{message}</span>
            </div>
            
            {/* Subtle description */}
            <div className="text-sm text-muted-foreground max-w-xs">
              {message === "Loading..." ? "Initializing Myotopia..." : message}
            </div>
          </>
        )}
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
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
};