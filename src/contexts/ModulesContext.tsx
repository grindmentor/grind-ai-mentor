import React, { createContext, useContext, ReactNode } from 'react';
import { Brain, Camera, Calculator, Dumbbell, Apple, Timer, BarChart3, Target, TrendingUp, Crown } from 'lucide-react';
import CoachGPT from '@/components/ai-modules/CoachGPT';
import PhysiqueAI from '@/components/ai-modules/PhysiqueAI';
import CutCalculator from '@/components/ai-modules/CutCalculator';
import TrainingProgramGenerator from '@/components/ai-modules/TrainingProgramGenerator';
import FoodLogger from '@/components/ai-modules/FoodLogger';
import WorkoutTimer from '@/components/ai-modules/WorkoutTimer';
import ProgressAnalyzer from '@/components/ai-modules/ProgressAnalyzer';
import HabitTracker from '@/components/ai-modules/HabitTracker';
import ProgressHub from '@/components/ai-modules/ProgressHub';

export interface Module {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const modules: Module[] = [
  {
    id: 'coach-gpt',
    title: 'Coach GPT',
    description: 'Your AI fitness coach for personalized workout advice and training guidance.',
    component: CoachGPT,
    icon: Brain,
    gradient: 'from-blue-500 to-purple-600',
    isNew: true,
  },
  {
    id: 'physique-ai',
    title: 'Physique AI',
    description: 'Advanced body composition analysis using AI-powered photo assessment.',
    component: PhysiqueAI,
    icon: Camera,
    gradient: 'from-green-500 to-teal-600',
    isPremium: true,
  },
  {
    id: 'cut-calculator',
    title: 'Cut Calculator',
    description: 'Calculate optimal cutting calories and timeline for your weight loss goals.',
    component: CutCalculator,
    icon: Calculator,
    gradient: 'from-red-500 to-pink-600',
  },
  {
    id: 'training-program-generator',
    title: 'Training Program Generator',
    description: 'Generate customized workout programs based on your goals and experience.',
    component: TrainingProgramGenerator,
    icon: Dumbbell,
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'food-logger',
    title: 'Food Logger & Analysis',
    description: 'Track your nutrition with AI-powered food recognition and macro analysis.',
    component: FoodLogger,
    icon: Apple,
    gradient: 'from-emerald-500 to-green-600',
    isNew: true,
  },
  {
    id: 'workout-timer',
    title: 'Workout Timer',
    description: 'Smart workout timing with rest period tracking and exercise logging.',
    component: WorkoutTimer,
    icon: Timer,
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'progress-analyzer',
    title: 'Progress Analyzer',
    description: 'Analyze your fitness progress with detailed metrics and trend analysis.',
    component: ProgressAnalyzer,
    icon: BarChart3,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    description: 'Build lasting fitness habits with smart tracking and accountability.',
    component: HabitTracker,
    icon: Target,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'progress-hub',
    title: 'Progress Hub',
    description: 'Comprehensive dashboard for tracking all aspects of your fitness journey.',
    component: ProgressHub,
    icon: TrendingUp,
    gradient: 'from-purple-500 to-indigo-600',
  },
];

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

interface ModulesProviderProps {
  children: ReactNode;
}

export const ModulesProvider: React.FC<ModulesProviderProps> = ({ children }) => {
  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = (): ModulesContextType => {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

export default ModulesProvider;
