
import React, { useState, useEffect, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceContext } from './performance-provider';
import { ModuleLoadingScreen } from './module-loading-screen';

interface ModuleTransitionWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  moduleName: string;
  isActive?: boolean;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
  className?: string;
}

export const ModuleTransitionWrapper: React.FC<ModuleTransitionWrapperProps> = ({
  children,
  moduleId,
  moduleName,
  isActive = true,
  onTransitionStart,
  onTransitionEnd,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { optimizedSettings, measurePerformance } = usePerformanceContext();

  useEffect(() => {
    if (isActive && !isLoaded) {
      onTransitionStart?.();
      
      const loadTimer = setTimeout(() => {
        measurePerformance(`Module Load: ${moduleName}`, () => {
          setIsLoaded(true);
          setTimeout(() => {
            setShowContent(true);
            onTransitionEnd?.();
          }, 50);
        });
      }, 10);

      return () => clearTimeout(loadTimer);
    }
  }, [isActive, isLoaded, moduleName, measurePerformance, onTransitionStart, onTransitionEnd]);

  if (!isActive || !isLoaded) {
    return <ModuleLoadingScreen moduleName={moduleName} />;
  }

  const transitionDuration = optimizedSettings.reduceAnimations ? 200 : 300;

  return (
    <div 
      className={cn(
        "w-full h-full transition-all ease-out transform-gpu",
        showContent 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-1 scale-99",
        className
      )}
      style={{
        transitionDuration: `${transitionDuration}ms`,
        transitionProperty: 'opacity, transform'
      }}
    >
      <Suspense fallback={<ModuleLoadingScreen moduleName={moduleName} />}>
        {children}
      </Suspense>
    </div>
  );
};
