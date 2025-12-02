import React from 'react';
import { cn } from '@/lib/utils';

const shimmerClass = "bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer";

interface TabContentSkeletonProps {
  className?: string;
  variant?: 'profile' | 'settings' | 'goals' | 'default';
}

export const TabContentSkeleton: React.FC<TabContentSkeletonProps> = ({ 
  className,
  variant = 'default' 
}) => {
  switch (variant) {
    case 'profile':
      return (
        <div className={cn("space-y-6 animate-fade-in", className)}>
          {/* Account card skeleton */}
          <div className="rounded-lg border border-border/30 bg-card/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={cn("w-10 h-10 rounded-lg", shimmerClass)} />
              <div className={cn("h-6 w-40", shimmerClass)} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={cn("w-4 h-4 rounded", shimmerClass)} />
                <div className={cn("h-4 w-48", shimmerClass)} />
              </div>
              <div className="flex items-center space-x-3">
                <div className={cn("w-4 h-4 rounded", shimmerClass)} />
                <div className={cn("h-4 w-36", shimmerClass)} />
              </div>
            </div>
          </div>
          {/* Subscription card skeleton */}
          <div className="rounded-lg border border-border/30 bg-card/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={cn("w-10 h-10 rounded-lg", shimmerClass)} />
              <div className={cn("h-6 w-44", shimmerClass)} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className={cn("h-4 w-24", shimmerClass)} />
                <div className={cn("h-6 w-20 rounded-full", shimmerClass)} />
              </div>
              <div className="flex justify-between">
                <div className={cn("h-4 w-28", shimmerClass)} />
                <div className={cn("h-4 w-16", shimmerClass)} />
              </div>
            </div>
          </div>
          {/* Stats card skeleton */}
          <div className="rounded-lg border border-border/30 bg-card/30 p-6">
            <div className={cn("h-6 w-28 mb-4", shimmerClass)} />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className={cn("h-8 w-16 mx-auto", shimmerClass)} />
                  <div className={cn("h-3 w-12 mx-auto", shimmerClass)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className={cn("space-y-4 animate-fade-in", className)}>
          <div className={cn("h-6 w-32 mb-4", shimmerClass)} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/30"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("w-5 h-5 rounded", shimmerClass)} />
                <div className={cn("h-5 w-32", shimmerClass)} />
              </div>
              <div className={cn("h-8 w-24 rounded-lg", shimmerClass)} />
            </div>
          ))}
        </div>
      );

    case 'goals':
      return (
        <div className={cn("space-y-4 animate-fade-in", className)}>
          <div className="flex justify-between items-center mb-4">
            <div className={cn("h-5 w-28", shimmerClass)} />
            <div className={cn("h-9 w-28 rounded-lg", shimmerClass)} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="p-4 rounded-lg border border-border/30 bg-card/30 space-y-3"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn("w-10 h-10 rounded-lg", shimmerClass)} />
                  <div className="space-y-2">
                    <div className={cn("h-5 w-36", shimmerClass)} />
                    <div className={cn("h-3 w-48", shimmerClass)} />
                  </div>
                </div>
                <div className={cn("h-6 w-16 rounded-full", shimmerClass)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className={cn("h-4 w-20", shimmerClass)} />
                  <div className={cn("h-4 w-12", shimmerClass)} />
                </div>
                <div className={cn("h-2 w-full rounded-full", shimmerClass)} />
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className={cn("space-y-4 animate-fade-in", className)}>
          <div className={cn("h-6 w-40 mb-4", shimmerClass)} />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("h-12 w-full rounded-lg", shimmerClass)} style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </div>
      );
  }
};

// Tab transition wrapper with animation
interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export const TabTransition: React.FC<TabTransitionProps> = ({ children, isActive, className }) => {
  if (!isActive) return null;
  
  return (
    <div className={cn(
      "animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
};

export default TabContentSkeleton;
