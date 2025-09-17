import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedSkeletonProps {
  variant?: 'card' | 'list' | 'chart' | 'profile' | 'muscle-map';
  count?: number;
  className?: string;
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={`glass-card border-primary/20 ${className}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-primary/20 to-secondary/20" />
                  <Skeleton className="h-3 w-1/2 bg-gradient-to-r from-secondary/20 to-primary/20" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full" />
                  <Skeleton className="h-8 w-16 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 glass-card border-primary/10 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                  <Skeleton className="h-3 w-3/4 bg-gradient-to-r from-secondary/20 to-primary/20" />
                </div>
                <Skeleton className="h-6 w-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full" />
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <Card className={`glass-card border-primary/20 ${className}`}>
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-gradient-to-r from-primary/20 to-secondary/20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end space-x-2 h-40">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`w-8 bg-gradient-to-t from-primary/30 to-secondary/30 rounded-t`}
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-8 bg-gradient-to-r from-primary/20 to-secondary/20" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'profile':
        return (
          <Card className={`glass-card border-primary/20 ${className}`}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                <div className="space-y-2 text-center w-full">
                  <Skeleton className="h-6 w-32 mx-auto bg-gradient-to-r from-primary/20 to-secondary/20" />
                  <Skeleton className="h-4 w-24 mx-auto bg-gradient-to-r from-secondary/20 to-primary/20" />
                </div>
                <div className="grid grid-cols-3 gap-4 w-full">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full" />
                      <Skeleton className="h-3 w-12 mx-auto bg-gradient-to-r from-secondary/20 to-primary/20" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'muscle-map':
        return (
          <Card className={`glass-card border-primary/20 ${className}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40 bg-gradient-to-r from-primary/20 to-secondary/20" />
                <Skeleton className="h-8 w-20 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-gray-900/20 to-gray-800/20 rounded-xl overflow-hidden">
                {/* Animated muscle regions */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="absolute rounded-lg bg-gradient-to-r from-primary/30 to-secondary/30 animate-pulse"
                    style={{
                      left: `${20 + (i % 3) * 20}%`,
                      top: `${15 + Math.floor(i / 3) * 15}%`,
                      width: `${8 + Math.random() * 6}%`,
                      height: `${6 + Math.random() * 4}%`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <Skeleton className={`h-4 w-full bg-gradient-to-r from-primary/20 to-secondary/20 ${className}`} />;
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 150}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default EnhancedSkeleton;