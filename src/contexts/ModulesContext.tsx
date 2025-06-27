
import React, { createContext, useContext } from 'react';
import { Activity, BarChart3, BookOpen, ChefHat, Flame, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Pizza, Speaker, TrendingUp } from 'lucide-react';

type ModuleId =
  | 'dashboard'
  | 'smart-training'
  | 'coach-gpt'
  | 'tdee-calculator'
  | 'meal-plan-generator'
  | 'recovery-coach'
  | 'workout-logger'
  | 'food-photo-logger'
  | 'exercise-database'
  | 'supplement-assistant'
  | 'progress-hub';

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  gradient: string;
  usageKey: string;
  isPremium: boolean;
  isNew: boolean;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

// Simple placeholder component for modules
const PlaceholderComponent = ({ title, onBack }: { title?: string; onBack?: () => void }) => (
  <div className="p-6 text-center text-white">
    <h2 className="text-2xl font-bold mb-4">{title || 'Module'}</h2>
    <p className="text-gray-400">This module is loading...</p>
    {onBack && (
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
        Back
      </button>
    )}
  </div>
);

// Safe component loader that won't crash the app
const SafeComponent = ({ moduleName, onBack, onFoodLogged }: { 
  moduleName: string; 
  onBack?: () => void;
  onFoodLogged?: (data: any) => void;
}) => {
  try {
    // Dynamically import components with error handling
    switch (moduleName) {
      case 'smart-training':
        const SmartTraining = React.lazy(() => 
          import('@/components/ai-modules/SmartTraining').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Smart Training" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Smart Training" onBack={onBack} />}><SmartTraining onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'coach-gpt':
        const CoachGPT = React.lazy(() => 
          import('@/components/ai-modules/CoachGPT').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Coach GPT" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Coach GPT" onBack={onBack} />}><CoachGPT onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'tdee-calculator':
        const TDEECalculator = React.lazy(() => 
          import('@/components/ai-modules/TDEECalculator').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="TDEE Calculator" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="TDEE Calculator" onBack={onBack} />}><TDEECalculator onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'meal-plan-generator':
        const MealPlanAI = React.lazy(() => 
          import('@/components/ai-modules/MealPlanAI').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Meal Plan Generator" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Meal Plan Generator" onBack={onBack} />}><MealPlanAI onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'recovery-coach':
        const RecoveryCoach = React.lazy(() => 
          import('@/components/ai-modules/RecoveryCoach').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Recovery Coach" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Recovery Coach" onBack={onBack} />}><RecoveryCoach onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'workout-logger':
        const WorkoutLoggerAI = React.lazy(() => 
          import('@/components/ai-modules/WorkoutLoggerAI').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Workout Logger" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Workout Logger" onBack={onBack} />}><WorkoutLoggerAI onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'food-photo-logger':
        const FoodPhotoLogger = React.lazy(() => 
          import('@/components/ai-modules/FoodPhotoLogger').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Food Photo Logger" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Food Photo Logger" onBack={onBack} />}><FoodPhotoLogger onBack={onBack || (() => {})} onFoodLogged={onFoodLogged || (() => {})} /></React.Suspense>;
      
      case 'exercise-database':
        const WorkoutLibrary = React.lazy(() => 
          import('@/components/ai-modules/WorkoutLibrary').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Exercise Database" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Exercise Database" onBack={onBack} />}><WorkoutLibrary onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'progress-hub':
        const ProgressHub = React.lazy(() => 
          import('@/components/ai-modules/ProgressHub').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Progress Hub" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Progress Hub" onBack={onBack} />}><ProgressHub onBack={onBack || (() => {})} /></React.Suspense>;
      
      default:
        return <PlaceholderComponent title={moduleName} onBack={onBack} />;
    }
  } catch (error) {
    console.error(`Error loading module ${moduleName}:`, error);
    return <PlaceholderComponent title={moduleName} onBack={onBack} />;
  }
};

const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules: Module[] = [
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered workout recommendations',
      icon: Flame,
      component: (props: any) => <SafeComponent moduleName="smart-training" {...props} />,
      gradient: 'from-red-500 to-pink-500',
      usageKey: 'smart_training',
      isPremium: false,
      isNew: false
    },
    {
      id: 'coach-gpt',
      title: 'Coach GPT',
      description: 'Your AI fitness coach',
      icon: MessageSquare,
      component: (props: any) => <SafeComponent moduleName="coach-gpt" {...props} />,
      gradient: 'from-green-500 to-emerald-500',
      usageKey: 'coach_gpt',
      isPremium: false,
      isNew: false
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure',
      icon: BarChart3,
      component: (props: any) => <SafeComponent moduleName="tdee-calculator" {...props} />,
      gradient: 'from-blue-500 to-cyan-500',
      usageKey: 'tdee_calculator',
      isPremium: false,
      isNew: false
    },
    {
      id: 'meal-plan-generator',
      title: 'Meal Plan Generator',
      description: 'Generate personalized meal plans',
      icon: ChefHat,
      component: (props: any) => <SafeComponent moduleName="meal-plan-generator" {...props} />,
      gradient: 'from-yellow-500 to-orange-500',
      usageKey: 'meal_plan_generator',
      isPremium: true,
      isNew: false
    },
    {
      id: 'recovery-coach',
      title: 'Recovery Coach',
      description: 'Optimize your recovery with AI guidance',
      icon: Activity,
      component: (props: any) => <SafeComponent moduleName="recovery-coach" {...props} />,
      gradient: 'from-teal-500 to-green-500',
      usageKey: 'recovery_coach',
      isPremium: true,
      isNew: false
    },
    {
      id: 'workout-logger',
      title: 'Workout Logger',
      description: 'Log and track your workouts',
      icon: ListChecks,
      component: (props: any) => <SafeComponent moduleName="workout-logger" {...props} />,
      gradient: 'from-purple-500 to-indigo-500',
      usageKey: 'workout_logger',
      isPremium: false,
      isNew: false
    },
    {
      id: 'food-photo-logger',
      title: 'Food Photo Logger',
      description: 'Log your meals with photos',
      icon: Pizza,
      component: (props: any) => <SafeComponent moduleName="food-photo-logger" {...props} />,
      gradient: 'from-orange-500 to-amber-500',
      usageKey: 'food_photo_logger',
      isPremium: true,
      isNew: false
    },
    {
      id: 'exercise-database',
      title: 'Exercise Database',
      description: 'Browse a comprehensive exercise library',
      icon: BookOpen,
      component: (props: any) => <SafeComponent moduleName="exercise-database" {...props} />,
      gradient: 'from-slate-500 to-gray-500',
      usageKey: 'exercise_database',
      isPremium: false,
      isNew: false
    },
    {
      id: 'supplement-assistant',
      title: 'Supplement Assistant',
      description: 'Get AI-powered supplement recommendations',
      icon: Speaker,
      component: (props: any) => <PlaceholderComponent title="Supplement Assistant" {...props} />,
      gradient: 'from-stone-500 to-zinc-500',
      usageKey: 'supplement_assistant',
      isPremium: true,
      isNew: false
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Track your fitness progress with detailed measurements and analytics',
      icon: TrendingUp,
      component: (props: any) => <SafeComponent moduleName="progress-hub" {...props} />,
      gradient: 'from-blue-500 to-blue-700',
      usageKey: 'progress_tracking',
      isPremium: false,
      isNew: false
    }
  ];

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export default ModulesProvider;
