import React, { Suspense, lazy } from 'react';
import ModuleErrorBoundary from '@/components/ModuleErrorBoundary';

interface ModuleLoaderProps {
  moduleId: string;
  moduleTitle?: string;
  onBack?: () => void;
  [key: string]: any;
}

const Loader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">Loading {title}...</p>
    </div>
  </div>
);

const moduleMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'blueprint-ai': lazy(() => import('@/components/ai-modules/BlueprintAI')),
  'smart-training': lazy(() => import('@/components/ai-modules/SmartTraining')),
  'coach-gpt': lazy(() => import('@/components/ai-modules/CoachGPT')),
  'tdee-calculator': lazy(() => import('@/components/ai-modules/TDEECalculator')),
  'meal-plan-generator': lazy(() => import('@/components/ai-modules/MealPlanAI')),
  'smart-food-log': lazy(() => import('@/components/ai-modules/SmartFoodLog')),
  'workout-logger': lazy(() => import('@/components/ai-modules/WorkoutLoggerAI')),
  'progress-hub': lazy(() => import('@/components/ai-modules/ProgressHub')),
  'recovery-coach': lazy(() => import('@/components/ai-modules/RecoveryCoach')),
  'workout-timer': lazy(() => import('@/components/ai-modules/WorkoutTimer')),
  'cut-calc-pro': lazy(() => import('@/components/ai-modules/CutCalcPro')),
  'habit-tracker': lazy(() => import('@/components/ai-modules/HabitTracker')),
  'physique-ai': lazy(() => import('@/components/ai-modules/PhysiqueAI')),
};

const ModuleLoader: React.FC<ModuleLoaderProps> = ({ moduleId, moduleTitle, onBack, ...rest }) => {
  const LazyComp = moduleMap[moduleId];

  if (!LazyComp) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Unknown Module</h3>
          <p className="text-muted-foreground">No module found for id: {moduleId}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader title={moduleTitle || moduleId} />}>
      <ModuleErrorBoundary moduleName={moduleTitle || moduleId} onBack={onBack}>
        <LazyComp onBack={onBack} {...rest} />
      </ModuleErrorBoundary>
    </Suspense>
  );
};

export default ModuleLoader;
