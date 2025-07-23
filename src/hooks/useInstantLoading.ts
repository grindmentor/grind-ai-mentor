import { useEffect, useRef, useState } from 'react';
import { AppShellCache } from '@/utils/appShellCache';

interface InstantLoadingOptions {
  preloadModules?: string[];
  enablePredictiveLoading?: boolean;
  aggressiveCaching?: boolean;
}

export const useInstantLoading = (options: InstantLoadingOptions = {}) => {
  const [isShellReady, setIsShellReady] = useState(false);
  const [preloadedModules, setPreloadedModules] = useState<Set<string>>(new Set());
  const shellCache = useRef(AppShellCache.getInstance());
  const userInteractionMap = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const initShell = async () => {
      // Instantly mark shell as ready for immediate UI render
      setIsShellReady(true);
      
      // Background shell caching
      await shellCache.current.preloadCriticalResources();
      
      if (options.preloadModules) {
        // Predictive module preloading
        const preloadPromises = options.preloadModules.map(async (moduleName) => {
          try {
            // Dynamic import with prefetch
            await import(/* webpackPrefetch: true */ `@/components/ai-modules/${moduleName}.tsx`);
            setPreloadedModules(prev => new Set([...prev, moduleName]));
          } catch (error) {
            console.warn(`Failed to preload module ${moduleName}:`, error);
          }
        });
        
        // Staggered loading to avoid blocking
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => Promise.all(preloadPromises));
        } else {
          setTimeout(() => Promise.all(preloadPromises), 100);
        }
      }
    };

    initShell();
  }, [options.preloadModules]);

  // Predictive loading based on user behavior
  const trackInteraction = (moduleName: string) => {
    if (options.enablePredictiveLoading) {
      const count = userInteractionMap.current.get(moduleName) || 0;
      userInteractionMap.current.set(moduleName, count + 1);
      
      // Auto-preload frequently accessed modules
      if (count >= 2 && !preloadedModules.has(moduleName)) {
        import(/* webpackPrefetch: true */ `@/components/ai-modules/${moduleName}.tsx`)
          .then(() => {
            setPreloadedModules(prev => new Set([...prev, moduleName]));
          })
          .catch(console.warn);
      }
    }
  };

  // Instant navigation warmup
  const warmupRoute = (route: string) => {
    shellCache.current.warmupNextPage(route);
  };

  // Memory-aggressive caching
  const enableAggressiveCaching = () => {
    if (options.aggressiveCaching && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'ENABLE_AGGRESSIVE_CACHE'
        });
      });
    }
  };

  useEffect(() => {
    if (options.aggressiveCaching) {
      enableAggressiveCaching();
    }
  }, [options.aggressiveCaching]);

  return {
    isShellReady,
    preloadedModules,
    trackInteraction,
    warmupRoute,
    isModulePreloaded: (moduleName: string) => preloadedModules.has(moduleName)
  };
};