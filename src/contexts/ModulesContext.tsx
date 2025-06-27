
import React, { createContext, useContext } from 'react';
import { Activity, BarChart3, BookOpen, ChefHat, Flame, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Pizza, Speaker, TrendingUp } from 'lucide-react';
import SmartTraining from '@/components/ai-modules/SmartTraining';
import CoachGPT from '@/components/ai-modules/CoachGPT';
import TDEECalculator from '@/components/ai-modules/TDEECalculator';
import MealPlanAI from '@/components/ai-modules/MealPlanAI';
import RecoveryCoach from '@/components/ai-modules/RecoveryCoach';
import WorkoutLoggerAI from '@/components/ai-modules/WorkoutLoggerAI';
import FoodPhotoLogger from '@/components/ai-modules/FoodPhotoLogger';
import WorkoutLibrary from '@/components/ai-modules/WorkoutLibrary';
import ProgressHub from '@/components/ai-modules/ProgressHub';

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

// Simple placeholder component for missing modules
const ComingSoonComponent = ({ title }: { title?: string }) => (
  <div className="p-6 text-center text-white">
    <h2 className="text-2xl font-bold mb-4">{title || 'Coming Soon'}</h2>
    <p className="text-gray-400">This feature is currently under development.</p>
  </div>
);

const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const modules: Module[] = [
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered workout recommendations',
      icon: Flame,
      component: SmartTraining,
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
      component: CoachGPT,
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
      component: TDEECalculator,
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
      component: MealPlanAI,
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
      component: RecoveryCoach,
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
      component: WorkoutLoggerAI,
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
      component: FoodPhotoLogger,
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
      component: WorkoutLibrary,
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
      component: () => <ComingSoonComponent title="Supplement Assistant" />,
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
      component: ProgressHub,
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
