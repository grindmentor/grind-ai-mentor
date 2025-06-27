
import React, { createContext, useContext } from 'react';
import { Book, Flame, LayoutDashboard, ListChecks, TrendingUp } from 'lucide-react';
import SimpleWorkoutLibrary from '@/components/ai-modules/SimpleWorkoutLibrary';

// Create placeholder components for missing modules
const WorkoutLogger = () => <div>Workout Logger - Coming Soon</div>;
const PersonalizedTraining = () => <div>Personalized Training - Coming Soon</div>;
const MacroCalculator = () => <div>Macro Calculator - Coming Soon</div>;
const ProgressHub = () => <div>Progress Hub - Coming Soon</div>;

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  component: React.ComponentType<any>;
  isPremium: boolean;
  isNew: boolean;
  category: string;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const modules: Module[] = [
    {
      id: 'workout-library',
      title: 'Workout Library',
      description: 'Browse exercises and workout programs with AI guidance',
      icon: Book,
      color: 'from-blue-500 to-blue-700',
      gradient: 'bg-gradient-to-br from-blue-600/80 to-indigo-700/80 border-blue-400/50',
      component: SimpleWorkoutLibrary,
      isPremium: false,
      isNew: false,
      category: 'training'
    },
    {
      id: 'workout-logger',
      title: 'Workout Logger',
      description: 'Log your workouts and track your progress',
      icon: ListChecks,
      color: 'from-green-500 to-green-700',
      gradient: 'bg-gradient-to-br from-green-600/80 to-emerald-700/80 border-green-400/50',
      component: WorkoutLogger,
      isPremium: false,
      isNew: true,
      category: 'training'
    },
    {
      id: 'personalized-training',
      title: 'AI Training Plans',
      description: 'Get personalized workout plans based on your goals',
      icon: Flame,
      color: 'from-red-500 to-red-700',
      gradient: 'bg-gradient-to-br from-red-600/80 to-pink-700/80 border-red-400/50',
      component: PersonalizedTraining,
      isPremium: true,
      isNew: true,
      category: 'training'
    },
    {
      id: 'macro-calculator',
      title: 'Macro Calculator',
      description: 'Calculate your macro needs for optimal fitness results',
      icon: LayoutDashboard,
      color: 'from-orange-500 to-orange-700',
      gradient: 'bg-gradient-to-br from-orange-600/80 to-yellow-700/80 border-orange-400/50',
      component: MacroCalculator,
      isPremium: false,
      isNew: false,
      category: 'nutrition'
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Track your fitness journey with detailed analytics',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-700',
      gradient: 'bg-gradient-to-br from-purple-600/80 to-indigo-700/80 border-purple-400/50',
      component: ProgressHub,
      isPremium: false,
      isNew: false,
      category: 'analytics'
    },
  ];

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};
