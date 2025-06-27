
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Trophy, Target, Calendar, Zap, CheckCircle, TrendingUp, Award, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from './MobileHeader';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  current_value: number;
  target_value: number;
  deadline?: string;
  priority: string;
  category: string;
}

interface NotificationCenterProps {
  onBack?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
      } else if (goalsData) {
        const formattedGoals = goalsData.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          progress: goal.target_value ? Math.round((goal.current_value / goal.target_value) * 100) : 0,
          current_value: goal.current_value || 0,
          target_value: goal.target_value || 0,
          deadline: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : undefined,
          priority: goal.priority || 'medium',
          category: goal.category
        }));
        setGoals(formattedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
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
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Health': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
        {onBack && <MobileHeader title="Notifications" onBack={onBack} />}
        <div className="p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
      {onBack && <MobileHeader title="Notifications" onBack={onBack} />}
      
      <div className="p-4 sm:p-6">
        <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Notification Center</CardTitle>
                  <CardDescription className="text-blue-200/80">
                    Track your goals and progress
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
                  <span>Achievements</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-200 mb-2">No Goals Yet</h3>
                    <p className="text-blue-300/70 mb-6">
                      Create your first fitness goal to start tracking progress
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/app'} 
                      className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </div>
                ) : (
                  goals.map((goal) => (
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
                              Progress: {goal.current_value}/{goal.target_value}
                            </span>
                            {goal.deadline && (
                              <span className={getPriorityColor(goal.priority)}>
                                Due: {goal.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{goal.progress}% Complete</span>
                          <span className="text-blue-400">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-yellow-200 mb-2">No Achievements Yet</h3>
                  <p className="text-yellow-300/70 mb-6">
                    Complete goals and stay consistent to unlock achievements!
                  </p>
                  <div className="text-xs text-gray-400 mt-4">
                    Achievements will appear here as you progress
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;
