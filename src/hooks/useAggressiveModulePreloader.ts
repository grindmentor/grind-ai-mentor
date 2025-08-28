import { useCallback, useRef, useEffect } from 'react';
import { usePerformanceContext } from '@/components/ui/performance-provider';

// Cache for preloaded modules to avoid duplicate loads
const moduleCache = new Map<string, Promise<any>>();
const loadedModules = new Set<string>();

// Module mapping for instant loading
const moduleImports: Record<string, () => Promise<any>> = {
  'coach-gpt': () => import('@/components/ai-modules/CoachGPT'),
  'smart-training': () => import('@/components/ai-modules/SmartTraining'),
  'workout-logger': () => import('@/components/ai-modules/WorkoutLoggerAI'),
  'smart-food-log': () => import('@/components/ai-modules/SmartFoodLog'),
  'blueprint-ai': () => import('@/components/ai-modules/BlueprintAI'),
  'progress-hub': () => import('@/components/ai-modules/ProgressHub'),
  'meal-plan-generator': () => import('@/components/ai-modules/MealPlanAI'),
  'recovery-coach': () => import('@/components/ai-modules/RecoveryCoach'),
  'tdee-calculator': () => import('@/components/ai-modules/TDEECalculator'),
  'cut-calc-pro': () => import('@/components/ai-modules/CutCalcPro'),
  'habit-tracker': () => import('@/components/ai-modules/HabitTracker'),
  'workout-timer': () => import('@/components/ai-modules/WorkoutTimer'),
  'physique-ai': () => import('@/components/ai-modules/ProgressAI'),
};

export const useAggressiveModulePreloader = () => {
  const { optimizedSettings } = usePerformanceContext();
  const interactionTimer = useRef<NodeJS.Timeout>();
  const hoverPreloadRef = useRef<Set<string>>(new Set());

  const preloadModule = useCallback(async (moduleId: string): Promise<boolean> => {
    if (loadedModules.has(moduleId) || optimizedSettings.lowDataMode) {
      return true;
    }

    const moduleImport = moduleImports[moduleId];
    if (!moduleImport) return false;

    // Use cached promise if available
    if (moduleCache.has(moduleId)) {
      try {
        await moduleCache.get(moduleId);
        loadedModules.add(moduleId);
        return true;
      } catch {
        moduleCache.delete(moduleId);
        return false;
      }
    }

    // Create and cache the promise
    const importPromise = moduleImport().then(module => {
      loadedModules.add(moduleId);
      console.log(`[AggressivePreloader] Module ${moduleId} loaded instantly`);
      return module;
    }).catch(error => {
      console.warn(`[AggressivePreloader] Failed to preload ${moduleId}:`, error);
      moduleCache.delete(moduleId);
      throw error;
    });

    moduleCache.set(moduleId, importPromise);
    
    try {
      await importPromise;
      return true;
    } catch {
      return false;
    }
  }, [optimizedSettings.lowDataMode]);

  // Preload on hover with debouncing
  const preloadOnHover = useCallback((moduleId: string) => {
    if (hoverPreloadRef.current.has(moduleId) || optimizedSettings.lowDataMode) {
      return;
    }

    hoverPreloadRef.current.add(moduleId);
    
    // Immediate preload on hover
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadModule(moduleId), { timeout: 100 });
    } else {
      setTimeout(() => preloadModule(moduleId), 10);
    }
  }, [preloadModule, optimizedSettings.lowDataMode]);

  // Preload on interaction patterns
  const preloadOnInteraction = useCallback((moduleId: string) => {
    if (interactionTimer.current) {
      clearTimeout(interactionTimer.current);
    }

    // Predict user intent and preload related modules
    interactionTimer.current = setTimeout(() => {
      const relatedModules = getRelatedModules(moduleId);
      relatedModules.forEach(relatedId => {
        if (!loadedModules.has(relatedId)) {
          preloadModule(relatedId);
        }
      });
    }, 200);
  }, [preloadModule]);

  // Critical modules preload (immediate)
  const preloadCritical = useCallback(() => {
    if (optimizedSettings.lowDataMode) return;

    const criticalModules = ['coach-gpt', 'smart-training', 'workout-logger'];
    
    // Preload critical modules immediately in parallel
    const preloadPromises = criticalModules.map(moduleId => 
      preloadModule(moduleId).catch(() => {}) // Silent fail for critical preload
    );

    return Promise.allSettled(preloadPromises);
  }, [preloadModule, optimizedSettings.lowDataMode]);

  // Background preload of secondary modules
  const preloadSecondary = useCallback(() => {
    if (optimizedSettings.lowDataMode) return;

    const secondaryModules = ['progress-hub', 'smart-food-log', 'blueprint-ai', 'tdee-calculator'];
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        secondaryModules.forEach((moduleId, index) => {
          setTimeout(() => preloadModule(moduleId), index * 100);
        });
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        secondaryModules.forEach((moduleId, index) => {
          setTimeout(() => preloadModule(moduleId), index * 100);
        });
      }, 1000);
    }
  }, [preloadModule, optimizedSettings.lowDataMode]);

  useEffect(() => {
    // Start aggressive preloading immediately
    preloadCritical().then(() => {
      // Then preload secondary modules
      preloadSecondary();
    });
  }, [preloadCritical, preloadSecondary]);

  const isModuleReady = useCallback((moduleId: string): boolean => {
    return loadedModules.has(moduleId);
  }, []);

  const getModuleFromCache = useCallback((moduleId: string) => {
    return moduleCache.get(moduleId);
  }, []);

  return {
    preloadModule,
    preloadOnHover,
    preloadOnInteraction,
    preloadCritical,
    isModuleReady,
    getModuleFromCache,
    loadedModules: Array.from(loadedModules)
  };
};

// Helper function to determine related modules
function getRelatedModules(moduleId: string): string[] {
  const moduleRelations: Record<string, string[]> = {
    'smart-training': ['workout-logger', 'workout-timer', 'recovery-coach'],
    'coach-gpt': ['smart-training', 'progress-hub', 'recovery-coach'],
    'workout-logger': ['smart-training', 'progress-hub', 'workout-timer'],
    'smart-food-log': ['meal-plan-generator', 'tdee-calculator', 'cut-calc-pro'],
    'blueprint-ai': ['smart-training', 'workout-logger', 'progress-hub'],
    'progress-hub': ['physique-ai', 'workout-logger', 'smart-training'],
    'meal-plan-generator': ['smart-food-log', 'tdee-calculator', 'cut-calc-pro'],
    'recovery-coach': ['smart-training', 'habit-tracker', 'progress-hub'],
    'tdee-calculator': ['cut-calc-pro', 'meal-plan-generator', 'smart-food-log'],
    'cut-calc-pro': ['tdee-calculator', 'meal-plan-generator', 'progress-hub'],
    'habit-tracker': ['recovery-coach', 'progress-hub', 'coach-gpt'],
    'workout-timer': ['smart-training', 'workout-logger', 'recovery-coach'],
    'physique-ai': ['progress-hub', 'smart-training', 'coach-gpt'],
  };

  return moduleRelations[moduleId] || [];
}