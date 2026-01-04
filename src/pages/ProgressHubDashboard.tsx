import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Camera, 
  Target,
  Activity,
  Moon,
  Heart,
  Zap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { MobileHeader } from '@/components/MobileHeader';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';

interface DashboardStats {
  totalWorkouts: number;
  totalFoodEntries: number;
  weeklyProgress: number;
  currentStreak: number;
  avgSleepHours: number;
  avgStressLevel: number;
  avgRecoveryScore: number;
}

const ProgressHubDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigateToModule, navigateWithReturn } = useModuleNavigation();
  const { isSubscribed } = useSubscription();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    totalFoodEntries: 0,
    weeklyProgress: 0,
    currentStreak: 0,
    avgSleepHours: 0,
    avgStressLevel: 0,
    avgRecoveryScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before deciding what to do
    if (authLoading) return;
    
    if (user) {
      loadDashboardStats();
    } else {
      setIsLoading(false);
    }
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Progress Hub loading timeout - forcing completion');
        setIsLoading(false);
        setLoadError('Loading took too long. Some data may be incomplete.');
      }
    }, 10000);
    
    return () => clearTimeout(safetyTimeout);
  }, [user, authLoading]);

  const loadDashboardStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Run queries in parallel for better performance
      const [workoutsResult, foodResult, recoveryResult] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, session_date')
          .eq('user_id', user.id),
        supabase
          .from('food_log_entries')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('recovery_data')
          .select('sleep_hours, stress_level, energy_level')
          .eq('user_id', user.id)
          .order('recorded_date', { ascending: false })
          .limit(7)
      ]);

      const workouts = workoutsResult.data || [];
      const foodEntries = foodResult.data || [];
      const recoveryData = recoveryResult.data || [];

      // Calculate streak based on consecutive days with workouts
      const calculateStreak = () => {
        if (workouts.length === 0) return 0;
        
        const sortedDates = workouts
          .map(w => new Date(w.session_date).toDateString())
          .filter((date, index, arr) => arr.indexOf(date) === index)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedDates.length; i++) {
          const workoutDate = new Date(sortedDates[i]);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (workoutDate.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }
        
        return streak;
      };

      // Calculate averages from recovery data
      const avgSleep = recoveryData.length > 0 
        ? recoveryData.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recoveryData.length 
        : 0;
      const avgStress = recoveryData.length > 0 
        ? recoveryData.reduce((sum, r) => sum + (r.stress_level || 0), 0) / recoveryData.length 
        : 0;
      const avgEnergy = recoveryData.length > 0 
        ? recoveryData.reduce((sum, r) => sum + (r.energy_level || 0), 0) / recoveryData.length 
        : 0;

      // Calculate weekly progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyWorkouts = workouts.filter(w => new Date(w.session_date) > weekAgo).length;
      const weeklyProgress = Math.min((weeklyWorkouts / 5) * 100, 100);

      setStats({
        totalWorkouts: workouts.length,
        totalFoodEntries: foodEntries.length,
        weeklyProgress,
        currentStreak: calculateStreak(),
        avgSleepHours: Math.round(avgSleep * 10) / 10,
        avgStressLevel: Math.round(avgStress * 10) / 10,
        avgRecoveryScore: Math.round(avgEnergy * 10) / 10
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setLoadError('Failed to load some stats. Pull to refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = useMemo(() => [
    {
      title: 'Physique AI',
      description: 'AI-powered body analysis',
      icon: Brain,
      path: '/physique-ai',
      color: 'from-purple-500/20 to-blue-500/20 border-purple-500/30'
    },
    {
      title: 'Log Workout',
      description: 'Track your training',
      icon: Dumbbell,
      path: '/workout-logger',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    },
    {
      title: 'Food Log',
      description: 'Track nutrition',
      icon: Utensils,
      path: '/smart-food-log',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    },
    {
      title: 'Exercises',
      description: 'Browse exercise library',
      icon: Dumbbell,
      path: '/exercise-database',
      color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30'
    }
  ], []);

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold text-foreground">
              {value || (isLoading ? <Skeleton className="h-6 w-12" /> : '0')}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ title, description, icon: Icon }: { 
    title: string; 
    description: string;
    icon: React.ElementType;
  }) => (
    <div className="p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Progress Hub" />
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {/* Loading indicator with message */}
          <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <TrendingUp className="w-4 h-4" />
            </motion.div>
            <span className="text-sm">Loading your progress...</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(i => (
              <Skeleton 
                key={i} 
                className="h-24 rounded-xl" 
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl" style={{ animationDelay: '400ms' }} />
          <Skeleton className="h-32 rounded-xl" style={{ animationDelay: '550ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Progress Hub" />
      
      <motion.div 
        className="px-4 pb-24 space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Error banner - shows but doesn't block content */}
          {loadError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-center justify-between"
            >
              <span>{loadError}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => { setLoadError(null); loadDashboardStats(); }}
                className="text-destructive hover:text-destructive"
              >
                Retry
              </Button>
            </motion.div>
          )}
          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-2 gap-3"
          >
            <StatCard
              title="Workouts"
              value={stats.totalWorkouts}
              subtitle="Total logged"
              icon={Dumbbell}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Streak"
              value={`${stats.currentStreak} days`}
              icon={Zap}
              color="bg-orange-500/10 text-orange-500"
            />
            <StatCard
              title="Meals"
              value={stats.totalFoodEntries}
              subtitle="Logged"
              icon={Utensils}
              color="bg-green-500/10 text-green-500"
            />
            <StatCard
              title="Week Progress"
              value={`${Math.round(stats.weeklyProgress)}%`}
              icon={TrendingUp}
              color="bg-purple-500/10 text-purple-500"
            />
          </motion.div>

          {/* Tabs for different sections */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl p-1 h-11">
                <TabsTrigger value="overview" className="rounded-lg text-xs data-[state=active]:bg-background">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="physique" className="rounded-lg text-xs data-[state=active]:bg-background">
                  Body
                </TabsTrigger>
                <TabsTrigger value="mental" className="rounded-lg text-xs data-[state=active]:bg-background">
                  Recovery
                </TabsTrigger>
                <TabsTrigger value="science" className="rounded-lg text-xs data-[state=active]:bg-background">
                  Research
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Weekly Progress */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Weekly Goal Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Workouts this week</span>
                        <span className="font-medium">{Math.round(stats.weeklyProgress)}%</span>
                      </div>
                      <Progress value={stats.weeklyProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {stats.weeklyProgress >= 100 
                          ? "Goal reached! Keep it up!" 
                          : `${Math.round((100 - stats.weeklyProgress) / 20)} more workouts to reach your weekly goal`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={action.title}
                          onClick={() => navigateToModule(action.path)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all active:scale-95",
                            "bg-gradient-to-br",
                            action.color
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <action.icon className="w-5 h-5 mb-2" />
                          <p className="font-medium text-sm text-foreground">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="physique" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Physique Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <EmptyState
                      title="No physique data yet"
                      description="Take a photo to get AI-powered body composition analysis"
                      icon={Camera}
                    />
                    <Button
                      onClick={() => navigateToModule('/physique-ai')}
                      className="w-full mt-4"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Analyze Physique
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mental" className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Avg Sleep</p>
                          <p className="text-xl font-bold text-foreground">
                            {stats.avgSleepHours > 0 ? `${stats.avgSleepHours}h` : 'No data'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Avg Stress Level</p>
                          <p className="text-xl font-bold text-foreground">
                            {stats.avgStressLevel > 0 ? `${stats.avgStressLevel}/10` : 'No data'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Avg Energy Level</p>
                          <p className="text-xl font-bold text-foreground">
                            {stats.avgRecoveryScore > 0 ? `${stats.avgRecoveryScore}/10` : 'No data'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {stats.avgSleepHours === 0 && stats.avgStressLevel === 0 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => navigateToModule('/recovery-coach')}
                      variant="outline"
                      className="w-full"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Log Recovery Data
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="science" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Training Science
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore evidence-based training principles and the latest research in exercise science.
                    </p>
                    <Button
                      onClick={() => navigateToModule('/research')}
                      variant="outline"
                      className="w-full"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      View Research Library
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressHubDashboard;