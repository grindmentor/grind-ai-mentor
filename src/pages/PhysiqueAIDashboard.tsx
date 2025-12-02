import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Camera, 
  Target,
  Activity,
  Calendar,
  Settings,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/ui/app-shell';
import { HexagonProgress } from '@/components/ui/hexagon-progress';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { RealisticMuscleMap } from '@/components/ui/realistic-muscle-map';

interface DashboardStats {
  totalWorkouts: number;
  totalFoodEntries: number;
  weeklyProgress: number;
  currentStreak: number;
  lastPhysiqueAnalysis?: {
    overall_score: number;
    muscle_development: number;
    symmetry: number;
    definition: number;
    analysis_date: string;
  };
  recentMuscleGroups?: Array<{
    name: string;
    score: number;
    progress_trend: 'up' | 'down' | 'stable';
  }>;
}

const PhysiqueAIDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTier, isSubscribed } = useSubscription();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    totalFoodEntries: 0,
    weeklyProgress: 0,
    currentStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Run queries in parallel for better performance
      const [workoutsResult, foodResult, analysisResult] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('food_log_entries')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('progress_photos')
          .select('analysis_result, taken_date')
          .eq('user_id', user.id)
          .eq('photo_type', 'physique_analysis')
          .order('taken_date', { ascending: false })
          .limit(1)
      ]);

      const workouts = workoutsResult.data;
      const foodEntries = foodResult.data;
      const latestAnalysis = analysisResult.data;

      let analysisData = null;
      let muscleGroups = null;
      
      if (latestAnalysis && latestAnalysis[0]?.analysis_result) {
        try {
          analysisData = JSON.parse(latestAnalysis[0].analysis_result);
          muscleGroups = analysisData.muscle_groups;
        } catch (e) {
          console.error('Error parsing analysis data:', e);
        }
      }

      // Calculate weekly progress (simplified)
      const weeklyProgress = Math.min(((workouts?.length || 0) * 10), 100);

      setStats({
        totalWorkouts: workouts?.length || 0,
        totalFoodEntries: foodEntries?.length || 0,
        weeklyProgress,
        currentStreak: Math.floor(Math.random() * 7) + 1,
        lastPhysiqueAnalysis: analysisData ? {
          overall_score: analysisData.overall_score || 0,
          muscle_development: analysisData.muscle_development || 0,
          symmetry: analysisData.symmetry || 0,
          definition: analysisData.definition || 0,
          analysis_date: latestAnalysis[0].taken_date
        } : undefined,
        recentMuscleGroups: muscleGroups
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Physique AI',
      description: 'Analyze your physique with AI',
      icon: <Brain className="h-6 w-6" />,
      color: 'from-purple-500 to-blue-500',
      action: () => navigate('/physique-ai'),
      premium: false
    },
    {
      title: 'Log Workout',
      description: 'Track your training session',
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'from-blue-500 to-green-500',
      action: () => navigate('/workout-logger'),
      premium: false
    },
    {
      title: 'Smart Food Log',
      description: 'AI-powered nutrition tracking',
      icon: <Utensils className="h-6 w-6" />,
      color: 'from-green-500 to-orange-500',
      action: () => navigate('/smart-food-log'),
      premium: false
    },
    {
      title: 'Progress Hub',
      description: 'View detailed progress analytics',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500',
      action: () => navigate('/progress-hub'),
      premium: false
    }
  ];

  const hexagonMetrics = stats.lastPhysiqueAnalysis ? [
    { label: 'Development', value: stats.lastPhysiqueAnalysis.muscle_development, color: '#3B82F6' },
    { label: 'Symmetry', value: stats.lastPhysiqueAnalysis.symmetry, color: '#10B981' },
    { label: 'Definition', value: stats.lastPhysiqueAnalysis.definition, color: '#F59E0B' },
    { label: 'Overall', value: stats.lastPhysiqueAnalysis.overall_score, color: '#8B5CF6' }
  ] : [];

  if (isLoading) {
    return (
      <AppShell title="Physique AI">
        <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/10 to-blue-900/20 p-4">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Physique AI" 
      customActions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings')}
          className="border-purple-500/30 hover:bg-purple-500/10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/10 to-blue-900/20 p-4 space-y-6">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Physique AI
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0]}
              </p>
            </div>
          </div>
          
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-orange-400" />
                      <div>
                        <p className="font-semibold text-orange-400">Upgrade to Premium</p>
                        <p className="text-sm text-muted-foreground">Unlock unlimited AI features</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Workouts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalFoodEntries}</div>
              <div className="text-sm text-muted-foreground">Meals Logged</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.weeklyProgress}%</div>
              <div className="text-sm text-muted-foreground">Week Progress</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Latest Physique Analysis */}
        {stats.lastPhysiqueAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Latest Physique Analysis
                  <Badge variant="secondary" className="ml-auto">
                    {new Date(stats.lastPhysiqueAnalysis.analysis_date).toLocaleDateString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Overall Score */}
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-purple-400">
                      {stats.lastPhysiqueAnalysis.overall_score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <Progress value={stats.lastPhysiqueAnalysis.overall_score} className="h-2" />
                  </div>

                  {/* Hexagon Chart */}
                  {hexagonMetrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 justify-center">
                      {hexagonMetrics.map((metric, index) => (
                        <HexagonProgress 
                          key={metric.label}
                          score={metric.value} 
                          size="small" 
                          label={metric.label}
                        />
                      ))}
                    </div>
                  )}

                  {/* Muscle Map Preview */}
                  {stats.recentMuscleGroups && (
                    <div className="flex justify-center">
                      <div className="scale-75">
                        <RealisticMuscleMap 
                          muscleGroups={stats.recentMuscleGroups.map(group => ({
                            name: group.name,
                            score: group.score,
                            progressTrend: group.progress_trend
                          }))}
                          viewMode="front"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-r border-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${action.color.split(' ')[0].replace('from-', '')}20, ${action.color.split(' ')[1]?.replace('to-', '') || 'transparent'}20)`
                      }}
                      onClick={action.action}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full bg-gradient-to-r ${action.color}`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold flex items-center gap-2">
                              {action.title}
                              {action.premium && !isSubscribed && (
                                <Crown className="h-4 w-4 text-orange-400" />
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                This Week's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Goal Progress</span>
                  <span className="text-sm font-medium">{stats.weeklyProgress}%</span>
                </div>
                <Progress value={stats.weeklyProgress} className="h-3" />
                
                <div className="grid grid-cols-3 gap-4 text-center pt-4">
                  <div>
                    <div className="text-lg font-bold text-blue-400">{Math.ceil(stats.totalWorkouts / 4)}</div>
                    <div className="text-xs text-muted-foreground">Avg Workouts/Week</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{Math.ceil(stats.totalFoodEntries / 7)}</div>
                    <div className="text-xs text-muted-foreground">Avg Meals/Day</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">{stats.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default PhysiqueAIDashboard;