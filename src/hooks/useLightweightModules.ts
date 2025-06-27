import { useState, useEffect, useCallback } from 'react';
import { usePerformanceOptimizer } from './usePerformanceOptimizer';
import { Module } from '@/contexts/ModulesContext';

// Minimal module cache
const componentCache = new Map<string, React.ComponentType<any>>();
const loadingStates = new Set<string>();

export const useLightweightModules = () => {
  const { metrics } = usePerformanceOptimizer();
  const [loadedModules, setLoadedModules] = useState<Map<string, React.ComponentType<any>>>(new Map());

  // Lazy load module component only when needed
  const loadModule = useCallback(async (moduleId: string, moduleComponent: React.ComponentType<any>) => {
    if (componentCache.has(moduleId)) {
      return componentCache.get(moduleId)!;
    }

    if (loadingStates.has(moduleId)) {
      // Wait for existing load to complete
      while (loadingStates.has(moduleId)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return componentCache.get(moduleId)!;
    }

    try {
      loadingStates.add(moduleId);
      
      componentCache.set(moduleId, moduleComponent);
      setLoadedModules(prev => new Map(prev).set(moduleId, moduleComponent));
      
      return moduleComponent;
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error);
      throw error;
    } finally {
      loadingStates.delete(moduleId);
    }
  }, []);

  // Preload critical modules based on device capability
  const preloadCriticalModules = useCallback(async (modules: Module[]) => {
    if (metrics.isLowPowerMode) return; // Skip preloading on low-power devices
    
    const criticalModules = modules.slice(0, 3); // Only preload first 3
    
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        criticalModules.forEach(module => {
          if (!componentCache.has(module.id)) {
            loadModule(module.id, module.component).catch(() => {
              // Fail silently for preloading
            });
          }
        });
      });
    }
  }, [metrics.isLowPowerMode, loadModule]);

  // Memory cleanup
  useEffect(() => {
    const cleanup = () => {
      // Keep only recently used modules in cache
      if (componentCache.size > 5) {
        const entries = Array.from(componentCache.entries());
        const toKeep = entries.slice(-3); // Keep last 3
        componentCache.clear();
        toKeep.forEach(([key, value]) => componentCache.set(key, value));
      }
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return {
    loadModule,
    preloadCriticalModules,
    loadedModules,
    isLowPowerMode: metrics.isLowPowerMode
  };
};
