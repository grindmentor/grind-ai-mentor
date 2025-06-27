
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trophy, Target, CheckCircle, Trash2, Bell, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GoalCreationDialog from '@/components/GoalCreationDialog';

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

const GoalsManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Preset goals for new users
  const presetGoals = [
    {
      title: "Complete First Workout",
      description: "Start your fitness journey with your first workout session",
      category: "Training",
      priority: "high",
      icon: "🏋️‍♂️"
    },
    {
      title: "Log 7 Days of Meals",
      description: "Track your nutrition for one full week",
      category: "Nutrition", 
      priority: "medium",
      icon: "🥗"
    },
    {
      title: "Hit Daily Step Goal",
      description: "Walk 8,000 steps in a single day",
      category: "Cardio",
      priority: "medium",
      icon: "🚶‍♂️"
    },
    {
      title: "Complete Weekly Workout Plan",
      description: "Finish all scheduled workouts for the week",
      category: "Consistency",
      priority: "high",
      icon: "📅"
    }
  ];

  const sampleAchievements = [
    {
      id: 1,
      title: "Early Bird",
      description: "Completed morning workout before 8 AM",
      category: "Training",
      points: 50,
      time: "2 hours ago",
      icon: "🌅"
    },
    {
      id: 2,
      title: "Hydration Hero",
      description: "Drank 8 glasses of water in one day",
      category: "Recovery",
      points: 25,
      time: "1 day ago", 
      icon: "💧"
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Completed workouts 3 days in a row",
      category: "Consistency",
      points: 100,
      time: "3 days ago",
      icon: "🔥"
    }
  ];

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addPresetGoal = async (presetGoal: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .insert([{
          user_id: user.id,
          title: presetGoal.title,
          description: presetGoal.description,
          category: presetGoal.category,
          priority: presetGoal.priority,
          current_value: 0,
          is_completed: false
        }]);

      if (error) throw error;

      toast({
        title: 'Goal Added',
        description: `${presetGoal.title} has been added to your goals.`
      });

      loadGoals();
    } catch (error) {
      console.error('Error adding preset goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add goal. Please try again.',
        variant: 'destructive'
      });
    }
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

      toast({
        title: currentStatus ? 'Goal Reopened' : 'Goal Completed',
        description: currentStatus ? 'Your goal has been reopened.' : 'Congratulations on completing your goal!'
      });

      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Goal Deleted',
        description: 'Your goal has been deleted successfully.'
      });

      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive'
      });
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white">
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <button
                onClick={() => navigate('/app')}
                className="text-white hover:text-blue-400 transition-colors font-medium flex items-center space-x-2 p-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Dashboard</span>
              </button>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h1 className="text-base sm:text-lg font-semibold text-center">
                  Goals & Achievements
                </h1>
              </div>
              <div className="w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-blue-900/20 backdrop-blur-sm h-12">
              <TabsTrigger 
                value="goals" 
                className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2 text-sm"
              >
                <Target className="w-4 h-4" />
                <span>Goals ({goals.filter(g => !g.is_completed).length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2 text-sm"
              >
                <Trophy className="w-4 h-4" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-6">
              {/* Preset Goals Section */}
              {goals.length === 0 && !loading && (
                <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      Quick Start Goals
                    </CardTitle>
                    <CardDescription className="text-blue-200/80">
                      Get started with these recommended fitness goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {presetGoals.map((preset, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-900/40 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{preset.icon}</span>
                          <div>
                            <h3 className="text-white font-medium text-sm">{preset.title}</h3>
                            <p className="text-gray-400 text-xs">{preset.description}</p>
                            <Badge className={getCategoryColor(preset.category)} size="sm">
                              {preset.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => addPresetGoal(preset)}
                          size="sm"
                          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Custom Goals Section */}
              <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Your Goals</CardTitle>
                    <GoalCreationDialog onGoalCreated={loadGoals} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  ) : goals.filter(g => !g.is_completed).length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-blue-200 mb-2">No Active Goals</h3>
                      <p className="text-blue-300/70 mb-4">Create your first custom goal or add one from Quick Start above</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {goals.filter(g => !g.is_completed).map((goal) => (
                        <div 
                          key={goal.id} 
                          className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-sm text-white">{goal.title}</h3>
                                <Badge className={getCategoryColor(goal.category)} size="sm">
                                  {goal.category}
                                </Badge>
                              </div>
                              {goal.description && (
                                <p className="text-gray-400 text-xs mb-2">{goal.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteGoal(goal.id)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {goal.target_value && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">
                                  Progress: {goal.current_value}/{goal.target_value} {goal.unit}
                                </span>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/30 backdrop-blur-sm border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription className="text-yellow-200/80">
                    Celebrate your fitness milestones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Completed Goals as Achievements */}
                  {goals.filter(g => g.is_completed).map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r from-green-500/20 to-emerald-500/30 border-green-500/40"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-lg flex items-center justify-center border border-green-500/30">
                          <Trophy className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                            <Badge className={getCategoryColor(achievement.category)} size="sm">
                              {achievement.category}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                          <p className="text-gray-500 text-xs">Completed {new Date(achievement.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Sample Achievements */}
                  {sampleAchievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/30 border-yellow-500/40"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/40 rounded-lg flex items-center justify-center border border-yellow-500/30">
                          <span className="text-lg">{achievement.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                            <Badge className={getCategoryColor(achievement.category)} size="sm">
                              {achievement.category}
                            </Badge>
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                          <p className="text-gray-500 text-xs">{achievement.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {goals.filter(g => g.is_completed).length === 0 && (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-yellow-200 mb-2">No Achievements Yet</h3>
                      <p className="text-yellow-300/70">Complete your goals to unlock achievements!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default GoalsManager;
