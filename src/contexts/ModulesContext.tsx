import React, { createContext, useContext, useMemo, lazy } from 'react';
import { Star, TrendingUp, Lightbulb, BookOpen, Dumbbell, Heart, Calculator, Utensils, Activity, MessageSquare, User } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  component: React.ComponentType<any>;
  isPremium?: boolean;
  isNew?: boolean;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType>({
  modules: []
});

export const useModules = () => useContext(ModulesContext);

// Lazy-loaded modules
const CutCalcPro = lazy(() => import('@/components/ai-modules/CutCalcPro'));
const BlueprintAI = lazy(() => import('@/components/ai-modules/BlueprintAI'));
const SmartTraining = lazy(() => import('@/components/ai-modules/SmartTraining'));
const MealPlanAI = lazy(() => import('@/components/ai-modules/MealPlanAI'));
const RecoveryCoach = lazy(() => import('@/components/ai-modules/RecoveryCoach'));
const TDEECalculator = lazy(() => import('@/components/ai-modules/TDEECalculator'));
const SmartFoodLog = lazy(() => import('@/components/ai-modules/SmartFoodLog'));
const HabitTracker = lazy(() => import('@/components/ai-modules/HabitTracker'));
const CardioAI = lazy(() => import('@/components/ai-modules/CardioAI'));
const WorkoutTimer = lazy(() => import('@/components/ai-modules/WorkoutTimer'));
const CoachGPT = lazy(() => import('@/components/ai-modules/CoachGPT'));
const WorkoutLoggerAI = lazy(() => import('@/components/ai-modules/WorkoutLoggerAI'));

// Import Physique AI
const PhysiqueAI = lazy(() => import('@/components/ai-modules/PhysiqueAI'));

export const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules = useMemo(() => [
    {
      id: 'cut-calc-pro',
      title: 'Cut Calc Pro',
      description: 'AI-powered calorie and macro cycling for optimized fat loss.',
      icon: Star,
      gradient: 'from-red-900/60 to-pink-900/80',
      component: CutCalcPro,
      isPremium: true,
      isNew: false
    },
    {
      id: 'blueprint-ai',
      title: 'Blueprint AI',
      description: 'AI workout generator that creates science-backed training plans.',
      icon: Lightbulb,
      gradient: 'from-blue-900/60 to-indigo-900/80',
      component: BlueprintAI,
      isPremium: true,
      isNew: false
    },
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-driven personalized workout plans tailored to your goals and equipment.',
      icon: Dumbbell,
      gradient: 'from-blue-900/60 to-indigo-900/80',
      component: SmartTraining,
      isPremium: true,
      isNew: false
    },
    {
      id: 'meal-plan-ai',
      title: 'Meal Plan AI',
      description: 'AI meal plan generator for custom nutrition plans based on your dietary needs.',
      icon: Utensils,
      gradient: 'from-green-900/60 to-emerald-900/80',
      component: MealPlanAI,
      isPremium: true,
      isNew: false
    },
    {
      id: 'recovery-coach',
      title: 'Recovery Coach',
      description: 'AI-powered recovery strategies and personalized recommendations for optimal muscle repair.',
      icon: Heart,
      gradient: 'from-purple-900/60 to-violet-900/80',
      component: RecoveryCoach,
      isPremium: true,
      isNew: false
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Centralized dashboard to track your fitness journey and visualize your progress.',
      icon: TrendingUp,
      gradient: 'from-purple-900/60 to-violet-900/80',
      component: RecoveryCoach,
      isPremium: false,
      isNew: false
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure (TDEE) and calorie needs.',
      icon: Calculator,
      gradient: 'from-green-900/60 to-emerald-900/80',
      component: TDEECalculator,
      isPremium: false,
      isNew: false
    },
    {
      id: 'smart-food-log',
      title: 'Smart Food Log',
      description: 'AI-powered food logging with automatic nutrient analysis and insights.',
      icon: BookOpen,
      gradient: 'from-teal-900/60 to-cyan-900/80',
      component: SmartFoodLog,
      isPremium: true,
      isNew: false
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Track your daily habits and build consistency in your fitness routine.',
      icon: Activity,
      gradient: 'from-pink-900/60 to-rose-900/80',
      component: HabitTracker,
      isPremium: false,
      isNew: false
    },
    {
      id: 'cardio-ai',
      title: 'Cardio AI',
      description: 'AI-driven cardio workout generator for personalized endurance training.',
      icon: Activity,
      gradient: 'from-indigo-900/60 to-blue-900/80',
      component: CardioAI,
      isPremium: true,
      isNew: false
    },
    {
      id: 'workout-timer',
      title: 'Workout Timer',
      description: 'Interactive workout timer with customizable intervals and rest periods.',
      icon: Calculator,
      gradient: 'from-yellow-900/60 to-orange-900/80',
      component: WorkoutTimer,
      isPremium: false,
      isNew: false
    },
    {
      id: 'coach-gpt',
      title: 'Coach GPT',
      description: 'Your AI fitness coach for personalized advice, motivation, and support.',
      icon: MessageSquare,
      gradient: 'from-teal-900/60 to-cyan-900/80',
      component: CoachGPT,
      isPremium: false,
      isNew: true
    },
    {
      id: 'workout-logger-ai',
      title: 'Workout Logger AI',
      description: 'AI-powered workout logging with exercise recognition and performance analysis.',
      icon: Dumbbell,
      gradient: 'from-green-900/60 to-emerald-900/80',
      component: WorkoutLoggerAI,
      isPremium: true,
      isNew: true
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'Science-backed body transformation analysis and guidance for achieving your physique goals.',
      icon: User,
      gradient: 'from-purple-900/60 to-pink-900/80',
      component: PhysiqueAI,
      isPremium: false,
      isNew: true
    },
  ], []);

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};
