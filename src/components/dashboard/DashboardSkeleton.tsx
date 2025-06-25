
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Skeleton */}
        <div className="text-center md:text-left">
          <Skeleton className="h-10 w-96 mx-auto md:mx-0 mb-2" />
          <Skeleton className="h-6 w-80 mx-auto md:mx-0" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* AI Modules Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
