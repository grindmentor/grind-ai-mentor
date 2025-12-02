import React, { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { DataSkeleton } from './data-skeleton';

interface SkeletonWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton?: React.ReactNode;
  variant?: 'card' | 'stats' | 'chart' | 'list' | 'profile' | 'goals' | 'research' | 'workout' | 'food' | 'notifications';
  className?: string;
  delay?: number; // Delay before showing skeleton (prevents flash for fast loads)
}

/**
 * A wrapper component that shows a skeleton while data is loading
 * Use this for any data-fetching component that needs a loading state
 */
export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  children,
  isLoading,
  skeleton,
  variant,
  className,
  delay = 0
}) => {
  const [showSkeleton, setShowSkeleton] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0 && isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    }
    if (!isLoading) {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  if (isLoading && (showSkeleton || delay === 0)) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    if (variant) {
      return <DataSkeleton variant={variant} className={className} />;
    }
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Inline skeleton for text content
 */
interface InlineSkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
}

export const InlineSkeleton: React.FC<InlineSkeletonProps> = ({
  isLoading,
  children,
  width = 'w-20',
  height = 'h-4',
  className
}) => {
  if (isLoading) {
    return <Skeleton className={cn("inline-block", width, height, className)} />;
  }
  return <>{children}</>;
};

/**
 * Suspense-based skeleton wrapper for lazy-loaded components
 */
interface SuspenseSkeletonProps {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  variant?: 'card' | 'stats' | 'chart' | 'list' | 'profile' | 'goals' | 'research';
  className?: string;
}

export const SuspenseSkeleton: React.FC<SuspenseSkeletonProps> = ({
  children,
  skeleton,
  variant,
  className
}) => {
  const fallback = skeleton || (variant ? <DataSkeleton variant={variant} className={className} /> : <Skeleton className="h-48 w-full" />);
  
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

/**
 * List skeleton wrapper with automatic item detection
 */
interface ListSkeletonWrapperProps<T> {
  items: T[] | undefined;
  isLoading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  skeletonCount?: number;
  skeletonItem?: React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function ListSkeletonWrapper<T>({
  items,
  isLoading,
  renderItem,
  skeletonCount = 5,
  skeletonItem,
  emptyState,
  className,
  itemClassName
}: ListSkeletonWrapperProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 50}ms` }}>
            {skeletonItem || (
              <div className={cn("flex items-center space-x-3 p-3 rounded-lg bg-card/30 border border-border/20", itemClassName)}>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default SkeletonWrapper;
