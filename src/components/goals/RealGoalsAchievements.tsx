
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, Calendar, Plus, TrendingUp, Weight, Flame, Activity, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GoalCreationModal } from './GoalCreationModal';

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
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');

  useEffect(() => {
    if (user) {
      loadGoalsAndAchievements();
    }
  }, [user]);

  const loadGoalsAndAchievements = async () => {
    if (!user) return;

    try {
      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      setGoals(goalsData || []);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error loading goals and achievements:', error);
      toast.error('Failed to load goals and achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = () => {
    loadGoalsAndAchievements();
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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

  const formatGoalDescription = (goal: Goal) => {
    // If the goal is weight-related and has "pounds" in description, replace with user's unit
    if (goal.category.toLowerCase() === 'weight' && goal.description.includes('pounds')) {
      const weightUnit = preferences.weight_unit === 'kg' ? 'kg' : 'lbs';
      return goal.description.replace(/pounds?/gi, weightUnit);
    }
    return goal.description;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-400" />
              Goals & Achievements
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'goals' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('goals')}
                className={activeTab === 'goals' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'}
              >
                Goals ({goals.length})
              </Button>
              <Button
                variant={activeTab === 'achievements' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('achievements')}
                className={activeTab === 'achievements' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'}
              >
                Achievements ({achievements.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeTab === 'goals' && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Active Goals</h3>
                <Button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowGoalModal(true);
                  }}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No goals set yet</p>
                  <Button
                    onClick={() => {
                      setEditingGoal(null);
                      setShowGoalModal(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const IconComponent = getCategoryIcon(goal.category);
                    return (
                      <div key={goal.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(goal.category).split(' ')[0]}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{goal.title}</h4>
                              <p className="text-gray-400 text-sm">{formatGoalDescription(goal)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditGoal(goal)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </span>
                            <span className="text-orange-400">
                              {getProgressPercentage(goal.current_value, goal.target_value).toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={getProgressPercentage(goal.current_value, goal.target_value)} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className={
                            goal.status === 'completed' ? 'text-green-400 border-green-500/50' :
                            goal.status === 'paused' ? 'text-yellow-400 border-yellow-500/50' :
                            'text-blue-400 border-blue-500/50'
                          }>
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
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      <GoalCreationModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        onGoalCreated={handleGoalCreated}
        editingGoal={editingGoal}
      />
    </>
  );
};

export default RealGoalsAchievements;
