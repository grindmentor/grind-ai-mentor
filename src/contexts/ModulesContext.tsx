import React, { createContext, useContext } from 'react';
import { Activity, BarChart3, BookOpen, ChefHat, Flame, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Pizza, TrendingUp, Timer, Target, Zap, NotebookPen, Eye } from 'lucide-react';
import ModuleLoader from '@/components/modules/ModuleLoader';

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

// Simple loading component
const SimpleLoader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">Loading {title}...</p>
    </div>
  </div>
);

// Fixed component that avoids the "rendered fewer hooks" error
const SafeComponent = ({ moduleName, onBack, ...props }: { moduleName: string; onBack?: () => void }) => {
  // Always call hooks in the same order, regardless of state
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    
    const loadModule = async () => {
      try {
        setLoading(true);
        setError(null);

        let moduleImport;
        switch (moduleName) {
          case 'blueprint-ai':
            moduleImport = await import('@/components/ai-modules/BlueprintAI');
            break;
          case 'smart-training':
            moduleImport = await import('@/components/ai-modules/SmartTraining');
            break;
          case 'coach-gpt':
            moduleImport = await import('@/components/ai-modules/CoachGPT');
            break;
          case 'tdee-calculator':
            moduleImport = await import('@/components/ai-modules/TDEECalculator');
            break;
          case 'meal-plan-generator':
            moduleImport = await import('@/components/ai-modules/MealPlanAI');
            break;
          case 'smart-food-log':
            moduleImport = await import('@/components/ai-modules/SmartFoodLog');
            break;
          case 'workout-logger':
            moduleImport = await import('@/components/ai-modules/WorkoutLoggerAI');
            break;
          case 'progress-hub':
            moduleImport = await import('@/components/ai-modules/ProgressHub');
            break;
          case 'recovery-coach':
            moduleImport = await import('@/components/ai-modules/RecoveryCoach');
            break;
          case 'workout-timer':
            moduleImport = await import('@/components/ai-modules/WorkoutTimer');
            break;
          case 'cut-calc-pro':
            moduleImport = await import('@/components/ai-modules/CutCalcPro');
            break;
          case 'habit-tracker':
            moduleImport = await import('@/components/ai-modules/HabitTracker');
            break;
          case 'physique-ai':
            moduleImport = await import('@/components/ai-modules/PhysiqueAI');
            break;
          default:
            throw new Error(`Unknown module: ${moduleName}`);
        }

        if (mounted && moduleImport?.default) {
          setComponent(() => moduleImport.default);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load module ${moduleName}:`, err);
        if (mounted) {
          setError(`Failed to load ${moduleName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    loadModule();
    return () => { mounted = false; };
  }, [moduleName]);

  // Always render the same component structure to avoid hook count changes
  return (
    <React.Fragment>
      {loading ? (
        <SimpleLoader title={moduleName} />
      ) : error || !Component ? (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Module Error</h3>
              <p className="text-muted-foreground">{error || 'Module failed to load'}</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <Component onBack={onBack} {...props} />
      )}
    </React.Fragment>
  );
};

const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules: Module[] = [
    {
      id: 'blueprint-ai',
      title: 'Blueprint AI',
      description: 'Your intelligent session planner and workout archive with science-backed programs',
      icon: Target,
      component: (props: any) => <ModuleLoader moduleId="blueprint-ai" moduleTitle="Blueprint AI" {...props} />,
      gradient: 'from-cyan-500 to-blue-500',
      usageKey: 'training_programs',
      isPremium: false,
      isNew: true
    },
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered workout generator with advanced progressive overload tracking',
      icon: Activity,
      component: (props: any) => <ModuleLoader moduleId="smart-training" moduleTitle="Smart Training" {...props} />,
      gradient: 'from-green-500 to-emerald-500',
      usageKey: 'workout_generations',
      isPremium: false,
      isNew: false
    },
    {
      id: 'coach-gpt',
      title: 'CoachGPT',
      description: 'Your personal AI fitness coach for questions, form tips, and expert guidance',
      icon: MessageSquare,
      component: (props: any) => <ModuleLoader moduleId="coach-gpt" moduleTitle="CoachGPT" {...props} />,
      gradient: 'from-purple-500 to-indigo-500',
      usageKey: 'ai_conversations',
      isPremium: false,
      isNew: false
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure with precision and science',
      icon: Flame,
      component: (props: any) => <ModuleLoader moduleId="tdee-calculator" moduleTitle="TDEE Calculator" {...props} />,
      gradient: 'from-red-500 to-orange-500',
      usageKey: 'tdee_calculations',
      isPremium: false,
      isNew: false
    },
    {
      id: 'meal-plan-generator',
      title: 'Meal Plan AI',
      description: 'Generate personalized meal plans tailored to your fitness goals and preferences',
      icon: ChefHat,
      component: (props: any) => <ModuleLoader moduleId="meal-plan-generator" moduleTitle="Meal Plan AI" {...props} />,
      gradient: 'from-yellow-500 to-orange-500',
      usageKey: 'meal_plans',
      isPremium: true,
      isNew: false
    },
    {
      id: 'smart-food-log',
      title: 'Smart Food Log',
      description: 'AI-powered food tracking with photo recognition and nutritional insights',
      icon: Pizza,
      component: (props: any) => <ModuleLoader moduleId="smart-food-log" moduleTitle="Smart Food Log" {...props} />,
      gradient: 'from-teal-500 to-cyan-500',
      usageKey: 'food_logs',
      isPremium: false,
      isNew: false
    },
    {
      id: 'workout-logger',
      title: 'Workout Logger AI',
      description: 'Intelligent workout tracking with AI-powered form analysis and progress insights',
      icon: NotebookPen,
      component: (props: any) => <ModuleLoader moduleId="workout-logger" moduleTitle="Workout Logger AI" {...props} />,
      gradient: 'from-blue-500 to-indigo-500',
      usageKey: 'workout_logs',
      isPremium: false,
      isNew: false
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Comprehensive progress tracking with AI insights and personalized recommendations',
      icon: TrendingUp,
      component: (props: any) => <ModuleLoader moduleId="progress-hub" moduleTitle="Progress Hub" {...props} />,
      gradient: 'from-violet-500 to-purple-500',
      usageKey: 'progress_analysis',
      isPremium: false,
      isNew: false
    },
    {
      id: 'recovery-coach',
      title: 'Recovery Coach',
      description: 'Optimize your recovery with AI-driven insights on sleep, stress, and regeneration',
      icon: Zap,
      component: (props: any) => <ModuleLoader moduleId="recovery-coach" moduleTitle="Recovery Coach" {...props} />,
      gradient: 'from-emerald-500 to-teal-500',
      usageKey: 'recovery_insights',
      isPremium: true,
      isNew: false
    },
    {
      id: 'workout-timer',
      title: 'Workout Timer',
      description: 'Professional workout timer with rest periods, intervals, and custom routines',
      icon: Timer,
      component: (props: any) => <ModuleLoader moduleId="workout-timer" moduleTitle="Workout Timer" {...props} />,
      gradient: 'from-orange-500 to-red-500',
      usageKey: 'timer_sessions',
      isPremium: false,
      isNew: false
    },
    {
      id: 'cut-calc-pro',
      title: 'CutCalc Pro',
      description: 'Advanced cutting calculator with precision macros and timeline predictions',
      icon: BarChart3,
      component: (props: any) => <ModuleLoader moduleId="cut-calc-pro" moduleTitle="CutCalc Pro" {...props} />,
      gradient: 'from-pink-500 to-red-500',
      usageKey: 'cutting_calculations',
      isPremium: true,
      isNew: false
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build lasting fitness habits with AI-powered tracking and motivation',
      icon: ListChecks,
      component: (props: any) => <ModuleLoader moduleId="habit-tracker" moduleTitle="Habit Tracker" {...props} />,
      gradient: 'from-amber-500 to-yellow-500',
      usageKey: 'habit_tracking',
      isPremium: false,
      isNew: false
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'AI-powered body composition analysis and physique progress tracking',
      icon: Eye,
      component: (props: any) => <ModuleLoader moduleId="physique-ai" moduleTitle="Physique AI" {...props} />,
      gradient: 'from-indigo-500 to-purple-500',
      usageKey: 'physique_analysis',
      isPremium: true,
      isNew: true
    }
  ];

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export default ModulesProvider;