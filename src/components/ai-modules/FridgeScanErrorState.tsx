import React from 'react';
import { WifiOff, CreditCard, Clock, ShieldAlert, ServerCrash, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type FridgeScanErrorCode = 'offline' | 401 | 402 | 429 | 500 | 503 | 'unknown';

interface FridgeScanErrorStateProps {
  errorCode: FridgeScanErrorCode;
  onRetry?: () => void;
  onBack?: () => void;
  queuedCount?: number;
  className?: string;
}

const errorConfig: Record<FridgeScanErrorCode, {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  showRetry: boolean;
  color: string;
}> = {
  offline: {
    icon: <WifiOff className="w-8 h-8" />,
    title: 'You\'re Offline',
    description: 'Your request has been queued and will automatically process when you reconnect.',
    showRetry: false,
    color: 'text-blue-400',
  },
  401: {
    icon: <ShieldAlert className="w-8 h-8" />,
    title: 'Session Expired',
    description: 'Please sign in again to continue using FridgeScan.',
    actionLabel: 'Sign In',
    showRetry: true,
    color: 'text-amber-400',
  },
  402: {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'AI Credits Exhausted',
    description: 'You\'ve used all your AI credits for this period. Upgrade to Premium for unlimited access.',
    actionLabel: 'View Plans',
    showRetry: false,
    color: 'text-purple-400',
  },
  429: {
    icon: <Clock className="w-8 h-8" />,
    title: 'Too Many Requests',
    description: 'You\'re sending requests too quickly. Please wait a moment and try again.',
    actionLabel: 'Try Again',
    showRetry: true,
    color: 'text-orange-400',
  },
  500: {
    icon: <ServerCrash className="w-8 h-8" />,
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified. Please try again shortly.',
    actionLabel: 'Retry',
    showRetry: true,
    color: 'text-red-400',
  },
  503: {
    icon: <ServerCrash className="w-8 h-8" />,
    title: 'Service Unavailable',
    description: 'The AI service is temporarily unavailable. This usually resolves within a few minutes.',
    actionLabel: 'Retry',
    showRetry: true,
    color: 'text-red-400',
  },
  unknown: {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    actionLabel: 'Retry',
    showRetry: true,
    color: 'text-muted-foreground',
  },
};

const FridgeScanErrorState: React.FC<FridgeScanErrorStateProps> = ({
  errorCode,
  onRetry,
  onBack,
  queuedCount = 0,
  className,
}) => {
  const config = errorConfig[errorCode] || errorConfig.unknown;

  return (
    <Card className={cn("bg-card/60 border-border/50", className)}>
      <CardContent className="flex flex-col items-center text-center py-8 px-6">
        <div className={cn("mb-4", config.color)}>
          {config.icon}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {config.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {config.description}
        </p>

        {errorCode === 'offline' && queuedCount > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-400">
              {queuedCount} request{queuedCount !== 1 ? 's' : ''} queued
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          )}
          
          {config.showRetry && onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {config.actionLabel || 'Retry'}
            </Button>
          )}

          {errorCode === 402 && (
            <Button onClick={() => window.location.href = '/pricing'}>
              {config.actionLabel}
            </Button>
          )}

          {errorCode === 401 && (
            <Button onClick={() => window.location.href = '/signin'}>
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FridgeScanErrorState;
