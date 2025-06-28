import React, { createContext, useContext } from 'react';
import { Activity, BarChart3, BookOpen, ChefHat, Flame, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Pizza, TrendingUp, Timer, Target, Zap, NotebookPen, Eye } from 'lucide-react';
import ModuleErrorBoundary from '@/components/ModuleErrorBoundary';

type ModuleId =
  | 'dashboard'
  | 'smart-training'
  | 'coach-gpt'
  | 'tdee-calculator'
  | 'meal-plan-generator'
  | 'recovery-coach'
  | 'workout-logger'
  | 'smart-food-log'
  | 'progress-hub'
  | 'workout-timer'
  | 'cut-calc-pro'
  | 'habit-tracker'
  | 'physique-ai'
  | 'blueprint-ai';

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

// Enhanced placeholder component with better loading states
const PlaceholderComponent = ({ title, onBack }: { title?: string; onBack?: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold mb-4">{title || 'Module'}</h2>
      <p className="text-gray-400 mb-6">This module is loading...</p>
      {onBack && (
        <button 
          onClick={onBack} 
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      )}
    </div>
  </div>
);

// Enhanced safe component loader with better error handling and logging
const SafeComponent = ({ moduleName, onBack }: { 
  moduleName: string; 
  onBack?: () => void;
}) => {
  console.log(`Loading module: ${moduleName}`);
  
  try {
    // Dynamically import components with enhanced error handling
    switch (moduleName) {
      case 'blueprint-ai':
        const BlueprintAI = React.lazy(() => 
          import('@/components/ai-modules/BlueprintAI')
            .then(module => {
              console.log(`Successfully loaded BlueprintAI module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load BlueprintAI module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Blueprint AI" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Blueprint AI" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Blueprint AI" onBack={onBack} />}>
              <BlueprintAI onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'smart-training':
        const SmartTraining = React.lazy(() => 
          import('@/components/ai-modules/SmartTraining')
            .then(module => {
              console.log(`Successfully loaded SmartTraining module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load SmartTraining module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Smart Training" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Smart Training" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Smart Training" onBack={onBack} />}>
              <SmartTraining onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );

      
      case 'coach-gpt':
        const CoachGPT = React.lazy(() => 
          import('@/components/ai-modules/CoachGPT')
            .then(module => {
              console.log(`Successfully loaded CoachGPT module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load CoachGPT module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Coach GPT" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Coach GPT" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Coach GPT" onBack={onBack} />}>
              <CoachGPT onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'tdee-calculator':
        const TDEECalculator = React.lazy(() => 
          import('@/components/ai-modules/TDEECalculator')
            .then(module => {
              console.log(`Successfully loaded TDEECalculator module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load TDEECalculator module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="TDEE Calculator" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="TDEE Calculator" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="TDEE Calculator" onBack={onBack} />}>
              <TDEECalculator onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'meal-plan-generator':
        const MealPlanAI = React.lazy(() => 
          import('@/components/ai-modules/MealPlanAI')
            .then(module => {
              console.log(`Successfully loaded MealPlanAI module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load MealPlanAI module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Meal Plan Generator" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Meal Plan Generator" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Meal Plan Generator" onBack={onBack} />}>
              <MealPlanAI onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'recovery-coach':
        const RecoveryCoach = React.lazy(() => 
          import('@/components/ai-modules/RecoveryCoach')
            .then(module => {
              console.log(`Successfully loaded RecoveryCoach module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load RecoveryCoach module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Recovery Coach" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Recovery Coach" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Recovery Coach" onBack={onBack} />}>
              <RecoveryCoach onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'workout-logger':
        const WorkoutLoggerAI = React.lazy(() => 
          import('@/components/ai-modules/WorkoutLoggerAI')
            .then(module => {
              console.log(`Successfully loaded WorkoutLoggerAI module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load WorkoutLoggerAI module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Workout Logger" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Workout Logger" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Workout Logger" onBack={onBack} />}>
              <WorkoutLoggerAI onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'smart-food-log':
        const SmartFoodLog = React.lazy(() => 
          import('@/components/ai-modules/SmartFoodLog')
            .then(module => {
              console.log(`Successfully loaded SmartFoodLog module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load SmartFoodLog module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Smart Food Log" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Smart Food Log" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Smart Food Log" onBack={onBack} />}>
              <SmartFoodLog onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'progress-hub':
        const ProgressHub = React.lazy(() => 
          import('@/components/ai-modules/ProgressHub')
            .then(module => {
              console.log(`Successfully loaded ProgressHub module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load ProgressHub module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Progress Hub" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Progress Hub" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Progress Hub" onBack={onBack} />}>
              <ProgressHub />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'workout-timer':
        const WorkoutTimer = React.lazy(() => 
          import('@/components/ai-modules/WorkoutTimer')
            .then(module => {
              console.log(`Successfully loaded WorkoutTimer module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load WorkoutTimer module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Workout Timer" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Workout Timer" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Workout Timer" onBack={onBack} />}>
              <WorkoutTimer onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'cut-calc-pro':
        const CutCalcPro = React.lazy(() => 
          import('@/components/ai-modules/CutCalcPro')
            .then(module => {
              console.log(`Successfully loaded CutCalcPro module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load CutCalcPro module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="CutCalc Pro" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="CutCalc Pro" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="CutCalc Pro" onBack={onBack} />}>
              <CutCalcPro onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'habit-tracker':
        const HabitTracker = React.lazy(() => 
          import('@/components/ai-modules/HabitTracker')
            .then(module => {
              console.log(`Successfully loaded HabitTracker module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load HabitTracker module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Habit Tracker" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Habit Tracker" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Habit Tracker" onBack={onBack} />}>
              <HabitTracker onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      case 'physique-ai':
        const PhysiqueAI = React.lazy(() => 
          import('@/components/ai-modules/ProgressAI')
            .then(module => {
              console.log(`Successfully loaded PhysiqueAI module`);
              return module;
            })
            .catch(error => {
              console.error(`Failed to load PhysiqueAI module:`, error);
              return { default: (props: any) => <PlaceholderComponent title="Physique AI" {...props} /> };
            })
        );
        return (
          <ModuleErrorBoundary moduleName="Physique AI" onBack={onBack}>
            <React.Suspense fallback={<PlaceholderComponent title="Physique AI" onBack={onBack} />}>
              <PhysiqueAI onBack={onBack || (() => {})} />
            </React.Suspense>
          </ModuleErrorBoundary>
        );
      
      default:
        console.warn(`Unknown module: ${moduleName}`);
        return (
          <ModuleErrorBoundary moduleName={moduleName} onBack={onBack}>
            <PlaceholderComponent title={moduleName} onBack={onBack} />
          </ModuleErrorBoundary>
        );
    }
  } catch (error) {
    console.error(`Critical error loading module ${moduleName}:`, error);
    return (
      <ModuleErrorBoundary moduleName={moduleName} onBack={onBack}>
        <PlaceholderComponent title={moduleName} onBack={onBack} />
      </ModuleErrorBoundary>
    );
  }
};

const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules: Module[] = [
    {
      id: 'blueprint-ai',
      title: 'Blueprint AI',
      description: 'Your intelligent session planner and workout archive with science-backed programs',
      icon: Target,
      component: (props: any) => <SafeComponent moduleName="blueprint-ai" {...props} />,
      gradient: 'from-cyan-500 to-blue-500',
      usageKey: 'training_programs',
      isPremium: false,
      isNew: true
    },
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered workout recommendations with scientific backing',
      icon: Flame,
      component: (props: any) => <SafeComponent moduleName="smart-training" {...props} />,
      gradient: 'from-red-500 to-pink-500',
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
      gradient: 'from-green-500 to-emerald-500',
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
      gradient: 'from-blue-500 to-cyan-500',
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
      gradient: 'from-red-500 to-red-700',
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
      gradient: 'from-yellow-500 to-orange-500',
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
      gradient: 'from-orange-500 to-amber-500',
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
      gradient: 'from-teal-500 to-green-500',
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
      gradient: 'from-indigo-500 to-violet-500',
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
      gradient: 'from-cyan-500 to-blue-500',
      usageKey: 'workout_timer',
      isPremium: false,
      isNew: false
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build lasting fitness habits with behavioral science',
      icon: Zap,
      component: (props: any) => <SafeComponent moduleName="habit-tracker" {...props} />,
      gradient: 'from-yellow-500 to-yellow-700',
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
      gradient: 'from-purple-500 to-indigo-500',
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
      gradient: 'from-purple-800 to-purple-900',
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
