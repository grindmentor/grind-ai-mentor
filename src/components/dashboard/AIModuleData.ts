import { 
  MessageSquare, 
  Utensils, 
  Activity, 
  Calculator, 
  Timer, 
  Brain, 
  TrendingUp,
  TrendingDown,
  Heart,
  CheckCircle,
  Camera,
  Zap,
  Target,
  Refrigerator
} from 'lucide-react';

// Import components
import CoachGPT from '@/components/ai-modules/CoachGPT';
import SmartFoodLog from '@/components/ai-modules/SmartFoodLog';
import WorkoutLoggerAI from '@/components/ai-modules/WorkoutLoggerAI';
import TDEECalculator from '@/components/ai-modules/TDEECalculator';
import WorkoutTimer from '@/components/ai-modules/WorkoutTimer';
import MealPlanAI from '@/components/ai-modules/MealPlanAI';
import OptimizedProgressHub from '@/components/ai-modules/OptimizedProgressHub';
import RecoveryCoach from '@/components/ai-modules/RecoveryCoach';
import HabitTracker from '@/components/ai-modules/HabitTracker';
import ProgressAI from '@/components/ai-modules/ProgressAI';
import CutCalcPro from '@/components/ai-modules/CutCalcPro';
import BlueprintAI from '@/components/ai-modules/BlueprintAI';
import FridgeScan from '@/components/ai-modules/FridgeScan';

export interface AIModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  component: React.ComponentType<any>;
  isPremium: boolean;
  isNew?: boolean;
}

export const aiModules: AIModule[] = [
  {
    id: 'blueprint-ai',
    title: 'Blueprint AI',
    description: 'Intelligent session planner with science-backed workout templates',
    icon: Target,
    gradient: 'from-blue-600/80 to-blue-800/90 border-blue-500/60',
    component: BlueprintAI,
    isPremium: true,
    isNew: false
  },
  {
    id: 'coach-gpt',
    title: 'Coach GPT',
    description: 'Your AI fitness coach for personalized guidance and motivation',
    icon: MessageSquare,
    gradient: 'from-green-600/80 to-green-800/90 border-green-500/60',
    component: CoachGPT,
    isPremium: false,
    isNew: false
  },
  {
    id: 'smart-food-log',
    title: 'Smart Food Log',
    description: 'AI-powered nutrition tracking with instant macro analysis',
    icon: Utensils,
    gradient: 'from-orange-600/80 to-orange-800/90 border-orange-500/60',
    component: SmartFoodLog,
    isPremium: false
  },
  {
    id: 'workout-logger',
    title: 'Workout Logger',
    description: 'Track your workouts with AI-powered exercise recommendations',
    icon: Activity,
    gradient: 'from-blue-600/80 to-blue-800/90 border-blue-500/60',
    component: WorkoutLoggerAI,
    isPremium: false
  },
  {
    id: 'tdee-calculator',
    title: 'TDEE Calculator',
    description: 'Calculate your daily energy expenditure with precision',
    icon: Calculator,
    gradient: 'from-indigo-600/80 to-indigo-800/90 border-indigo-500/60',
    component: TDEECalculator,
    isPremium: false
  },
  {
    id: 'cut-calc-pro',
    title: 'CutCalc Pro',
    description: 'Advanced cutting calculator with timeline and macro targets',
    icon: TrendingDown,
    gradient: 'from-red-600/80 to-red-800/90 border-red-500/60',
    component: CutCalcPro,
    isPremium: true
  },
  {
    id: 'meal-plan-ai',
    title: 'Meal Plan AI',
    description: 'Generate personalized meal plans based on your goals',
    icon: Utensils,
    gradient: 'from-orange-600/80 to-orange-800/90 border-orange-500/60',
    component: MealPlanAI,
    isPremium: true
  },
  {
    id: 'progress-hub',
    title: 'Progress Hub',
    description: 'Track your fitness journey with detailed analytics',
    icon: TrendingUp,
    gradient: 'from-purple-600/80 to-purple-800/90 border-purple-500/60',
    component: OptimizedProgressHub,
    isPremium: false
  },
  {
    id: 'recovery-coach',
    title: 'Recovery Coach',
    description: 'Optimize your recovery with personalized recommendations',
    icon: Heart,
    gradient: 'from-teal-600/80 to-teal-800/90 border-teal-500/60',
    component: RecoveryCoach,
    isPremium: true
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    description: 'Build healthy habits with AI-powered tracking and insights',
    icon: CheckCircle,
    gradient: 'from-emerald-600/80 to-emerald-800/90 border-emerald-500/60',
    component: HabitTracker,
    isPremium: false
  },
  {
    id: 'physique-ai',
    title: 'Physique AI',
    description: 'AI-powered physique analysis with weekly insights',
    icon: Camera,
    gradient: 'from-slate-600/80 to-indigo-800/90 border-slate-500/60',
    component: ProgressAI,
    isPremium: true,
    isNew: false
  },
  {
    id: 'fridge-scan',
    title: 'FridgeScan',
    description: 'Snap your fridge → get macro-optimized meals',
    icon: Refrigerator,
    gradient: 'from-cyan-600/80 to-teal-800/90 border-cyan-500/60',
    component: FridgeScan,
    isPremium: true,
    isNew: true
  }
];
