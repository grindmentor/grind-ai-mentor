import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton, shimmerClass } from './skeleton';

interface ModuleCardSkeletonProps {
  className?: string;
  variant?: 'grid' | 'list';
  style?: React.CSSProperties;
}

export const ModuleCardSkeleton: React.FC<ModuleCardSkeletonProps> = ({ 
  className,
  variant = 'grid',
  style
}) => {
  if (variant === 'list') {
    return (
      <div 
        className={cn(
          "rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 animate-fade-in",
          className
        )}
        style={style}
      >
        <div className="flex items-center space-x-4">
          {/* Icon skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
          
          {/* Action skeleton */}
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl border border-border/30 bg-gradient-to-br from-muted/20 to-muted/10 backdrop-blur-sm overflow-hidden animate-fade-in",
        className
      )}
      style={style}
    >
      <div className="p-6 relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          {/* Icon skeleton */}
          <Skeleton className="w-14 h-14 rounded-xl" />
          {/* Favorite button skeleton */}
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        
        {/* Title and badge skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};

interface ModuleGridSkeletonProps {
  count?: number;
  variant?: 'grid' | 'list';
  className?: string;
}

export const ModuleGridSkeleton: React.FC<ModuleGridSkeletonProps> = ({
  count = 6,
  variant = 'grid',
  className
}) => {
  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <ModuleCardSkeleton 
            key={i} 
            variant="list"
            className="opacity-100"
            style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <ModuleCardSkeleton 
          key={i} 
          variant="grid"
          style={{ animationDelay: `${i * 75}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ModuleCardSkeleton;
