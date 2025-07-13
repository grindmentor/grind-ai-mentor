import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Activity, 
  Zap,
  Heart,
  Brain,
  Dumbbell,
  Scale,
  Clock,
  ChevronRight,
  Trophy,
  Star,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressMetrics {
  strength: number;
  endurance: number;
  consistency: number;
  nutrition: number;
  recovery: number;
  overall: number;
}

interface WorkoutData {
  total_sessions: number;
  recent_sessions: number;
  avg_duration: number;
  total_exercises: number;
  consistency_streak: number;
}

interface NutritionData {
  entries_count: number;
  protein_avg: number;
  calories_avg: number;
  consistency_days: number;
}

interface RecoveryData {
  sleep_avg: number;
  stress_avg: number;
  recovery_entries: number;
}

interface ProgressHubProps {
  onBack?: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    strength: 0,
    endurance: 0,
    consistency: 0,
    nutrition: 0,
    recovery: 0,
    overall: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Elite-level thresholds that make 100% extremely difficult
  const ELITE_THRESHOLDS = {
    strength: {
      sessions: 200,    // 200+ workout sessions
      progression: 50,  // 50+ progressive overload entries
      consistency: 90   // 90+ day streak
    },
    endurance: {
      cardio_sessions: 100,
      total_duration: 5000, // 83+ hours of cardio
      intensity_variety: 20  // 20+ different cardio types
    },
    consistency: {
      workout_streak: 100,   // 100-day workout streak
      weekly_frequency: 6,   // 6 workouts per week average
      months_active: 12      // 12+ months of activity
    },
    nutrition: {
      log_streak: 60,        // 60-day logging streak
      protein_consistency: 90, // 90% of days hitting protein
      macro_balance: 80      // 80% balanced macro days
    },
    recovery: {
      sleep_consistency: 50,  // 50+ sleep logs
      stress_management: 80,  // 80% low stress days
      recovery_tracking: 90   // 90+ recovery entries
    }
  };

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const calculateEliteScore = (value: number, threshold: number, curve: 'linear' | 'exponential' = 'exponential'): number => {
    if (value <= 0) return 0;
    
    let score;
    if (curve === 'exponential') {
      // Exponential curve that makes reaching 100% extremely difficult
      score = (1 - Math.exp(-3 * value / threshold)) * 100;
      // Apply diminishing returns after 70%
      if (score > 70) {
        const excess = score - 70;
        score = 70 + excess * 0.3; // Severely limit progress after 70%
      }
    } else {
      score = Math.min((value / threshold) * 100, 100);
    }
    
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const loadProgressData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load workout data
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id);

      const { data: progressEntries } = await supabase
        .from('progressive_overload_entries')
        .select('*')
        .eq('user_id', user.id);

      // Load nutrition data
      const { data: foodEntries } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id);

      // Load recovery data
      const { data: recoveryEntries } = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user.id);

      // Calculate sophisticated metrics
      const workoutData: WorkoutData = {
        total_sessions: workoutSessions?.length || 0,
        recent_sessions: workoutSessions?.filter(s => 
          new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0,
        avg_duration: workoutSessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / (workoutSessions?.length || 1) || 0,
        total_exercises: progressEntries?.length || 0,
        consistency_streak: calculateWorkoutStreak(workoutSessions || [])
      };

      const nutritionData: NutritionData = {
        entries_count: foodEntries?.length || 0,
        protein_avg: foodEntries?.reduce((sum, e) => sum + (e.protein || 0), 0) / (foodEntries?.length || 1) || 0,
        calories_avg: foodEntries?.reduce((sum, e) => sum + (e.calories || 0), 0) / (foodEntries?.length || 1) || 0,
        consistency_days: calculateNutritionStreak(foodEntries || [])
      };

      const recoveryData: RecoveryData = {
        sleep_avg: recoveryEntries?.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / (recoveryEntries?.length || 1) || 0,
        stress_avg: recoveryEntries?.reduce((sum, e) => sum + (e.stress_level || 0), 0) / (recoveryEntries?.length || 1) || 0,
        recovery_entries: recoveryEntries?.length || 0
      };

      // Calculate elite-level scores with challenging curves
      const strengthScore = calculateEliteScore(
        workoutData.total_sessions + (progressEntries?.length || 0) * 2 + workoutData.consistency_streak,
        ELITE_THRESHOLDS.strength.sessions + ELITE_THRESHOLDS.strength.progression * 2 + ELITE_THRESHOLDS.strength.consistency
      );

      const enduranceScore = calculateEliteScore(
        workoutData.total_sessions * 0.6 + workoutData.avg_duration * 0.1,
        ELITE_THRESHOLDS.endurance.cardio_sessions + ELITE_THRESHOLDS.endurance.total_duration * 0.1
      );

      const consistencyScore = calculateEliteScore(
        workoutData.consistency_streak + (workoutData.recent_sessions * 3),
        ELITE_THRESHOLDS.consistency.workout_streak + (ELITE_THRESHOLDS.consistency.weekly_frequency * 4 * 3)
      );

      const nutritionScore = calculateEliteScore(
        nutritionData.entries_count + nutritionData.consistency_days * 2,
        ELITE_THRESHOLDS.nutrition.log_streak + ELITE_THRESHOLDS.nutrition.log_streak * 2
      );

      const recoveryScore = calculateEliteScore(
        recoveryData.recovery_entries + (recoveryData.sleep_avg > 7 ? 20 : 0),
        ELITE_THRESHOLDS.recovery.recovery_tracking + 20
      );

      const overallScore = Math.round(
        (strengthScore + enduranceScore + consistencyScore + nutritionScore + recoveryScore) / 5
      );

      setMetrics({
        strength: strengthScore,
        endurance: enduranceScore,
        consistency: consistencyScore,
        nutrition: nutritionScore,
        recovery: recoveryScore,
        overall: overallScore
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWorkoutStreak = (sessions: any[]): number => {
    if (!sessions.length) return 0;
    
    const sortedSessions = sessions
      .map(s => new Date(s.session_date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const sessionDate of sortedSessions) {
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateNutritionStreak = (entries: any[]): number => {
    if (!entries.length) return 0;
    
    const dates = entries
      .map(e => e.logged_date)
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const date of dates) {
      const daysDiff = Math.floor((currentDate.getTime() - new Date(date).getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = new Date(date);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
    if (score >= 80) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    if (score >= 70) return 'text-green-400 bg-green-500/20 border-green-500/40';
    if (score >= 50) return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 95) return 'Elite';
    if (score >= 85) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 50) return 'Developing';
    return 'Beginner';
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading progress data..." />
      </div>
    );
  }

  // Hexagonal Progress Component
  const HexagonProgress = ({ score, size, label, icon: Icon }: { 
    score: number; 
    size: 'small' | 'large'; 
    label: string; 
    icon?: any;
  }) => {
    const isLarge = size === 'large';
    const hexSize = isLarge ? 120 : 80;
    const strokeWidth = isLarge ? 8 : 6;
    const circumference = hexSize * 0.6 * 6; // Approximate hexagon perimeter
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - score / 100);
    
    return (
      <div className="relative flex flex-col items-center">
        <div className={`relative ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
          {/* Hexagon SVG */}
          <svg 
            className="absolute inset-0 transform -rotate-90" 
            width={hexSize + 20} 
            height={hexSize + 20}
            viewBox={`0 0 ${hexSize + 20} ${hexSize + 20}`}
          >
            {/* Background hexagon */}
            <polygon
              points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
              fill="none"
              stroke="rgb(55, 65, 81)"
              strokeWidth={strokeWidth}
            />
            {/* Progress hexagon */}
            <polygon
              points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
              fill="none"
              stroke={score < 50 ? '#ef4444' : score < 70 ? '#3b82f6' : score < 80 ? '#10b981' : score < 90 ? '#f59e0b' : '#a855f7'}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {Icon && !isLarge && <Icon className="w-4 h-4 text-orange-400 mb-1" />}
            <span className={`font-bold text-white ${isLarge ? 'text-2xl' : 'text-sm'}`}>
              {score}%
            </span>
            {isLarge && (
              <Badge className={`${getScoreColor(score)} text-xs mt-2`}>
                {getScoreLabel(score)}
              </Badge>
            )}
          </div>
        </div>
        
        <span className={`text-center font-medium mt-2 ${isLarge ? 'text-lg text-white' : 'text-xs text-gray-300'}`}>
          {label}
        </span>
      </div>
    );
  };

  const MetricCard = ({ 
    title, 
    icon: Icon, 
    score, 
    description 
  }: { 
    title: string; 
    icon: any; 
    score: number; 
    description: string;
  }) => (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white text-sm">{title}</h3>
          </div>
          <Badge className={`${getScoreColor(score)} text-xs font-bold px-2 py-1`}>
            {score}%
          </Badge>
        </div>
        
        <Progress 
          value={score} 
          className="h-2 mb-2 bg-gray-800/50"
          style={{
            background: `linear-gradient(to right, 
              ${score < 50 ? '#ef4444' : score < 70 ? '#3b82f6' : score < 80 ? '#10b981' : score < 90 ? '#f59e0b' : '#a855f7'} 0%, 
              ${score < 50 ? '#ef4444' : score < 70 ? '#3b82f6' : score < 80 ? '#10b981' : score < 90 ? '#f59e0b' : '#a855f7'} ${score}%, 
              #374151 ${score}%, 
              #374151 100%)`
          }}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{description}</span>
          <span className="text-xs font-medium text-orange-300">
            {getScoreLabel(score)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-purple-900/20 to-purple-800/30 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          {/* Back Button - visible on all devices */}
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Progress Hub</h1>
            <p className="text-purple-200/80 text-sm">Elite performance tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {lastUpdated && (
            <span className="text-xs text-purple-300/60 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={loadProgressData}
            size="sm"
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/40 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-purple-600/15 border-purple-500/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{metrics.overall}%</h2>
              <p className="text-purple-300 font-medium">Overall Progress</p>
              <p className="text-sm text-purple-200/70 mt-1">
                {getScoreLabel(metrics.overall)} • Elite threshold: 95%+
              </p>
            </div>
            <div className="text-right">
              <Trophy className="w-12 h-12 text-purple-400 mb-2" />
              <Badge className={`${getScoreColor(metrics.overall)} text-sm px-3 py-1`}>
                {getScoreLabel(metrics.overall)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="flex flex-col items-center p-4 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg">
          <HexagonProgress score={metrics.strength} size="small" label="Strength" icon={Dumbbell} />
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg">
          <HexagonProgress score={metrics.endurance} size="small" label="Endurance" icon={Heart} />
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg">
          <HexagonProgress score={metrics.consistency} size="small" label="Consistency" icon={Target} />
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg">
          <HexagonProgress score={metrics.nutrition} size="small" label="Nutrition" icon={Scale} />
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg col-span-2 lg:col-span-1">
          <HexagonProgress score={metrics.recovery} size="small" label="Recovery" icon={Brain} />
        </div>
      </div>

      {/* Detailed Metrics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-purple-500/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-200">
            Overview
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-200">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-200">
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Strength"
              icon={Dumbbell}
              score={metrics.strength}
              description="Progressive overload & power development"
            />
            <MetricCard
              title="Endurance"
              icon={Heart}
              score={metrics.endurance}
              description="Cardiovascular fitness & stamina"
            />
            <MetricCard
              title="Consistency"
              icon={Target}
              score={metrics.consistency}
              description="Training frequency & adherence"
            />
            <MetricCard
              title="Nutrition"
              icon={Scale}
              score={metrics.nutrition}
              description="Macro tracking & dietary compliance"
            />
          </div>
          
          <MetricCard
            title="Recovery"
            icon={Brain}
            score={metrics.recovery}
            description="Sleep quality & stress management"
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/40 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 text-purple-400 mr-2" />
                  Training Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Strength Score:</span>
                  <Badge className={getScoreColor(metrics.strength)}>
                    {metrics.strength}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Endurance Score:</span>
                  <Badge className={getScoreColor(metrics.endurance)}>
                    {metrics.endurance}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Consistency:</span>
                  <Badge className={getScoreColor(metrics.consistency)}>
                    {metrics.consistency}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 text-purple-400 mr-2" />
                  Lifestyle Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Nutrition:</span>
                  <Badge className={getScoreColor(metrics.nutrition)}>
                    {metrics.nutrition}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Recovery:</span>
                  <Badge className={getScoreColor(metrics.recovery)}>
                    {metrics.recovery}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Overall Score:</span>
                  <Badge className={getScoreColor(metrics.overall)}>
                    {metrics.overall}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Card className="bg-gray-900/40 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 text-purple-400 mr-2" />
                Elite Performance Milestones
              </CardTitle>
              <CardDescription className="text-purple-200/70">
                Reaching 95%+ in any category qualifies as Elite performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(metrics).filter(([key]) => key !== 'overall').map(([key, score]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-purple-500/10">
                  <div className="flex items-center space-x-3">
                    <Star className={`w-5 h-5 ${score >= 95 ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span className="text-white capitalize">{key}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={score} className="w-20 h-2" />
                    <Badge className={getScoreColor(score)}>
                      {score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Elite Progress Info */}
      <Card className="bg-purple-500/10 border-purple-500/30 mt-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Star className="w-6 h-6 text-purple-400 mt-1" />
            <div>
              <h3 className="text-purple-300 font-semibold mb-2">Elite Performance Standards</h3>
              <p className="text-purple-200/80 text-sm mb-3">
                Myotopia uses scientifically-backed elite performance standards. Reaching 100% represents 
                the top 1% of fitness enthusiasts and requires exceptional dedication and consistency.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-purple-300">• 90%+: Elite performer</div>
                <div className="text-yellow-300">• 80%+: Advanced athlete</div>
                <div className="text-green-300">• 70%+: Strong intermediate</div>
                <div className="text-blue-300">• 50%+: Developing fitness</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressHub;
