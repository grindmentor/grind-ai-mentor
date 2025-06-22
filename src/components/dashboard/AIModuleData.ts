
import { Brain, Calculator, TrendingUp, Camera, Utensils, Dumbbell, Timer, FileImage, Target, Heart, Moon } from "lucide-react";
import CoachGPT from "../ai-modules/CoachGPT";
import TDEECalculator from "../ai-modules/TDEECalculator";
import CutCalcPro from "../ai-modules/CutCalcPro";
import ProgressAI from "../ai-modules/ProgressAI";
import MealPlanAI from "../ai-modules/MealPlanAI";
import SmartTraining from "../ai-modules/SmartTraining";
import CardioAI from "../ai-modules/CardioAI";
import WorkoutTimer from "../ai-modules/WorkoutTimer";
import SmartFoodLog from "../ai-modules/SmartFoodLog";
import HabitTracker from "../ai-modules/HabitTracker";
import RecoveryCoach from "../ai-modules/RecoveryCoach";
import ProgressiveOverloadAI from "../ai-modules/ProgressiveOverloadAI";

// Most useful AIs for front page display
export const featuredModules = [
  'coach-gpt',
  'meal-plan-ai', 
  'smart-training',
  'progress-ai',
  'tdee-calculator',
  'smart-food-log'
];

export const aiModules = [
  {
    id: 'coach-gpt',
    name: 'CoachGPT',
    description: '24/7 AI fitness coaching with research citations',
    icon: Brain,
    color: 'bg-blue-500',
    component: CoachGPT,
    tier: 'free',
    buttonText: 'Get Coaching'
  },
  {
    id: 'meal-plan-ai',
    name: 'MealPlanAI',
    description: 'Custom meal plans and nutrition guidance',
    icon: Utensils,
    color: 'bg-green-500',
    component: MealPlanAI,
    tier: 'free',
    buttonText: 'Create Meal Plan'
  },
  {
    id: 'smart-training',
    name: 'Smart Training',
    description: 'AI-generated personalized weight training programs',
    icon: Dumbbell,
    color: 'bg-red-500',
    component: SmartTraining,
    tier: 'free',
    buttonText: 'Build Workout'
  },
  {
    id: 'progress-ai',
    name: 'ProgressAI',
    description: 'AI photo analysis & body composition tracking',
    icon: Camera,
    color: 'bg-purple-500',
    component: ProgressAI,
    tier: 'free',
    buttonText: 'Track Progress'
  },
  {
    id: 'tdee-calculator',
    name: 'TDEE & FFMI Calculator',
    description: 'Calculate metabolic needs and muscle potential',
    icon: Calculator,
    color: 'bg-indigo-500',
    component: TDEECalculator,
    tier: 'free',
    buttonText: 'Calculate TDEE'
  },
  {
    id: 'smart-food-log',
    name: 'Smart Food Log',
    description: 'Photo-based food tracking and analysis',
    icon: FileImage,
    color: 'bg-yellow-500',
    component: SmartFoodLog,
    tier: 'free',
    buttonText: 'Track Food'
  },
  {
    id: 'progressive-overload',
    name: 'Progressive Overload AI',
    description: 'Track strength progress with intelligent suggestions',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-blue-500 to-purple-600',
    component: ProgressiveOverloadAI,
    tier: 'free',
    buttonText: 'Track Progress'
  },
  {
    id: 'recovery-coach',
    name: 'Recovery Coach',
    description: 'Sleep optimization and recovery protocols',
    icon: Moon,
    color: 'bg-indigo-500',
    component: RecoveryCoach,
    tier: 'free',
    buttonText: 'Optimize Recovery'
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Build consistent fitness and wellness habits',
    icon: Target,
    color: 'bg-gradient-to-r from-green-500 to-blue-500',
    component: HabitTracker,
    tier: 'free',
    buttonText: 'Track Habits'
  },
  {
    id: 'cardio-ai',
    name: 'CardioAI',
    description: 'Science-based cardiovascular training programs',
    icon: Heart,
    color: 'bg-red-600',
    component: CardioAI,
    tier: 'free',
    buttonText: 'Plan Cardio'
  },
  {
    id: 'cut-calc-pro',
    name: 'CutCalc Pro',
    description: 'Advanced body composition & cutting calculator',
    icon: TrendingUp,
    color: 'bg-pink-500',
    component: CutCalcPro,
    tier: 'free',
    buttonText: 'Calculate Cut'
  },
  {
    id: 'workout-timer',
    name: 'Workout Timer',
    description: 'Smart rest periods and workout timing',
    icon: Timer,
    color: 'bg-teal-500',
    component: WorkoutTimer,
    tier: 'free',
    buttonText: 'Start Timer'
  }
];
