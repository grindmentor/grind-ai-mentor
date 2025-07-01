
import { useEffect, useCallback, useRef } from 'react';
import { usePerformanceContext } from '@/components/ui/performance-provider';

interface ModulePreloaderOptions {
  modules: string[];
  priority?: 'high' | 'low';
  delay?: number;
}

export const useModulePreloader = (options: ModulePreloaderOptions) => {
  const { modules, priority = 'low', delay = 2000 } = options;
  const { optimizedSettings, prefetchResource } = usePerformanceContext();
  const preloadedRef = useRef<Set<string>>(new Set());

  const preloadModule = useCallback(async (modulePath: string) => {
    if (preloadedRef.current.has(modulePath) || optimizedSettings.lowDataMode) {
      return;
    }

    try {
      // Preload the module component
      prefetchResource(modulePath, 'script');
      preloadedRef.current.add(modulePath);
      
      console.log(`[Preloader] Preloaded module: ${modulePath}`);
    } catch (error) {
      console.warn(`[Preloader] Failed to preload ${modulePath}:`, error);
    }
  }, [optimizedSettings.lowDataMode, prefetchResource]);

  const preloadModules = useCallback(async () => {
    if (optimizedSettings.lowDataMode) return;

    const preloadPromises = modules.map(module => preloadModule(module));
    
    if (priority === 'high') {
      await Promise.all(preloadPromises);
    } else {
      // Low priority - preload one by one with delays
      for (const promise of preloadPromises) {
        await promise;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [modules, priority, preloadModule, optimizedSettings.lowDataMode]);

  useEffect(() => {
    if (modules.length === 0) return;

    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => preloadModules(), { timeout: 5000 });
      } else {
        preloadModules();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [modules, delay, preloadModules]);

  return {
    preloadModule,
    preloadedModules: Array.from(preloadedRef.current)
  };
};
