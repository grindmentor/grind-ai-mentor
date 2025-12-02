import React from 'react';
import { cn } from '@/lib/utils';

interface RefreshSkeletonProps {
  className?: string;
  variant?: 'dashboard' | 'card' | 'list' | 'module';
}

const shimmerClass = "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer";

export const RefreshSkeleton: React.FC<RefreshSkeletonProps> = ({ 
  className, 
  variant = 'dashboard' 
}) => {
  if (variant === 'card') {
    return (
      <div className={cn("rounded-xl border border-border bg-card/50 p-4 space-y-3", className)}>
        <div className={cn("h-10 w-10 rounded-lg", shimmerClass)} />
        <div className={cn("h-5 w-3/4 rounded", shimmerClass)} />
        <div className={cn("h-4 w-1/2 rounded", shimmerClass)} />
        <div className={cn("h-9 w-full rounded-lg", shimmerClass)} />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-card/30">
            <div className={cn("h-10 w-10 rounded-full", shimmerClass)} />
            <div className="flex-1 space-y-2">
              <div className={cn("h-4 w-2/3 rounded", shimmerClass)} />
              <div className={cn("h-3 w-1/2 rounded", shimmerClass)} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'module') {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
            <div className={cn("h-12 w-12 rounded-xl", shimmerClass)} />
            <div className={cn("h-5 w-3/4 rounded", shimmerClass)} />
            <div className={cn("h-4 w-full rounded", shimmerClass)} />
            <div className={cn("h-9 w-full rounded-lg", shimmerClass)} />
          </div>
        ))}
      </div>
    );
  }

  // Dashboard variant (default)
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <div className={cn("h-8 w-64 mx-auto rounded-lg", shimmerClass)} />
        <div className={cn("h-5 w-48 mx-auto rounded", shimmerClass)} />
      </div>

      {/* Favorites section skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn("h-6 w-32 rounded", shimmerClass)} />
          <div className={cn("h-8 w-24 rounded-lg", shimmerClass)} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
              <div className={cn("h-12 w-12 rounded-xl", shimmerClass)} />
              <div className={cn("h-5 w-3/4 rounded", shimmerClass)} />
              <div className={cn("h-9 w-full rounded-lg", shimmerClass)} />
            </div>
          ))}
        </div>
      </div>

      {/* Progress hub skeleton */}
      <div className={cn("h-20 w-full rounded-xl", shimmerClass)} />

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={cn("h-48 rounded-xl", shimmerClass)} />
        <div className={cn("h-48 rounded-xl", shimmerClass)} />
      </div>
    </div>
  );
};

export default RefreshSkeleton;
