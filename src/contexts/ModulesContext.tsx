
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { lazy } from 'react';
import { useAuth } from './AuthContext';

// Lazy load all module components
const CoachGPT = lazy(() => import('@/components/ai-modules/CoachGPT'));
const SmartTraining = lazy(() => import('@/components/ai-modules/SmartTraining'));
const MealPlanAI = lazy(() => import('@/components/ai-modules/MealPlanAI'));
const SmartFoodLog = lazy(() => import('@/components/ai-modules/SmartFoodLog'));
const TDEECalculator = lazy(() => import('@/components/ai-modules/TDEECalculator'));
const CutCalc = lazy(() => import('@/components/ai-modules/CutCalcPro'));
const WorkoutTimer = lazy(() => import('@/components/ai-modules/WorkoutTimer'));
const WorkoutLoggerAI = lazy(() => import('@/components/ai-modules/WorkoutLoggerAI'));
const BlueprintAI = lazy(() => import('@/components/ai-modules/BlueprintAI'));
const PhysiqueAI = lazy(() => import('@/components/ai-modules/PhysiqueAI'));
const ProgressHub = lazy(() => import('@/components/ai-modules/ProgressHub'));
const HabitTracker = lazy(() => import('@/components/ai-modules/HabitTracker'));

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  category: 'AI Training' | 'Nutrition' | 'Calculators' | 'Progress' | 'Community';
  gradient: string;
  isPremium?: boolean;
}

interface ModulesContextType {
  modules: Module[];
  getModuleById: (id: string) => Module | undefined;
  getModulesByCategory: (category: string) => Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

import { 
  MessageSquare, 
  Target, 
  Utensils, 
  Camera, 
  Calculator, 
  Scissors, 
  Timer, 
  Dumbbell, 
  Map, 
  User, 
  TrendingUp, 
  Activity, 
  Move,
  Apple,
  CheckSquare
} from 'lucide-react';

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const modules: Module[] = useMemo(() => [
    {
      id: 'coach-gpt',
      title: 'CoachGPT',
      description: 'Your AI fitness coach for training advice, motivation, and form tips',
      icon: MessageSquare,
      component: CoachGPT,
      category: 'AI Training',
      gradient: 'from-green-900/40 to-emerald-900/60'
    },
    {
      id: 'smart-training',
      title: 'Smart Training',
      description: 'AI-powered personalized workout programs based on your goals',
      icon: Target,
      component: SmartTraining,
      category: 'AI Training',
      gradient: 'from-blue-900/40 to-indigo-900/60',
      isPremium: true
    },
    {
      id: 'meal-plan-ai',
      title: 'Meal Plan AI',
      description: 'Generate personalized meal plans tailored to your goals and preferences',
      icon: Utensils,
      component: MealPlanAI,
      category: 'Nutrition',
      gradient: 'from-green-900/40 to-emerald-900/60',
      isPremium: true
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'AI-powered physique analysis with personalized recommendations',
      icon: Camera,
      component: PhysiqueAI,
      category: 'Progress',
      gradient: 'from-purple-900/40 to-indigo-900/60',
      isPremium: true
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure for optimal nutrition planning',
      icon: Calculator,
      component: TDEECalculator,
      category: 'Calculators',
      gradient: 'from-amber-900/40 to-yellow-900/60'
    },
    {
      id: 'cut-calc',
      title: 'CutCalc',
      description: 'Advanced cutting calculator for precise fat loss planning',
      icon: Scissors,
      component: CutCalc,
      category: 'Calculators',
      gradient: 'from-red-900/40 to-rose-900/60'
    },
    {
      id: 'workout-timer',
      title: 'Workout Timer',
      description: 'Smart workout timer with rest periods and interval training',
      icon: Timer,
      component: WorkoutTimer,
      category: 'AI Training',
      gradient: 'from-orange-900/40 to-amber-900/60'
    },
    {
      id: 'workout-logger',
      title: 'Workout Logger AI',
      description: 'Intelligent workout logging with exercise tracking and progression',
      icon: Dumbbell,
      component: WorkoutLoggerAI,
      category: 'Progress',
      gradient: 'from-blue-900/40 to-indigo-900/60'
    },
    {
      id: 'blueprint-ai',
      title: 'Blueprint AI',
      description: 'Discover science-backed workout templates and training programs',
      icon: Map,
      component: BlueprintAI,
      category: 'AI Training',
      gradient: 'from-orange-900/40 to-red-900/60'
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Track your fitness journey with detailed analytics and insights',
      icon: TrendingUp,
      component: ProgressHub,
      category: 'Progress',
      gradient: 'from-purple-900/40 to-violet-900/60'
    },
    {
      id: 'smart-food-log',
      title: 'Smart Food Log',
      description: 'AI-powered food logging with photo recognition and macro tracking',
      icon: Apple,
      component: SmartFoodLog,
      category: 'Nutrition',
      gradient: 'from-lime-900/40 to-green-900/60'
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build lasting fitness habits with intelligent tracking and insights',
      icon: CheckSquare,
      component: HabitTracker,
      category: 'Progress',
      gradient: 'from-violet-900/40 to-purple-900/60'
    }
  ], []);

  const getModuleById = (id: string): Module | undefined => {
    return modules.find(module => module.id === id);
  };

  const getModulesByCategory = (category: string): Module[] => {
    return modules.filter(module => module.category === category);
  };

  const value = {
    modules,
    getModuleById,
    getModulesByCategory
  };

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  );
};
