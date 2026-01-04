import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AILoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  className?: string;
  timeout?: number; // ms before showing "taking longer" message
}

/**
 * Unified AI loading state component that provides clear feedback
 * during AI operations, preventing silent failures and unclear states.
 */
export const AILoadingState: React.FC<AILoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  loadingMessage = 'Thinking...',
  errorMessage,
  className,
  timeout = 5000
}) => {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSlowMessage(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  if (error) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 text-center",
        className
      )}>
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {errorMessage || 'Something went wrong'}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {error}
          </p>
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="mt-2 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 p-6",
        className
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground animate-pulse">
            {loadingMessage}
          </p>
          {showSlowMessage && (
            <p className="text-xs text-muted-foreground">
              This is taking longer than usual...
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Hook for managing AI loading states with timeout protection
 */
export const useAILoadingState = (options?: { timeout?: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeout = options?.timeout ?? 30000;

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setErrorState = (err: string | Error) => {
    setError(typeof err === 'string' ? err : err.message);
    setIsLoading(false);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  // Auto-timeout for safety
  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      if (isLoading) {
        setError('Request timed out. Please try again.');
        setIsLoading(false);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    reset
  };
};

export default AILoadingState;
