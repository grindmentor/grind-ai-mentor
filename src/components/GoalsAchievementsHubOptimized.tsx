
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, CheckCircle, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useInstantModule } from '@/hooks/useInstantModule';

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

const GoalsAchievementsHubOptimized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('goals');

  // Use instant module hook for performance
  const { data: goals, isLoading } = useInstantModule({
    moduleId: 'goals-hub',
    preloadData: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return error ? [] : data;
    }
  });

  // Memoize calculations for performance
  const goalStats = useMemo(() => {
    if (!goals || !Array.isArray(goals)) return { total: 0, completed: 0, active: 0 };
    return {
      total: goals.length,
      completed: goals.filter(g => g.is_completed).length,
      active: goals.filter(g => !g.is_completed).length
    };
  }, [goals]);

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

  if (!user) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
        <CardContent className="p-6 text-center">
          <Trophy className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-200 mb-2">Sign in to track goals</h3>
          <p className="text-blue-300/70">Create an account to set and achieve your fitness goals</p>
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
              <CardTitle className="text-white text-xl">Goals & Achievements</CardTitle>
              <CardDescription className="text-blue-200/80">
                Track your fitness progress
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => navigate('/goals-manager')}
            variant="outline"
            size="sm"
            className="text-blue-400 border-blue-500/40 hover:bg-blue-500/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-blue-900/30 backdrop-blur-sm">
              <TabsTrigger 
                value="goals" 
                className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <span>Goals ({goalStats.active})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Completed ({goalStats.completed})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-4">
              {!goals || goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-200 mb-2">No Goals Yet</h3>
                  <p className="text-blue-300/70 mb-4">Create your first fitness goal to start tracking progress</p>
                  <Button
                    onClick={() => navigate('/goals-manager')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.filter(g => !g.is_completed).slice(0, 3).map((goal) => (
                    <div key={goal.id} className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      {goal.target_value && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                  {goals.filter(g => !g.is_completed).length > 3 && (
                    <Button
                      onClick={() => navigate('/goals-manager')}
                      variant="outline"
                      className="w-full text-blue-400 border-blue-500/40 hover:bg-blue-500/20"
                    >
                      View All Goals ({goals.filter(g => !g.is_completed).length})
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              {goals?.filter(g => g.is_completed).length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-yellow-200 mb-2">No Achievements Yet</h3>
                  <p className="text-yellow-300/70">Complete your first goal to unlock achievements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.filter(g => g.is_completed).slice(0, 3).map((goal) => (
                    <div key={goal.id} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-8 h-8 text-yellow-400" />
                        <div>
                          <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
                          <p className="text-yellow-300/70 text-xs">Completed {new Date(goal.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsAchievementsHubOptimized;
