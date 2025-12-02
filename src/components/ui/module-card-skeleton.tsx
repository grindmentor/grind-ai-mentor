import React from 'react';
import { cn } from '@/lib/utils';

interface ModuleCardSkeletonProps {
  className?: string;
  variant?: 'grid' | 'list';
  style?: React.CSSProperties;
}

const shimmerClass = "bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer";

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
          <div className={cn("w-12 h-12 rounded-xl", shimmerClass)} />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className={cn("h-5 w-2/3 rounded", shimmerClass)} />
            <div className={cn("h-3 w-full rounded", shimmerClass)} />
          </div>
          
          {/* Action skeleton */}
          <div className={cn("w-8 h-8 rounded-full", shimmerClass)} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden animate-fade-in",
        className
      )}
      style={style}
    >
      {/* Background pattern placeholder */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>
      
      <div className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon skeleton */}
          <div className={cn("w-16 h-16 rounded-2xl", shimmerClass)} />
          
          {/* Title skeleton */}
          <div className={cn("h-6 w-3/4 rounded", shimmerClass)} />
          
          {/* Description skeleton */}
          <div className="w-full space-y-2">
            <div className={cn("h-3 w-full rounded mx-auto", shimmerClass)} />
            <div className={cn("h-3 w-2/3 rounded mx-auto", shimmerClass)} />
          </div>
          
          {/* Badge skeleton (optional) */}
          <div className={cn("h-5 w-20 rounded-full", shimmerClass)} />
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
          style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ModuleCardSkeleton;
