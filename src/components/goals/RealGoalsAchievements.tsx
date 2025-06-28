import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trophy, Calendar, Flag, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  current_value: number;
  target_value: number;
  unit: string;
  deadline: string;
  priority: string;
  is_completed: boolean;
}

interface RealGoalsAchievementsProps {
  onNotificationsOpen?: () => void;
}

export const RealGoalsAchievements: React.FC<RealGoalsAchievementsProps> = ({ onNotificationsOpen }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;
      loadGoals();
      
      toast({
        title: 'Progress Updated! 🎯',
        description: 'Your goal progress has been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal progress.',
        variant: 'destructive'
      });
    }
  };

  const updateGoalTitle = async (goalId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ title: newTitle })
        .eq('id', goalId);

      if (error) throw error;
      loadGoals();
      setEditingGoal(null);
      
      toast({
        title: 'Goal Updated! ✏️',
        description: 'Your goal has been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal.',
        variant: 'destructive'
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      loadGoals();
      
      toast({
        title: 'Goal Removed',
        description: 'Goal has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal.',
        variant: 'destructive'
      });
    }
  };

  const handleAddGoalClick = () => {
    // Open notifications center in the dashboard
    if (onNotificationsOpen) {
      onNotificationsOpen();
    }
  };

  const handleGoalClick = (goal: Goal) => {
    // Redirect to appropriate AI module based on category
    const moduleMap: { [key: string]: string } = {
      'Recovery': '/app?module=recovery-coach',
      'Training': '/app?module=smart-training',
      'Nutrition': '/app?module=meal-plan-ai',
      'Strength': '/app?module=workout-logger-ai',
      'Health': '/app?module=progress-hub',
      'Consistency': '/app?module=habit-tracker'
    };

    const moduleUrl = moduleMap[goal.category];
    if (moduleUrl) {
      window.location.href = moduleUrl;
      toast({
        title: `Opening ${goal.category} Module`,
        description: `Tell the AI about your goal: "${goal.title}" and it will help track your progress.`
      });
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditValue(goal.title);
  };

  const saveEdit = () => {
    if (editingGoal && editValue.trim()) {
      updateGoalTitle(editingGoal, editValue.trim());
    }
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditValue('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Health': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-blue-700/30 rounded w-1/3"></div>
            <div className="h-4 bg-blue-700/30 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-16 bg-blue-700/30 rounded"></div>
              <div className="h-16 bg-blue-700/30 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Your Goals</CardTitle>
              <CardDescription className="text-blue-200/80">
                {goals.length === 0 ? 'No goals yet' : `${goals.length} active goals`}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleAddGoalClick}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-200 mb-2">No Goals Yet</h3>
            <p className="text-blue-300/70 mb-6">
              Create your first fitness goal to start tracking progress
            </p>
            <Button
              onClick={handleAddGoalClick}
              className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <>
            {goals.slice(0, 4).map((goal) => {
              const progress = calculateProgress(goal.current_value || 0, goal.target_value || 0);
              
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-colors cursor-pointer group"
                  onClick={() => !editingGoal && handleGoalClick(goal)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {editingGoal === goal.id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="bg-gray-800 text-white px-2 py-1 rounded text-sm flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={saveEdit} className="h-6 w-6 p-0">✓</Button>
                            <Button size="sm" onClick={cancelEdit} variant="ghost" className="h-6 w-6 p-0">✕</Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                              {goal.title}
                            </h3>
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                            <Badge className={getPriorityColor(goal.priority)}>
                              <Flag className="w-3 h-3 mr-1" />
                              {goal.priority}
                            </Badge>
                          </>
                        )}
                      </div>
                      
                      {goal.description && !editingGoal && (
                        <p className="text-gray-400 text-xs mb-2">{goal.description}</p>
                      )}
                      
                      {!editingGoal && (
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-300">
                            Progress: {goal.current_value || 0}
                            {goal.target_value && `/${goal.target_value}`}
                            {goal.unit && ` ${goal.unit}`}
                          </span>
                          {goal.deadline && (
                            <span className="text-blue-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {!editingGoal && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(goal);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValue = prompt(`Update progress for "${goal.title}":`, goal.current_value?.toString() || '0');
                            if (newValue !== null && !isNaN(Number(newValue))) {
                              updateGoalProgress(goal.id, Number(newValue));
                            }
                          }}
                        >
                          📊
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete goal "${goal.title}"?`)) {
                              deleteGoal(goal.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!editingGoal && goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{Math.round(progress)}% Complete</span>
                        <span className="text-blue-400">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {goals.length > 4 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  onClick={handleAddGoalClick}
                >
                  View All Goals ({goals.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
