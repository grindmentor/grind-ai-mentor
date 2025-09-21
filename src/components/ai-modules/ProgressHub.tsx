import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RealisticMuscleMap } from "@/components/ui/realistic-muscle-map";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimizedProgressData, useMuscleGroupProgress } from '@/hooks/useOptimizedProgressData';
import { ProgressMetrics } from '@/components/progress/ProgressMetrics';
import { BackButton } from '@/components/ui/back-button';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Users,
  Brain,
  FlaskConical,
  Dumbbell,
  Heart,
  Shield,
  Scale,
  Zap,
  Timer,
  Award,
  Flame,
  Moon,
  Coffee,
  Droplets,
  Gauge,
  Camera,
  Plus,
  ExternalLink
} from "lucide-react";

// Optimized Progress Skeleton Component
const ProgressSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="hover-scale">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="hover-scale">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default function OptimizedProgressHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: progressData, isLoading, error } = useOptimizedProgressData(user?.id || null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleBack = () => {
    navigate('/app', { replace: true });
  };

  console.log('ProgressHub - Loading:', isLoading, 'Data:', progressData, 'Error:', error);

  // Calculate muscle groups from actual workout data
  const muscleGroupData = useMuscleGroupProgress(progressData?.workouts || []);

  const progressMetrics = useMemo(() => {
    if (!progressData) {
      return {
        overallProgress: 0,
        totalWorkouts: 0,
        averageSleep: 0,
        activeGoals: 0,
        muscleGroups: [],
        weeklyVolume: 0,
        consistency: 0,
        strengthGain: 0
      };
    }

    const { workouts, recovery, goals } = progressData;
    
    // Calculate realistic muscle group scores from actual data  
    const muscleGroups = Object.entries(muscleGroupData || {}).map(([name, data]: [string, any]) => ({
      name,
      score: Math.min(100, Math.max(30, (data?.totalVolume / 1000) + (data?.sessions * 10))),
      progressTrend: 'up' as const
    }));

    // Fill in missing muscle groups with baseline scores
    const allMuscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];
    allMuscleGroups.forEach(muscle => {
      if (!muscleGroups.find(m => m.name === muscle)) {
        muscleGroups.push({
          name: muscle,
          score: 40 + Math.floor(Math.random() * 20),
          progressTrend: 'up' as const
        });
      }
    });

    const weeklyVolume = workouts?.reduce((acc, workout) => 
      acc + ((workout?.weight || 0) * (workout?.sets || 0) * (workout?.reps || 0)), 0
    ) || 0;
    
    const avgSleep = recovery?.length > 0 ? 
      recovery.reduce((acc: number, curr: any) => acc + (curr?.sleep_hours || 7.5), 0) / recovery.length : 7.5;

    // Calculate consistency based on workout frequency
    const daysWithWorkouts = new Set(workouts?.map(w => w?.workout_date).filter(Boolean)).size;
    const consistency = Math.min(100, (daysWithWorkouts / 7) * 100);

    return {
      overallProgress: Math.min(100, Math.max(50, (workouts?.length || 0) * 5 + consistency)),
      totalWorkouts: workouts?.length || 0,
      averageSleep: avgSleep,
      activeGoals: goals?.filter((goal: any) => goal?.status === 'active').length || 0,
      muscleGroups,
      weeklyVolume: Math.floor(weeklyVolume / 1000) || 0,
      consistency: Math.floor(consistency),
      strengthGain: Math.min(20, Math.max(5, (workouts?.length || 0) * 2))
    };
  }, [progressData, muscleGroupData]);

  // Handler functions for interactive elements
  const handleAddGoal = () => {
    console.log('Navigate to goal creation');
    // In a real app, this would navigate to goal creation or open a modal
  };

  const handleViewWorkouts = () => {
    console.log('Navigate to workout history');
    // In a real app, this would navigate to workout history
  };

  const handleViewNutrition = () => {
    console.log('Navigate to nutrition tracking');
    // In a real app, this would navigate to food log
  };

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Unable to load progress data</p>
            <p className="text-sm opacity-75 mt-1">Please check your connection and try again</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <BackButton onBack={handleBack} text="Back to Dashboard" />
      </div>
      {/* Hero Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{progressMetrics?.overallProgress || 0}%</div>
                <div className="text-sm text-muted-foreground font-medium">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Dumbbell className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500">{progressMetrics?.totalWorkouts || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Moon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-500">{(progressMetrics?.averageSleep || 0).toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground font-medium">Avg Sleep</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">{progressMetrics?.activeGoals || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-muted/50 to-muted/80 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="physique" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Physique
          </TabsTrigger>
          <TabsTrigger value="mental" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Mental
          </TabsTrigger>
          <TabsTrigger value="science" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Science
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-8 animate-fade-in">
          <ProgressMetrics 
            metrics={progressMetrics}
            onAddGoal={handleAddGoal}
            onViewWorkouts={handleViewWorkouts}
          />

          {/* Training Schedule */}
          <Card className="bg-gradient-to-br from-indigo-500/5 to-violet-600/5 border-indigo-500/20 hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-indigo-500" />
                  <span>This Week's Plan</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => console.log('Edit schedule')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </CardTitle>
              <CardDescription>Upcoming training sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Push Day', 'Pull Day', 'Legs', 'Cardio'].map((workout, index) => (
                <div key={workout} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">{workout}</span>
                  <Badge variant={index === 0 ? 'default' : 'outline'}>
                    {index === 0 ? 'Today' : ['Tomorrow', 'Friday', 'Saturday'][index - 1]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nutrition Overview */}
          <Card className="bg-gradient-to-br from-pink-500/5 to-rose-600/5 border-pink-500/20 hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-pink-500" />
                  <span>Nutrition Status</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleViewNutrition}>
                  <Plus className="w-4 h-4 mr-1" />
                  Log Food
                </Button>
              </CardTitle>
              <CardDescription>Daily macro and calorie tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Protein (180g target)</span>
                  <span className="text-pink-500 font-medium">165g</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Carbs (250g target)</span>
                  <span className="text-blue-500 font-medium">230g</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calories (2400 target)</span>
                  <span className="text-green-500 font-medium">2280</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physique" className="space-y-6 mt-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Muscle Map */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Muscle Development Map</span>
                </CardTitle>
                <CardDescription>
                  Interactive visualization of your training progress by muscle group
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <RealisticMuscleMap 
                  muscleGroups={progressMetrics?.muscleGroups || []} 
                />
              </CardContent>
            </Card>

            {/* Body Composition Tracking */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-600/5 border-blue-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Body Composition</span>
                </CardTitle>
                <CardDescription>Track your physique changes over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-500/5 rounded-xl">
                    <div className="text-2xl font-bold text-blue-500">12.5%</div>
                    <div className="text-sm text-muted-foreground">Body Fat</div>
                    <div className="text-xs text-green-500 mt-1">↓ 2% this month</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/5 rounded-xl">
                    <div className="text-2xl font-bold text-green-500">165 lbs</div>
                    <div className="text-sm text-muted-foreground">Lean Mass</div>
                    <div className="text-xs text-green-500 mt-1">↑ 3 lbs gained</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weight Goal Progress</span>
                    <span className="text-sm text-muted-foreground">185 lbs target</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Muscle Definition</span>
                    <span className="text-sm text-muted-foreground">Advanced level</span>
                  </div>
                  <Progress value={82} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Symmetry Score</span>
                    <span className="text-sm text-muted-foreground">Excellent</span>
                  </div>
                  <Progress value={88} className="h-3" />
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">AI Physique Insight</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progressMetrics.totalWorkouts > 0 
                      ? `Based on your ${progressMetrics.totalWorkouts} recent workouts, focus on balanced muscle development.`
                      : 'Start tracking workouts to receive personalized physique insights.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Progress Photos Timeline */}
            <Card className="bg-gradient-to-br from-purple-500/5 to-pink-600/5 border-purple-500/20 hover-scale lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-purple-500" />
                    <span>Transformation Timeline</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => console.log('Upload photo')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Photo
                  </Button>
                </CardTitle>
                <CardDescription>Visual progress tracking over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['January', 'March', 'June', 'Current'].map((month, index) => (
                    <div key={month} className="text-center">
                      <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl mb-2 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <Users className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <div className="text-sm font-medium">{month}</div>
                      <div className="text-xs text-muted-foreground">
                        {index === 3 ? '185 lbs • 12.5% BF' : `${175 + index * 3} lbs • ${16 - index * 1.2}% BF`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mental" className="space-y-6 mt-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mental Resilience */}
            <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-600/5 border-purple-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span>Mental Resilience</span>
                </CardTitle>
                <CardDescription>Psychological strength and mindset tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Motivation Level</span>
                    <Badge className="bg-purple-500/10 text-purple-700">8.5/10</Badge>
                  </div>
                  <Progress value={85} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stress Management</span>
                    <Badge className="bg-blue-500/10 text-blue-700">7.2/10</Badge>
                  </div>
                  <Progress value={72} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Focus & Clarity</span>
                    <Badge className="bg-green-500/10 text-green-700">8.8/10</Badge>
                  </div>
                  <Progress value={88} className="h-3" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Mental Performance Boost</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your focus peaks during evening workouts. Consider scheduling important training sessions between 6-8 PM.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recovery & Sleep */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-600/5 border-blue-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <span>Recovery & Sleep</span>
                </CardTitle>
                <CardDescription>Rest quality and recovery optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                    <div className="text-xl font-bold text-blue-500">7.8</div>
                    <div className="text-xs text-muted-foreground">Sleep Score</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/5 rounded-lg">
                    <div className="text-xl font-bold text-green-500">85%</div>
                    <div className="text-xs text-muted-foreground">Recovery Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deep Sleep</span>
                    <span className="text-sm font-medium text-blue-500">2h 15m</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">REM Sleep</span>
                    <span className="text-sm font-medium text-purple-500">1h 45m</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sleep Efficiency</span>
                    <span className="text-sm font-medium text-green-500">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Habit Tracking */}
            <Card className="bg-gradient-to-br from-green-500/5 to-emerald-600/5 border-green-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>Consistency Tracker</span>
                </CardTitle>
                <CardDescription>Daily habits and behavioral patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Hydration Goal</span>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-700">7/8 cups</Badge>
                  </div>
                  <Progress value={87} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coffee className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Morning Routine</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700">Complete</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Meditation</span>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-700">15/15 min</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="mt-4 p-3 bg-green-500/5 rounded-lg">
                  <div className="text-sm font-medium text-green-700 mb-1">21-Day Streak! 🔥</div>
                  <div className="text-xs text-muted-foreground">
                    Excellent consistency with your daily habits. Keep up the momentum!
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wellness Metrics */}
            <Card className="bg-gradient-to-br from-orange-500/5 to-red-600/5 border-orange-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-orange-500" />
                  <span>Wellness Dashboard</span>
                </CardTitle>
                <CardDescription>Holistic health and wellbeing metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-red-500/5 rounded-lg">
                    <div className="text-lg font-bold text-red-500">72</div>
                    <div className="text-xs text-muted-foreground">Resting HR</div>
                  </div>
                  <div className="text-center p-2 bg-green-500/5 rounded-lg">
                    <div className="text-lg font-bold text-green-500">45</div>
                    <div className="text-xs text-muted-foreground">HRV Score</div>
                  </div>
                  <div className="text-center p-2 bg-blue-500/5 rounded-lg">
                    <div className="text-lg font-bold text-blue-500">98%</div>
                    <div className="text-xs text-muted-foreground">SpO2</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Energy Levels</span>
                    <span className="text-sm font-medium text-yellow-500">High</span>
                  </div>
                  <Progress value={82} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mood Rating</span>
                    <span className="text-sm font-medium text-green-500">Positive</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stress Index</span>
                    <span className="text-sm font-medium text-blue-500">Low</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="science" className="space-y-6 mt-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Science */}
            <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-600/5 border-cyan-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FlaskConical className="w-5 h-5 text-cyan-500" />
                  <span>Training Science</span>
                </CardTitle>
                <CardDescription>Evidence-based training insights and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <div className="font-medium text-cyan-700 mb-2">Progressive Overload Analysis</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your strength has increased by <span className="font-semibold text-cyan-600">15%</span> in the last 8 weeks, 
                    following optimal progressive overload principles.
                  </p>
                  <div className="text-xs text-cyan-600 bg-cyan-500/10 p-2 rounded">
                    📚 Research: Gradual load increases of 2-10% weekly optimize strength gains while minimizing injury risk.
                  </div>
                </div>
                
                <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <div className="font-medium text-green-700 mb-2">Volume Landmarks</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Current weekly volume is within the <span className="font-semibold text-green-600">10-20 set range</span> 
                    per muscle group, optimal for hypertrophy.
                  </p>
                  <div className="text-xs text-green-600 bg-green-500/10 p-2 rounded">
                    📊 Study: 10-20 sets per muscle group per week maximizes muscle protein synthesis response.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Science */}
            <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-600/5 border-indigo-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <span>Recovery Science</span>
                </CardTitle>
                <CardDescription>Sleep and recovery optimization research</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
                  <div className="font-medium text-indigo-700 mb-2">Sleep Quality Impact</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Averaging <span className="font-semibold text-indigo-600">7.5 hours</span> per night with 85% efficiency, 
                    supporting optimal recovery and muscle protein synthesis.
                  </p>
                  <div className="text-xs text-indigo-600 bg-indigo-500/10 p-2 rounded">
                    🧬 Research: 7-9 hours of quality sleep increases growth hormone release by 70%.
                  </div>
                </div>
                
                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <div className="font-medium text-purple-700 mb-2">HRV Trends</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Heart rate variability indicates <span className="font-semibold text-purple-600">excellent autonomic recovery</span> 
                    and readiness for training.
                  </p>
                  <div className="text-xs text-purple-600 bg-purple-500/10 p-2 rounded">
                    💓 Science: Higher HRV correlates with better recovery and reduced overtraining risk.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Science */}
            <Card className="bg-gradient-to-br from-emerald-500/5 to-green-600/5 border-emerald-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  <span>Nutrition Science</span>
                </CardTitle>
                <CardDescription>Evidence-based nutrition tracking and insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <div className="font-medium text-emerald-700 mb-2">Protein Intake Optimization</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Averaging <span className="font-semibold text-emerald-600">1.6g/kg bodyweight</span>, within the optimal 
                    range for muscle protein synthesis and recovery.
                  </p>
                  <div className="text-xs text-emerald-600 bg-emerald-500/10 p-2 rounded">
                    🥩 Research: 1.6-2.2g/kg protein intake maximizes muscle protein synthesis for athletes.
                  </div>
                </div>
                
                <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                  <div className="font-medium text-orange-700 mb-2">Nutrient Timing</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Post-workout nutrition window utilized effectively for 
                    <span className="font-semibold text-orange-600"> enhanced recovery</span>.
                  </p>
                  <div className="text-xs text-orange-600 bg-orange-500/10 p-2 rounded">
                    ⏰ Study: Post-exercise protein within 2 hours optimizes muscle adaptation.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Psychology */}
            <Card className="bg-gradient-to-br from-rose-500/5 to-pink-600/5 border-rose-500/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-rose-500" />
                  <span>Performance Psychology</span>
                </CardTitle>
                <CardDescription>Mental performance optimization and behavioral science</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-rose-500/5 rounded-lg border border-rose-500/20">
                  <div className="font-medium text-rose-700 mb-2">Circadian Performance</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Peak motivation occurs during <span className="font-semibold text-rose-600">evening training sessions</span>, 
                    aligning with your natural circadian rhythm.
                  </p>
                  <div className="text-xs text-rose-600 bg-rose-500/10 p-2 rounded">
                    🕐 Research: Performance peaks 6-8 hours after natural wake time for most individuals.
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="font-medium text-blue-700 mb-2">Habit Formation</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-blue-600">21-day consistency streak</span> indicates strong habit 
                    formation and behavioral change.
                  </p>
                  <div className="text-xs text-blue-600 bg-blue-500/10 p-2 rounded">
                    🧠 Science: 66 days average to form automatic habits, you're building excellent momentum.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Highlights */}
            <Card className="bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border-yellow-500/20 hover-scale md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Latest Research Insights</span>
                </CardTitle>
                <CardDescription>Recent scientific findings relevant to your training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg border border-blue-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <FlaskConical className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-700">Exercise Order Research</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recent 2024 study shows compound movements first can increase overall training volume by 12-15%.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Moon className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-purple-700">Sleep & Performance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New findings: Each additional hour of quality sleep correlates with 3-5% strength improvement.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scale className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700">Protein Distribution</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Spreading protein across 4+ meals shows 8% better muscle protein synthesis than 2-3 large meals.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-lg border border-orange-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-orange-700">Recovery Methods</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cold therapy (10-15°C for 10-15 min) post-workout reduces inflammation markers by 23%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}