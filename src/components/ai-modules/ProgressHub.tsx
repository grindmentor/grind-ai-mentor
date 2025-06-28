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
  frequency: number;
  intensity: number;
  volume: number;
  consistency: number;
  progression: number;
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
    frequency: 0,
    intensity: 0,
    volume: 0,
    consistency: 0,
    progression: 0
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
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const recentWorkouts = workouts.filter(w => new Date(w.session_date) >= thirtyDaysAgo);
    const last90Days = workouts.filter(w => new Date(w.session_date) >= ninetyDaysAgo);
    
    // Frequency: Much harder - need 5+ workouts per week for high score
    const weeksInMonth = 4.3;
    const workoutsPerWeek = recentWorkouts.length / weeksInMonth;
    // Now requires 5+ sessions per week to get 100%, 4 sessions = 70%
    const frequency = Math.min((workoutsPerWeek / 5.5) * 100, 100);
    
    // Intensity: Stricter duration requirements (60-90 min optimal, penalize heavily outside range)
    const avgDuration = recentWorkouts.length > 0 
      ? recentWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / recentWorkouts.length 
      : 0;
    const optimalDuration = 75; // Increased from 60 to 75 minutes
    let intensity = 0;
    if (avgDuration >= 60 && avgDuration <= 90) {
      intensity = Math.min(100 - Math.abs(avgDuration - optimalDuration) * 3, 100); // More penalty for deviation
    } else if (avgDuration >= 45 && avgDuration < 60) {
      intensity = Math.max(50 - (60 - avgDuration) * 2, 10); // Heavy penalty for short sessions
    } else if (avgDuration > 90) {
      intensity = Math.max(60 - (avgDuration - 90) * 1.5, 15); // Penalty for overly long sessions
    } else {
      intensity = Math.max(avgDuration * 0.8, 5); // Very low score for very short sessions
    }
    
    // Volume: Much higher requirement - need 100+ workouts for max score
    const totalWorkouts = workouts.length;
    const volume = Math.min((totalWorkouts / 120) * 100, 100); // Increased from 50 to 120 workouts
    
    // Consistency: Stricter requirements - need very regular training
    let consistency = 0;
    if (recentWorkouts.length >= 16) { // Need 16+ workouts in 30 days (4+ per week)
      const idealFrequency = 4.5; // Target 4.5 workouts per week
      const deviation = Math.abs(workoutsPerWeek - idealFrequency);
      consistency = Math.max(100 - (deviation * 15), 30); // Heavy penalty for deviation
    } else if (recentWorkouts.length >= 8) {
      consistency = Math.min(recentWorkouts.length * 4, 70); // Cap at 70% for moderate activity
    } else {
      consistency = Math.min(recentWorkouts.length * 3, 40); // Cap at 40% for low activity
    }
    
    // Progression: Much stricter - need clear improvement in multiple metrics
    const recent2Weeks = workouts.filter(w => {
      const date = new Date(w.session_date);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo;
    });
    
    const older4Weeks = workouts.filter(w => {
      const date = new Date(w.session_date);
      const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return date >= sixWeeksAgo && date < twoWeeksAgo;
    });
    
    let progression = 20; // Start much lower
    if (recent2Weeks.length >= 6 && older4Weeks.length >= 6) { // Need substantial data
      const recentAvgDuration = recent2Weeks.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / recent2Weeks.length;
      const olderAvgDuration = older4Weeks.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / older4Weeks.length;
      
      const durationImprovement = (recentAvgDuration - olderAvgDuration) / olderAvgDuration;
      const frequencyImprovement = (recent2Weeks.length / 2) - (older4Weeks.length / 4); // Per week comparison
      
      // Need both duration AND frequency improvement for high scores
      if (durationImprovement > 0.1 && frequencyImprovement > 0) {
        progression = Math.min(75 + (durationImprovement * 100) + (frequencyImprovement * 20), 100);
      } else if (durationImprovement > 0.05 || frequencyImprovement > 0) {
        progression = Math.min(50 + (durationImprovement * 80) + (frequencyImprovement * 15), 75);
      } else if (durationImprovement < -0.1 || frequencyImprovement < -0.5) {
        progression = Math.max(20 + (durationImprovement * 50), 5); // Penalty for regression
      }
    } else if (workouts.length >= 10) {
      // Minimal progression score for having some data
      progression = Math.min(15 + (recentWorkouts.length * 2), 45);
    }

    setUserStats({
      frequency: Math.round(Math.max(frequency, 0)),
      intensity: Math.round(Math.max(intensity, 0)),
      volume: Math.round(Math.max(volume, 0)),
      consistency: Math.round(Math.max(consistency, 0)),
      progression: Math.round(Math.max(progression, 0))
    });
  };

  const generateBenchmarks = (workouts: WorkoutSession[]) => {
    // Much stricter benchmark calculations
    const weeklyFrequency = workouts.length > 0 ? (workouts.length / 16) : 0; // Assume 16 weeks of data for realistic average
    const avgDuration = workouts.length > 0 ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length : 0;
    const totalHours = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / 60;
    
    const benchmarkData: BenchmarkData[] = [
      {
        metric: 'Training Frequency',
        userValue: Math.round(weeklyFrequency * 10) / 10,
        percentile: Math.min(Math.round((weeklyFrequency / 5) * 100), 95), // Now need 5 sessions/week for 100%
        description: 'Sessions per week',
        comparison: weeklyFrequency >= 5 ? 'Elite - exceptional training frequency' : weeklyFrequency >= 4 ? 'Advanced - very good frequency' : weeklyFrequency >= 3 ? 'Intermediate - decent frequency' : weeklyFrequency >= 2 ? 'Beginner - building habits' : 'Starting - need more consistency'
      },
      {
        metric: 'Session Quality',
        userValue: Math.round(avgDuration),
        percentile: avgDuration >= 75 && avgDuration <= 90 ? 95 : avgDuration >= 60 && avgDuration <= 75 ? 80 : avgDuration >= 45 ? 50 : 20,
        description: 'Average duration (minutes)',
        comparison: avgDuration >= 75 && avgDuration <= 90 ? 'Elite - optimal session length' : avgDuration >= 60 ? 'Advanced - good session quality' : avgDuration >= 45 ? 'Intermediate - adequate duration' : avgDuration >= 30 ? 'Beginner - short sessions' : 'Very short - need longer sessions'
      },
      {
        metric: 'Training Volume',
        userValue: workouts.length,
        percentile: Math.min(Math.round((workouts.length / 150) * 100), 95), // Now need 150 total sessions for 100%
        description: 'Total sessions completed',
        comparison: workouts.length >= 100 ? 'Elite - exceptional dedication' : workouts.length >= 50 ? 'Advanced - strong commitment' : workouts.length >= 25 ? 'Intermediate - building momentum' : workouts.length >= 10 ? 'Beginner - good start' : 'Just starting - keep going'
      },
      {
        metric: 'Training Hours',
        userValue: Math.round(totalHours),
        percentile: Math.min(Math.round((totalHours / 400) * 100), 90), // Now need 400 hours for 90%
        description: 'Total hours trained',
        comparison: totalHours >= 300 ? 'Elite - massive time investment' : totalHours >= 150 ? 'Advanced - serious dedication' : totalHours >= 75 ? 'Intermediate - solid foundation' : totalHours >= 25 ? 'Beginner - building habits' : 'Starting - every hour matters'
      }
    ];

    setBenchmarks(benchmarkData);
  };

  const radarData = [
    { metric: 'Frequency', value: userStats.frequency, fullMark: 100 },
    { metric: 'Intensity', value: userStats.intensity, fullMark: 100 },
    { metric: 'Volume', value: userStats.volume, fullMark: 100 },
    { metric: 'Consistency', value: userStats.consistency, fullMark: 100 },
    { metric: 'Progression', value: userStats.progression, fullMark: 100 }
  ];

  const chartConfig = {
    value: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-400'; // Raised threshold
    if (percentile >= 75) return 'text-yellow-400'; // Raised threshold
    if (percentile >= 50) return 'text-orange-400'; // Raised threshold
    return 'text-red-400';
  };

  const getStatColor = (value: number) => {
    if (value >= 90) return 'text-green-300'; // Raised threshold
    if (value >= 75) return 'text-yellow-300'; // Raised threshold
    if (value >= 50) return 'text-orange-300'; // Raised threshold
    return 'text-red-300';
  };

  const getStatDescription = (stat: string, value: number) => {
    const descriptions = {
      frequency: value >= 90 ? 'Elite' : value >= 75 ? 'Advanced' : value >= 50 ? 'Intermediate' : value >= 25 ? 'Beginner' : 'Starting',
      intensity: value >= 90 ? 'Elite' : value >= 75 ? 'Advanced' : value >= 50 ? 'Intermediate' : value >= 25 ? 'Developing' : 'Poor',
      volume: value >= 90 ? 'Elite' : value >= 75 ? 'Advanced' : value >= 50 ? 'Intermediate' : value >= 25 ? 'Building' : 'Starting',
      consistency: value >= 90 ? 'Rock Solid' : value >= 75 ? 'Very Stable' : value >= 50 ? 'Stable' : value >= 25 ? 'Variable' : 'Irregular',
      progression: value >= 90 ? 'Excellent' : value >= 75 ? 'Strong' : value >= 50 ? 'Steady' : value >= 25 ? 'Slow' : 'Stagnating'
    };
    return descriptions[stat as keyof typeof descriptions] || 'Unknown';
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
                  Elite Training Analysis
                </CardTitle>
              </div>
              <CardDescription className="text-purple-200/80 text-base">
                Demanding metrics that separate elite athletes from casual trainers
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
                  <div className={`text-lg sm:text-xl lg:text-3xl font-bold mb-1 ${getStatColor(userStats.frequency)}`}>{userStats.frequency}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70 font-medium">Frequency</div>
                  <div className="text-xs text-purple-300/60 mt-1">{getStatDescription('frequency', userStats.frequency)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl lg:text-3xl font-bold mb-1 ${getStatColor(userStats.intensity)}`}>{userStats.intensity}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70 font-medium">Intensity</div>
                  <div className="text-xs text-purple-300/60 mt-1">{getStatDescription('intensity', userStats.intensity)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl lg:text-3xl font-bold mb-1 ${getStatColor(userStats.volume)}`}>{userStats.volume}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70 font-medium">Volume</div>
                  <div className="text-xs text-purple-300/60 mt-1">{getStatDescription('volume', userStats.volume)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl lg:text-3xl font-bold mb-1 ${getStatColor(userStats.consistency)}`}>{userStats.consistency}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70 font-medium">Consistency</div>
                  <div className="text-xs text-purple-300/60 mt-1">{getStatDescription('consistency', userStats.consistency)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl lg:text-3xl font-bold mb-1 ${getStatColor(userStats.progression)}`}>{userStats.progression}%</div>
                  <div className="text-xs sm:text-sm text-purple-200/70 font-medium">Progression</div>
                  <div className="text-xs text-purple-300/60 mt-1">{getStatDescription('progression', userStats.progression)}</div>
                </div>
              </div>
              
              {/* Updated Metric Explanations */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-600/20">
                  <div className="font-semibold text-purple-200 mb-1">Frequency</div>
                  <div className="text-purple-300/80">5+ sessions/week for elite level</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-600/20">
                  <div className="font-semibold text-purple-200 mb-1">Intensity</div>
                  <div className="text-purple-300/80">75-90 min optimal, heavily penalized outside</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-600/20">
                  <div className="font-semibold text-purple-200 mb-1">Volume</div>
                  <div className="text-purple-300/80">120+ total sessions for maximum score</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-600/20">
                  <div className="font-semibold text-purple-200 mb-1">Consistency</div>
                  <div className="text-purple-300/80">16+ sessions monthly, minimal deviation</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-600/20 sm:col-span-2 lg:col-span-1">
                  <div className="font-semibold text-purple-200 mb-1">Progression</div>
                  <div className="text-purple-300/80">Clear improvement in multiple metrics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benchmarking Section */}
          <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Trophy className="w-6 h-6 mr-3 text-purple-300" />
                Elite Performance Benchmarks
              </CardTitle>
              <CardDescription className="text-purple-200/70">
                Challenging standards that separate elite performers from the rest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benchmarks.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-purple-200 mb-2">Start Training to See Benchmarks</h3>
                  <p className="text-purple-300/70">
                    Complete workouts to unlock demanding performance comparisons
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
                            {benchmark.percentile}th percentile
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                          <span className="text-purple-200/70">Performance Level</span>
                          <span className={`font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                            {benchmark.percentile >= 90 ? 'Elite' : benchmark.percentile >= 75 ? 'Advanced' : benchmark.percentile >= 50 ? 'Intermediate' : benchmark.percentile >= 25 ? 'Beginner' : 'Starting'}
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
                  Elite Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {Math.round((userStats.frequency + userStats.intensity + userStats.volume + userStats.consistency + userStats.progression) / 5)}%
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Overall rating</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/40 border-purple-600/50 backdrop-blur-sm">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="flex items-center text-white text-xs sm:text-sm">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" />
                  Training Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {Math.round(workoutSessions.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / 60)}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">Total hours</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
