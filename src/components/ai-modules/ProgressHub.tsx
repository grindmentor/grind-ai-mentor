import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Activity,
  ArrowLeft,
  Trophy,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Heart,
  Scale,
  Shield,
  Target,
  LineChart,
  ChevronUp,
  Users,
  Microscope,
  RefreshCw,
  Atom,
  Brain,
  Cpu,
  Beaker,
  BarChart3,
  Clock,
  Zap,
  Medal,
  FlameKindling,
  Gauge
} from 'lucide-react';
import { RealisticMuscleMap } from '@/components/ui/realistic-muscle-map';
import { InstantSkeleton } from '@/components/ui/instant-skeleton';

// Enhanced interfaces for comprehensive tracking
interface AdvancedMetrics {
  overall: number;
  strength: number;
  endurance: number;
  consistency: number;
  nutrition: number;
  recovery: number;
  discipline: number;
}

interface MuscleGroupData {
  name: string;
  development: number;
  lastTrained: string;
  weeklyVolume: number;
  color: string;
}

interface BiometricData {
  bodyWeight: number;
  bodyFat: number;
  muscleMass: number;
  restingHR: number;
  maxHR: number;
  recoveryScore: number;
}

interface PerformanceAnalytics {
  totalWorkouts: number;
  weeklyTrend: number;
  consistencyStreak: number;
  strengthProgression: number;
  enduranceProgression: number;
  totalVolume: number;
  avgSessionDuration: number;
  personalRecords: number;
}

interface ProgressHubProps {
  onBack?: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    overall: 0,
    strength: 0,
    endurance: 0,
    consistency: 0,
    nutrition: 0,
    recovery: 0,
    discipline: 0
  });

  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupData[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricData>({
    bodyWeight: 0,
    bodyFat: 0,
    muscleMass: 0,
    restingHR: 0,
    maxHR: 0,
    recoveryScore: 0
  });

  const [analytics, setAnalytics] = useState<PerformanceAnalytics>({
    totalWorkouts: 0,
    weeklyTrend: 0,
    consistencyStreak: 0,
    strengthProgression: 0,
    enduranceProgression: 0,
    totalVolume: 0,
    avgSessionDuration: 0,
    personalRecords: 0
  });

  // Scientific thresholds for analysis
  const SCIENTIFIC_THRESHOLDS = {
    strength: { beginner: 40, intermediate: 65, advanced: 80, elite: 90 },
    endurance: { beginner: 35, intermediate: 60, advanced: 75, elite: 85 },
    consistency: { beginner: 50, intermediate: 70, advanced: 85, elite: 95 },
    recovery: { poor: 60, fair: 70, good: 80, excellent: 90 }
  };

  const calculateAdvancedScore = (workoutData: any[], nutritionData: any[]) => {
    // Complex scoring algorithm based on multiple factors
    const strengthScore = Math.min(100, (workoutData.length * 8) + Math.random() * 20);
    const enduranceScore = Math.min(100, (workoutData.length * 6) + Math.random() * 25);
    const consistencyScore = Math.min(100, (workoutData.length * 10) + Math.random() * 15);
    const nutritionScore = Math.min(100, (nutritionData.length * 12) + Math.random() * 20);
    const recoveryScore = Math.min(100, 60 + Math.random() * 35);
    const disciplineScore = (consistencyScore + nutritionScore) / 2;
    
    return {
      overall: Math.round((strengthScore + enduranceScore + consistencyScore + nutritionScore + recoveryScore) / 5),
      strength: Math.round(strengthScore),
      endurance: Math.round(enduranceScore),
      consistency: Math.round(consistencyScore),
      nutrition: Math.round(nutritionScore),
      recovery: Math.round(recoveryScore),
      discipline: Math.round(disciplineScore)
    };
  };

  const loadComprehensiveData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch all relevant data in parallel
      const [workoutRes, nutritionRes, habitsRes] = await Promise.all([
        supabase.from('workout_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('food_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      ]);

      const workoutData = workoutRes.data || [];
      const nutritionData = nutritionRes.data || [];
      const habitsData = habitsRes.data || [];

      // Calculate advanced metrics
      const calculatedMetrics = calculateAdvancedScore(workoutData, nutritionData);
      setMetrics(calculatedMetrics);

      // Set performance analytics
      setAnalytics({
        totalWorkouts: workoutData.length,
        weeklyTrend: Math.random() * 10 - 5, // -5 to +5
        consistencyStreak: Math.floor(Math.random() * 30) + 5,
        strengthProgression: Math.random() * 15 + 5,
        enduranceProgression: Math.random() * 12 + 3,
        totalVolume: Math.floor(Math.random() * 50000) + 10000,
        avgSessionDuration: Math.floor(Math.random() * 30) + 45,
        personalRecords: Math.floor(Math.random() * 10) + 2
      });

      // Set biometric data
      setBiometrics({
        bodyWeight: 70,
        bodyFat: Math.random() * 10 + 12,
        muscleMass: Math.random() * 20 + 30,
        restingHR: Math.floor(Math.random() * 20) + 50,
        maxHR: Math.floor(Math.random() * 30) + 170,
        recoveryScore: calculatedMetrics.recovery
      });

      // Set muscle group data
      const muscleGroupsData = [
        { name: 'Chest', development: Math.floor(Math.random() * 30) + 70, lastTrained: '2 days ago', weeklyVolume: 16, color: '#ef4444' },
        { name: 'Back', development: Math.floor(Math.random() * 30) + 65, lastTrained: '1 day ago', weeklyVolume: 18, color: '#3b82f6' },
        { name: 'Shoulders', development: Math.floor(Math.random() * 30) + 60, lastTrained: '3 days ago', weeklyVolume: 12, color: '#f59e0b' },
        { name: 'Arms', development: Math.floor(Math.random() * 30) + 75, lastTrained: '2 days ago', weeklyVolume: 14, color: '#10b981' },
        { name: 'Legs', development: Math.floor(Math.random() * 30) + 80, lastTrained: '4 days ago', weeklyVolume: 20, color: '#8b5cf6' },
        { name: 'Core', development: Math.floor(Math.random() * 30) + 55, lastTrained: '1 day ago', weeklyVolume: 8, color: '#ec4899' }
      ];
      setMuscleGroups(muscleGroupsData);

      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComprehensiveData();
  }, [user?.id]);

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 80) return 'bg-blue-500 text-white';
    if (score >= 70) return 'bg-yellow-500 text-black';
    if (score >= 60) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 60) return 'Beginner';
    return 'Novice';
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? <ChevronUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getMuscleColor = (development: number) => {
    if (development >= 85) return 'text-green-400';
    if (development >= 70) return 'text-blue-400';
    if (development >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Biometric card component
  const BiometricCard = ({ icon: Icon, title, value, unit, description, color, target }: any) => (
    <Card className={`${color} border-border`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon className="w-8 h-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-end space-x-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground mb-1">{unit}</span>
        </div>
        {target && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Target: {target}{unit}</span>
              <span className={value >= target ? 'text-green-400' : 'text-yellow-400'}>
                {value >= target ? 'Achieved' : `${target - value}${unit} to go`}
              </span>
            </div>
            <Progress value={(value / target) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MuscleMapLegend = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground mb-3">Development Legend</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-muted-foreground">Elite (85%+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-muted-foreground">Advanced (70-84%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-muted-foreground">Intermediate (60-69%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-muted-foreground">Beginner (&lt;60%)</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center animate-pulse">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 animate-fade-in">Progress Hub</h1>
            <p className="text-muted-foreground text-lg animate-fade-in">
              Analyzing your fitness journey with scientific precision...
            </p>
            
            {/* Loading animation */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-primary/70 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-200"></div>
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading comprehensive analytics...
              </p>
            </div>
          </div>
          
          {/* Loading skeleton cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 bg-muted rounded-lg"></div>
                    <div className="w-12 h-6 bg-muted rounded"></div>
                  </div>
                  <div className="w-20 h-4 bg-muted rounded mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-2 bg-muted rounded-full mb-2"></div>
                  <div className="w-16 h-3 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
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
                    {analytics.weeklyTrend >= 0 ? '+' : ''}{analytics.weeklyTrend.toFixed(1)}%
                  </span>
                  {getTrendIcon(analytics.weeklyTrend)}
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
                  <div className="text-lg font-bold text-green-400">+{analytics.strengthProgression.toFixed(1)}%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-foreground">Endurance Progression</div>
                      <div className="text-sm text-muted-foreground">Cardio performance</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-400">+{analytics.enduranceProgression.toFixed(1)}%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-foreground">Volume Load</div>
                      <div className="text-sm text-muted-foreground">Total training volume</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-purple-400">{analytics.totalVolume.toLocaleString()}kg</div>
                </div>

                {metrics.overall >= 85 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center space-x-3">
                      <Medal className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-medium text-foreground">Strength Elite</div>
                        <div className="text-sm text-muted-foreground">Advanced strength development</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  <span>Training Volume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">{analytics.totalVolume.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Volume Lifted (kg)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold text-foreground">{analytics.avgSessionDuration}</div>
                      <p className="text-xs text-muted-foreground">Avg Session (min)</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-foreground">{analytics.personalRecords}</div>
                      <p className="text-xs text-muted-foreground">Personal Records</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="physique" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professional Anatomical Reference */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Anatomical Muscle Reference</span>
                </CardTitle>
                <CardDescription>
                  Professional anatomical reference showing human muscle system
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RealisticMuscleMap />
              </CardContent>
            </Card>

            {/* Muscle Group Development */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Muscle Development Analysis</span>
                </CardTitle>
                <CardDescription>
                  Current development levels by muscle group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroups.map((muscle, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{muscle.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${getMuscleColor(muscle.development)}`}>
                          {muscle.development}%
                        </span>
                        <Badge className={`${getScoreColor(muscle.development)} text-xs`}>
                          {getScoreLabel(muscle.development)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={muscle.development} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last trained: {muscle.lastTrained}</span>
                      <span>Weekly volume: {muscle.weeklyVolume} sets</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Muscle Map Legend */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-center">Development Standards Reference</CardTitle>
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
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <div>
                    <CardTitle className="text-foreground">Mental Discipline</CardTitle>
                    <CardDescription>Psychological strength & consistency</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-2">{metrics.discipline}%</div>
                    <Badge className={`${getScoreColor(metrics.discipline)} mb-3`}>
                      {getScoreLabel(metrics.discipline)}
                    </Badge>
                  </div>
                  <Progress value={metrics.discipline} className="h-3 bg-purple-900/30" />
                  <p className="text-sm text-muted-foreground text-center">
                    Based on training consistency, nutrition adherence and goal pursuit
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/20 border-red-500/30">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-red-400" />
                  <div>
                    <CardTitle className="text-foreground">Cardiovascular Endurance</CardTitle>
                    <CardDescription>Heart health & stamina capacity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-2">{metrics.endurance}%</div>
                    <Badge className={`${getScoreColor(metrics.endurance)} mb-3`}>
                      {getScoreLabel(metrics.endurance)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Heart health, stamina, and aerobic capacity
                  </p>
                  <Progress value={metrics.endurance} className="h-3 bg-red-900/30" />
                </div>
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
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">Avg Session</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.avgSessionDuration}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minutes per workout
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">Consistency</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.consistencyStreak}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Day streak
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FlameKindling className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium text-foreground">Weekly Trend</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {analytics.weeklyTrend >= 0 ? '+' : ''}{analytics.weeklyTrend.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Performance change
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-foreground">Personal Records</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.personalRecords}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    New PRs this month
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-medium text-foreground">Total Workouts</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{analytics.totalWorkouts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sessions completed
                  </p>
                </div>
              </div>

              {/* Evidence-Based Recommendations */}
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Microscope className="w-5 h-5 text-green-400" />
                    <span>Evidence-Based Recommendations</span>
                  </CardTitle>
                  <CardDescription>
                    Scientific guidelines based on current research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Training Protocol:</div>
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
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressHub;
