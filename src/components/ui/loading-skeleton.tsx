
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-800/50",
        className
      )}
      {...props}
    />
  );
};

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'exercise' | 'workout';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  count = 3 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        );
      
      case 'list':
        return (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        );
      
      case 'exercise':
        return (
          <div className="bg-gray-800/30 border border-gray-600/50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <Skeleton className="w-4 h-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-12 h-6 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        );
      
      case 'workout':
        return (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/40 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-4" />
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Skeleton className="h-8" />
                      <Skeleton className="h-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};
