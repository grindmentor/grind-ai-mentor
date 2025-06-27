import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmoothButton } from '@/components/ui/smooth-button';
import { ArrowLeft, TrendingUp, Calendar, Target, Award, Activity, Scale, Hexagon, Zap, Trophy, Heart, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface WorkoutSession {
  id: string;
  workout_name: string;
  session_date: string;
  duration_minutes: number;
  exercises_data?: any;
  calories_burned?: number;
}

interface UserStats {
  dedication: number;
  strength: number;
  recovery: number;
  consistency: number;
  endurance: number;
}

interface ProgressHubProps {
  onBack: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    dedication: 0,
    strength: 0,
    recovery: 0,
    consistency: 0,
    endurance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load workout sessions with better error handling
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(50);

      if (workoutError) {
        console.error('Workout sessions error:', workoutError);
      } else if (workoutData) {
        setWorkoutSessions(workoutData);
      }

      // Calculate stats from workout data
      calculateUserStats(workoutData || []);

    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: 'Loading Error',
        description: 'Some data may not be available. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (workouts: WorkoutSession[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate consistency (workouts in last 30 days)
    const recentWorkouts = workouts.filter(w => new Date(w.session_date) >= thirtyDaysAgo);
    const consistency = Math.min((recentWorkouts.length / 20) * 100, 100);
    
    // Calculate dedication (total workout sessions)
    const dedication = Math.min((workouts.length / 50) * 100, 100);
    
    // Calculate strength (average workout duration)
    const avgDuration = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length 
      : 0;
    const strength = Math.min((avgDuration / 90) * 100, 100);
    
    // Calculate endurance (calories burned trend)
    const avgCalories = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0) / workouts.length 
      : 0;
    const endurance = Math.min((avgCalories / 400) * 100, 100);
    
    // Calculate recovery based on workout frequency (optimal is 3-4 times per week)
    const weeklyWorkouts = recentWorkouts.length / 4; // approximate weeks in 30 days
    const recovery = Math.min(Math.max((4 - Math.abs(weeklyWorkouts - 3.5)) / 4 * 100, 0), 100);

    setUserStats({
      dedication: Math.round(dedication),
      strength: Math.round(strength),
      recovery: Math.round(recovery),
      consistency: Math.round(consistency),
      endurance: Math.round(endurance)
    });
  };

  const radarData = [
    { metric: 'Dedication', value: userStats.dedication, fullMark: 100 },
    { metric: 'Strength', value: userStats.strength, fullMark: 100 },
    { metric: 'Recovery', value: userStats.recovery, fullMark: 100 },
    { metric: 'Consistency', value: userStats.consistency, fullMark: 100 },
    { metric: 'Endurance', value: userStats.endurance, fullMark: 100 }
  ];

  const chartConfig = {
    value: {
      label: "Progress",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-purple-800/20 text-white overflow-x-hidden">
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <SmoothButton
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-purple-500/20 backdrop-blur-sm hover:text-purple-400 transition-colors font-medium flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </SmoothButton>
              <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                Progress Hub
              </h1>
              <div className="w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-6 sm:h-8 bg-purple-700/30 rounded w-1/4"></div>
              <div className="h-24 sm:h-32 bg-purple-700/30 rounded"></div>
              <div className="h-48 sm:h-64 bg-purple-700/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-purple-800/20 text-white overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <SmoothButton
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-purple-500/20 backdrop-blur-sm hover:text-purple-400 transition-colors font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </SmoothButton>
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Progress Hub
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-full">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Mobile-optimized Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  Total Workouts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{workoutSessions.length}</div>
                <div className="text-xs text-purple-200/70 mt-1">Sessions completed</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {workoutSessions.filter(w => {
                    const sessionDate = new Date(w.session_date);
                    const now = new Date();
                    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Workouts</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  Avg Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {workoutSessions.length > 0 
                    ? Math.round(workoutSessions.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workoutSessions.length)
                    : 0} min
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Per workout</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  Weekly Avg
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {workoutSessions.length > 0 
                    ? Math.round(workoutSessions.filter(w => {
                        const sessionDate = new Date(w.session_date);
                        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        return sessionDate >= thirtyDaysAgo;
                      }).length / 4.3) // 30 days ≈ 4.3 weeks
                    : 0}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Workouts/week</div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-optimized Hexagon Radar Chart */}
          <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm mb-6 sm:mb-8">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-white flex items-center text-base sm:text-lg lg:text-xl">
                <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-300" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-purple-200/70 text-xs sm:text-sm">
                AI-powered analysis of your fitness journey based on workout data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px] lg:max-h-[400px] w-full">
                <RadarChart data={radarData}>
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <PolarGrid stroke="rgba(147, 51, 234, 0.3)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'white', fontSize: isMobile ? 10 : 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={0} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: isMobile ? 8 : 10 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="rgba(147, 51, 234, 0.8)"
                    fill="rgba(147, 51, 234, 0.3)"
                    strokeWidth={2}
                  />
                </RadarChart>
              </ChartContainer>
              
              {/* Mobile-optimized Metrics Legend */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-300">{userStats.dedication}%</div>
                  <div className="text-xs text-purple-200/70">Dedication</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-300">{userStats.strength}%</div>
                  <div className="text-xs text-purple-200/70">Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-300">{userStats.recovery}%</div>
                  <div className="text-xs text-purple-200/70">Recovery</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-300">{userStats.consistency}%</div>
                  <div className="text-xs text-purple-200/70">Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-300">{userStats.endurance}%</div>
                  <div className="text-xs text-purple-200/70">Endurance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-300" />
                Recent Workouts
              </CardTitle>
              <CardDescription className="text-purple-200/70">
                Your latest training sessions automatically tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workoutSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">No Workouts Yet</h3>
                  <p className="text-purple-300/70">Start using the Workout Logger to see your progress here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workoutSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{session.workout_name}</h4>
                          <p className="text-sm text-purple-200/70">
                            {new Date(session.session_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-300 font-medium">{session.duration_minutes} min</div>
                          {session.calories_burned && (
                            <div className="text-sm text-purple-200/70">{session.calories_burned} cal</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-300" />
                AI Insights
              </CardTitle>
              <CardDescription className="text-purple-200/70">
                Smart recommendations based on your workout patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutSessions.length > 0 ? (
                  <>
                    <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/30">
                      <h4 className="font-semibold text-white mb-2">🎯 Training Consistency</h4>
                      <p className="text-sm text-purple-200/70">
                        {userStats.consistency > 80 
                          ? "Excellent consistency! You're maintaining a great workout routine."
                          : userStats.consistency > 60
                          ? "Good consistency! Try to maintain regular workout schedules for better results."
                          : "Focus on building consistency. Regular workouts lead to better long-term results."
                        }
                      </p>
                    </div>
                    <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/30">
                      <h4 className="font-semibold text-white mb-2">💪 Workout Intensity</h4>
                      <p className="text-sm text-purple-200/70">
                        {userStats.strength > 75
                          ? "Your workout duration suggests good training intensity. Keep challenging yourself!"
                          : "Consider extending your workouts or increasing intensity for better strength gains."
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">Start Your Fitness Journey</h3>
                    <p className="text-purple-300/70">
                      Begin logging workouts to receive personalized AI insights and track your progress
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
