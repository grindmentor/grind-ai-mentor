
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Calendar, Flame, Zap, Star, Award, Heart, Clock, Dumbbell, Apple, Moon, TrendingUp, CheckCircle, Mountain, Timer, Scale, Activity, Book, Coffee, Utensils } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Training' | 'Nutrition' | 'Consistency' | 'Progress' | 'Health' | 'Milestones';
  icon: React.ComponentType<any>;
  requirement: number;
  unit: string;
  earned: boolean;
  earnedDate?: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievementsList: Achievement[] = [
  // Training Achievements
  {
    id: 'first-workout',
    title: 'First Step',
    description: 'Complete your first workout',
    category: 'Training',
    icon: Dumbbell,
    requirement: 1,
    unit: 'workout',
    earned: false,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'workout-streak-7',
    title: 'Week Warrior',
    description: 'Log workouts for 7 consecutive days',
    category: 'Training',
    icon: Flame,
    requirement: 7,
    unit: 'days',
    earned: false,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'workout-streak-30',
    title: 'Month Master',
    description: 'Maintain a 30-day workout streak',
    category: 'Training',
    icon: Calendar,
    requirement: 30,
    unit: 'days',
    earned: false,
    points: 500,
    rarity: 'epic'
  },
  {
    id: 'logged-5-workouts',
    title: 'Getting Started',
    description: 'Log 5 workouts in total',
    category: 'Training',
    icon: CheckCircle,
    requirement: 5,
    unit: 'workouts',
    earned: false,
    points: 100,
    rarity: 'common'
  },
  {
    id: 'logged-25-workouts',
    title: 'Dedicated Trainee',
    description: 'Log 25 workouts in total',
    category: 'Training',
    icon: Trophy,
    requirement: 25,
    unit: 'workouts',
    earned: false,
    points: 250,
    rarity: 'rare'
  },
  {
    id: 'logged-100-workouts',
    title: 'Century Club',
    description: 'Log 100 workouts in total',
    category: 'Training',
    icon: Mountain,
    requirement: 100,
    unit: 'workouts',
    earned: false,
    points: 1000,
    rarity: 'legendary'
  },

  // Nutrition Achievements
  {
    id: 'first-food-log',
    title: 'Nutrition Tracker',
    description: 'Log your first meal',
    category: 'Nutrition',
    icon: Apple,
    requirement: 1,
    unit: 'meal',
    earned: false,
    points: 25,
    rarity: 'common'
  },
  {
    id: 'food-log-7-days',
    title: 'Nutrition Ninja',
    description: 'Log food for 7 consecutive days',
    category: 'Nutrition',
    icon: Utensils,
    requirement: 7,
    unit: 'days',
    earned: false,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'protein-goal-5-days',
    title: 'Protein Power',
    description: 'Hit protein target 5 days in a row',
    category: 'Nutrition',
    icon: Coffee,
    requirement: 5,
    unit: 'days',
    earned: false,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'meal-plan-complete',
    title: 'Plan Perfectionist',
    description: 'Complete a full meal plan week',
    category: 'Nutrition',
    icon: Book,
    requirement: 1,
    unit: 'week',
    earned: false,
    points: 150,
    rarity: 'common'
  },

  // Consistency Achievements
  {
    id: 'daily-login-7',
    title: 'Daily Dedication',
    description: 'Use the app for 7 consecutive days',
    category: 'Consistency',
    icon: Star,
    requirement: 7,
    unit: 'days',
    earned: false,
    points: 100,
    rarity: 'common'
  },
  {
    id: 'weekly-goal-4',
    title: 'Goal Getter',
    description: 'Complete weekly goals 4 weeks in a row',
    category: 'Consistency',
    icon: Target,
    requirement: 4,
    unit: 'weeks',
    earned: false,
    points: 400,
    rarity: 'epic'
  },
  {
    id: 'habit-streak-14',
    title: 'Habit Hero',
    description: 'Maintain any habit for 14 days',
    category: 'Consistency',
    icon: Zap,
    requirement: 14,
    unit: 'days',
    earned: false,
    points: 250,
    rarity: 'rare'
  },

  // Health Achievements
  {
    id: 'sleep-8hrs-7-days',
    title: 'Sleep Champion',
    description: 'Sleep 8+ hours for 7 consecutive days',
    category: 'Health',
    icon: Moon,
    requirement: 7,
    unit: 'days',
    earned: false,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'recovery-data-30',
    title: 'Recovery Master',
    description: 'Log recovery data for 30 days',
    category: 'Health',
    icon: Heart,
    requirement: 30,
    unit: 'days',
    earned: false,
    points: 400,
    rarity: 'epic'
  },
  {
    id: 'stress-low-7-days',
    title: 'Zen Master',
    description: 'Maintain low stress levels for 7 days',
    category: 'Health',
    icon: Heart,
    requirement: 7,
    unit: 'days',
    earned: false,
    points: 200,
    rarity: 'rare'
  },

  // Progress Achievements
  {
    id: 'weight-loss-5kg',
    title: 'Weight Warrior',
    description: 'Lose 5kg from starting weight',
    category: 'Progress',
    icon: Scale,
    requirement: 5,
    unit: 'kg',
    earned: false,
    points: 500,
    rarity: 'epic'
  },
  {
    id: 'deadlift-bodyweight',
    title: 'Strength Milestone',
    description: 'Deadlift your bodyweight',
    category: 'Progress',
    icon: Award,
    requirement: 1,
    unit: 'milestone',
    earned: false,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'deadlift-2x-bodyweight',
    title: 'Powerhouse',
    description: 'Deadlift 2x your bodyweight',
    category: 'Progress',
    icon: Trophy,
    requirement: 2,
    unit: 'x bodyweight',
    earned: false,
    points: 1000,
    rarity: 'legendary'
  },
  {
    id: 'progress-photo-10',
    title: 'Progress Photographer',
    description: 'Take 10 progress photos',
    category: 'Progress',
    icon: Activity,
    requirement: 10,
    unit: 'photos',
    earned: false,
    points: 150,
    rarity: 'common'
  },

  // Milestone Achievements
  {
    id: 'first-month',
    title: 'Monthly Milestone',
    description: 'Complete your first month of training',
    category: 'Milestones',
    icon: Calendar,
    requirement: 30,
    unit: 'days',
    earned: false,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'workout-time-1000-min',
    title: 'Time Investment',
    description: 'Log 1000 minutes of workout time',
    category: 'Milestones',
    icon: Timer,
    requirement: 1000,
    unit: 'minutes',
    earned: false,
    points: 500,
    rarity: 'epic'
  },
  {
    id: 'all-modules-used',
    title: 'Module Master',
    description: 'Use all available fitness modules',
    category: 'Milestones',
    icon: Star,
    requirement: 12,
    unit: 'modules',
    earned: false,
    points: 750,
    rarity: 'epic'
  },
  {
    id: 'goal-setter',
    title: 'Goal Setter',
    description: 'Create your first fitness goal',
    category: 'Milestones',
    icon: Target,
    requirement: 1,
    unit: 'goal',
    earned: false,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'goal-achiever',
    title: 'Goal Achiever',
    description: 'Complete your first fitness goal',
    category: 'Milestones',
    icon: CheckCircle,
    requirement: 1,
    unit: 'completed goal',
    earned: false,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Complete all planned activities for a week',
    category: 'Consistency',
    icon: TrendingUp,
    requirement: 1,
    unit: 'week',
    earned: false,
    points: 400,
    rarity: 'epic'
  }
];

export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export const getCategoryColor = (category: Achievement['category']) => {
  switch (category) {
    case 'Training': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Consistency': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Health': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'Milestones': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const IconComponent = achievement.icon;
  
  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        achievement.earned 
          ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/20 border-yellow-500/40' 
          : 'bg-gray-800/50 border-gray-700/50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          achievement.earned 
            ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border border-yellow-500/30' 
            : 'bg-gray-700/50 border border-gray-600/50'
        }`}>
          <IconComponent className={`w-5 h-5 ${
            achievement.earned ? 'text-yellow-400' : 'text-gray-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-semibold text-sm ${
              achievement.earned ? 'text-white' : 'text-gray-400'
            }`}>
              {achievement.title}
            </h3>
            <Badge className={getRarityColor(achievement.rarity)}>
              {achievement.rarity}
            </Badge>
          </div>
          <p className={`text-xs mb-2 ${
            achievement.earned ? 'text-yellow-200' : 'text-gray-500'
          }`}>
            {achievement.description}
          </p>
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(achievement.category)}>
              {achievement.category}
            </Badge>
            <Badge variant="outline" className="border-gray-500/50 text-gray-400 text-xs">
              +{achievement.points} pts
            </Badge>
          </div>
          {achievement.earned && achievement.earnedDate && (
            <p className="text-xs text-gray-400 mt-1">
              Earned on {achievement.earnedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
