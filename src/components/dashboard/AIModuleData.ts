
import { Brain, Utensils, Calculator, Camera, Timer, Target, TrendingUp, Heart, Dumbbell, BarChart3, Activity, Zap } from "lucide-react";
import CoachGPT from "../ai-modules/CoachGPT";
import MealPlanAI from "../ai-modules/MealPlanAI";
import TDEECalculator from "../ai-modules/TDEECalculator";
import FoodPhotoLogger from "../ai-modules/FoodPhotoLogger";
import WorkoutTimer from "../ai-modules/WorkoutTimer";
import SmartTraining from "../ai-modules/SmartTraining";
import ProgressAI from "../ai-modules/ProgressAI";
import RecoveryCoach from "../ai-modules/RecoveryCoach";
import WorkoutLibrary from "../ai-modules/WorkoutLibrary";
import SmartFoodLog from "../ai-modules/SmartFoodLog";
import HabitTracker from "../ai-modules/HabitTracker";
import CutCalcPro from "../ai-modules/CutCalcPro";

export const aiModules = [
  {
    id: "coach-gpt",
    title: "CoachGPT",
    description: "Your personal AI fitness coach",
    icon: Brain,
    gradient: "from-blue-500 to-blue-700",
    component: CoachGPT,
    isNew: false,
    isPremium: false,
    usageKey: "coach_gpt_queries" as const
  },
  {
    id: "smart-training",
    title: "Smart Training",
    description: "AI-powered workout programs with progressive overload",
    icon: Dumbbell,
    gradient: "from-purple-500 to-purple-700",
    component: SmartTraining,
    isNew: false,
    isPremium: true, // Premium only feature
    usageKey: "training_programs" as const
  },
  {
    id: "meal-plan-ai",
    title: "MealPlan AI",
    description: "Custom meal plans based on your goals",
    icon: Utensils,
    gradient: "from-green-500 to-green-700",
    component: MealPlanAI,
    isNew: false,
    isPremium: false,
    usageKey: "meal_plan_generations" as const
  },
  {
    id: "tdee-calculator",
    title: "TDEE & FFMI Calculator",
    description: "Calculate your daily energy needs",
    icon: Calculator,
    gradient: "from-orange-500 to-orange-700",
    component: TDEECalculator,
    isNew: false,
    isPremium: false,
    usageKey: "tdee_calculations" as const
  },
  {
    id: "cut-calc-pro",
    title: "CutCalc Pro",
    description: "Advanced cutting calculator with body fat analysis",
    icon: Target,
    gradient: "from-red-500 to-red-700",
    component: CutCalcPro,
    isNew: false,
    isPremium: false,
    usageKey: "cut_calc_uses" as const
  },
  {
    id: "food-photo-logger",
    title: "Food Photo Logger",
    description: "Log meals with AI photo analysis",
    icon: Camera,
    gradient: "from-pink-500 to-pink-700",
    component: FoodPhotoLogger,
    isNew: false,
    isPremium: false,
    usageKey: "food_photo_analyses" as const
  },
  {
    id: "smart-food-log",
    title: "Smart Food Log",
    description: "Track nutrition with AI insights",
    icon: Activity,
    gradient: "from-emerald-500 to-emerald-700",
    component: SmartFoodLog,
    isNew: false,
    isPremium: false,
    usageKey: "food_log_analyses" as const
  },
  {
    id: "workout-timer",
    title: "Workout Timer",
    description: "Time your workouts with smart features",
    icon: Timer,
    gradient: "from-cyan-500 to-cyan-700",
    component: WorkoutTimer,
    isNew: false,
    isPremium: false,
    usageKey: "workout_timer_sessions" as const
  },
  {
    id: "progress-ai",
    title: "Progress AI",
    description: "AI analysis of your fitness progress",
    icon: TrendingUp,
    gradient: "from-indigo-500 to-indigo-700",
    component: ProgressAI,
    isNew: false,
    isPremium: false,
    usageKey: "progress_analyses" as const
  },
  {
    id: "recovery-coach",
    title: "Recovery Coach",
    description: "Optimize your rest and recovery",
    icon: Heart,
    gradient: "from-teal-500 to-teal-700",
    component: RecoveryCoach,
    isNew: false,
    isPremium: false,
    usageKey: "habit_checks" as const
  },
  {
    id: "workout-library",
    title: "Workout Library",
    description: "Comprehensive exercise database",
    icon: BarChart3,
    gradient: "from-violet-500 to-violet-700",
    component: WorkoutLibrary,
    isNew: false,
    isPremium: false,
    usageKey: "coach_gpt_queries" as const
  },
  {
    id: "habit-tracker",
    title: "Habit Tracker",
    description: "Build lasting fitness habits",
    icon: Zap,
    gradient: "from-yellow-500 to-yellow-700",
    component: HabitTracker,
    isNew: false,
    isPremium: false,
    usageKey: "habit_checks" as const
  }
];
