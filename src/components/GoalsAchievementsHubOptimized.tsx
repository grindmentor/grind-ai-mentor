
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, CheckCircle, TrendingUp, Award, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserGoal {
  id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  category: string;
  priority: string;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Cached data store
let cachedGoals: UserGoal[] = [];
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 seconds

const GoalsAchievementsHubOptimized = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<UserGoal[]>(cachedGoals);
  const [loading, setLoading] = useState(false);

  // Optimized goals loading with caching
  const loadGoals = useMemo(() => async (forceRefresh = false) => {
    if (!user) return;

    const now = Date.now();
    if (!forceRefresh && cachedGoals.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      setGoals(cachedGoals);
      return;
    }

    if (loading) return; // Prevent duplicate requests
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      cachedGoals = data || [];
      lastFetch = now;
      setGoals(cachedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  // Preload on mount with instant display
  useEffect(() => {
    if (user) {
      // Show cached data immediately
      if (cachedGoals.length > 0) {
        setGoals(cachedGoals);
      }
      // Then refresh in background
      loadGoals(false);
    }
  }, [user, loadGoals]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Recovery': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Cardio': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const calculateProgress = (goal: UserGoal) => {
    if (!goal.target_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const toggleGoalCompletion = async (goalId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ is_completed: !currentStatus })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update cache immediately
      cachedGoals = cachedGoals.map(goal => 
        goal.id === goalId ? { ...goal, is_completed: !currentStatus } : goal
      );
      setGoals([...cachedGoals]);

      toast({
        title: currentStatus ? 'Goal Reopened' : 'Goal Completed',
        description: currentStatus ? 'Your goal has been reopened.' : 'Congratulations on completing your goal!'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Only show real achievements (no placeholders)
  const userAchievements = goals.filter(goal => goal.is_completed);

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Goals & Achievements Hub</CardTitle>
              <CardDescription className="text-blue-200/80">
                Track your fitness progress and celebrate milestones
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => navigate('/goals-manager')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-blue-900/30 backdrop-blur-sm">
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Goals ({goals.filter(g => !g.is_completed).length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements ({userAchievements.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {goals.filter(g => !g.is_completed).length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-200 mb-2">No Active Goals</h3>
                <p className="text-blue-300/70 mb-4">Create your first fitness goal to start tracking progress</p>
                <Button
                  onClick={() => navigate('/goals-manager')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            ) : (
              goals.filter(g => !g.is_completed).slice(0, 3).map((goal) => (
                <div 
                  key={goal.id} 
                  className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-white">{goal.title}</h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-gray-400 text-xs mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs">
                        {goal.target_value && (
                          <span className="text-gray-300">
                            Progress: {goal.current_value}/{goal.target_value} {goal.unit}
                          </span>
                        )}
                        <span className={getPriorityColor(goal.priority)}>
                          {goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString()}` : `Priority: ${goal.priority}`}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{Math.round(calculateProgress(goal))}% Complete</span>
                        <span className="text-blue-400">{Math.round(calculateProgress(goal))}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(goal)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {goals.filter(g => !g.is_completed).length > 3 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/goals-manager')}
                  className="border-blue-500/40 text-blue-300 hover:bg-blue-500/20"
                >
                  View All Goals ({goals.filter(g => !g.is_completed).length})
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {userAchievements.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-yellow-200 mb-2">No Achievements Yet</h3>
                <p className="text-yellow-300/70 mb-4">Complete your goals to unlock achievements</p>
              </div>
            ) : (
              userAchievements.slice(0, 3).map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/30 border-yellow-500/40"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/40 rounded-lg flex items-center justify-center border border-yellow-500/30">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                        <Badge className={getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                      <p className="text-gray-500 text-xs">Completed {new Date(achievement.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {userAchievements.length > 3 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/goals-manager')}
                  className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20"
                >
                  View All Achievements ({userAchievements.length})
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoalsAchievementsHubOptimized;
