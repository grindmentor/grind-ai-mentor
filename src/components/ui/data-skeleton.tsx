import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Skeleton, 
  shimmerClass, 
  ModuleCardSkeleton, 
  GoalSkeleton, 
  ChartSkeleton 
} from './skeleton';

interface DataSkeletonProps {
  className?: string;
  variant?: 'card' | 'stats' | 'chart' | 'list' | 'profile' | 'goals' | 'research' | 'workout' | 'food' | 'notifications';
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
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      );

    case 'chart':
      return <ChartSkeleton className={className} />;

    case 'list':
      return (
        <div className={cn("space-y-3", className)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center space-x-3 p-3 rounded-lg bg-card/30 border border-border/20"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'goals':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <GoalSkeleton key={i} />
            ))}
          </div>
        </div>
      );

    case 'research':
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-background/30 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'workout':
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="p-4 rounded-lg bg-card/30 border border-border/20"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="text-center space-y-1">
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 'food':
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="p-4 rounded-lg bg-card/30 border border-border/20"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 'notifications':
      return (
        <div className={cn("space-y-3", className)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-start space-x-3 p-4 rounded-lg bg-card/30 border border-border/20"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      );

    // Default card variant
    default:
      return (
        <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6", className)}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
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
    "w-full h-16 sm:h-20 rounded-xl border border-purple-700/30",
    shimmerClass,
    className
  )} />
);

export const FavoritesSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <ModuleCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Full page loading skeleton
export const PageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6 p-6", className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
    
    {/* Stats */}
    <DataSkeleton variant="stats" />
    
    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataSkeleton variant="chart" />
      <DataSkeleton variant="list" />
    </div>
  </div>
);

// Module content skeleton
export const ModuleContentSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    
    {/* Content */}
    <DataSkeleton variant="card" />
    <DataSkeleton variant="list" />
  </div>
);

export default DataSkeleton;
