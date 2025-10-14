import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, RotateCcw, Eye, Calendar, Target, Trophy, Activity, Heart, Brain, Dumbbell } from "lucide-react";
import { RealisticMuscleMap, MuscleMapLegend } from "@/components/ui/realistic-muscle-map";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { InstantSkeleton } from "@/components/ui/instant-skeleton";

// Fast skeleton for immediate loading
const ProgressSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
  </div>
);

// Optimized data fetching hook
const useProgressData = (userId: string) => {
  return useQuery({
    queryKey: ['progressData', userId],
    queryFn: async () => {
      // Fetch all data in parallel for faster loading
      const [workoutData, recoveryData, goalsData] = await Promise.all([
        supabase
          .from('progressive_overload_entries')
          .select('exercise_name, weight, sets, reps, workout_date, rpe, created_at')
          .eq('user_id', userId)
          .limit(200),
        supabase
          .from('recovery_data')
          .select('sleep_hours, stress_level, recorded_date, created_at')
          .eq('user_id', userId)
          .limit(50),
        supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      return {
        workouts: workoutData.data || [],
        recovery: recoveryData.data || [],
        goals: goalsData.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

interface OptimizedProgressHubProps {
  onBack?: () => void;
}

const OptimizedProgressHub: React.FC<OptimizedProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { data, isLoading } = useProgressData(user?.id || '');

  // Memoized calculations for better performance
  const progressMetrics = useMemo(() => {
    if (!data) return null;

    const workouts = data.workouts;
    const recovery = data.recovery;
    const goals = data.goals;

    // Calculate muscle development scores based on REAL workout data only
    const muscleExerciseMap: Record<string, string[]> = {
      chest: ['bench press', 'chest press', 'push up', 'fly', 'dip'],
      shoulders: ['shoulder press', 'lateral raise', 'front raise', 'overhead press'],
      arms: ['bicep curl', 'tricep', 'hammer curl', 'skull crusher'],
      back: ['row', 'pull up', 'lat pulldown', 'deadlift'],
      core: ['plank', 'crunch', 'ab', 'sit up', 'leg raise'],
      legs: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl'],
      glutes: ['hip thrust', 'glute bridge', 'kickback'],
      calves: ['calf raise', 'calf press'],
      traps: ['shrug', 'upright row']
    };

    // Build muscle groups from actual workout data
    const muscleGroups = Object.entries(muscleExerciseMap).map(([muscle, keywords]) => {
      const relevantWorkouts = workouts.filter(w => 
        keywords.some(keyword => w.exercise_name?.toLowerCase().includes(keyword))
      );
      
      const totalVolume = relevantWorkouts.reduce((sum, w) => 
        sum + (w.weight || 0) * (w.sets || 0) * (w.reps || 0), 0
      );
      
      // Only include muscles with actual training data
      if (relevantWorkouts.length === 0 || totalVolume === 0) {
        return null;
      }

      // Calculate score based on volume and frequency
      const score = Math.min(100, (totalVolume / 1000) + (relevantWorkouts.length * 5));
      
      return {
        name: muscle,
        score: Math.round(score),
        progressTrend: 'up' as const
      };
    }).filter((mg): mg is NonNullable<typeof mg> => mg !== null);

    const totalWorkouts = workouts.length;
    const avgSleep = recovery.length > 0 ? recovery.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recovery.length : 0;
    const activeGoals = goals.filter(g => !g.is_completed).length;
    
    // Calculate overall progress based on real data only
    const overallProgress = Math.min(100, Math.max(
      0,
      (totalWorkouts * 2) + // 2% per workout
      (avgSleep > 0 ? (avgSleep / 8) * 20 : 0) + // Up to 20% for good sleep
      (activeGoals * 5) // 5% per active goal
    ));

    return {
      muscleGroups,
      totalWorkouts,
      avgSleep: Math.round(avgSleep * 10) / 10,
      activeGoals,
      overallProgress: Math.round(overallProgress)
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <InstantSkeleton />
        <ProgressSkeleton />
      </div>
    );
  }

  if (!progressMetrics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Unable to load progress data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{progressMetrics.overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{progressMetrics.totalWorkouts}</p>
              </div>
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Sleep</p>
                <p className="text-2xl font-bold">{progressMetrics.avgSleep.toFixed(1)}h</p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{progressMetrics.activeGoals}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs - Force all content to render */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4" role="tablist">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="physique" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Physique
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Mental
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Science
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6" forceMount hidden={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Overall</CardTitle></CardHeader>
              <CardContent>
                <Progress value={progressMetrics.overallProgress} className="h-2" />
              </CardContent>
            </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Workouts</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{progressMetrics.totalWorkouts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Avg Sleep</CardTitle></CardHeader>
                <CardContent>
              <p className="text-2xl font-semibold">{progressMetrics.avgSleep > 0 ? `${progressMetrics.avgSleep}h` : '--'}</p>
                </CardContent>
              </Card>
            </div>
        </TabsContent>

        <TabsContent value="physique" className="space-y-6" forceMount hidden={false}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Muscle Development Analysis
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Front/Back
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RealisticMuscleMap
                    muscleGroups={progressMetrics.muscleGroups}
                    viewMode="front"
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Development Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <MuscleMapLegend />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recovery" forceMount hidden={false}>
          <Card>
              <CardHeader>
                <CardTitle>Mental & Recovery Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.recovery && data.recovery.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Tracking {data.recovery.length} recovery entries
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Sleep</p>
                        <p className="text-2xl font-bold">{progressMetrics?.avgSleep || 0}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Stress</p>
                        <p className="text-2xl font-bold">
                          {data.recovery.length > 0 
                            ? (data.recovery.reduce((sum, r) => sum + (r.stress_level || 0), 0) / data.recovery.length).toFixed(1)
                            : '--'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recovery data yet. Start tracking sleep and stress levels.</p>
                )}
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="goals" forceMount hidden={false}>
          <Card>
              <CardHeader>
                <CardTitle>Scientific Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {progressMetrics?.totalWorkouts > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Based on your {progressMetrics.totalWorkouts} logged workouts
                    </p>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm">
                        Training consistency and progressive overload are key factors in muscle development.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Start logging workouts to see science-based insights.</p>
                )}
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizedProgressHub;