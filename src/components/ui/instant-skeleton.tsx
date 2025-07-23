import React from 'react';
import { cn } from '@/lib/utils';

interface InstantSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

export const InstantSkeleton: React.FC<InstantSkeletonProps> = ({
  className,
  variant = 'default',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  const variants = {
    default: 'h-4 w-full',
    card: 'h-32 w-full',
    text: 'h-3 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-9 w-20'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 ? 'w-1/2' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
    />
  );
};

// Pre-built skeleton layouts for instant loading
export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <InstantSkeleton variant="text" className="h-8 w-48" />
      <InstantSkeleton variant="button" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <InstantSkeleton key={i} variant="card" />
      ))}
    </div>
  </div>
);

export const ModuleSkeleton = () => (
  <div className="space-y-4 p-4">
    <InstantSkeleton variant="text" className="h-6 w-32" />
    <InstantSkeleton variant="text" lines={3} />
    <div className="flex gap-2">
      <InstantSkeleton variant="button" />
      <InstantSkeleton variant="button" />
    </div>
  </div>
);