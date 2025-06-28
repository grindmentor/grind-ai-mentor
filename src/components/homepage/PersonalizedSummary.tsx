
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, TrendingUp, Target, Activity, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PersonalizedSummary = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    workoutsThisWeek: 0,
    caloriesLogged: 0,
    waterIntake: 0,
    streakDays: 0,
    nextGoal: "No active goals",
    bodyWeight: "Not set",
    weeklyGoal: "Not set"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRealUserData();
    }
  }, [user]);

  const loadRealUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get workouts this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_date', startOfWeek.toISOString().split('T')[0]);

      // Get food logs today
      const today = new Date().toISOString().split('T')[0];
      const { data: foodLogs } = await supabase
        .from('food_log_entries')
        .select('calories')
        .eq('user_id', user.id)
        .eq('logged_date', today);

      // Get user profile for weight and goals
      const { data: profile } = await supabase
        .from('profiles')
        .select('weight, goal')
        .eq('id', user.id)
        .single();

      // Get active goals
      const { data: goals } = await supabase
        .from('user_goals')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1);

      // Calculate streak (consecutive days with workouts in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentWorkouts } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', user.id)
        .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: false });

      const streak = calculateStreak(recentWorkouts || []);
      const totalCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;

      setUserData({
        workoutsThisWeek: workouts?.length || 0,
        caloriesLogged: totalCalories,
        waterIntake: 0, // Would need a separate water tracking table
        streakDays: streak,
        nextGoal: goals?.[0]?.title || "Create your first goal",
        bodyWeight: profile?.weight ? `${profile.weight} lbs` : "Not set",
        weeklyGoal: profile?.goal || "Not set"
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (workouts: any[]) => {
    if (workouts.length === 0) return 0;
    
    const workoutDates = workouts.map(w => new Date(w.session_date).toDateString());
    const uniqueDates = [...new Set(workoutDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of uniqueDates) {
      const workoutDate = new Date(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = workoutDate;
      } else if (daysDiff > streak + 1) {
        break;
      }
    }
    
    return streak;
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

  if (loading) {
    return (
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/30 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-gray-700/30 rounded"></div>
              <div className="h-16 bg-gray-700/30 rounded"></div>
              <div className="h-16 bg-gray-700/30 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no data
  if (userData.workoutsThisWeek === 0 && userData.caloriesLogged === 0 && userData.streakDays === 0) {
    return (
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center text-xl">
            <User className="w-5 h-5 mr-2 text-orange-400" />
            Your Progress Summary
          </CardTitle>
          <CardDescription>
            Start logging workouts and meals to see your personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
          <p className="text-gray-400 mb-4">
            Log your first workout or meal to start tracking your progress
          </p>
        </CardContent>
      </Card>
    );
  }

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
            <h3 className="text-orange-200 font-medium text-sm">Next Goal</h3>
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

        {/* Quick Insights - Only show if there's actual data */}
        {(userData.workoutsThisWeek > 0 || userData.streakDays > 0) && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-orange-400" />
              Quick Insights
            </h4>
            <div className="space-y-2">
              {userData.workoutsThisWeek >= 3 && (
                <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-200">
                  ✓ You're on track with your weekly workout goal
                </div>
              )}
              {userData.streakDays >= 7 && (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-200">
                  🔥 Amazing streak! Keep up the consistency
                </div>
              )}
              {userData.caloriesLogged > 0 && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                  📊 Great job tracking your nutrition today
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedSummary;
