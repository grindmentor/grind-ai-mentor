
import { 
  MessageSquare, 
  Utensils, 
  Activity, 
  Calculator, 
  Dumbbell, 
  Timer, 
  Brain, 
  TrendingUp,
  Heart,
  CheckCircle,
  Camera,
  Zap
} from 'lucide-react';

// Import components
import CoachGPT from '@/components/ai-modules/CoachGPT';
import SmartFoodLog from '@/components/ai-modules/SmartFoodLog';
import WorkoutLoggerAI from '@/components/ai-modules/WorkoutLoggerAI';
import TDEECalculator from '@/components/ai-modules/TDEECalculator';
import WorkoutLibrary from '@/components/ai-modules/WorkoutLibrary';
import WorkoutTimer from '@/components/ai-modules/WorkoutTimer';
import MealPlanAI from '@/components/ai-modules/MealPlanAI';
import ProgressHub from '@/components/ai-modules/ProgressHub';
import RecoveryCoach from '@/components/ai-modules/RecoveryCoach';
import HabitTracker from '@/components/ai-modules/HabitTracker';
import ProgressAI from '@/components/ai-modules/ProgressAI';
import CutCalcPro from '@/components/ai-modules/CutCalcPro';

export const aiModules = [
  {
    id: 'coach-gpt',
    title: 'Coach GPT',
    description: 'Your AI fitness coach for personalized guidance and motivation',
    icon: MessageSquare,
    gradient: 'bg-gradient-to-br from-green-900/60 to-green-800/80 border-green-700/50',
    component: CoachGPT,
    isPremium: false,
    isNew: true
  },
  {
    id: 'smart-food-log',
    title: 'Smart Food Log',
    description: 'AI-powered nutrition tracking with instant macro analysis',
    icon: Utensils,
    gradient: 'bg-gradient-to-br from-orange-900/60 to-orange-800/80 border-orange-700/50',
    component: SmartFoodLog,
    isPremium: false
  },
  {
    id: 'workout-logger',
    title: 'Workout Logger',
    description: 'Track your workouts with AI-powered exercise recommendations',
    icon: Activity,
    gradient: 'bg-gradient-to-br from-blue-900/60 to-blue-800/80 border-blue-700/50',
    component: WorkoutLoggerAI,
    isPremium: false
  },
  {
    id: 'tdee-calculator',
    title: 'TDEE Calculator',
    description: 'Calculate your daily energy expenditure with precision',
    icon: Calculator,
    gradient: 'bg-gradient-to-br from-indigo-900/60 to-indigo-800/80 border-indigo-700/50',
    component: TDEECalculator,
    isPremium: false
  },
  {
    id: 'workout-library',
    title: 'Workout Library',
    description: 'Comprehensive database of exercises and workout programs',
    icon: Dumbbell,
    gradient: 'bg-gradient-to-br from-blue-900/60 to-blue-800/80 border-blue-700/50',
    component: WorkoutLibrary,
    isPremium: false
  },
  {
    id: 'cut-calc-pro',
    title: 'CutCalc Pro',
    description: 'Advanced cutting calculator with timeline and macro targets',
    icon: TrendingDown,
    gradient: 'bg-gradient-to-br from-red-900/60 to-red-800/80 border-red-700/50',
    component: CutCalcPro,
    isPremium: true
  },
  {
    id: 'meal-plan-ai',
    title: 'Meal Plan AI',
    description: 'Generate personalized meal plans based on your goals',
    icon: Utensils,
    gradient: 'bg-gradient-to-br from-orange-900/60 to-orange-800/80 border-orange-700/50',
    component: MealPlanAI,
    isPremium: true
  },
  {
    id: 'progress-hub',
    title: 'Progress Hub',
    description: 'Track your fitness journey with detailed analytics',
    icon: TrendingUp,
    gradient: 'bg-gradient-to-br from-purple-900/60 to-purple-800/80 border-purple-700/50',
    component: ProgressHub,
    isPremium: false
  },
  {
    id: 'recovery-coach',
    title: 'Recovery Coach',
    description: 'Optimize your recovery with personalized recommendations',
    icon: Heart,
    gradient: 'bg-gradient-to-br from-teal-900/60 to-teal-800/80 border-teal-700/50',
    component: RecoveryCoach,
    isPremium: true
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    description: 'Build healthy habits with AI-powered tracking and insights',
    icon: CheckCircle,
    gradient: 'bg-gradient-to-br from-emerald-900/60 to-emerald-800/80 border-emerald-700/50',
    component: HabitTracker,
    isPremium: false
  },
  {
    id: 'physique-ai',
    title: 'Physique AI',
    description: 'AI-powered physique analysis and progress tracking',
    icon: Camera,
    gradient: 'bg-gradient-to-br from-slate-900/60 to-indigo-900/80 border-slate-700/50',
    component: ProgressAI,
    isPremium: true
  }
];
