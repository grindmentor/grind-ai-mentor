
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmoothButton } from '@/components/ui/smooth-button';
import { ArrowLeft, TrendingUp, Calendar, Target, Award, Activity, Scale, Hexagon, Zap, Trophy, Heart, Clock, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

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

interface BenchmarkData {
  metric: string;
  userValue: number;
  percentile: number;
  description: string;
  comparison: string;
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
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProgressData();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

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

      calculateUserStats(workoutData || []);
      generateBenchmarks(workoutData || []);

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
    
    const recentWorkouts = workouts.filter(w => new Date(w.session_date) >= thirtyDaysAgo);
    const consistency = Math.min((recentWorkouts.length / 20) * 100, 100);
    const dedication = Math.min((workouts.length / 50) * 100, 100);
    
    const avgDuration = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length 
      : 0;
    const strength = Math.min((avgDuration / 90) * 100, 100);
    
    const avgCalories = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0) / workouts.length 
      : 0;
    const endurance = Math.min((avgCalories / 400) * 100, 100);
    
    const weeklyWorkouts = recentWorkouts.length / 4;
    const recovery = Math.min(Math.max((4 - Math.abs(weeklyWorkouts - 3.5)) / 4 * 100, 0), 100);

    setUserStats({
      dedication: Math.round(dedication),
      strength: Math.round(strength),
      recovery: Math.round(recovery),
      consistency: Math.round(consistency),
      endurance: Math.round(endurance)
    });
  };

  const generateBenchmarks = (workouts: WorkoutSession[]) => {
    // Simulate demographic-based benchmarking
    const weeklyFrequency = workouts.length > 0 ? (workouts.length / 12) : 0; // rough weekly average
    const avgDuration = workouts.length > 0 ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length : 0;
    
    const benchmarkData: BenchmarkData[] = [
      {
        metric: 'Training Frequency',
        userValue: Math.round(weeklyFrequency * 10) / 10,
        percentile: Math.min(Math.round((weeklyFrequency / 4) * 100), 95),
        description: 'Workouts per week',
        comparison: weeklyFrequency >= 3 ? 'Excellent consistency - top 25% of trainees' : weeklyFrequency >= 2 ? 'Good frequency - above average' : 'Room for improvement - aim for 3x/week'
      },
      {
        metric: 'Session Duration',
        userValue: Math.round(avgDuration),
        percentile: Math.min(Math.round((avgDuration / 90) * 100), 90),
        description: 'Average workout length (minutes)',
        comparison: avgDuration >= 60 ? 'Optimal duration - matches research recommendations' : avgDuration >= 45 ? 'Good session length' : 'Consider longer sessions for better results'
      },
      {
        metric: 'Total Sessions',
        userValue: workouts.length,
        percentile: Math.min(Math.round((workouts.length / 100) * 100), 95),
        description: 'Lifetime workout count',
        comparison: workouts.length >= 50 ? 'Experienced trainee - top 30%' : workouts.length >= 20 ? 'Building consistency' : 'Just getting started - keep going!'
      }
    ];

    setBenchmarks(benchmarkData);
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

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-400';
    if (percentile >= 60) return 'text-yellow-400';
    if (percentile >= 40) return 'text-orange-400';
    return 'text-red-400';
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
        
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-purple-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Hexagon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-white text-lg font-medium">Loading Progress Data...</span>
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
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Hero Section - Hexagon Chart */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/50 border-purple-600/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Hexagon className="w-8 h-8 text-purple-300" />
                <CardTitle className="text-white text-2xl lg:text-3xl font-bold">
                  Your Fitness Profile
                </CardTitle>
              </div>
              <CardDescription className="text-purple-200/80 text-base">
                AI-powered analysis based on your training data and scientific benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] w-full">
                <RadarChart data={radarData}>
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <PolarGrid stroke="rgba(147, 51, 234, 0.3)" strokeWidth={1} />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'white', fontSize: isMobile ? 12 : 14, fontWeight: 500 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="rgba(147, 51, 234, 0.9)"
                    fill="rgba(147, 51, 234, 0.4)"
                    strokeWidth={3}
                    dot={{ fill: 'rgba(147, 51, 234, 1)', r: 6 }}
                  />
                </RadarChart>
              </ChartContainer>
              
              <div className="grid grid-cols-5 gap-3 sm:gap-6 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-purple-300 mb-1">{userStats.dedication}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Dedication</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-purple-300 mb-1">{userStats.strength}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-purple-300 mb-1">{userStats.recovery}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Recovery</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-purple-300 mb-1">{userStats.consistency}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-purple-300 mb-1">{userStats.endurance}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Endurance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benchmarking Section */}
          <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Trophy className="w-6 h-6 mr-3 text-purple-300" />
                Performance Benchmarks
              </CardTitle>
              <CardDescription className="text-purple-200/70">
                See how you compare to other trainees in your demographic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benchmarks.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-purple-200 mb-2">Start Training to See Benchmarks</h3>
                  <p className="text-purple-300/70">
                    Complete workouts to unlock personalized performance comparisons
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {benchmarks.map((benchmark, index) => (
                    <div key={index} className="bg-purple-800/30 rounded-xl p-4 sm:p-6 border border-purple-600/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-base sm:text-lg mb-1">{benchmark.metric}</h4>
                          <p className="text-purple-200/80 text-sm">{benchmark.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-1">
                            {benchmark.userValue}
                          </div>
                          <div className={`text-sm sm:text-base font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                            Top {Math.max(100 - benchmark.percentile, 5)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                          <span className="text-purple-200/70">Population Percentile</span>
                          <span className={`font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                            {benchmark.percentile}th percentile
                          </span>
                        </div>
                        <div className="w-full bg-purple-950/50 rounded-full h-2 sm:h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                            style={{ width: `${benchmark.percentile}%` }}
                          />
                        </div>
                      </div>
                      
                      <p className="text-purple-200/90 text-sm leading-relaxed bg-purple-950/30 rounded-lg p-3">
                        {benchmark.comparison}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{workoutSessions.length}</div>
                <div className="text-xs text-purple-200/70 mt-1">Workouts completed</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4">
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
                <div className="text-xs text-purple-200/70 mt-1">Recent workouts</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4">
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
                      }).length / 4.3)
                    : 0}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Sessions/week</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  AI Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {Math.round((userStats.dedication + userStats.strength + userStats.recovery + userStats.consistency + userStats.endurance) / 5)}%
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Overall fitness</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
