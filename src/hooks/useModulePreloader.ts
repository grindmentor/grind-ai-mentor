
import { useEffect, useCallback, useRef } from 'react';
import { usePerformanceContext } from '@/components/ui/performance-provider';

// Common module imports for preloading
const moduleImports: Record<string, () => Promise<any>> = {
  'coach-gpt': () => import('@/components/ai-modules/CoachGPT'),
  'smart-training': () => import('@/components/ai-modules/SmartTraining'),
  'workout-logger': () => import('@/components/ai-modules/WorkoutLoggerAI'),
  'smart-food-log': () => import('@/components/ai-modules/SmartFoodLog'),
  'blueprint-ai': () => import('@/components/ai-modules/BlueprintAI'),
  'progress-hub': () => import('@/components/ai-modules/ProgressHub'),
  'meal-plan-ai': () => import('@/components/ai-modules/MealPlanAI'),
  'recovery-coach': () => import('@/components/ai-modules/RecoveryCoach'),
  'fridge-scan': () => import('@/components/ai-modules/FridgeScan'),
};

export const useModulePreloader = () => {
  const { optimizedSettings } = usePerformanceContext();
  const preloadedModules = useRef<Set<string>>(new Set());

  const preloadModule = useCallback(async (moduleId: string) => {
    if (preloadedModules.current.has(moduleId) || optimizedSettings.lowDataMode) {
      return;
    }

    const moduleImport = moduleImports[moduleId];
    if (moduleImport) {
      try {
        await moduleImport();
        preloadedModules.current.add(moduleId);
        console.log(`[Preloader] Module ${moduleId} preloaded`);
      } catch (error) {
        console.warn(`[Preloader] Failed to preload ${moduleId}:`, error);
      }
    }
  }, [optimizedSettings.lowDataMode]);

  const preloadCritical = useCallback(() => {
    if (optimizedSettings.lowDataMode) return;

    // Preload most commonly used modules
    const criticalModules = ['coach-gpt', 'smart-training', 'workout-logger', 'progress-hub'];
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        criticalModules.forEach((moduleId, index) => {
          setTimeout(() => preloadModule(moduleId), index * 200);
        });
      });
    } else {
      setTimeout(() => {
        criticalModules.forEach((moduleId, index) => {
          setTimeout(() => preloadModule(moduleId), index * 200);
        });
      }, 1000);
    }
  }, [preloadModule, optimizedSettings.lowDataMode]);

  useEffect(() => {
    preloadCritical();
  }, [preloadCritical]);

  return { preloadModule, preloadedModules: preloadedModules.current };
};
