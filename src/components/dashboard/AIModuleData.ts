
import { 
  Brain, 
  Utensils, 
  Activity, 
  Target, 
  TrendingUp, 
  Clock, 
  Calculator, 
  Camera,
  Timer,
  Dumbbell,
  Heart,
  Zap,
  Users,
  BookOpen,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';

export interface AIModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  isPremium: boolean;
  gradient?: string;
  comingSoon?: boolean;
}

export const aiModules: AIModule[] = [
  {
    id: 'coach-gpt',
    title: 'CoachGPT',
    description: 'Your personal AI fitness coach for expert guidance and motivation',
    icon: Brain,
    category: 'AI Coach',
    isPremium: false,
    gradient: 'from-blue-500/30 to-purple-600/40'
  },
  {
    id: 'smart-training',
    title: 'Smart Training',
    description: 'AI-powered workout generation and progressive overload tracking',
    icon: Dumbbell,
    category: 'Training',
    isPremium: false,
    gradient: 'from-orange-500/30 to-red-600/40'
  },
  {
    id: 'meal-plan-ai',
    title: 'Meal Plan AI',
    description: 'Personalized meal plans based on your goals and preferences',
    icon: Utensils,
    category: 'Nutrition',
    isPremium: false,
    gradient: 'from-green-500/30 to-teal-600/40'
  },
  {
    id: 'smart-food-log',
    title: 'Smart Food Log',
    description: 'USDA database integration with photo analysis for accurate nutrition tracking',
    icon: Camera,
    category: 'Nutrition',
    isPremium: false,
    gradient: 'from-amber-500/30 to-orange-600/40'
  },
  {
    id: 'progress-ai',
    title: 'Progress AI',
    description: 'AI-powered progress analysis with photo comparison and insights',
    icon: TrendingUp,
    category: 'Progress',
    isPremium: false,
    gradient: 'from-pink-500/30 to-rose-600/40'
  },
  {
    id: 'recovery-coach',
    title: 'Recovery Coach',
    description: 'Optimize your rest and recovery with AI-driven recommendations',
    icon: Heart,
    category: 'Recovery',
    isPremium: false,
    gradient: 'from-purple-500/30 to-indigo-600/40'
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    description: 'Build lasting fitness habits with AI-powered tracking and insights',
    icon: Target,
    category: 'Habits',
    isPremium: false,
    gradient: 'from-indigo-500/30 to-blue-600/40'
  },
  {
    id: 'cut-calc-pro',
    title: 'Cut Calc Pro',
    description: 'Advanced cutting calculator with timeline and macro recommendations',
    icon: Calculator,
    category: 'Nutrition',
    isPremium: false,
    gradient: 'from-red-500/30 to-pink-600/40'
  },
  {
    id: 'workout-timer',
    title: 'Workout Timer',
    description: 'Smart workout timer with rest period optimization and tracking',
    icon: Timer,
    category: 'Training',
    isPremium: false,
    gradient: 'from-cyan-500/30 to-teal-600/40'
  },
  {
    id: 'workout-logger-ai',
    title: 'Workout Logger',
    description: 'AI-enhanced workout logging with exercise recommendations',
    icon: Activity,
    category: 'Training',
    isPremium: false,
    gradient: 'from-gray-500/20 to-gray-600/30'
  },
  {
    id: 'tdee-calculator',
    title: 'TDEE Calculator',
    description: 'Calculate your Total Daily Energy Expenditure with precision',
    icon: Zap,
    category: 'Nutrition',
    isPremium: false,
    gradient: 'from-yellow-500/30 to-amber-600/40'
  },
  {
    id: 'blueprint-ai',
    title: 'Blueprint AI',
    description: 'Create comprehensive fitness blueprints tailored to your goals',
    icon: BookOpen,
    category: 'Planning',
    isPremium: true,
    gradient: 'from-violet-500/30 to-purple-600/40'
  },
  {
    id: 'cardio-ai',
    title: 'Cardio AI',
    description: 'Intelligent cardio programming for optimal fat loss and conditioning',
    icon: Heart,
    category: 'Cardio',
    isPremium: true,
    gradient: 'from-red-500/30 to-orange-600/40'
  }
];

export const getModulesByCategory = () => {
  const categories = aiModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, AIModule[]>);
  
  return categories;
};
