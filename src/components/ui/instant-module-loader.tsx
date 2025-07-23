import React, { useEffect, useRef, useState } from 'react';
import { useAggressiveModulePreloader } from '@/hooks/useAggressiveModulePreloader';

interface InstantModuleLoaderProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

const moduleComponentCache = new Map<string, React.ComponentType<any>>();

export const InstantModuleLoader: React.FC<InstantModuleLoaderProps> = ({
  moduleId,
  children,
  fallback,
  onLoadStart,
  onLoadComplete
}) => {
  const [isInstantReady, setIsInstantReady] = useState(false);
  const [loadingStartTime] = useState(() => performance.now());
  const { isModuleReady, getModuleFromCache } = useAggressiveModulePreloader();
  const hasTriggeredLoadStart = useRef(false);

  useEffect(() => {
    const checkModuleReadiness = async () => {
      // Check if module is preloaded and ready
      if (isModuleReady(moduleId)) {
        const loadTime = performance.now() - loadingStartTime;
        console.log(`[InstantLoader] Module ${moduleId} ready instantly in ${loadTime.toFixed(2)}ms`);
        
        if (!hasTriggeredLoadStart.current && onLoadStart) {
          onLoadStart();
          hasTriggeredLoadStart.current = true;
        }
        
        setIsInstantReady(true);
        onLoadComplete?.();
        return;
      }

      // Try to get from cache if available
      const cachedModule = getModuleFromCache(moduleId);
      if (cachedModule) {
        try {
          if (!hasTriggeredLoadStart.current && onLoadStart) {
            onLoadStart();
            hasTriggeredLoadStart.current = true;
          }

          await cachedModule;
          const loadTime = performance.now() - loadingStartTime;
          console.log(`[InstantLoader] Module ${moduleId} loaded from cache in ${loadTime.toFixed(2)}ms`);
          
          setIsInstantReady(true);
          onLoadComplete?.();
        } catch (error) {
          console.warn(`[InstantLoader] Failed to load cached module ${moduleId}:`, error);
          // Fallback to normal loading
          setIsInstantReady(true);
          onLoadComplete?.();
        }
      } else {
        // Module not preloaded, show immediately but track performance
        const loadTime = performance.now() - loadingStartTime;
        console.log(`[InstantLoader] Module ${moduleId} loading normally after ${loadTime.toFixed(2)}ms`);
        
        if (!hasTriggeredLoadStart.current && onLoadStart) {
          onLoadStart();
          hasTriggeredLoadStart.current = true;
        }
        
        setIsInstantReady(true);
        onLoadComplete?.();
      }
    };

    // Use micro-task for immediate execution
    Promise.resolve().then(checkModuleReadiness);
  }, [moduleId, isModuleReady, getModuleFromCache, loadingStartTime, onLoadStart, onLoadComplete]);

  // Always show content for instant feel, even if not technically "ready"
  // The goal is zero perceived loading time
  if (!isInstantReady && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Helper hook for tracking module load performance
export const useModuleLoadPerformance = (moduleId: string) => {
  const startTimeRef = useRef<number>(performance.now());
  const [loadMetrics, setLoadMetrics] = useState<{
    loadTime: number;
    wasPreloaded: boolean;
    wasInstant: boolean;
  } | null>(null);

  const recordLoadComplete = (wasPreloaded: boolean) => {
    const loadTime = performance.now() - startTimeRef.current;
    const wasInstant = loadTime < 100; // Consider sub-100ms as instant
    
    setLoadMetrics({
      loadTime,
      wasPreloaded,
      wasInstant
    });

    // Log performance metrics
    console.log(`[ModulePerformance] ${moduleId}: ${loadTime.toFixed(2)}ms ${wasPreloaded ? '(preloaded)' : '(cold)'} ${wasInstant ? '⚡' : ''}`);
  };

  return { loadMetrics, recordLoadComplete };
};