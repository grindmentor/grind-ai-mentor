import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, Calendar, Plus, TrendingUp, Weight, Flame, Activity, Edit, Trash2, Repeat, Clock, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import GoalProgressLogger from './GoalProgressLogger';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';
import { SwipeToDelete } from '@/components/ui/swipe-to-delete';
import { LongPressMenu, createEditAction, createDeleteAction, createShareAction } from '@/components/ui/long-press-menu';
import { DragToReorder, DragHandle } from '@/components/ui/drag-to-reorder';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
  goal_type: 'target' | 'habit';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  tracking_unit: string;
  created_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  unlocked_at: string;
  icon_name: string;
}

const RealGoalsAchievements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { state, actions } = useGlobalState();
  const { on, off, emit, getCache, setCache, invalidateCache } = useAppSync();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  
  // Track if we've already handled the refreshGoals flag to prevent loops
  const refreshHandledRef = useRef(false);

  // Calculate REAL streak from workout data
  const realStreak = useMemo(() => {
    if (!workoutSessions.length) return 0;
    
    // Sort sessions by date descending
    const sortedSessions = [...workoutSessions].sort((a, b) => 
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const msPerDay = 24 * 60 * 60 * 1000;
    let currentDate = today;
    
    // Check consecutive days with workouts (allowing 1 day gap for rest days)
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasWorkout = sortedSessions.some(s => s.session_date === dateStr);
      
      if (hasWorkout) {
        streak++;
      } else if (i === 0) {
        // Check if there's a workout yesterday (allow 1 day rest)
        const yesterday = new Date(currentDate.getTime() - msPerDay);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (!sortedSessions.some(s => s.session_date === yesterdayStr)) {
          break; // No recent workout, streak is 0
        }
      } else {
        // Allow 1 rest day
        const nextDate = new Date(currentDate.getTime() - msPerDay);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        if (!sortedSessions.some(s => s.session_date === nextDateStr)) {
          break;
        }
      }
      
      currentDate = new Date(currentDate.getTime() - msPerDay);
    }
    
    return streak;
  }, [workoutSessions]);

  // Handle tab change with transition
  const handleTabChange = (newTab: 'goals' | 'achievements') => {
    if (newTab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 150);
  };

  const loading = state.loading.goals || state.loading.achievements;

  const loadWorkoutSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, session_date')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(365);
      
      if (!error && data) {
        setWorkoutSessions(data);
      }
    } catch (error) {
      console.error('Error loading workout sessions:', error);
    }
  };

  const loadGoalsAndAchievements = useCallback(async (bypassCache: boolean = false) => {
    if (!user) return;

    const cacheKey = `user-${user.id}-goals-achievements`;
    
    // Only use cache if NOT bypassing and data is not stale
    if (!bypassCache) {
      const cached = getCache(cacheKey);
      if (cached && !state.dataStale.goals && !state.dataStale.achievements) {
        setGoals(cached.goals || []);
        setAchievements(cached.achievements || []);
        setInitialLoadComplete(true);
        return;
      }
    }

    let fetchSuccess = false;
    try {
      actions.setLoading('goals', true);
      actions.setLoading('achievements', true);
      
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
        setGoals([]);
      } else {
        setGoals(goalsData || []);
      }

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        setAchievements([]);
      } else {
        setAchievements(achievementsData || []);
      }

      // Only update cache and clear stale flags on successful fetch
      if (!goalsError && !achievementsError) {
        fetchSuccess = true;
        setCache(cacheKey, {
          goals: goalsData || [],
          achievements: achievementsData || []
        });
      }
      
    } catch (error) {
      console.error('Error:', error);
      setGoals([]);
      setAchievements([]);
    } finally {
      actions.setLoading('goals', false);
      actions.setLoading('achievements', false);
      setInitialLoadComplete(true);
      // Clear stale flags only after successful fresh fetch
      if (fetchSuccess) {
        actions.setDataStale('goals', false);
        actions.setDataStale('achievements', false);
      }
    }
  }, [user, getCache, setCache, state.dataStale.goals, state.dataStale.achievements, actions]);

  // Initial load effect
  useEffect(() => {
    if (user && !initialLoadComplete) {
      loadGoalsAndAchievements(false);
      loadWorkoutSessions();
    }
  }, [user, initialLoadComplete, loadGoalsAndAchievements]);

  // Handle refreshGoals flag from navigation state (e.g., after creating a goal)
  // This guarantees a fresh fetch bypassing the cache
  const currentState = (location.state ?? {}) as Record<string, unknown>;
  const refreshGoals = !!currentState.refreshGoals;
  useEffect(() => {
    if (refreshGoals && user && !refreshHandledRef.current) {
      refreshHandledRef.current = true;
      // Clear ONLY the refreshGoals key, preserve other state keys (e.g., returnTo)
      const currentState = (location.state ?? {}) as Record<string, unknown>;
      const { refreshGoals: _ignored, ...preservedState } = currentState;
      if (Object.keys(preservedState).length === 0) {
        navigate(location.pathname, { replace: true });
      } else {
        navigate(location.pathname, { replace: true, state: preservedState });
      }
      // Force a fresh fetch bypassing cache
      loadGoalsAndAchievements(true);
    }
  }, [refreshGoals, user, navigate, location.pathname, loadGoalsAndAchievements]);

  // Re-fetch when data becomes stale (e.g., after goal creation/update/delete)
  useEffect(() => {
    if (user && initialLoadComplete && (state.dataStale.goals || state.dataStale.achievements)) {
      loadGoalsAndAchievements(true);
    }
  }, [user, initialLoadComplete, state.dataStale.goals, state.dataStale.achievements, loadGoalsAndAchievements]);

  // Listen for real-time updates
  useEffect(() => {
    const handleDataRefresh = () => {
      if (user) {
        loadGoalsAndAchievements(true);
        loadWorkoutSessions();
      }
    };

    on('goals:refresh', handleDataRefresh);
    on('achievements:refresh', handleDataRefresh);
    on('realtime:user-goals', handleDataRefresh);
    on('realtime:user-achievements', handleDataRefresh);
    on('workout:completed', handleDataRefresh);

    return () => {
      off('goals:refresh', handleDataRefresh);
      off('achievements:refresh', handleDataRefresh);
      off('realtime:user-goals', handleDataRefresh);
      off('realtime:user-achievements', handleDataRefresh);
      off('workout:completed', handleDataRefresh);
    };
  }, [user, on, off, loadGoalsAndAchievements]);

  useEffect(() => {
    const handleGoalUpdate = () => {
      if (user) {
        invalidateCache(`user-${user?.id}-goals-achievements`);
        loadGoalsAndAchievements(true);
      }
    };
    window.addEventListener('focus', handleGoalUpdate);
    return () => window.removeEventListener('focus', handleGoalUpdate);
  }, [user, invalidateCache, loadGoalsAndAchievements]);

  const handleDeleteGoal = async (goalId: string) => {
    const goalToDelete = goals.find(g => g.id === goalId);
    if (!goalToDelete) return;

    triggerHapticFeedback('medium');
    const previousGoals = [...goals];
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setDeletingGoalId(goalId);

    toast.success('Goal deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          triggerHapticFeedback('light');
          setGoals(previousGoals);
          try {
            const { error } = await supabase
              .from('user_goals')
              .insert([{
                user_id: user?.id,
                title: goalToDelete.title,
                description: goalToDelete.description,
                target_value: goalToDelete.target_value,
                current_value: goalToDelete.current_value,
                unit: goalToDelete.unit,
                category: goalToDelete.category,
                deadline: goalToDelete.deadline,
                status: goalToDelete.status,
                goal_type: goalToDelete.goal_type,
                frequency: goalToDelete.frequency,
                tracking_unit: goalToDelete.tracking_unit,
              }]);
            if (error) throw error;
            invalidateCache(`user-${user?.id}-goals-achievements`);
            loadGoalsAndAchievements(true);
            toast.success('Goal restored');
          } catch (error) {
            console.error('Failed to restore goal:', error);
            setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
            toast.error('Failed to restore goal');
          }
        }
      },
      duration: 5000,
    });

    try {
      const { error } = await supabase.from('user_goals').delete().eq('id', goalId);
      if (error) throw error;
      triggerHapticFeedback('success');
      invalidateCache(`user-${user?.id}-goals-achievements`);
      emit('goals:updated');
    } catch (error) {
      setGoals(previousGoals);
      triggerHapticFeedback('error');
      toast.error('Failed to delete goal');
    } finally {
      setDeletingGoalId(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    navigate(`/create-goal?edit=${goal.id}`);
  };

  const getProgressPercentage = (current: number, target: number, goalTitle: string) => {
    const lowerIsBetter = goalTitle.toLowerCase().includes('run') && goalTitle.toLowerCase().includes('minute') ||
                         goalTitle.toLowerCase().includes('time') ||
                         goalTitle.toLowerCase().includes('body fat') ||
                         goalTitle.toLowerCase().includes('weight') && goalTitle.toLowerCase().includes('lose');
    
    if (lowerIsBetter) {
      if (current <= target) return 100;
      return Math.max(0, (1 - (current - target) / target) * 100);
    } else {
      return Math.min((current / target) * 100, 100);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weight': return Weight;
      case 'strength': return TrendingUp;
      case 'cardio': case 'training': return Activity;
      case 'nutrition': return Flame;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weight': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cardio': case 'training': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'nutrition': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'habit': return Repeat;
      case 'target': return Target;
      default: return Target;
    }
  };

  const formatGoalDescription = (goal: Goal) => {
    if (goal.category.toLowerCase() === 'weight' && goal.description.includes('pounds')) {
      const weightUnit = preferences?.weight_unit === 'kg' ? 'kg' : 'lbs';
      return goal.description.replace(/pounds?/gi, weightUnit);
    }
    return goal.description;
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'once': return 'One-time';
      default: return frequency;
    }
  };

  // Loading skeleton
  if (loading && !initialLoadComplete) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 animate-pulse h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (selectedGoal) {
    return (
      <GoalProgressLogger
        goal={selectedGoal}
        onBack={() => setSelectedGoal(null)}
        onGoalUpdated={() => loadGoalsAndAchievements(true)}
      />
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-foreground text-base">Goals & Achievements</CardTitle>
              {realStreak > 0 && (
                <p className="text-xs text-muted-foreground">
                  🔥 {realStreak} day streak
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={activeTab === 'goals' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange('goals')}
              className={cn(
                "text-xs px-3 h-8 rounded-lg transition-all",
                activeTab === 'goals' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              Goals
            </Button>
            <Button
              variant={activeTab === 'achievements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange('achievements')}
              className={cn(
                "text-xs px-3 h-8 rounded-lg transition-all",
                activeTab === 'achievements' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              Trophies
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isTabTransitioning ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'goals' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Active Goals</span>
                  <Button
                    onClick={() => navigate('/create-goal')}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 h-9 rounded-lg text-xs"
                    aria-label="Add new goal"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <div className="empty-state-premium py-8">
                    <div className="empty-state-icon">
                      <Target className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground font-medium mb-1">No goals yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">Set your first fitness goal</p>
                    <Button
                      onClick={() => navigate('/create-goal')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal) => {
                      const IconComponent = getCategoryIcon(goal.category);
                      const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value, goal.title);
                      
                      return (
                        <SwipeToDelete
                          key={goal.id}
                          onDelete={() => handleDeleteGoal(goal.id)}
                          deleteLabel="Delete"
                        >
                          <div 
                            className="p-4 rounded-xl bg-muted/30 border border-border/50 cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/30 native-press"
                            onClick={() => setSelectedGoal(goal)}
                            role="button"
                            aria-label={`View ${goal.title} details`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center",
                                  getCategoryColor(goal.category).split(' ')[0]
                                )}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-foreground font-medium text-sm truncate">{goal.title}</h4>
                                  <p className="text-muted-foreground text-xs truncate">{formatGoalDescription(goal)}</p>
                                </div>
                              </div>
                              <Badge className={cn("text-[10px]", getCategoryColor(goal.category))}>
                                {goal.category}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {goal.current_value} / {goal.target_value} {goal.unit}
                                </span>
                                <span className="text-primary font-medium">
                                  {progressPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={progressPercentage} className="h-1.5" />
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Due: {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                goal.status === 'completed' ? 'text-green-400 border-green-500/50' :
                                goal.status === 'paused' ? 'text-yellow-400 border-yellow-500/50' :
                                'text-blue-400 border-blue-500/50'
                              )}>
                                {goal.status}
                              </Badge>
                            </div>
                          </div>
                        </SwipeToDelete>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'achievements' && (
              <>
                <span className="text-sm font-medium text-foreground">Recent Trophies</span>
                
                {achievements.length === 0 ? (
                  <div className="empty-state-premium py-8">
                    <div className="empty-state-icon">
                      <Trophy className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground font-medium mb-1">No trophies yet</h3>
                    <p className="text-muted-foreground text-sm">Complete goals and workouts to earn achievements!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-foreground font-medium text-sm">{achievement.title}</h4>
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                                +{achievement.points} pts
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs">{achievement.description}</p>
                            <p className="text-amber-400/60 text-[10px] mt-1">
                              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealGoalsAchievements;
