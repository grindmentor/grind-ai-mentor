
import React, { useState, useCallback, useMemo } from 'react';
import { useOptimizedLazyLoading } from '@/hooks/useOptimizedLazyLoading';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SmartPreloader } from '@/services/bundleOptimizationService';

interface OptimizedModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    category: string;
    isPremium: boolean;
  };
  onClick: (moduleId: string) => void;
  isActive: boolean;
}

const OptimizedModuleCard: React.FC<OptimizedModuleCardProps> = ({ 
  module, 
  onClick, 
  isActive 
}) => {
  const { elementRef, isVisible, isLoaded } = useOptimizedLazyLoading({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const handleClick = useCallback(() => {
    // Track interaction for smart preloading
    SmartPreloader.getInstance().trackInteraction(module.id);
    onClick(module.id);
  }, [module.id, onClick]);

  const IconComponent = module.icon;

  if (!isVisible) {
    return (
      <div ref={elementRef} className="h-32">
        <Skeleton className="h-full w-full rounded-lg bg-gray-800/50" />
      </div>
    );
  }

  return (
    <Card
      ref={elementRef}
      className={`
        cursor-pointer transition-all duration-200 hover:scale-[1.02] 
        bg-gray-900/40 backdrop-blur-sm border-gray-700/50 
        hover:bg-gray-800/60 hover:border-orange-500/30
        ${isActive ? 'ring-2 ring-orange-500 bg-gray-800/60' : ''}
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">
              {module.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {module.description}
            </p>
            {module.isPremium && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
                Premium
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface OptimizedModuleGridProps {
  modules: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    category: string;
    isPremium: boolean;
  }>;
  onModuleClick: (moduleId: string) => void;
  activeModule?: string;
}

export const OptimizedModuleGrid: React.FC<OptimizedModuleGridProps> = ({
  modules,
  onModuleClick,
  activeModule
}) => {
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Memoize filtered modules to prevent unnecessary re-renders
  const visibleModules = useMemo(() => 
    modules.slice(0, visibleCount),
    [modules, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 4, modules.length));
  }, [modules.length]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleModules.map((module) => (
          <OptimizedModuleCard
            key={module.id}
            module={module}
            onClick={onModuleClick}
            isActive={activeModule === module.id}
          />
        ))}
      </div>
      
      {visibleCount < modules.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Load More ({modules.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
