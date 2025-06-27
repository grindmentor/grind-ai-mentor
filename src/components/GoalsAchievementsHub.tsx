
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, CheckCircle, TrendingUp, Award, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GoalCreationDialog from './GoalCreationDialog';

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

const GoalsAchievementsHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const achievements = [
    {
      id: 1,
      title: "7-Day Streak Champion",
      description: "Completed workouts for 7 consecutive days",
      category: "Consistency",
      points: 100,
      time: "2 hours ago",
      color: "bg-gradient-to-r from-yellow-500/20 to-orange-500/30 border-yellow-500/40"
    },
    {
      id: 2,
      title: "Protein Master",
      description: "Hit your protein target 5 days in a row",
      category: "Nutrition",
      points: 75,
      time: "1 day ago",
      color: "bg-gradient-to-r from-green-500/20 to-emerald-500/30 border-green-500/40"
    },
    {
      id: 3,
      title: "Strength Milestone",
      description: "Deadlifted 2x your bodyweight for the first time",
      category: "Strength",
      points: 200,
      time: "3 days ago",
      color: "bg-gradient-to-r from-red-500/20 to-pink-500/30 border-red-500/40"
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
              <span>Goals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Your Goals</h3>
              <GoalCreationDialog onGoalCreated={loadGoals} />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-200 mb-2">No Goals Yet</h3>
                <p className="text-blue-300/70 mb-4">Create your first fitness goal to start tracking your progress</p>
                <GoalCreationDialog onGoalCreated={loadGoals} />
              </div>
            ) : (
              goals.map((goal) => (
                <div 
                  key={goal.id} 
                  className={`p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm ${goal.is_completed ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold text-sm ${goal.is_completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {goal.title}
                        </h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                        {goal.is_completed && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
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
                  
                  {goal.target_value && !goal.is_completed && (
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
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border backdrop-blur-sm ${achievement.color}`}
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoalsAchievementsHub;
