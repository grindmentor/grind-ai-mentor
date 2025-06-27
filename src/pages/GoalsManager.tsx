
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, CheckCircle, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GoalCreationDialog from '@/components/GoalCreationDialog';
import { PageTransition } from '@/components/ui/page-transition';

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
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-blue-800/50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/app')}
                  className="text-white hover:bg-blue-500/20"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Goals Manager
                  </h1>
                  <p className="text-gray-400 text-sm">Create and manage your fitness goals</p>
                </div>
              </div>
              <GoalCreationDialog onGoalCreated={loadGoals} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No Goals Yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start your fitness journey by creating your first goal. Track your progress and celebrate achievements.
              </p>
              <GoalCreationDialog onGoalCreated={loadGoals} />
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-6 bg-gray-900/40 rounded-xl border border-gray-700/50 backdrop-blur-sm ${
                    goal.is_completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-xl font-semibold ${
                          goal.is_completed ? 'line-through text-gray-400' : 'text-white'
                        }`}>
                          {goal.title}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </div>
                        {goal.is_completed && (
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Completed
                          </div>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-gray-400 mb-3">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-gray-300">
                        {goal.target_value && (
                          <span>
                            Progress: {goal.current_value}/{goal.target_value} {goal.unit}
                          </span>
                        )}
                        <span className="capitalize">Priority: {goal.priority}</span>
                        {goal.deadline && (
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                        className="text-green-400 border-green-500/40 hover:bg-green-500/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-400 border-red-500/40 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {goal.target_value && !goal.is_completed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{Math.round(calculateProgress(goal))}% Complete</span>
                        <span className="text-blue-400 font-medium">{Math.round(calculateProgress(goal))}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress(goal)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default GoalsManager;
