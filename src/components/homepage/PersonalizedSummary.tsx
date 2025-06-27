
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, TrendingUp, Target, Activity, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PersonalizedSummary = () => {
  const { user } = useAuth();

  // Mock data - in real app this would come from user's actual data
  const userData = {
    workoutsThisWeek: 3,
    caloriesLogged: 1847,
    waterIntake: 2.1,
    streakDays: 12,
    nextGoal: "Reach 4 workouts this week",
    bodyWeight: "165 lbs",
    weeklyGoal: "Cut"
  };

  const stats = [
    {
      icon: <Activity className="w-4 h-4" />,
      label: "Workouts This Week",
      value: userData.workoutsThisWeek,
      unit: "sessions",
      color: "text-green-400"
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Calories Today",
      value: userData.caloriesLogged,
      unit: "kcal",
      color: "text-blue-400"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Current Streak",
      value: userData.streakDays,
      unit: "days",
      color: "text-orange-400"
    }
  ];

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-xl">
          <User className="w-5 h-5 mr-2 text-orange-400" />
          Your Progress Summary
        </CardTitle>
        <CardDescription>
          Personalized insights based on your fitness data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Goal */}
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-orange-200 font-medium text-sm">Current Goal</h3>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {userData.weeklyGoal}
            </Badge>
          </div>
          <p className="text-white text-sm">{userData.nextGoal}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 bg-gray-800/50 rounded-lg text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-white font-semibold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.unit}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Insights */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-orange-400" />
            Quick Insights
          </h4>
          <div className="space-y-2">
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-200">
              ✓ You're on track with your weekly workout goal
            </div>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
              💧 Great hydration consistency this week
            </div>
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-200">
              📈 Your streak is at an all-time high!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedSummary;
