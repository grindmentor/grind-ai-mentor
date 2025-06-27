
import React, { createContext, useContext } from 'react';
import { Activity, BarChart3, BookOpen, ChefHat, Flame, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Pizza, TrendingUp, Dumbbell, Camera, Timer, Target, Zap, NotebookPen, Eye } from 'lucide-react';

type ModuleId =
  | 'dashboard'
  | 'smart-training'
  | 'coach-gpt'
  | 'tdee-calculator'
  | 'meal-plan-generator'
  | 'recovery-coach'
  | 'workout-logger'
  | 'smart-food-log'
  | 'workout-library'
  | 'progress-hub'
  | 'workout-timer'
  | 'cut-calc-pro'
  | 'habit-tracker'
  | 'physique-ai';

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
      
      case 'smart-food-log':
        const SmartFoodLog = React.lazy(() => 
          import('@/components/ai-modules/SmartFoodLog').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Smart Food Log" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Smart Food Log" onBack={onBack} />}><SmartFoodLog onBack={onBack || (() => {})} onFoodLogged={onFoodLogged || (() => {})} /></React.Suspense>;
      
      case 'workout-library':
        const WorkoutLibrary = React.lazy(() => 
          import('@/components/ai-modules/WorkoutLibrary').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Workout Library" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Workout Library" onBack={onBack} />}><WorkoutLibrary onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'progress-hub':
        const ProgressHub = React.lazy(() => 
          import('@/components/ai-modules/ProgressHub').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Progress Hub" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Progress Hub" onBack={onBack} />}><ProgressHub onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'workout-timer':
        const WorkoutTimer = React.lazy(() => 
          import('@/components/ai-modules/WorkoutTimer').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Workout Timer" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Workout Timer" onBack={onBack} />}><WorkoutTimer onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'cut-calc-pro':
        const CutCalcPro = React.lazy(() => 
          import('@/components/ai-modules/CutCalcPro').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="CutCalc Pro" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="CutCalc Pro" onBack={onBack} />}><CutCalcPro onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'habit-tracker':
        const HabitTracker = React.lazy(() => 
          import('@/components/ai-modules/HabitTracker').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Habit Tracker" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Habit Tracker" onBack={onBack} />}><HabitTracker onBack={onBack || (() => {})} /></React.Suspense>;
      
      case 'physique-ai':
        const PhysiqueAI = React.lazy(() => 
          import('@/components/ai-modules/ProgressAI').catch(() => 
            ({ default: (props: any) => <PlaceholderComponent title="Physique AI" {...props} /> })
          )
        );
        return <React.Suspense fallback={<PlaceholderComponent title="Physique AI" onBack={onBack} />}><PhysiqueAI onBack={onBack || (() => {})} /></React.Suspense>;
      
      default:
        return <PlaceholderComponent title={moduleName} onBack={onBack} />;
    }
  } catch (error) {
    console.error(`Error loading module ${moduleName}:`, error);
    return <PlaceholderComponent title={moduleName} onBack={onBack} />;
  }
};

export const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules: Module[] = [
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered workout recommendations with scientific backing',
      icon: Flame,
      component: (props: any) => <SafeComponent moduleName="smart-training" {...props} />,
      gradient: 'bg-gradient-to-br from-red-500 to-pink-500',
      usageKey: 'smart_training',
      isPremium: true,
      isNew: false
    },
    {
      id: 'coach-gpt',
      title: 'Coach GPT',
      description: 'Your AI fitness coach with research-based guidance',
      icon: MessageSquare,
      component: (props: any) => <SafeComponent moduleName="coach-gpt" {...props} />,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
      usageKey: 'coach_gpt',
      isPremium: false,
      isNew: false
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure scientifically',
      icon: BarChart3,
      component: (props: any) => <SafeComponent moduleName="tdee-calculator" {...props} />,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      usageKey: 'tdee_calculator',
      isPremium: false,
      isNew: false
    },
    {
      id: 'cut-calc-pro',
      title: 'CutCalc Pro',
      description: 'Advanced cutting calculator with comprehensive analysis',
      icon: Target,
      component: (props: any) => <SafeComponent moduleName="cut-calc-pro" {...props} />,
      gradient: 'bg-gradient-to-br from-red-500 to-red-700',
      usageKey: 'cut_calc_pro',
      isPremium: false,
      isNew: false
    },
    {
      id: 'meal-plan-generator',
      title: 'Meal Plan Generator',
      description: 'Generate personalized, science-based meal plans',
      icon: ChefHat,
      component: (props: any) => <SafeComponent moduleName="meal-plan-generator" {...props} />,
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      usageKey: 'meal_plan_generator',
      isPremium: true,
      isNew: false
    },
    {
      id: 'smart-food-log',
      title: 'Smart Food Log',
      description: 'AI-powered food logging with photo analysis and nutrition tracking',
      icon: Pizza,
      component: (props: any) => <SafeComponent moduleName="smart-food-log" {...props} />,
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-500',
      usageKey: 'smart_food_log',
      isPremium: false,
      isNew: false
    },
    {
      id: 'recovery-coach',
      title: 'Recovery Coach',
      description: 'Optimize your recovery with AI guidance and research',
      icon: Activity,
      component: (props: any) => <SafeComponent moduleName="recovery-coach" {...props} />,
      gradient: 'bg-gradient-to-br from-teal-500 to-green-500',
      usageKey: 'recovery_coach',
      isPremium: false,
      isNew: false
    },
    {
      id: 'workout-logger',
      title: 'Workout Logger',
      description: 'Log and track your workouts with intelligent insights',
      icon: NotebookPen,
      component: (props: any) => <SafeComponent moduleName="workout-logger" {...props} />,
      gradient: 'bg-gradient-to-br from-indigo-500 to-violet-500',
      usageKey: 'workout_logger',
      isPremium: false,
      isNew: false
    },
    {
      id: 'workout-timer',
      title: 'Workout Timer',
      description: 'Time your workouts with smart rest period recommendations',
      icon: Timer,
      component: (props: any) => <SafeComponent moduleName="workout-timer" {...props} />,
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      usageKey: 'workout_timer',
      isPremium: false,
      isNew: false
    },
    {
      id: 'workout-library',
      title: 'Workout Library',
      description: 'AI-powered exercise database with personalized recommendations',
      icon: BookOpen,
      component: (props: any) => <SafeComponent moduleName="workout-library" {...props} />,
      gradient: 'bg-gradient-to-br from-slate-500 to-gray-500',
      usageKey: 'workout_library',
      isPremium: false,
      isNew: false
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build lasting fitness habits with behavioral science',
      icon: Zap,
      component: (props: any) => <SafeComponent moduleName="habit-tracker" {...props} />,
      gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
      usageKey: 'habit_tracker',
      isPremium: false,
      isNew: false
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'AI-powered physique analysis and progress tracking with visual insights',
      icon: Eye,
      component: (props: any) => <SafeComponent moduleName="physique-ai" {...props} />,
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      usageKey: 'progress_analyses',
      isPremium: true,
      isNew: false
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Track your fitness progress with detailed measurements and analytics',
      icon: TrendingUp,
      component: (props: any) => <SafeComponent moduleName="progress-hub" {...props} />,
      gradient: 'bg-gradient-to-br from-purple-800 to-purple-900',
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
