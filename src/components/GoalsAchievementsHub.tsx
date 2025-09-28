
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Calendar, Zap, CheckCircle, TrendingUp, Award, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

const GoalsAchievementsHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
        setGoals([]);
      } else {
        setGoals(goalsData || []);
      }

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(5);

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        setAchievements([]);
      } else {
        setAchievements(achievementsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setGoals([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'consistency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'general': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Goals & Achievements Hub</CardTitle>
              <CardDescription className="text-blue-200/80">Loading your progress...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
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
              <span>Goals ({goals.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements ({achievements.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {goals.length > 0 ? goals.map((goal) => {
              const progress = getProgressPercentage(goal.current_value, goal.target_value);
              return (
                <div 
                  key={goal.id} 
                  className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{goal.title}</h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-gray-300">
                          Progress: {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                        {goal.deadline && (
                          <span className="text-blue-400">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{Math.round(progress)}% Complete</span>
                      <span className="text-blue-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-2">No active goals yet</p>
                <p className="text-gray-500 text-sm mb-4">Set your first goal to start tracking progress</p>
                <Button variant="outline" size="sm" className="text-blue-400 border-blue-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.length > 0 ? achievements.map((achievement) => (
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
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                    <p className="text-gray-500 text-xs">{formatDate(achievement.unlocked_at)}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-2">No achievements yet</p>
                <p className="text-gray-500 text-sm">Complete goals and log workouts to unlock achievements</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoalsAchievementsHub;
