
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
    <section id="achievements" className="scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Available Achievements
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-prose mx-auto">
            Unlock these achievements as you progress on your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {availableAchievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`bg-gray-900/40 backdrop-blur-sm ${achievement.borderColor} hover:bg-gray-800/50 transition-all duration-300 group w-full`}
            >
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${achievement.bgColor} rounded-xl flex items-center justify-center ${achievement.color}`}>
                    {achievement.icon}
                  </div>
                  <Badge 
                    className={`${achievement.bgColor} ${achievement.color} ${achievement.borderColor} border text-xs sm:text-sm`}
                    variant="outline"
                  >
                    {achievement.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-base sm:text-lg group-hover:text-orange-400 transition-colors">
                  {achievement.title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {achievement.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-gray-600 h-2 rounded-full w-0 transition-all duration-500 group-hover:w-1/4"></div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Ready to unlock</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableAchievements;
