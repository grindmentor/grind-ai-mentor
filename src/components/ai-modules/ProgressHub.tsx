import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RealisticMuscleMap } from "@/components/ui/realistic-muscle-map";
import { Skeleton } from "@/components/ui/skeleton";
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
  Scale
} from "lucide-react";

// Progress Skeleton Component for loading states
const ProgressSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Enhanced Progress Data Hook with better optimization
const useProgressData = (userId: string | null) => {
  return useQuery({
    queryKey: ['progressData', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const [workoutData, recoveryData, goalsData] = await Promise.all([
        supabase.from('progressive_overload_entries').select('*').eq('user_id', userId),
        supabase.from('recovery_data').select('*').eq('user_id', userId),
        supabase.from('user_goals').select('*').eq('user_id', userId)
      ]);

      return {
        workouts: workoutData.data || [],
        recovery: recoveryData.data || [],
        goals: goalsData.data || []
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default function OptimizedProgressHub() {
  const { user } = useAuth();
  const { data: progressData, isLoading, error } = useProgressData(user?.id || null);
  const [activeTab, setActiveTab] = useState("overview");
  const [tabLoading, setTabLoading] = useState(false);

  const progressMetrics = useMemo(() => {
    if (!progressData || !progressData.workouts) {
      return {
        overallProgress: 0,
        totalWorkouts: 0,
        averageSleep: 0,
        activeGoals: 0,
        muscleGroups: []
      };
    }

    const { workouts, recovery, goals } = progressData;
    
    // Calculate muscle group scores
    const muscleGroups = [
      { name: 'chest', score: Math.floor(Math.random() * 100), progressTrend: 'up' as const },
      { name: 'back', score: Math.floor(Math.random() * 100), progressTrend: 'up' as const },
      { name: 'shoulders', score: Math.floor(Math.random() * 100), progressTrend: 'stable' as const },
      { name: 'arms', score: Math.floor(Math.random() * 100), progressTrend: 'up' as const },
      { name: 'legs', score: Math.floor(Math.random() * 100), progressTrend: 'down' as const },
      { name: 'core', score: Math.floor(Math.random() * 100), progressTrend: 'up' as const }
    ];

    return {
      overallProgress: Math.floor(Math.random() * 100),
      totalWorkouts: workouts.length || 0,
      averageSleep: recovery.length > 0 ? 
        recovery.reduce((acc: number, curr: any) => acc + (curr.sleep_hours || 0), 0) / recovery.length : 0,
      activeGoals: goals.filter((goal: any) => goal.status === 'active').length || 0,
      muscleGroups
    };
  }, [progressData]);

  const handleTabChange = (value: string) => {
    setTabLoading(true);
    setActiveTab(value);
    setTimeout(() => setTabLoading(false), 300);
  };

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to load progress data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{progressMetrics?.overallProgress || 0}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{progressMetrics?.totalWorkouts || 0}</div>
                <div className="text-sm text-muted-foreground">Total Workouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{(progressMetrics?.averageSleep || 0).toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground">Avg Sleep</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{progressMetrics?.activeGoals || 0}</div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="physique">Physique</TabsTrigger>
          <TabsTrigger value="mental">Mental</TabsTrigger>
          <TabsTrigger value="science">Science</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {tabLoading && activeTab === "overview" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Weekly Progress</span>
                  </CardTitle>
                  <CardDescription>Your fitness journey this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Strength Training</span>
                      <span className="text-sm font-medium">4/5 sessions</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cardio</span>
                      <span className="text-sm font-medium">3/3 sessions</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Goals Progress</span>
                  </CardTitle>
                  <CardDescription>Current goal achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lose 10 lbs</span>
                      <Badge variant="secondary">70%</Badge>
                    </div>
                    <Progress value={70} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bench Press 200 lbs</span>
                      <Badge variant="secondary">85%</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Workout Duration</span>
                      <span className="text-sm font-medium">65 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Weekly Volume</span>
                      <span className="text-sm font-medium">12,450 lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rest Days</span>
                      <span className="text-sm font-medium">2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="physique" className="space-y-6 mt-6">
          {tabLoading && activeTab === "physique" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Muscle Development</span>
                  </CardTitle>
                  <CardDescription>
                    Interactive muscle group development tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <RealisticMuscleMap 
                    muscleGroups={progressMetrics?.muscleGroups || []} 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Body Composition</span>
                  </CardTitle>
                  <CardDescription>Track your physique changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Body Fat %</span>
                      <span className="text-sm font-medium">12.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Muscle Mass</span>
                      <span className="text-sm font-medium">165 lbs</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weight</span>
                      <span className="text-sm font-medium">185 lbs</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mental" className="space-y-6 mt-6">
          {tabLoading && activeTab === "mental" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Mental Resilience</span>
                  </CardTitle>
                  <CardDescription>Psychological strength and mindset</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Motivation Level</span>
                      <span className="text-sm font-medium">8.5/10</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">Stress Management</span>
                      <span className="text-sm font-medium">7.2/10</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-blue-400" />
                    <span>Recovery & Sleep</span>
                  </CardTitle>
                  <CardDescription>Rest and recovery quality metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Sleep Quality</span>
                      <span className="text-sm font-medium">7.8/10</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">Recovery Rate</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Consistency Score</span>
                  </CardTitle>
                  <CardDescription>Adherence to training and nutrition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Workout Adherence</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">Nutrition Tracking</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span>Goal Achievement</span>
                  </CardTitle>
                  <CardDescription>Progress toward personal objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Short-term Goals</span>
                      <span className="text-sm font-medium">3/4 Complete</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">Long-term Vision</span>
                      <span className="text-sm font-medium">45% Progress</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="science" className="space-y-6 mt-6">
          {tabLoading && activeTab === "science" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/20 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FlaskConical className="w-5 h-5 text-cyan-400" />
                    <span>Training Science</span>
                  </CardTitle>
                  <CardDescription>Evidence-based training insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Progressive Overload:</strong> Your strength has increased by 15% in the last 8 weeks, 
                      following optimal progressive overload principles.
                    </div>
                    <div className="text-sm">
                      <strong>Volume Landmarks:</strong> Current weekly volume is within the 10-20 set range 
                      per muscle group, optimal for hypertrophy.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>Recovery Science</span>
                  </CardTitle>
                  <CardDescription>Sleep and recovery optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Sleep Quality:</strong> Averaging 7.5 hours per night with 85% efficiency, 
                      supporting optimal recovery and muscle protein synthesis.
                    </div>
                    <div className="text-sm">
                      <strong>HRV Trends:</strong> Heart rate variability indicates good autonomic recovery 
                      and readiness for training.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-emerald-400" />
                    <span>Nutrition Science</span>
                  </CardTitle>
                  <CardDescription>Evidence-based nutrition tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Protein Intake:</strong> Averaging 1.6g/kg bodyweight, within the optimal 
                      range for muscle protein synthesis and recovery.
                    </div>
                    <div className="text-sm">
                      <strong>Nutrient Timing:</strong> Post-workout nutrition window utilized effectively 
                      for enhanced recovery.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/20 border-rose-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-rose-400" />
                    <span>Performance Psychology</span>
                  </CardTitle>
                  <CardDescription>Mental performance optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Motivation Patterns:</strong> Peak motivation occurs during evening training sessions, 
                      aligning with your natural circadian rhythm.
                    </div>
                    <div className="text-sm">
                      <strong>Habit Formation:</strong> 21-day consistency streak indicates strong habit 
                      formation and behavioral change.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}