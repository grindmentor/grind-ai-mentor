import React, { useState, useEffect, useMemo } from 'react';
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
  Shield,
  BarChart3,
  LineChart,
  Users,
  Atom,
  Eye,
  RotateCcw,
  Beaker,
  Microscope,
  TrendingDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { RealisticMuscleMap, MuscleMapLegend } from '@/components/ui/realistic-muscle-map';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';

// Enhanced interfaces for comprehensive tracking
interface AdvancedMetrics {
  overall: number;
  strength: number;
  endurance: number;
  power: number;
  flexibility: number;
  consistency: number;
  nutrition: number;
  recovery: number;
  discipline: number;
  adaptation: number;
  technique: number;
  volumeLoad: number;
}

interface MuscleGroupData {
  name: string;
  score: number;
  volume: number;
  frequency: number;
  intensity: number;
  exercises: string[];
  lastTrained: Date | null;
  progressTrend: 'up' | 'down' | 'stable';
}

interface BiometricData {
  recoveryScore: number;
}

interface PerformanceAnalytics {
  weeklyTrend: number;
  monthlyTrend: number;
  strengthProgression: number;
  enduranceProgression: number;
  consistencyStreak: number;
  totalWorkouts: number;
  totalVolume: number;
  averageIntensity: number;
}

interface ProgressHubProps {
  onBack?: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const isMobile = useIsMobile();
  
  // Enhanced state management
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    overall: 0,
    strength: 0,
    endurance: 0,
    power: 0,
    flexibility: 0,
    consistency: 0,
    nutrition: 0,
    recovery: 0,
    discipline: 0,
    adaptation: 0,
    technique: 0,
    volumeLoad: 0
  });
  
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupData[]>([
    { name: 'Chest', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Back', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Shoulders', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Arms', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Core', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Legs', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Glutes', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' },
    { name: 'Calves', score: 0, volume: 0, frequency: 0, intensity: 0, exercises: [], lastTrained: null, progressTrend: 'stable' }
  ]);
  
  const [biometrics, setBiometrics] = useState<BiometricData>({
    recoveryScore: 0
  });
  
  const [analytics, setAnalytics] = useState<PerformanceAnalytics>({
    weeklyTrend: 0,
    monthlyTrend: 0,
    strengthProgression: 0,
    enduranceProgression: 0,
    consistencyStreak: 0,
    totalWorkouts: 0,
    totalVolume: 0,
    averageIntensity: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  // Scientific calculation thresholds based on exercise science
  const SCIENTIFIC_THRESHOLDS = {
    strength: { volume: 12000, frequency: 4, intensity: 80 }, // kg/week, sessions/week, %1RM
    endurance: { duration: 600, frequency: 3, zones: 5 }, // minutes/week, sessions/week, training zones
    power: { explosiveness: 50, speed: 25, reactive: 30 },
    flexibility: { rom: 90, frequency: 3, hold: 30 }, // degrees, sessions/week, seconds
    recovery: { sleep: 8, hrv: 50, stress: 3 }, // hours, ms, scale 1-10
    nutrition: { protein: 2.2, hydration: 35, consistency: 90 } // g/kg, ml/kg, %
  };

  useEffect(() => {
    if (user) {
      loadComprehensiveData();
    }
  }, [user]);

  // Enhanced calculation with scientific principles
  const calculateAdvancedScore = (
    value: number, 
    threshold: number, 
    type: 'linear' | 'logarithmic' | 'exponential' = 'logarithmic'
  ): number => {
    if (value <= 0) return 0;
    
    let score;
    switch (type) {
      case 'exponential':
        score = (1 - Math.exp(-2 * value / threshold)) * 100;
        break;
      case 'logarithmic':
        score = Math.log(1 + value) / Math.log(1 + threshold) * 100;
        break;
      default:
        score = Math.min((value / threshold) * 100, 100);
    }
    
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const loadComprehensiveData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Optimized parallel data fetching with smaller queries
      const [
        { data: workoutSessions, error: workoutError },
        { data: progressEntries, error: progressError },
        { data: foodEntries, error: foodError },
        { data: recoveryEntries, error: recoveryError }
      ] = await Promise.all([
        supabase.from('workout_sessions').select('session_date, duration_minutes, workout_type, workout_name, created_at').eq('user_id', user.id).limit(100),
        supabase.from('progressive_overload_entries').select('exercise_name, weight, sets, reps, workout_date, rpe, created_at').eq('user_id', user.id).limit(200),
        supabase.from('food_log_entries').select('logged_date, protein, calories, created_at').eq('user_id', user.id).limit(100),
        supabase.from('recovery_data').select('sleep_hours, stress_level, recorded_date, created_at').eq('user_id', user.id).limit(50)
      ]);

      // Handle errors
      if (workoutError) console.warn('Workout data error:', workoutError);
      if (progressError) console.warn('Progress data error:', progressError);
      if (foodError) console.warn('Food data error:', foodError);
      if (recoveryError) console.warn('Recovery data error:', recoveryError);

      // Use fallback data if queries fail
      const workoutData = workoutSessions || [];
      const progressData = progressEntries || [];
      const nutritionData = foodEntries || [];
      const recoveryData = recoveryEntries || [];

      // Show some default data even if user has no data yet
      const hasAnyData = workoutData.length > 0 || progressData.length > 0 || nutritionData.length > 0;
      
      if (!hasAnyData) {
        // Set demo/default metrics for new users
        setMetrics({
          overall: 0,
          strength: 0,
          endurance: 0,
          power: 0,
          flexibility: 0,
          consistency: 0,
          nutrition: 0,
          recovery: 0,
          discipline: 0,
          adaptation: 0,
          technique: 0,
          volumeLoad: 0
        });
        
        // Keep muscle groups at 0 for new users
        setMuscleGroups(prev => prev.map(group => ({
          ...group,
          score: 0,
          volume: 0,
          frequency: 0,
          intensity: 0,
          progressTrend: 'stable' as const
        })));
        
        setAnalytics({
          weeklyTrend: 0,
          monthlyTrend: 0,
          strengthProgression: 0,
          enduranceProgression: 0,
          consistencyStreak: 0,
          totalWorkouts: 0,
          totalVolume: 0,
          averageIntensity: 0
        });
      } else {
        // Calculate comprehensive analytics with actual data
        const totalVolume = progressData.reduce((sum, entry) => 
          sum + (entry.weight * entry.sets * entry.reps), 0
        );
        
        const consistencyStreak = calculateConsistencyStreak(workoutData);
        const weeklyTrend = calculateWeeklyTrend(workoutData);
        const monthlyTrend = calculateMonthlyTrend(workoutData);
        
        // Enhanced muscle group analysis
        const enhancedMuscleGroups = calculateEnhancedMuscleGroups(progressData, workoutData);
        
        // Scientific metric calculations
        const strengthScore = calculateStrengthScore(progressData, workoutData);
        const enduranceScore = calculateEnduranceScore(workoutData);
        const nutritionScore = calculateNutritionScore(nutritionData);
        const recoveryScore = calculateRecoveryScore(recoveryData);
        const consistencyScore = calculateConsistencyScore(workoutData, nutritionData);
        const disciplineScore = Math.round((consistencyScore + nutritionScore + recoveryScore) / 3);
        
        // Calculate overall score from main metrics only
        const overallScore = Math.round(
          (strengthScore + enduranceScore + nutritionScore + recoveryScore + consistencyScore) / 5
        );

        setMetrics({
          overall: overallScore,
          strength: strengthScore,
          endurance: enduranceScore,
          power: 0,
          flexibility: 0,
          consistency: consistencyScore,
          nutrition: nutritionScore,
          recovery: recoveryScore,
          discipline: disciplineScore,
          adaptation: 0,
          technique: 0,
          volumeLoad: 0
        });

        setMuscleGroups(enhancedMuscleGroups);
        
        setAnalytics({
          weeklyTrend,
          monthlyTrend,
          strengthProgression: calculateStrengthProgression(progressData),
          enduranceProgression: calculateEnduranceProgression(workoutData),
          consistencyStreak,
          totalWorkouts: workoutData.length,
          totalVolume,
          averageIntensity: calculateAverageIntensity(progressData)
        });
      }

      setBiometrics({
        recoveryScore: hasAnyData ? calculateRecoveryScore(recoveryData) : 0
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading comprehensive data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced calculation functions
  const calculateEnhancedMuscleGroups = (progressData: any[], workoutData: any[]): MuscleGroupData[] => {
    const muscleMapping: { [key: string]: string[] } = {
      'Chest': ['bench press', 'push up', 'chest fly', 'dips', 'incline', 'decline', 'pec'],
      'Back': ['pull up', 'row', 'lat', 'deadlift', 'chin up', 'pulldown', 'rear delt'],
      'Shoulders': ['shoulder press', 'lateral raise', 'overhead', 'shrug', 'upright row', 'front raise'],
      'Arms': ['curl', 'tricep', 'arm', 'bicep', 'hammer', 'preacher', 'close grip'],
      'Core': ['plank', 'crunch', 'sit up', 'ab', 'core', 'russian twist', 'oblique'],
      'Legs': ['squat', 'leg press', 'quad', 'hamstring', 'lunge', 'leg extension', 'leg curl'],
      'Glutes': ['hip thrust', 'glute', 'bridge', 'romanian deadlift', 'sumo'],
      'Calves': ['calf raise', 'calf', 'standing calf', 'seated calf']
    };

    return muscleGroups.map(group => {
      const relevantExercises = progressData.filter(entry => 
        muscleMapping[group.name]?.some(keyword => 
          entry.exercise_name?.toLowerCase().includes(keyword)
        )
      );

      const volume = relevantExercises.reduce((sum, entry) => 
        sum + (entry.weight * entry.sets * entry.reps), 0
      );
      
      const frequency = new Set(relevantExercises.map(e => e.workout_date)).size;
      const intensity = relevantExercises.length > 0 ? 
        relevantExercises.reduce((sum, e) => sum + (e.rpe || 7), 0) / relevantExercises.length : 0;
      
      const score = calculateAdvancedScore(volume + frequency * 100 + intensity * 10, 1000);
      const exercises = [...new Set(relevantExercises.map(e => e.exercise_name))].slice(0, 5);
      
      const lastTrained = relevantExercises.length > 0 ? 
        new Date(Math.max(...relevantExercises.map(e => new Date(e.workout_date).getTime()))) : null;
      
      const progressTrend = calculateProgressTrend(relevantExercises);

      return {
        ...group,
        score,
        volume,
        frequency,
        intensity,
        exercises,
        lastTrained,
        progressTrend
      };
    });
  };

  const calculateProgressTrend = (exercises: any[]): 'up' | 'down' | 'stable' => {
    if (exercises.length < 3) return 'stable';
    
    const recent = exercises.slice(-3);
    const earlier = exercises.slice(-6, -3);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, e) => sum + e.weight, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + e.weight, 0) / earlier.length;
    
    const change = (recentAvg - earlierAvg) / earlierAvg;
    
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  };

  const calculateStrengthScore = (progressData: any[], workoutData: any[]): number => {
    const totalVolume = progressData.reduce((sum, entry) => 
      sum + (entry.weight * entry.sets * entry.reps), 0
    );
    const avgIntensity = progressData.length > 0 ? 
      progressData.reduce((sum, e) => sum + (e.rpe || 7), 0) / progressData.length : 0;
    const frequency = new Set(progressData.map(e => e.workout_date)).size;
    
    return calculateAdvancedScore(
      totalVolume * 0.4 + avgIntensity * 200 + frequency * 50,
      SCIENTIFIC_THRESHOLDS.strength.volume + 1400 + 200
    );
  };

  const calculateEnduranceScore = (workoutData: any[]): number => {
    const cardioSessions = workoutData.filter(w => 
      w.workout_type?.toLowerCase().includes('cardio') || 
      w.workout_name?.toLowerCase().includes('cardio') ||
      (w.duration_minutes || 0) > 30
    );
    
    const totalDuration = cardioSessions.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const frequency = cardioSessions.length;
    
    return calculateAdvancedScore(
      totalDuration * 0.6 + frequency * 50,
      SCIENTIFIC_THRESHOLDS.endurance.duration + 150
    );
  };

  const calculateNutritionScore = (nutritionData: any[]): number => {
    if (nutritionData.length === 0) return 0;
    
    const avgProtein = nutritionData.reduce((sum, e) => sum + (e.protein || 0), 0) / nutritionData.length;
    const consistency = new Set(nutritionData.map(e => e.logged_date)).size;
    const totalEntries = nutritionData.length;
    
    return calculateAdvancedScore(
      avgProtein * 10 + consistency * 5 + totalEntries * 2,
      220 + 450 + 200
    );
  };

  const calculateRecoveryScore = (recoveryData: any[]): number => {
    if (recoveryData.length === 0) return 0;
    
    const avgSleep = recoveryData.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / recoveryData.length;
    const avgStress = recoveryData.reduce((sum, e) => sum + (e.stress_level || 5), 0) / recoveryData.length;
    const consistency = recoveryData.length;
    
    return calculateAdvancedScore(
      avgSleep * 12.5 + (10 - avgStress) * 10 + consistency * 2,
      100 + 50 + 60
    );
  };

  const calculateConsistencyScore = (workoutData: any[], nutritionData: any[]): number => {
    const workoutStreak = calculateConsistencyStreak(workoutData);
    const nutritionStreak = calculateNutritionStreak(nutritionData);
    
    return calculateAdvancedScore(workoutStreak * 5 + nutritionStreak * 3, 500 + 180);
  };


  const calculateConsistencyStreak = (workoutData: any[]): number => {
    if (workoutData.length === 0) return 0;
    
    const sortedDates = workoutData
      .map(w => new Date(w.session_date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const workoutDate of sortedDates) {
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= streak + 2) { // Allow 1 day gap
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateNutritionStreak = (nutritionData: any[]): number => {
    if (nutritionData.length === 0) return 0;
    
    const dates = [...new Set(nutritionData.map(e => e.logged_date))]
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

  const calculateWeeklyTrend = (workoutData: any[]): number => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = workoutData.filter(w => new Date(w.session_date) >= oneWeekAgo).length;
    const lastWeek = workoutData.filter(w => 
      new Date(w.session_date) >= twoWeeksAgo && new Date(w.session_date) < oneWeekAgo
    ).length;
    
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  };

  const calculateMonthlyTrend = (workoutData: any[]): number => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const thisMonth = workoutData.filter(w => new Date(w.session_date) >= oneMonthAgo).length;
    const lastMonth = workoutData.filter(w => 
      new Date(w.session_date) >= twoMonthsAgo && new Date(w.session_date) < oneMonthAgo
    ).length;
    
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  };

  const calculateStrengthProgression = (progressData: any[]): number => {
    if (progressData.length < 5) return 0;
    
    const sortedData = progressData.sort((a, b) => 
      new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
    );
    
    const recent = sortedData.slice(-5);
    const earlier = sortedData.slice(0, 5);
    
    const recentAvg = recent.reduce((sum, e) => sum + e.weight, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + e.weight, 0) / earlier.length;
    
    return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
  };

  const calculateEnduranceProgression = (workoutData: any[]): number => {
    if (workoutData.length < 5) return 0;
    
    const cardioWorkouts = workoutData
      .filter(w => w.duration_minutes > 20)
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    
    if (cardioWorkouts.length < 5) return 0;
    
    const recent = cardioWorkouts.slice(-5);
    const earlier = cardioWorkouts.slice(0, 5);
    
    const recentAvg = recent.reduce((sum, w) => sum + w.duration_minutes, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, w) => sum + w.duration_minutes, 0) / earlier.length;
    
    return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
  };

  const calculateAverageIntensity = (progressData: any[]): number => {
    if (progressData.length === 0) return 0;
    return Math.round(progressData.reduce((sum, e) => sum + (e.rpe || 7), 0) / progressData.length);
  };

  // Helper functions for display
  const getScoreColor = (score: number): string => {
    if (score >= 95) return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
    if (score >= 85) return 'text-purple-300 bg-purple-400/20 border-purple-400/40';
    if (score >= 70) return 'text-violet-400 bg-violet-500/20 border-violet-500/40';
    if (score >= 50) return 'text-indigo-400 bg-indigo-500/20 border-indigo-500/40';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 95) return 'Elite';
    if (score >= 85) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 50) return 'Developing';
    return 'Beginner';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getMuscleColor = (score: number): string => {
    if (score >= 90) return '#a855f7'; // Purple
    if (score >= 80) return '#8b5cf6'; // Violet
    if (score >= 70) return '#7c3aed'; // Purple-600
    if (score >= 60) return '#6d28d9'; // Purple-700
    if (score >= 50) return '#5b21b6'; // Purple-800
    if (score >= 30) return '#4c1d95'; // Purple-900
    return '#6b7280'; // Gray
  };

  // Component removed - now using RealisticMuscleMap

  const BiometricCard = ({ icon: Icon, title, value, unit, description, color, target }: {
    icon: any;
    title: string;
    value: number;
    unit: string;
    description: string;
    color: string;
    target?: number;
  }) => (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {target && (
            <Badge variant="outline" className="text-xs">
              Target: {target}{unit}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <div className="text-3xl font-bold text-foreground mb-2">
          {Math.round(value)}<span className="text-lg text-muted-foreground">{unit}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {target && (
          <div className="mt-3">
            <Progress 
              value={Math.min((value / target) * 100, 100)} 
              className="h-2 bg-gray-800/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Analyzing your progress data..." />
        <p className="text-muted-foreground mt-4 text-center">
          Calculating comprehensive fitness metrics
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-purple-900/20 via-violet-900/10 to-purple-800/20 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-violet-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <Microscope className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scientific Progress Hub</h1>
            <p className="text-muted-foreground">Advanced performance analytics & insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Last Analysis</div>
              <div className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleString()}
              </div>
            </div>
          )}
          <Button
            onClick={loadComprehensiveData}
            size="sm"
            variant="outline"
            className="min-w-[120px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Elite Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-gradient-to-r from-purple-500/20 to-violet-600/15 border-purple-500/30">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">{metrics.overall}%</h2>
                <p className="text-xl font-semibold text-foreground/90 mb-1">Overall Performance Score</p>
                <p className="text-muted-foreground">
                  {getScoreLabel(metrics.overall)} Level • Target: Elite (95%+)
                </p>
                <div className="mt-4 flex items-center space-x-4">
                  <Badge className={`${getScoreColor(metrics.overall)} text-sm px-3 py-1`}>
                    {getScoreLabel(metrics.overall)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {95 - metrics.overall > 0 ? `${95 - metrics.overall} points to Elite` : 'Elite Level Achieved!'}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Trophy className="w-16 h-16 text-purple-400 mb-2 mx-auto" />
                <div className="text-sm text-muted-foreground">
                  Rank #{Math.max(1, Math.floor((100 - metrics.overall) * 100 / 15))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Atom className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-foreground">Performance Analytics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Weekly Trend</span>
                <div className="flex items-center space-x-1">
                  <span className={`text-sm font-medium ${analytics.weeklyTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analytics.weeklyTrend >= 0 ? '+' : ''}{analytics.weeklyTrend}%
                  </span>
                  {analytics.weeklyTrend >= 0 ? 
                    <ChevronUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Consistency Streak</span>
                <span className="text-sm font-medium text-foreground">{analytics.consistencyStreak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Workouts</span>
                <span className="text-sm font-medium text-foreground">{analytics.totalWorkouts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="physique">Physique</TabsTrigger>
          <TabsTrigger value="mental">Mental</TabsTrigger>
          <TabsTrigger value="science">Science</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Core Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: 'strength', icon: Dumbbell, label: 'Strength', color: 'text-red-400' },
              { key: 'endurance', icon: Heart, label: 'Endurance', color: 'text-pink-400' },
              { key: 'consistency', icon: Activity, label: 'Consistency', color: 'text-green-400' },
              { key: 'nutrition', icon: Scale, label: 'Nutrition', color: 'text-blue-400' },
              { key: 'recovery', icon: Shield, label: 'Recovery', color: 'text-purple-400' }
            ].map(({ key, icon: Icon, label, color }) => (
              <Card key={key} className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {metrics[key as keyof AdvancedMetrics]}%
                  </div>
                  <Progress value={metrics[key as keyof AdvancedMetrics]} className="h-2 mb-2" />
                  <Badge className={`${getScoreColor(metrics[key as keyof AdvancedMetrics])} text-xs`}>
                    {getScoreLabel(metrics[key as keyof AdvancedMetrics])}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  <span>Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-foreground">Strength Progression</div>
                      <div className="text-sm text-muted-foreground">Last 30 days</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-400">+{analytics.strengthProgression}%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-foreground">Endurance Progression</div>
                      <div className="text-sm text-muted-foreground">Cardio performance</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-400">+{analytics.enduranceProgression}%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-foreground">Volume Load</div>
                      <div className="text-sm text-muted-foreground">Total training volume</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-purple-400">{analytics.totalVolume.toLocaleString()} kg</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Achievements & Milestones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.overall >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="font-medium text-foreground">Elite Performer</div>
                      <div className="text-sm text-muted-foreground">Top-tier overall score achieved</div>
                    </div>
                  </div>
                )}

                {analytics.consistencyStreak >= 30 && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-500/10 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <div>
                      <div className="font-medium text-foreground">Consistency Master</div>
                      <div className="text-sm text-muted-foreground">{analytics.consistencyStreak} day streak</div>
                    </div>
                  </div>
                )}

                {metrics.strength >= 85 && (
                  <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-red-400" />
                    <div>
                      <div className="font-medium text-foreground">Strength Elite</div>
                      <div className="text-sm text-muted-foreground">Advanced strength development</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="physique" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Realistic Human Body Visualization */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Muscle Development Map</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'front' ? 'back' : 'front')}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {viewMode === 'front' ? 'Back View' : 'Front View'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Scientific analysis of muscle group training progress and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealisticMuscleMap muscleGroups={muscleGroups} viewMode={viewMode} />
              </CardContent>
            </Card>

            {/* Detailed Muscle Analysis */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Muscle Group Analytics</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of training frequency, volume, and intensity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroups.map((muscle) => (
                  <div key={muscle.name} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground">{muscle.name}</span>
                        {getTrendIcon(muscle.progressTrend)}
                      </div>
                      <Badge className={`${getScoreColor(muscle.score)} text-xs`}>
                        {muscle.score}%
                      </Badge>
                    </div>
                    
                    <Progress value={muscle.score} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium text-foreground">{muscle.volume.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Frequency</div>
                        <div className="font-medium text-foreground">{muscle.frequency}x/week</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Intensity</div>
                        <div className="font-medium text-foreground">{muscle.intensity.toFixed(1)} RPE</div>
                      </div>
                    </div>
                    
                    {muscle.exercises.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Recent exercises:</strong> {muscle.exercises.slice(0, 3).join(', ')}
                      </div>
                    )}
                    
                    {muscle.lastTrained && (
                      <div className="text-xs text-muted-foreground">
                        Last trained: {muscle.lastTrained.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Muscle Development Legend */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span>Development Scale Reference</span>
                </CardTitle>
                <CardDescription>
                  Understanding muscle development levels based on training data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MuscleMapLegend />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mental Performance Cards with Brain and Heart Icons */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Mental Discipline</h3>
                <div className="text-4xl font-bold text-purple-300 mb-4">{metrics.discipline}%</div>
                <Badge className={`${getScoreColor(metrics.discipline)} text-sm mb-4`}>
                  {getScoreLabel(metrics.discipline)}
                </Badge>
                <p className="text-muted-foreground mb-4">
                  Cognitive strength, focus, and training consistency
                </p>
                <Progress value={metrics.discipline} className="h-3 bg-purple-900/30" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-pink-600/20 border-red-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-pink-600/30 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Cardiovascular Endurance</h3>
                <div className="text-4xl font-bold text-red-300 mb-4">{metrics.endurance}%</div>
                <Badge className={`${getScoreColor(metrics.endurance)} text-sm mb-4`}>
                  {getScoreLabel(metrics.endurance)}
                </Badge>
                <p className="text-muted-foreground mb-4">
                  Heart health, stamina, and aerobic capacity
                </p>
                <Progress value={metrics.endurance} className="h-3 bg-red-900/30" />
              </CardContent>
            </Card>
          </div>

          {/* Recovery Data */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <BiometricCard
              icon={Shield}
              title="Recovery Score"
              value={biometrics.recoveryScore}
              unit="%"
              description="Based on sleep and stress tracking data"
              color="bg-gradient-to-br from-purple-500/20 to-purple-600/30"
              target={80}
            />
          </div>

          {/* Mental Performance Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-primary" />
                <span>Mental Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Mental Discipline</span>
                    <span className="text-lg font-bold text-foreground">{metrics.discipline}%</span>
                  </div>
                  <Progress value={metrics.discipline} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Consistency in training, nutrition and recovery habits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="science" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="w-5 h-5 text-primary" />
                <span>Training Analytics</span>
              </CardTitle>
              <CardDescription>
                Data-driven insights from your actual workout data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Real Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-foreground">Total Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.totalVolume.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total weight lifted (kg)
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-foreground">Workouts Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.totalWorkouts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Training sessions logged
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium text-foreground">Avg Intensity</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.averageIntensity}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average RPE rating
                  </p>
                </div>
              </div>

              {/* Scientific Recommendations */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Microscope className="w-5 h-5 text-primary" />
                  <span>Evidence-Based Recommendations</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Training Optimization:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Target 12-20 sets per muscle group per week</li>
                      <li>• Maintain 60-85% 1RM for strength development</li>
                      <li>• Rest 48-72 hours between training same muscles</li>
                      <li>• Include 2-3 cardio sessions weekly</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Recovery Protocol:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Aim for 7-9 hours of quality sleep</li>
                      <li>• Consume 2.2g protein per kg body weight</li>
                      <li>• Maintain hydration at 35ml per kg daily</li>
                      <li>• Include deload weeks every 4-6 weeks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressHub;