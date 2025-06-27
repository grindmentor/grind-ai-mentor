import React, { createContext, useContext, useMemo } from 'react';
import { Dumbbell, Calculator, MessageSquare, UtensilsCrossed, Moon, Target, TrendingUp, Timer, Camera, Eye } from 'lucide-react';
import BlueprintAI from '@/components/ai-modules/BlueprintAI';
import TDEECalculator from '@/components/ai-modules/TDEECalculator';
import CoachGPT from '@/components/ai-modules/CoachGPT';
import SmartFoodLog from '@/components/ai-modules/SmartFoodLog';
import RecoveryCoach from '@/components/ai-modules/RecoveryCoach';
import HabitTracker from '@/components/ai-modules/HabitTracker';
import ProgressHub from '@/components/ai-modules/ProgressHub';
import WorkoutTimer from '@/components/ai-modules/WorkoutTimer';
import PhysiqueAI from '@/components/ai-modules/PhysiqueAI';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  isPremium?: boolean;
  isNew?: boolean;
  component: React.ComponentType<any>;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const modules = useMemo(() => [
    {
      id: 'blueprint-ai',
      title: 'Blueprint AI',
      description: 'AI-powered workout programs tailored to your goals, experience level, and available equipment.',
      icon: Dumbbell,
      gradient: 'from-blue-900/60 to-indigo-900/80',
      component: BlueprintAI,
      isPremium: false,
      isNew: true
    },
    {
      id: 'tdee-calculator',
      title: 'TDEE Calculator',
      description: 'Calculate your Total Daily Energy Expenditure with precision using advanced algorithms.',
      icon: Calculator,
      gradient: 'from-green-900/60 to-emerald-900/80',
      component: TDEECalculator,
      isPremium: false
    },
    {
      id: 'coach-gpt',
      title: 'CoachGPT',
      description: 'Your personal AI fitness coach for motivation, form tips, and training guidance.',
      icon: MessageSquare,
      gradient: 'from-teal-900/60 to-cyan-900/80',
      component: CoachGPT,
      isPremium: false
    },
    {
      id: 'smart-food-log',
      title: 'Smart Food Log',
      description: 'AI-powered food logging with photo recognition and nutritional analysis.',
      icon: UtensilsCrossed,
      gradient: 'from-teal-900/60 to-cyan-900/80',
      component: SmartFoodLog,
      isPremium: false
    },
    {
      id: 'recovery-coach',
      title: 'Recovery Coach',
      description: 'Optimize your recovery with personalized sleep, stress, and rest recommendations.',
      icon: Moon,
      gradient: 'from-purple-900/60 to-violet-900/80',
      component: RecoveryCoach,
      isPremium: false
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build lasting fitness habits with intelligent tracking and motivation systems.',
      icon: Target,
      gradient: 'from-pink-900/60 to-rose-900/80',
      component: HabitTracker,
      isPremium: false
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Comprehensive progress tracking with advanced analytics and insights.',
      icon: TrendingUp,
      gradient: 'from-purple-900/60 to-violet-900/80',
      component: ProgressHub,
      isPremium: false
    },
    {
      id: 'workout-timer',
      title: 'Workout Timer',
      description: 'Smart workout timing with rest periods, interval training, and voice guidance.',
      icon: Timer,
      gradient: 'from-yellow-900/60 to-orange-900/80',
      component: WorkoutTimer,
      isPremium: false
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'AI-powered physique analysis and body composition insights with progress tracking.',
      icon: Eye,
      gradient: 'from-indigo-900/60 to-purple-900/80',
      component: PhysiqueAI,
      isPremium: false,
      isNew: true
    }
  ], []);

  const value = useMemo(() => ({
    modules
  }), [modules]);

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

export default ModulesProvider;
