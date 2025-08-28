import { useEffect } from 'react';

// Component preloading configuration
const CRITICAL_COMPONENTS = [
  () => import('@/components/Dashboard'),
  () => import('@/components/ai-modules/CoachGPT'),
  () => import('@/components/ai-modules/SmartTraining'),
  () => import('@/components/ai-modules/WorkoutLoggerAI'),
  () => import('@/components/ai-modules/ProgressHub'),
  () => import('@/components/ai-modules/SmartFoodLog'),
  () => import('@/components/ai-modules/PhysiqueAI'),
  () => import('@/components/ai-modules/TDEECalculator'),
  () => import('@/pages/Settings'),
  () => import('@/pages/Profile')
];

const SECONDARY_COMPONENTS = [
  () => import('@/components/ai-modules/MealPlanAI'),
  () => import('@/components/ai-modules/RecoveryCoachAI'),
  () => import('@/components/ai-modules/WorkoutTimer'),
  () => import('@/components/ai-modules/HabitTracker'),
  () => import('@/components/ai-modules/CutCalcPro'),
  () => import('@/components/ai-modules/WorkoutScheduler'),
  () => import('@/pages/ModuleLibrary')
];

export const usePreloadComponents = () => {
  useEffect(() => {
    // Preload critical components immediately
    const preloadCritical = async () => {
      for (const importFn of CRITICAL_COMPONENTS) {
        try {
          await importFn();
        } catch (error) {
          console.warn('Failed to preload critical component:', error);
        }
      }
    };

    // Preload secondary components when idle
    const preloadSecondary = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(async () => {
          for (const importFn of SECONDARY_COMPONENTS) {
            try {
              await importFn();
            } catch (error) {
              console.warn('Failed to preload secondary component:', error);
            }
          }
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(async () => {
          for (const importFn of SECONDARY_COMPONENTS) {
            try {
              await importFn();
            } catch (error) {
              console.warn('Failed to preload secondary component:', error);
            }
          }
        }, 1000);
      }
    };

    // Start preloading
    preloadCritical();
    preloadSecondary();
  }, []);
};

// Hook for preloading specific modules
export const useModulePreloader = () => {
  const preloadModule = async (moduleId: string) => {
    const moduleMap: Record<string, () => Promise<any>> = {
      'coach-gpt': () => import('@/components/ai-modules/CoachGPT'),
      'smart-training': () => import('@/components/ai-modules/SmartTraining'),
      'workout-logger': () => import('@/components/ai-modules/WorkoutLoggerAI'),
      'progress-hub': () => import('@/components/ai-modules/ProgressHub'),
      'smart-food-log': () => import('@/components/ai-modules/SmartFoodLog'),
      'physique-ai': () => import('@/components/ai-modules/PhysiqueAI'),
      'tdee-calculator': () => import('@/components/ai-modules/TDEECalculator'),
      'meal-plan-generator': () => import('@/components/ai-modules/MealPlanAI'),
      'recovery-coach': () => import('@/components/ai-modules/RecoveryCoach'),
      'workout-timer': () => import('@/components/ai-modules/WorkoutTimer'),
      'habit-tracker': () => import('@/components/ai-modules/HabitTracker'),
      'cut-calc-pro': () => import('@/components/ai-modules/CutCalcPro'),
      'workout-scheduler': () => import('@/components/ai-modules/WorkoutScheduler')
    };

    const importFn = moduleMap[moduleId];
    if (importFn) {
      try {
        await importFn();
        console.log(`Preloaded module: ${moduleId}`);
      } catch (error) {
        console.warn(`Failed to preload module ${moduleId}:`, error);
      }
    }
  };

  return { preloadModule };
};