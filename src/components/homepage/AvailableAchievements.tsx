
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Flame, Calendar, Dumbbell, Apple } from 'lucide-react';

const AvailableAchievements = () => {
  const availableAchievements = [
    {
      id: 'first-workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: <Dumbbell className="w-5 h-5" />,
      category: 'Beginner',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'weekly-streak',
      title: 'Weekly Warrior',
      description: 'Work out 5 days in a week',
      icon: <Calendar className="w-5 h-5" />,
      category: 'Consistency',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'nutrition-tracker',
      title: 'Nutrition Master',
      description: 'Log your meals for 7 consecutive days',
      icon: <Apple className="w-5 h-5" />,
      category: 'Nutrition',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'goal-setter',
      title: 'Goal Achiever',
      description: 'Complete your first fitness goal',
      icon: <Target className="w-5 h-5" />,
      category: 'Goals',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'streak-champion',
      title: 'Streak Champion',
      description: 'Maintain a 30-day workout streak',
      icon: <Flame className="w-5 h-5" />,
      category: 'Elite',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'perfectionist',
      title: 'The Perfectionist',
      description: 'Hit all your daily targets for a full week',
      icon: <Trophy className="w-5 h-5" />,
      category: 'Elite',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    }
  ];

  return (
    <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Available Achievements
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Unlock these achievements as you progress on your fitness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {availableAchievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={`bg-gray-900/40 backdrop-blur-sm ${achievement.borderColor} hover:bg-gray-800/50 transition-all duration-300 group`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${achievement.bgColor} rounded-xl flex items-center justify-center ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <Badge 
                  className={`${achievement.bgColor} ${achievement.color} ${achievement.borderColor} border`}
                  variant="outline"
                >
                  {achievement.category}
                </Badge>
              </div>
              <CardTitle className="text-white text-lg group-hover:text-orange-400 transition-colors">
                {achievement.title}
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {achievement.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full w-0 transition-all duration-500 group-hover:w-1/4"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ready to unlock</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailableAchievements;
