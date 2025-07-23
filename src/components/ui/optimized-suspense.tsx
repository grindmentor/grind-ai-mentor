import React, { Suspense, memo } from 'react';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { InstantSkeleton } from '@/components/ui/instant-skeleton';

interface OptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingType?: 'screen' | 'skeleton' | 'spinner';
  message?: string;
  className?: string;
}

// Memoized loading components
const MemoizedLoadingScreen = memo(({ message }: { message?: string }) => (
  <LoadingScreen message={message} fullScreen={false} />
));

const MemoizedSkeleton = memo(({ className }: { className?: string }) => (
  <div className={className}>
    <InstantSkeleton variant="card" />
  </div>
));

const MemoizedSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
));

MemoizedLoadingScreen.displayName = 'MemoizedLoadingScreen';
MemoizedSkeleton.displayName = 'MemoizedSkeleton';
MemoizedSpinner.displayName = 'MemoizedSpinner';

export const OptimizedSuspense: React.FC<OptimizedSuspenseProps> = ({
  children,
  fallback,
  loadingType = 'screen',
  message,
  className
}) => {
  const { lowDataMode } = usePerformanceContext();
  
  // Choose optimized fallback based on connection and preference
  const optimizedFallback = fallback || (() => {
    if (lowDataMode) {
      return <MemoizedSpinner />;
    }
    
    switch (loadingType) {
      case 'skeleton':
        return <MemoizedSkeleton className={className} />;
      case 'spinner':
        return <MemoizedSpinner />;
      default:
        return <MemoizedLoadingScreen message={message} />;
    }
  })();

  return (
    <Suspense fallback={optimizedFallback}>
      {children}
    </Suspense>
  );
};

// Hook for lazy loading with error handling
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    retries?: number;
    delay?: number;
  } = {}
) {
  const { retries = 3, delay = 1000 } = options;
  
  return React.useMemo(() => {
    return React.lazy(async () => {
      let lastError: Error | null = null;
      
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error) {
          lastError = error as Error;
          
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          }
        }
      }
      
      throw lastError;
    });
  }, [importFn, retries, delay]);
}

export default OptimizedSuspense;