// Ultra-aggressive preloader for instant loading
import { useEffect, useRef, useState } from 'react';

interface UltraPreloaderOptions {
  aggressivePreload?: boolean;
  instantCache?: boolean;
  prefetchStrategy?: 'all' | 'smart' | 'minimal';
}

const modulePreloadCache = new Map<string, Promise<any>>();
const componentCache = new Map<string, React.ComponentType<any>>();

export const useUltraPreloader = (options: UltraPreloaderOptions = {}) => {
  const [readyModules, setReadyModules] = useState<Set<string>>(new Set());
  const isPreloadingRef = useRef(false);

  // Aggressive module preloading
  const preloadAllModules = async () => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    const criticalModules = [
      'CoachGPT',
      'SmartTraining', 
      'TDEECalculator',
      'WorkoutLoggerAI',
      'ProgressHub',
      'BlueprintAI',
      'SmartFoodLog',
      'MealPlanAI'
    ];

    const modulePromises = criticalModules.map(async (moduleName) => {
      if (modulePreloadCache.has(moduleName)) {
        return modulePreloadCache.get(moduleName);
      }

      const promise = import(/* webpackPrefetch: true */ `@/components/ai-modules/${moduleName}.tsx`)
        .then(module => {
          setReadyModules(prev => new Set([...prev, moduleName]));
          return module.default;
        })
        .catch(() => null);

      modulePreloadCache.set(moduleName, promise);
      return promise;
    });

    // Load all modules in parallel for maximum speed
    await Promise.allSettled(modulePromises);
    console.log(`[UltraPreloader] Preloaded ${criticalModules.length} modules`);
  };

  // Instant component resolution
  const getInstantComponent = (moduleName: string) => {
    return componentCache.get(moduleName) || modulePreloadCache.get(moduleName);
  };

  // Smart prefetch strategy
  const smartPrefetch = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch UI components
        const uiComponents = [
          'loading-screen',
          'enhanced-loading', 
          'module-loading-screen',
          'performance-optimized-card'
        ];

        uiComponents.forEach(comp => {
          import(`@/components/ui/${comp}.tsx`).catch(() => {});
        });
      });
    }
  };

  useEffect(() => {
    const startTime = performance.now();

    if (options.aggressivePreload) {
      // Start aggressive preloading immediately
      preloadAllModules().then(() => {
        const loadTime = performance.now() - startTime;
        console.log(`[UltraPreloader] All modules ready in ${loadTime.toFixed(2)}ms`);
      });
    }

    if (options.prefetchStrategy === 'smart') {
      smartPrefetch();
    }
  }, [options.aggressivePreload, options.prefetchStrategy]);

  return {
    readyModules,
    getInstantComponent,
    isModuleReady: (moduleName: string) => readyModules.has(moduleName),
    preloadModule: (moduleName: string) => {
      if (!modulePreloadCache.has(moduleName)) {
        const promise = import(`@/components/ai-modules/${moduleName}.tsx`);
        modulePreloadCache.set(moduleName, promise);
        return promise;
      }
      return modulePreloadCache.get(moduleName);
    }
  };
};