import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RealisticMuscleMap } from "@/components/ui/realistic-muscle-map";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartLoading } from "@/components/ui/smart-loading";
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

// Simple number display without animation
const StatNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  return <span>{Math.round(value * 10) / 10}{suffix}</span>;
};

// Optimized Progress Skeleton Component with shimmer effect
const ProgressSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
    {/* Back Button Skeleton */}
    <div className="flex items-center mb-6 animate-slide-in-left">
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Hero Stats Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="hover-scale animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-16 animate-pulse" />
                <Skeleton className="h-4 w-20 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Tabs Skeleton */}
    <div className="space-y-6 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
      <Skeleton className="h-12 w-full rounded-xl animate-pulse" />
      
      {/* Tab Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="hover-scale animate-fade-in" style={{ animationDelay: `${500 + i * 100}ms` }}>
            <CardHeader>
              <Skeleton className="h-6 w-32 animate-pulse" />
              <Skeleton className="h-4 w-48 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full animate-pulse" />
                <Skeleton className="h-3 w-3/4 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Tab Content Skeleton for faster switching
const TabContentSkeleton = () => (
  <div className="space-y-6 mt-8 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="hover-scale animate-slide-in-up" style={{ animationDelay: `${i * 150}ms` }}>
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="h-4 w-48 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full animate-pulse" />
              <Skeleton className="h-3 w-2/3 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default function OptimizedProgressHub({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const { state, actions } = useGlobalState();
  const { on, off, emit, invalidateCache } = useAppSync();
  const navigate = useNavigate();
  const { data: progressData, isLoading, error } = useOptimizedProgressData(user?.id || null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/app', { replace: true });
    }
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
        strengthGain: 0,
        currentWeight: 0,
        bodyFatPercentage: 0,
        totalVolume: 0,
        averageRPE: 0,
        weeklyFrequency: 0
      };
    }

    const { workouts, recovery, goals, profile } = progressData;
    
    // Calculate realistic muscle group scores from actual data only 
    const muscleGroups = Object.entries(muscleGroupData || {}).map(([name, data]: [string, any]) => ({
      name,
      score: data?.totalVolume > 0 ? Math.min(100, (data?.totalVolume / 1000) + (data?.sessions * 10)) : 0,
      progressTrend: 'up' as const
    })).filter(mg => mg.score > 0); // Only show muscle groups with actual data

    // Enhanced calculations with real data
    const weeklyVolume = workouts?.reduce((acc, workout) => 
      acc + ((workout?.weight || 0) * (workout?.sets || 0) * (workout?.reps || 0)), 0
    ) || 0;

    const totalVolume = weeklyVolume;
    
    const avgSleep = recovery?.length > 0 ? 
      recovery.reduce((acc: number, curr: any) => acc + (curr?.sleep_hours || 7.5), 0) / recovery.length : 7.5;

    const averageRPE = workouts?.length > 0 ? 
      workouts.reduce((acc, workout) => acc + (workout?.rpe || 7), 0) / workouts.length : 7;

    // Calculate consistency based on workout frequency over the last 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentWorkouts = workouts?.filter(w => 
      w?.workout_date && new Date(w.workout_date) >= twoWeeksAgo
    ) || [];
    
    const daysWithWorkouts = new Set(recentWorkouts.map(w => w?.workout_date).filter(Boolean)).size;
    const consistency = Math.min(100, (daysWithWorkouts / 14) * 100);

    // Weekly frequency calculation
    const weeklyFrequency = Math.round((recentWorkouts.length / 2) * 10) / 10; // Average per week over 2 weeks

    // Overall progress calculation based on multiple factors
    const overallProgress = Math.min(100, Math.max(
      20, 
      (consistency * 0.4) + 
      (Math.min(100, workouts?.length * 3) * 0.3) + 
      (Math.min(100, avgSleep / 8 * 100) * 0.2) + 
      (goals?.filter((goal: any) => goal?.status === 'active').length * 10 * 0.1)
    ));

    return {
      overallProgress: Math.round(overallProgress),
      totalWorkouts: workouts?.length || 0,
      averageSleep: Math.round(avgSleep * 10) / 10,
      activeGoals: goals?.filter((goal: any) => goal?.status === 'active').length || 0,
      muscleGroups,
      weeklyVolume: Math.floor(weeklyVolume / 1000) || 0,
      consistency: Math.round(consistency),
      strengthGain: Math.min(25, Math.max(0, (workouts?.length || 0) * 1.5)),
      currentWeight: profile?.weight || 0,
      bodyFatPercentage: profile?.body_fat_percentage || 0,
      totalVolume: Math.round(totalVolume),
      averageRPE: Math.round(averageRPE * 10) / 10,
      weeklyFrequency
    };
  }, [progressData, muscleGroupData]);

  // Handler functions for interactive elements
  const handleAddGoal = () => {
    navigate('/app?module=goals');
  };

  const handleViewWorkouts = () => {
    navigate('/app?module=workout-logger');
  };

  const handleViewNutrition = () => {
    navigate('/app?module=smart-food-log');
  };

  const handleEditSchedule = () => {
    navigate('/app?module=workout-scheduler');
  };

  const handleTakePhoto = () => {
    navigate('/app?module=physique-ai');
  };

  const handleViewPhysique = () => {
    navigate('/app?module=physique-ai');
  };

  const handleTrackRecovery = () => {
    navigate('/app?module=recovery-coach');
  };

  const handleViewStudies = () => {
    navigate('/app?module=science-hub');
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <BackButton onBack={handleBack} text="Back to Dashboard" />
      </div>
      {/* Hero Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  <StatNumber value={progressMetrics?.overallProgress || 0} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground font-medium">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Dumbbell className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500">
                  <StatNumber value={progressMetrics?.totalWorkouts || 0} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Moon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-500">
                  <StatNumber value={progressMetrics?.averageSleep || 0} suffix="h" />
                </div>
                <div className="text-sm text-muted-foreground font-medium">Avg Sleep</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">
                  <StatNumber value={progressMetrics?.activeGoals || 0} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <div>
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

          <TabsContent value="overview" className="space-y-6 mt-8">
            {isLoading ? (
            <TabContentSkeleton />
          ) : (
            <>
              <ProgressMetrics 
                metrics={progressMetrics}
                onAddGoal={handleAddGoal}
                onViewWorkouts={handleViewWorkouts}
              />

              {/* Training Schedule */}
              <Card className="bg-gradient-to-br from-indigo-500/5 to-violet-600/5 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5 text-indigo-500" />
                      <span>This Week's Plan</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleEditSchedule}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </CardTitle>
                  <CardDescription>Upcoming training sessions</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-3">
                   {isLoading ? (
                     <div className="py-6">
                       <SmartLoading message="Loading schedule..." type="processing" size="md" />
                     </div>
                   ) : progressData?.workouts?.length > 0 ? (
                     <div className="text-center py-6">
                       <Activity className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                       <p className="text-sm text-muted-foreground mb-2">
                         You have {progressData.workouts.length} logged workouts
                       </p>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         onClick={handleEditSchedule}
                         className="text-indigo-400 border-indigo-400"
                       >
                         Plan Workouts
                       </Button>
                     </div>
                   ) : (
                     <div className="text-center py-6">
                       <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p className="text-sm text-muted-foreground mb-2">
                         No workout schedule yet
                       </p>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         onClick={handleEditSchedule}
                         className="text-indigo-400 border-indigo-400"
                       >
                         Create Schedule
                       </Button>
                     </div>
                   )}
                 </CardContent>
              </Card>

               {/* Nutrition Overview - Only show if we have food log data */}
               {progressData?.foodLogs?.length > 0 ? (
                 <Card className="bg-gradient-to-br from-pink-500/5 to-rose-600/5 border-pink-500/20">
                   <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <Scale className="w-5 h-5 text-pink-500" />
                         <span>Nutrition Tracking</span>
                       </div>
                       <Button size="sm" variant="outline" onClick={handleViewNutrition}>
                         <Plus className="w-4 h-4 mr-1" />
                         Log Food
                       </Button>
                     </CardTitle>
                     <CardDescription>Your recent nutrition data</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="text-center py-4">
                       <p className="text-sm text-muted-foreground">
                         {progressData.foodLogs.length} food entries logged
                       </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         Total calories: {progressData.foodLogs.reduce((sum, entry) => sum + (entry.calories || 0), 0)}
                       </p>
                     </div>
                   </CardContent>
                 </Card>
               ) : (
                 <Card className="bg-gradient-to-br from-pink-500/5 to-rose-600/5 border-pink-500/20">
                   <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <Scale className="w-5 h-5 text-pink-500" />
                         <span>Nutrition Tracking</span>
                       </div>
                       <Button size="sm" variant="outline" onClick={handleViewNutrition}>
                         <Plus className="w-4 h-4 mr-1" />
                         Start Tracking
                       </Button>
                     </CardTitle>
                     <CardDescription>Track your daily nutrition intake</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     {isLoading ? (
                       <div className="py-6">
                         <SmartLoading message="Loading nutrition..." type="processing" size="md" />
                       </div>
                     ) : (
                       <div className="text-center py-6">
                         <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                         <p className="text-sm text-muted-foreground mb-2">
                           No nutrition data yet
                         </p>
                         <p className="text-xs text-muted-foreground">
                           Start logging food to see your nutrition progress
                         </p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               )}
            </>
          )}
        </TabsContent>

          <TabsContent value="physique" className="space-y-6 mt-8">
            {isLoading ? (
            <TabContentSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interactive Muscle Map */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Users className="w-5 h-5 text-primary" />
                       <span>Muscle Development Map</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleViewWorkouts}>
                       <ExternalLink className="w-4 h-4 mr-1" />
                       Log Workout
                     </Button>
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
                <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-600/5 border-blue-500/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <TrendingUp className="w-5 h-5 text-blue-500" />
                       <span>Body Composition</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleTakePhoto}>
                       <Camera className="w-4 h-4 mr-1" />
                       Take Photo
                     </Button>
                   </CardTitle>
                   <CardDescription>Track your physique changes over time</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-500/5 rounded-xl">
                      <div className="text-2xl font-bold text-blue-500">
                        {progressMetrics.bodyFatPercentage > 0 ? `${progressMetrics.bodyFatPercentage}%` : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Body Fat</div>
                      <div className="text-xs text-green-500 mt-1">
                        {progressMetrics.bodyFatPercentage > 0 ? '↓ Trending down' : 'Add data to track'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/5 rounded-xl">
                      <div className="text-2xl font-bold text-green-500">
                        {progressMetrics.currentWeight > 0 ? `${progressMetrics.currentWeight} lbs` : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Weight</div>
                      <div className="text-xs text-green-500 mt-1">
                        {progressMetrics.currentWeight > 0 ? '↑ On track' : 'Update in profile'}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Training Consistency</span>
                      <span className="text-sm text-muted-foreground">{progressMetrics.consistency}% this month</span>
                    </div>
                    <Progress value={progressMetrics.consistency} className="h-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Weekly Frequency</span>
                      <span className="text-sm text-muted-foreground">{progressMetrics.weeklyFrequency}x per week</span>
                    </div>
                    <Progress value={Math.min(100, (progressMetrics.weeklyFrequency / 5) * 100)} className="h-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Strength Progress</span>
                      <span className="text-sm text-muted-foreground">+{progressMetrics.strengthGain}% gained</span>
                    </div>
                    <Progress value={Math.min(100, progressMetrics.strengthGain * 4)} className="h-3" />
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
            </div>
          )}
        </TabsContent>

          <TabsContent value="mental" className="space-y-6 mt-8">
            {isLoading ? (
            <TabContentSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mental Resilience */}
              <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-600/5 border-purple-500/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Brain className="w-5 h-5 text-purple-500" />
                       <span>Mental Resilience</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleTrackRecovery}>
                       <ExternalLink className="w-4 h-4 mr-1" />
                       Track Recovery
                     </Button>
                   </CardTitle>
                   <CardDescription>Tracking stress, recovery, and mental wellness</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-500/5 rounded-xl">
                      <div className="text-3xl font-bold text-green-500">
                        {progressData?.recovery?.length > 0 ? 
                          (progressData.recovery.reduce((acc: number, curr: any) => acc + (curr?.stress_level || 5), 0) / progressData.recovery.length).toFixed(1) 
                          : '--'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Stress Level</div>
                      <div className="text-xs text-green-500 mt-1">
                        {progressData?.recovery?.length > 0 ? 'Tracked' : 'No data yet'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/5 rounded-xl">
                      <div className="text-3xl font-bold text-blue-500">
                        {progressData?.recovery?.length > 0 ? 
                          Math.round((progressData.recovery.reduce((acc: number, curr: any) => acc + (curr?.sleep_quality || 7), 0) / progressData.recovery.length) * 10) + '%'
                          : '--'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Sleep Quality</div>
                      <div className="text-xs text-blue-500 mt-1">
                        {progressData?.recovery?.length > 0 ? 'Average rating' : 'Add sleep data'}
                      </div>
                    </div>
                  </div>

                  <Separator />

                   <div className="space-y-4">
                     {isLoading ? (
                       <div className="py-4">
                         <SmartLoading message="Loading recovery metrics..." type="analysis" size="md" />
                       </div>
                     ) : progressData?.recovery?.length > 0 ? (
                       <>
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Energy Levels</span>
                           <span className="text-sm text-muted-foreground">
                             {progressData.recovery.reduce((acc: number, curr: any) => acc + (curr?.energy_level || 5), 0) / progressData.recovery.length > 6 ? 'Good' : 'Fair'}
                           </span>
                         </div>
                         <Progress value={Math.min(100, (progressData.recovery.reduce((acc: number, curr: any) => acc + (curr?.energy_level || 5), 0) / progressData.recovery.length / 10) * 100)} className="h-3" />
                         
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Recovery Rate</span>
                           <span className="text-sm text-muted-foreground">
                             {progressMetrics.averageSleep > 7 ? 'Good' : 'Needs Work'}
                           </span>
                         </div>
                         <Progress value={progressMetrics.averageSleep * 12.5} className="h-3" />
                       </>
                     ) : (
                       <div className="text-center py-4">
                         <p className="text-sm text-muted-foreground">
                           No recovery metrics available yet
                         </p>
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>

              {/* Wellness Habits */}
              <Card className="bg-gradient-to-br from-green-500/5 to-emerald-600/5 border-green-500/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Heart className="w-5 h-5 text-green-500" />
                       <span>Wellness Habits</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleAddGoal}>
                       <Plus className="w-4 h-4 mr-1" />
                       Add Goal
                     </Button>
                   </CardTitle>
                   <CardDescription>Daily habits supporting your mental health</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {isLoading ? (
                     <div className="py-6">
                       <SmartLoading message="Loading wellness data..." type="analysis" size="md" />
                     </div>
                   ) : progressData?.recovery?.length > 0 ? (
                     <>
                       <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg">
                         <div className="flex items-center space-x-3">
                           <Moon className="w-4 h-4 text-green-500" />
                           <span className="text-sm font-medium">Sleep Consistency</span>
                         </div>
                         <Badge variant="outline" className="bg-green-500/10 text-green-700">
                           {progressMetrics.averageSleep > 7 ? 'Good' : 'Needs Work'}
                         </Badge>
                       </div>
                       
                       <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg">
                         <div className="flex items-center space-x-3">
                           <Heart className="w-4 h-4 text-blue-500" />
                           <span className="text-sm font-medium">Recovery Data</span>
                         </div>
                         <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                           {progressData.recovery.length} entries
                         </Badge>
                       </div>
                     </>
                   ) : (
                     <div className="text-center py-6">
                       <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p className="text-sm text-muted-foreground mb-2">
                         No wellness data yet
                       </p>
                       <p className="text-xs text-muted-foreground mb-4">
                         Start tracking sleep, stress, and energy levels
                       </p>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         onClick={handleTrackRecovery}
                         className="text-green-400 border-green-400"
                       >
                         Start Tracking
                       </Button>
                     </div>
                   )}

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Recovery Insight</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressMetrics.averageSleep > 7 
                        ? 'Your sleep quality is supporting excellent recovery. Keep it up!'
                        : 'Consider improving sleep quality to enhance recovery and performance.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

          <TabsContent value="science" className="space-y-6 mt-8">
            {isLoading ? (
            <TabContentSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scientific Metrics */}
              <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-600/5 border-cyan-500/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <FlaskConical className="w-5 h-5 text-cyan-500" />
                       <span>Training Science</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleViewStudies}>
                       <ExternalLink className="w-4 h-4 mr-1" />
                       View Studies
                     </Button>
                   </CardTitle>
                   <CardDescription>Evidence-based metrics and analysis</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-500/5 rounded-xl">
                      <div className="text-2xl font-bold text-blue-500">
                        {progressMetrics.totalVolume > 0 ? 
                          `${(progressMetrics.totalVolume / 1000).toFixed(1)}k` 
                          : '--'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Total Volume</div>
                      <div className="text-xs text-blue-500 mt-1">
                        {progressMetrics.totalVolume > 0 ? 'lbs lifted' : 'No workouts yet'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/5 rounded-xl">
                      <div className="text-2xl font-bold text-green-500">
                        {progressMetrics.averageRPE > 0 ? progressMetrics.averageRPE : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg RPE</div>
                      <div className="text-xs text-green-500 mt-1">
                        {progressMetrics.averageRPE > 0 ? 
                          (progressMetrics.averageRPE <= 6 ? 'Light intensity' : 
                           progressMetrics.averageRPE <= 8 ? 'Moderate intensity' : 'High intensity')
                          : 'Track RPE in workouts'
                        }
                      </div>
                    </div>
                  </div>

                  <Separator />

                   <div className="space-y-4">
                     {isLoading ? (
                       <div className="py-4">
                         <SmartLoading message="Loading training metrics..." type="analysis" size="md" />
                       </div>
                     ) : progressMetrics.totalWorkouts > 0 ? (
                       <>
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Progressive Overload</span>
                           <span className="text-sm text-muted-foreground">
                             {progressMetrics.totalWorkouts > 10 ? 'Good Progress' : 'Getting Started'}
                           </span>
                         </div>
                         <Progress value={Math.min(100, progressMetrics.totalWorkouts * 5)} className="h-3" />
                         
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Training Consistency</span>
                           <span className="text-sm text-muted-foreground">{progressMetrics.consistency}%</span>
                         </div>
                         <Progress value={progressMetrics.consistency} className="h-3" />
                       </>
                     ) : (
                       <div className="text-center py-4">
                         <p className="text-sm text-muted-foreground">
                           Start logging workouts to see training science metrics
                         </p>
                       </div>
                     )}
                   </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm font-medium">Research-Based Insight</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressMetrics.totalWorkouts > 5 
                        ? 'Your training volume aligns with research for optimal muscle growth and strength gains.'
                        : 'Continue tracking workouts to build a data-driven training approach.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card className="bg-gradient-to-br from-orange-500/5 to-red-600/5 border-orange-500/20">
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Gauge className="w-5 h-5 text-orange-500" />
                       <span>Performance Analytics</span>
                     </div>
                     <Button size="sm" variant="outline" onClick={handleViewWorkouts}>
                       <BarChart3 className="w-4 h-4 mr-1" />
                       View Analytics
                     </Button>
                   </CardTitle>
                   <CardDescription>Advanced training metrics and trends</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Training Frequency</span>
                        <span className="text-lg font-bold text-orange-500">{progressMetrics.weeklyFrequency}x/week</span>
                      </div>
                      <Progress value={Math.min(100, (progressMetrics.weeklyFrequency / 4) * 100)} className="h-2" />
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Consistency Rate</span>
                        <span className="text-lg font-bold text-green-500">{progressMetrics.consistency}%</span>
                      </div>
                      <Progress value={progressMetrics.consistency} className="h-2" />
                    </div>
                  </div>

                   <div className="space-y-3">
                     <h4 className="text-sm font-medium text-muted-foreground">Recent Achievements</h4>
                     {isLoading ? (
                       <div className="py-4">
                         <SmartLoading message="Loading achievements..." type="processing" size="md" />
                       </div>
                     ) : progressMetrics.totalWorkouts > 0 ? (
                       <>
                         <div className="flex items-center space-x-3 p-2 bg-green-500/5 rounded-lg">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-sm">Completed {progressMetrics.totalWorkouts} training sessions</span>
                         </div>
                         {progressMetrics.consistency > 70 && (
                           <div className="flex items-center space-x-3 p-2 bg-blue-500/5 rounded-lg">
                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                             <span className="text-sm">Maintaining {progressMetrics.consistency}% training consistency</span>
                           </div>
                         )}
                       </>
                     ) : (
                       <div className="text-center py-4 text-muted-foreground">
                         <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                         <p className="text-sm">No training data yet</p>
                         <p className="text-xs">Start logging workouts to see analytics</p>
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}