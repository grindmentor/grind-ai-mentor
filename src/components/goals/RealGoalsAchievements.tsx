import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, Calendar, Plus, TrendingUp, Weight, Flame, Activity, Edit, Trash2, Repeat, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import GoalProgressLogger from './GoalProgressLogger';

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
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { state, actions } = useGlobalState();
  const { on, off, emit, getCache, setCache, invalidateCache } = useAppSync();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Handle tab change with transition
  const handleTabChange = (newTab: 'goals' | 'achievements') => {
    if (newTab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 150);
  };

  // Sync with global loading state
  const loading = state.loading.goals || state.loading.achievements;

  useEffect(() => {
    if (user && !initialLoadComplete) {
      loadGoalsAndAchievements();
    }
  }, [user, initialLoadComplete]);

  // Listen for real-time updates and data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      if (user) {
        loadGoalsAndAchievements();
      }
    };

    on('goals:refresh', handleDataRefresh);
    on('achievements:refresh', handleDataRefresh);
    on('realtime:user-goals', handleDataRefresh);
    on('realtime:user-achievements', handleDataRefresh);

    return () => {
      off('goals:refresh', handleDataRefresh);
      off('achievements:refresh', handleDataRefresh);
      off('realtime:user-goals', handleDataRefresh);
      off('realtime:user-achievements', handleDataRefresh);
    };
  }, [user, on, off]);

  const loadGoalsAndAchievements = async () => {
    if (!user) return;

    // Check cache first
    const cacheKey = `user-${user.id}-goals-achievements`;
    const cached = getCache(cacheKey);
    if (cached && !state.dataStale.goals && !state.dataStale.achievements) {
      setGoals(cached.goals || []);
      setAchievements(cached.achievements || []);
      setInitialLoadComplete(true);
      return;
    }

    try {
      // Set loading state
      actions.setLoading('goals', true);
      actions.setLoading('achievements', true);
      
      // Load goals with better error handling
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
        actions.setError('goals', 'Failed to load goals');
        setGoals([]);
      } else {
        setGoals(goalsData || []);
        actions.setError('goals', null);
      }

      // Load achievements with better error handling
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        actions.setError('achievements', 'Failed to load achievements');
        setAchievements([]);
      } else {
        setAchievements(achievementsData || []);
        actions.setError('achievements', null);
      }

      // Cache the results
      setCache(cacheKey, {
        goals: goalsData || [],
        achievements: achievementsData || []
      });

      // Mark data as fresh
      actions.setDataStale('goals', false);
      actions.setDataStale('achievements', false);
      
    } catch (error) {
      console.error('Unexpected error loading goals and achievements:', error);
      actions.setError('global', 'Failed to load data');
      setGoals([]);
      setAchievements([]);
    } finally {
      actions.setLoading('goals', false);
      actions.setLoading('achievements', false);
      setInitialLoadComplete(true);
    }
  };

  // Check for goal updates when returning from create-goal page
  useEffect(() => {
    const handleGoalUpdate = () => {
      if (user) {
        invalidateCache(`user-${user?.id}-goals-achievements`);
        loadGoalsAndAchievements();
      }
    };

    // Listen for when user returns to this page
    window.addEventListener('focus', handleGoalUpdate);
    return () => window.removeEventListener('focus', handleGoalUpdate);
  }, [user]);

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    // Optimistic update - remove immediately from UI
    const previousGoals = [...goals];
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setDeletingGoalId(goalId);

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      invalidateCache(`user-${user?.id}-goals-achievements`);
      emit('goals:updated');
      toast.success('Goal deleted successfully');
    } catch (error) {
      // Rollback on error
      setGoals(previousGoals);
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      actions.setError('goals', 'Failed to delete goal');
    } finally {
      setDeletingGoalId(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    navigate(`/create-goal?edit=${goal.id}`);
  };

  const getProgressPercentage = (current: number, target: number, goalTitle: string) => {
    // Check if this is a "downward" goal (lower is better)
    const lowerIsBetter = goalTitle.toLowerCase().includes('run') && goalTitle.toLowerCase().includes('minute') ||
                         goalTitle.toLowerCase().includes('time') ||
                         goalTitle.toLowerCase().includes('body fat') ||
                         goalTitle.toLowerCase().includes('weight') && goalTitle.toLowerCase().includes('lose');
    
    if (lowerIsBetter) {
      // For downward goals, if current is at or below target, it's 100%
      if (current <= target) return 100;
      // Otherwise calculate how close we are (inverted)
      return Math.max(0, (1 - (current - target) / target) * 100);
    } else {
      // Normal upward progress
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
    // If the goal is weight-related and has "pounds" in description, replace with user's unit
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

  if (loading && !initialLoadComplete) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-lg" />
              <div className="h-6 w-40 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
            </div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-8 w-28 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Button skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
            <div className="h-9 w-28 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-lg" />
          </div>
          {/* Goal items skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30 space-y-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                    <div className="h-3 w-48 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                  <div className="h-4 w-12 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show goal progress logger if a goal is selected
  if (selectedGoal) {
    return (
      <GoalProgressLogger
        goal={selectedGoal}
        onBack={() => setSelectedGoal(null)}
        onGoalUpdated={loadGoalsAndAchievements}
      />
    );
  }

  return (
    <>
      <Card className="bg-card border-border"
            style={{ transition: 'all 0.3s ease' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-400" />
              Goals & Achievements
            </CardTitle>
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              <Button
                variant={activeTab === 'goals' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('goals')}
                className={`mobile-tab-button flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transition-all duration-200 ${
                  activeTab === 'goals' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'
                }`}
              >
                Goals ({goals.length})
              </Button>
              <Button
                variant={activeTab === 'achievements' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('achievements')}
                className={`mobile-tab-button flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transition-all duration-200 ${
                  activeTab === 'achievements' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'
                }`}
              >
                Achievements ({achievements.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isTabTransitioning ? (
            <div className="space-y-4 animate-fade-in">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                        <div className="h-3 w-48 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
          {activeTab === 'goals' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 animate-fade-in">
                <h3 className="text-white font-medium">Active Goals</h3>
                <Button
                  onClick={() => navigate('/create-goal')}
                  size="sm"
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 mobile-button-enhanced"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No goals set yet</p>
                  <Button
                    onClick={() => navigate('/create-goal')}
                    className="bg-orange-500 hover:bg-orange-600 mobile-button-enhanced"
                  >
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const IconComponent = getCategoryIcon(goal.category);
                    const GoalTypeIcon = getGoalTypeIcon(goal.goal_type);
                    const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value, goal.title);
                    
                     return (
                      <div 
                        key={goal.id} 
                        className="p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/70 hover:border-orange-500/30"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getCategoryColor(goal.category).split(' ')[0]}`}>
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium text-sm sm:text-base truncate">{goal.title}</h4>
                                <GoalTypeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              </div>
                              <p className="text-gray-400 text-xs sm:text-sm truncate">{formatGoalDescription(goal)}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {getFrequencyText(goal.frequency)}
                                </span>
                                {goal.goal_type === 'habit' && (
                                  <span className="text-xs text-blue-400">
                                    • Habit Goal
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Badge className={`${getCategoryColor(goal.category)} text-xs`}>
                              {goal.category}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGoal(goal);
                              }}
                              className="text-gray-400 hover:text-white p-1 w-8 h-8"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(goal.id);
                              }}
                              className="text-gray-400 hover:text-red-400 p-1 w-8 h-8"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 text-xs sm:text-sm">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </span>
                            <span className="text-orange-400 text-xs sm:text-sm">
                              {progressPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className={`text-xs ${
                            goal.status === 'completed' ? 'text-green-400 border-green-500/50' :
                            goal.status === 'paused' ? 'text-yellow-400 border-yellow-500/50' :
                            'text-blue-400 border-blue-500/50'
                          }`}>
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="animate-fade-in">
              <h3 className="text-white font-medium">Recent Achievements</h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No achievements unlocked yet</p>
                  <p className="text-gray-500 text-sm">Complete goals and track workouts to earn achievements!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{achievement.title}</h4>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          <p className="text-yellow-400/60 text-xs mt-1">
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RealGoalsAchievements;
