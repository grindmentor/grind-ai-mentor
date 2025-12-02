import React from 'react';
import { cn } from '@/lib/utils';

const shimmerClass = "bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer";

interface DataSkeletonProps {
  className?: string;
  variant?: 'card' | 'stats' | 'chart' | 'list' | 'profile' | 'goals' | 'research';
}

export const DataSkeleton: React.FC<DataSkeletonProps> = ({ 
  className,
  variant = 'card' 
}) => {
  switch (variant) {
    case 'stats':
      return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-3"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn("h-4 w-1/2 rounded", shimmerClass)} />
              <div className={cn("h-8 w-3/4 rounded", shimmerClass)} />
              <div className={cn("h-3 w-2/3 rounded", shimmerClass)} />
            </div>
          ))}
        </div>
      );

    case 'chart':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={cn("h-6 w-32 rounded", shimmerClass)} />
              <div className={cn("h-8 w-24 rounded-lg", shimmerClass)} />
            </div>
            <div className={cn("h-48 w-full rounded-lg", shimmerClass)} />
            <div className="flex justify-center space-x-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("h-4 w-16 rounded", shimmerClass)} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={cn("space-y-3", className)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center space-x-3 p-3 rounded-lg bg-card/30 border border-border/20"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn("h-10 w-10 rounded-full", shimmerClass)} />
              <div className="flex-1 space-y-2">
                <div className={cn("h-4 w-2/3 rounded", shimmerClass)} />
                <div className={cn("h-3 w-1/2 rounded", shimmerClass)} />
              </div>
              <div className={cn("h-6 w-16 rounded-full", shimmerClass)} />
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center space-x-4 mb-6">
            <div className={cn("h-16 w-16 rounded-full", shimmerClass)} />
            <div className="space-y-2">
              <div className={cn("h-6 w-32 rounded", shimmerClass)} />
              <div className={cn("h-4 w-48 rounded", shimmerClass)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={cn("h-3 w-1/2 rounded", shimmerClass)} />
                <div className={cn("h-5 w-3/4 rounded", shimmerClass)} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'goals':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center justify-between mb-4">
            <div className={cn("h-6 w-40 rounded", shimmerClass)} />
            <div className={cn("h-8 w-24 rounded-lg", shimmerClass)} />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={cn("h-4 w-1/3 rounded", shimmerClass)} />
                  <div className={cn("h-4 w-12 rounded", shimmerClass)} />
                </div>
                <div className={cn("h-2 w-full rounded-full", shimmerClass)} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'research':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center justify-between mb-4">
            <div className={cn("h-6 w-36 rounded", shimmerClass)} />
            <div className={cn("h-5 w-20 rounded-full", shimmerClass)} />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-background/30 space-y-2">
                <div className={cn("h-5 w-3/4 rounded", shimmerClass)} />
                <div className={cn("h-3 w-full rounded", shimmerClass)} />
                <div className={cn("h-3 w-2/3 rounded", shimmerClass)} />
              </div>
            ))}
          </div>
        </div>
      );

    // Default card variant
    default:
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={cn("h-10 w-10 rounded-lg", shimmerClass)} />
              <div className={cn("h-6 w-1/3 rounded", shimmerClass)} />
            </div>
            <div className="space-y-2">
              <div className={cn("h-4 w-full rounded", shimmerClass)} />
              <div className={cn("h-4 w-3/4 rounded", shimmerClass)} />
              <div className={cn("h-4 w-1/2 rounded", shimmerClass)} />
            </div>
            <div className={cn("h-10 w-full rounded-lg", shimmerClass)} />
          </div>
        </div>
      );
  }
};

// Compound skeletons for common dashboard patterns
export const DashboardContentSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6", className)}>
    <DataSkeleton variant="goals" />
    <DataSkeleton variant="research" />
  </div>
);

export const ProgressHubSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    "w-full h-16 sm:h-20 rounded-xl bg-gradient-to-r from-purple-900/30 to-purple-800/40 border border-purple-700/30",
    shimmerClass,
    className
  )} />
);

export const FavoritesSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div className={cn("h-7 w-36 rounded", shimmerClass)} />
      <div className={cn("h-8 w-24 rounded-lg", shimmerClass)} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-xl border border-border/30 bg-card/30 p-6 space-y-4"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className={cn("h-14 w-14 rounded-xl mx-auto", shimmerClass)} />
          <div className={cn("h-5 w-3/4 rounded mx-auto", shimmerClass)} />
          <div className={cn("h-3 w-full rounded", shimmerClass)} />
        </div>
      ))}
    </div>
  </div>
);

export default DataSkeleton;
