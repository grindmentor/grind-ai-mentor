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
  ArrowLeft,
  Flame,
  Shield
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
  discipline: number;
}

interface MuscleGroup {
  name: string;
  score: number;
  exercises: string[];
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
    overall: 0,
    discipline: 0
  });
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([
    { name: 'Chest', score: 0, exercises: [] },
    { name: 'Back', score: 0, exercises: [] },
    { name: 'Shoulders', score: 0, exercises: [] },
    { name: 'Arms', score: 0, exercises: [] },
    { name: 'Core', score: 0, exercises: [] },
    { name: 'Legs', score: 0, exercises: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Elite-level thresholds
  const ELITE_THRESHOLDS = {
    strength: {
      sessions: 200,
      progression: 50,
      consistency: 90
    },
    endurance: {
      cardio_sessions: 100,
      total_duration: 5000,
      intensity_variety: 20
    },
    consistency: {
      workout_streak: 100,
      weekly_frequency: 6,
      months_active: 12
    },
    nutrition: {
      log_streak: 60,
      protein_consistency: 90,
      macro_balance: 80
    },
    recovery: {
      sleep_consistency: 50,
      stress_management: 80,
      recovery_tracking: 90
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
      score = (1 - Math.exp(-3 * value / threshold)) * 100;
      if (score > 70) {
        const excess = score - 70;
        score = 70 + excess * 0.3;
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

      const disciplineScore = Math.round((consistencyScore + nutritionScore + recoveryScore) / 3);

      const overallScore = Math.round(
        (strengthScore + enduranceScore + consistencyScore + nutritionScore + recoveryScore) / 5
      );

      setMetrics({
        strength: strengthScore,
        endurance: enduranceScore,
        consistency: consistencyScore,
        nutrition: nutritionScore,
        recovery: recoveryScore,
        overall: overallScore,
        discipline: disciplineScore
      });

      // Calculate muscle group scores based on exercises
      calculateMuscleGroupScores(progressEntries || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMuscleGroupScores = (progressEntries: any[]) => {
    const muscleMapping: { [key: string]: string[] } = {
      'Chest': ['bench press', 'push up', 'chest fly', 'dips', 'incline', 'decline'],
      'Back': ['pull up', 'row', 'lat', 'deadlift', 'chin up', 'pulldown'],
      'Shoulders': ['shoulder press', 'lateral raise', 'overhead', 'shrug', 'upright row'],
      'Arms': ['curl', 'tricep', 'arm', 'bicep', 'hammer', 'preacher'],
      'Core': ['plank', 'crunch', 'sit up', 'ab', 'core', 'russian twist'],
      'Legs': ['squat', 'leg', 'calf', 'lunge', 'thigh', 'quad', 'hamstring']
    };

    const updatedMuscleGroups = muscleGroups.map(group => {
      const relevantExercises = progressEntries.filter(entry => 
        muscleMapping[group.name]?.some(keyword => 
          entry.exercise_name?.toLowerCase().includes(keyword)
        )
      );

      const score = Math.min(relevantExercises.length * 5, 100); // 5 points per exercise, max 100
      const exercises = relevantExercises.map(e => e.exercise_name);

      return {
        ...group,
        score,
        exercises: [...new Set(exercises)].slice(0, 5) // Unique exercises, max 5
      };
    });

    setMuscleGroups(updatedMuscleGroups);
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

  const getMuscleColor = (score: number): string => {
    if (score >= 80) return '#a855f7'; // Purple
    if (score >= 60) return '#10b981'; // Green
    if (score >= 40) return '#3b82f6'; // Blue
    if (score >= 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading progress data..." />
      </div>
    );
  }

  // Human Body Component
  const HumanBodyVisualizer = () => (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 300 500" className="w-full h-auto">
        {/* Head */}
        <circle cx="150" cy="50" r="30" fill="#374151" stroke="#6b7280" strokeWidth="2"/>
        
        {/* Shoulders */}
        <ellipse cx="150" cy="100" rx="60" ry="20" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Shoulders')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        
        {/* Chest */}
        <ellipse cx="150" cy="130" rx="45" ry="25" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Chest')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        
        {/* Arms */}
        <ellipse cx="90" cy="140" rx="15" ry="40" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Arms')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        <ellipse cx="210" cy="140" rx="15" ry="40" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Arms')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        
        {/* Core */}
        <ellipse cx="150" cy="180" rx="35" ry="30" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Core')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        
        {/* Back (shown as outline behind) */}
        <ellipse cx="150" cy="150" rx="50" ry="50" fill="none" stroke={getMuscleColor(muscleGroups.find(m => m.name === 'Back')?.score || 0)} strokeWidth="3" opacity="0.6" strokeDasharray="5,5"/>
        
        {/* Legs */}
        <ellipse cx="130" cy="280" rx="20" ry="60" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Legs')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        <ellipse cx="170" cy="280" rx="20" ry="60" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Legs')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
        
        {/* Lower legs */}
        <ellipse cx="130" cy="380" rx="15" ry="40" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Legs')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
        <ellipse cx="170" cy="380" rx="15" ry="40" fill={getMuscleColor(muscleGroups.find(m => m.name === 'Legs')?.score || 0)} stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-gray-400">0-20%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-gray-400">20-40%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-gray-400">40-60%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-gray-400">60-80%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a855f7' }}></div>
            <span className="text-gray-400">80%+</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mental Performance Component
  const MentalPerformanceCard = ({ icon: Icon, title, score, description, color }: { 
    icon: any; 
    title: string; 
    score: number; 
    description: string; 
    color: string;
  }) => (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-3xl font-bold text-white mb-2">{score}%</div>
        <Badge className={`${getScoreColor(score)} text-xs mb-3`}>
          {getScoreLabel(score)}
        </Badge>
        <p className="text-sm text-gray-400">{description}</p>
        
        <div className="mt-4">
          <Progress 
            value={score} 
            className="h-2 bg-gray-800/50"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div className="w-12 h-12 bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Progress Hub</h1>
            <p className="text-muted-foreground text-sm">Elite performance tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={loadProgressData}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/15 border-primary/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-1">{metrics.overall}%</h2>
              <p className="text-foreground/80 font-medium">Overall Progress</p>
              <p className="text-sm text-muted-foreground mt-1">
                {getScoreLabel(metrics.overall)} • Elite threshold: 95%+
              </p>
            </div>
            <div className="text-right">
              <Trophy className="w-12 h-12 text-primary mb-2" />
              <Badge className={`${getScoreColor(metrics.overall)} text-sm px-3 py-1`}>
                {getScoreLabel(metrics.overall)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="physique">Physique</TabsTrigger>
          <TabsTrigger value="mental">Mental</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / (24 * 60 * 60 * 1000)) : 0}</div>
                <div className="text-xs text-blue-200">Days Tracked</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.consistency}</div>
                <div className="text-xs text-green-200">Consistency %</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{getScoreLabel(metrics.overall)}</div>
                <div className="text-xs text-purple-200">Current Level</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.max(95 - metrics.overall, 0)}</div>
                <div className="text-xs text-yellow-200">Points to Elite</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Radar Chart Visual */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Performance Overview</span>
              </CardTitle>
              <CardDescription>
                Your comprehensive fitness profile across all metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Metrics */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Strength</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{metrics.strength}%</span>
                    </div>
                    <Progress value={metrics.strength} className="h-3" />
                    <Badge className={`${getScoreColor(metrics.strength)} text-xs w-fit`}>
                      {getScoreLabel(metrics.strength)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-foreground">Endurance</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{metrics.endurance}%</span>
                    </div>
                    <Progress value={metrics.endurance} className="h-3" />
                    <Badge className={`${getScoreColor(metrics.endurance)} text-xs w-fit`}>
                      {getScoreLabel(metrics.endurance)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-foreground">Consistency</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{metrics.consistency}%</span>
                    </div>
                    <Progress value={metrics.consistency} className="h-3" />
                    <Badge className={`${getScoreColor(metrics.consistency)} text-xs w-fit`}>
                      {getScoreLabel(metrics.consistency)}
                    </Badge>
                  </div>
                </div>

                {/* Right Column - Additional Stats */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Mental Strength</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{metrics.discipline}%</div>
                    <p className="text-sm text-muted-foreground">Discipline & consistency combined</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 p-4 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scale className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-foreground">Nutrition</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{metrics.nutrition}%</div>
                    <p className="text-sm text-muted-foreground">Diet tracking & compliance</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 p-4 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-foreground">Recovery</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{metrics.recovery}%</div>
                    <p className="text-sm text-muted-foreground">Sleep & stress management</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Recent Progress</span>
              </CardTitle>
              <CardDescription>
                Your fitness journey milestones and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Current Level: {getScoreLabel(metrics.overall)}</div>
                    <div className="text-sm text-muted-foreground">Overall progress score: {metrics.overall}%</div>
                  </div>
                </div>

                {metrics.strength >= 70 && (
                  <div className="flex items-center space-x-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Strength Milestone</div>
                      <div className="text-sm text-muted-foreground">Achieved {getScoreLabel(metrics.strength)} level in strength training</div>
                    </div>
                  </div>
                )}

                {metrics.consistency >= 80 && (
                  <div className="flex items-center space-x-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Consistency Master</div>
                      <div className="text-sm text-muted-foreground">Exceptional dedication to training routine</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physique" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Human Body Visualizer */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <span>Muscle Development</span>
                </CardTitle>
                <CardDescription>
                  Visual representation of your muscle group training progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HumanBodyVisualizer />
              </CardContent>
            </Card>

            {/* Muscle Groups Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Muscle Groups</CardTitle>
                <CardDescription>
                  Detailed breakdown of your training progress by muscle group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroups.map((muscle) => (
                  <div key={muscle.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{muscle.name}</span>
                      <Badge className={`${getScoreColor(muscle.score)} text-xs`}>
                        {muscle.score}%
                      </Badge>
                    </div>
                    <Progress value={muscle.score} className="h-2" />
                    {muscle.exercises.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Recent: {muscle.exercises.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Endurance */}
            <MentalPerformanceCard
              icon={Heart}
              title="Endurance"
              score={metrics.endurance}
              description="Cardiovascular fitness and stamina development"
              color="bg-gradient-to-br from-red-500/20 to-red-600/30"
            />

            {/* Discipline */}
            <MentalPerformanceCard
              icon={Brain}
              title="Discipline"
              score={metrics.discipline}
              description="Mental strength and consistency in training"
              color="bg-gradient-to-br from-purple-500/20 to-purple-600/30"
            />
          </div>

          {/* Additional Mental Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Focus</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{metrics.nutrition}%</div>
                <Progress value={metrics.nutrition} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">Nutrition tracking consistency</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Resilience</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{metrics.recovery}%</div>
                <Progress value={metrics.recovery} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">Recovery and stress management</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressHub;