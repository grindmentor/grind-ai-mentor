
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmoothButton } from '@/components/ui/smooth-button';
import { ArrowLeft, TrendingUp, Target, Award, Activity, Hexagon, Trophy, Users, BarChart3 } from 'lucide-react';
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
  strength: number;
  endurance: number;
  consistency: number;
  technique: number;
  recovery: number;
}

interface BenchmarkData {
  metric: string;
  userValue: number;
  percentile: number;
  description: string;
  comparison: string;
  demographic: string;
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
    strength: 0,
    endurance: 0,
    consistency: 0,
    technique: 0,
    recovery: 0
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
    if (workouts.length === 0) {
      // No mock data - all start at 0
      setUserStats({
        strength: 0,
        endurance: 0,
        consistency: 0,
        technique: 0,
        recovery: 0
      });
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workouts.filter(w => new Date(w.session_date) >= thirtyDaysAgo);
    
    const weeklyFrequency = recentWorkouts.length / 4.3;
    const consistency = Math.min((weeklyFrequency / 5) * 100, 85);
    
    const totalWorkouts = workouts.length;
    const strength = Math.min((totalWorkouts / 80) * 100, 90);
    
    const avgDuration = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length 
      : 0;
    const endurance = Math.min((avgDuration / 120) * 100, 85);
    
    const technique = Math.min((totalWorkouts / 100) * 100, 80);
    const recovery = Math.min(Math.max((4 - Math.abs(weeklyFrequency - 3)) / 4 * 100, 0), 75);

    setUserStats({
      strength: Math.round(strength),
      endurance: Math.round(endurance),
      consistency: Math.round(consistency),
      technique: Math.round(technique),
      recovery: Math.round(recovery)
    });
  };

  const generateBenchmarks = (workouts: WorkoutSession[]) => {
    if (workouts.length === 0) {
      setBenchmarks([]);
      return;
    }

    const weeklyFrequency = workouts.length > 0 ? (workouts.length / 12) : 0;
    const totalSessions = workouts.length;
    
    const benchmarkData: BenchmarkData[] = [
      {
        metric: 'Training Frequency',
        userValue: Math.round(weeklyFrequency * 10) / 10,
        percentile: Math.min(Math.round((weeklyFrequency / 4.5) * 100), 92),
        description: 'Workouts per week vs general population',
        demographic: 'Adults 25-40',
        comparison: weeklyFrequency >= 4 ? 'Elite consistency - top 8% of trainees' : 
                   weeklyFrequency >= 3 ? 'Excellent - top 25% of gym members' : 
                   weeklyFrequency >= 2 ? 'Above average - better than 60%' : 
                   'Building habits - room for improvement'
      },
      {
        metric: 'Total Experience',
        userValue: totalSessions,
        percentile: Math.min(Math.round((totalSessions / 120) * 100), 95),
        description: 'Lifetime training sessions',
        demographic: 'Fitness enthusiasts',
        comparison: totalSessions >= 100 ? 'Experienced lifter - top 15%' : 
                   totalSessions >= 50 ? 'Intermediate - top 40%' : 
                   totalSessions >= 20 ? 'Beginner+ - better than 70% of starters' : 
                   'Just beginning your journey!'
      }
    ];

    setBenchmarks(benchmarkData);
  };

  const radarData = [
    { metric: 'Strength', value: userStats.strength, fullMark: 100 },
    { metric: 'Endurance', value: userStats.endurance, fullMark: 100 },
    { metric: 'Consistency', value: userStats.consistency, fullMark: 100 },
    { metric: 'Technique', value: userStats.technique, fullMark: 100 },
    { metric: 'Recovery', value: userStats.recovery, fullMark: 100 }
  ];

  const chartConfig = {
    value: {
      label: "Progress",
      color: "hsl(var(--chart-1))",
    },
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 85) return 'text-green-400';
    if (percentile >= 70) return 'text-blue-400';
    if (percentile >= 50) return 'text-yellow-400';
    if (percentile >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 90) return { text: 'Elite', color: 'bg-green-600/20 text-green-300 border-green-500/30' };
    if (percentile >= 75) return { text: 'Advanced', color: 'bg-blue-600/20 text-blue-300 border-blue-500/30' };
    if (percentile >= 60) return { text: 'Good', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' };
    if (percentile >= 40) return { text: 'Average', color: 'bg-orange-600/20 text-orange-300 border-orange-500/30' };
    return { text: 'Developing', color: 'bg-red-600/20 text-red-300 border-red-500/30' };
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
              <span className="text-white text-lg font-medium">Analyzing Your Progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no workout data
  if (workoutSessions.length === 0) {
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
          <div className="text-center space-y-6 max-w-md">
            <Hexagon className="w-24 h-24 text-purple-400/50 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">No Progress Data Yet</h2>
              <p className="text-purple-200/80 mb-6">
                Start logging workouts to see your personalized fitness analytics and progress tracking here.
              </p>
              <SmoothButton
                onClick={() => window.location.href = '/app?module=workout-logger-ai'}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3"
              >
                Log Your First Workout
              </SmoothButton>
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
          
          {/* Hero Section - Enhanced Hexagon Chart */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/50 border-purple-600/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Hexagon className="w-10 h-10 text-purple-300" />
                <CardTitle className="text-white text-3xl lg:text-4xl font-bold">
                  Your Fitness DNA
                </CardTitle>
              </div>
              <CardDescription className="text-purple-200/80 text-lg max-w-2xl mx-auto">
                AI-powered analysis of your training profile based on workout data and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] w-full">
                <RadarChart data={radarData}>
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <PolarGrid 
                    stroke="rgba(147, 51, 234, 0.3)" 
                    strokeWidth={2}
                    radialLines={true}
                  />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ 
                      fill: 'white', 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 600 
                    }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="rgba(147, 51, 234, 1)"
                    fill="rgba(147, 51, 234, 0.3)"
                    strokeWidth={4}
                    dot={{ 
                      fill: 'rgba(147, 51, 234, 1)', 
                      r: 8,
                      strokeWidth: 2,
                      stroke: 'white'
                    }}
                  />
                </RadarChart>
              </ChartContainer>
              
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-8">
                {radarData.map((stat, index) => (
                  <div key={stat.metric} className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-300 mb-1 sm:mb-2">
                      {stat.value}%
                    </div>
                    <div className="text-xs sm:text-sm text-purple-200/70 font-medium">
                      {stat.metric}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Benchmarks Section */}
          {benchmarks.length > 0 && (
            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-2xl">
                  <BarChart3 className="w-7 h-7 mr-3 text-purple-300" />
                  Performance Benchmarks
                </CardTitle>
                <CardDescription className="text-purple-200/70 text-base">
                  See how your training measures against demographic standards and research data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {benchmarks.map((benchmark, index) => {
                    const badge = getPercentileBadge(benchmark.percentile);
                    return (
                      <div key={index} className="bg-purple-800/30 rounded-xl p-6 border border-purple-600/30 hover:border-purple-500/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-bold text-white text-lg">{benchmark.metric}</h4>
                              <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge.color}`}>
                                {badge.text}
                              </div>
                            </div>
                            <p className="text-purple-200/80 text-sm mb-1">{benchmark.description}</p>
                            <p className="text-purple-300/60 text-xs">Compared to: {benchmark.demographic}</p>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-3xl lg:text-4xl font-bold text-purple-300 mb-1">
                              {typeof benchmark.userValue === 'number' && benchmark.userValue < 10 
                                ? benchmark.userValue.toFixed(1) 
                                : benchmark.userValue}
                            </div>
                            <div className={`text-base font-bold ${getPercentileColor(benchmark.percentile)}`}>
                              {benchmark.percentile}th percentile
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-purple-200/70">Population Ranking</span>
                            <span className={`font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                              Better than {benchmark.percentile}% of people
                            </span>
                          </div>
                          <div className="w-full bg-purple-950/50 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${benchmark.percentile}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-purple-950/40 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <p className="text-purple-200/90 text-sm leading-relaxed">
                              {benchmark.comparison}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="flex items-center text-white text-sm">
                  <Trophy className="w-4 h-4 mr-2 text-purple-300" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl lg:text-3xl font-bold text-white">{workoutSessions.length}</div>
                <div className="text-xs text-purple-200/70 mt-1">Workouts logged</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="flex items-center text-white text-sm">
                  <Activity className="w-4 h-4 mr-2 text-purple-300" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {workoutSessions.filter(w => {
                    const sessionDate = new Date(w.session_date);
                    const now = new Date();
                    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Recent activity</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="flex items-center text-white text-sm">
                  <Target className="w-4 h-4 mr-2 text-purple-300" />
                  Fitness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {Math.round((userStats.strength + userStats.endurance + userStats.consistency + userStats.technique + userStats.recovery) / 5)}%
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Overall progress</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
