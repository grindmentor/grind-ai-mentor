
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trophy, Target, ChevronDown, ChevronUp, Award, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Preset goals for first-time users
const PRESET_GOALS = [
  {
    title: "Lose 10 pounds",
    description: "Achieve sustainable weight loss",
    target_value: 10,
    unit: "lbs",
    category: "weight_loss"
  },
  {
    title: "Gain 5 pounds of muscle",
    description: "Build lean muscle mass",
    target_value: 5,
    unit: "lbs",
    category: "muscle_gain"
  },
  {
    title: "Exercise 4 times per week",
    description: "Maintain consistent workout routine",
    target_value: 4,
    unit: "workouts",
    category: "consistency"
  },
  {
    title: "Reach 150g protein daily",
    description: "Meet daily protein intake goals",
    target_value: 150,
    unit: "grams",
    category: "nutrition"
  }
];

const CompactGoalsAchievements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPresets, setShowPresets] = useState(false);

  const [quickStats, setQuickStats] = useState({
    activeGoals: 0,
    completedToday: 0,
    weeklyStreak: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load active goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
      } else {
        setGoals(goalsData || []);
      }

      // Calculate completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: completedTodayData, error: completedTodayError } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('updated_at', today);

      // Get workout streak (simplified calculation)
      const { data: recentWorkouts, error: workoutsError } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(7);

      let streak = 0;
      if (recentWorkouts && recentWorkouts.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (const workout of recentWorkouts) {
          const workoutDate = new Date(workout.session_date);
          if (workoutDate.toDateString() === checkDate.toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      setQuickStats({
        activeGoals: goalsData?.length || 0,
        completedToday: completedTodayData?.length || 0,
        weeklyStreak: streak,
        totalPoints: 0
      });

      setAchievements([]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoalFromPreset = async (preset: typeof PRESET_GOALS[0]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: preset.title,
          description: preset.description,
          target_value: preset.target_value,
          current_value: 0,
          unit: preset.unit,
          category: preset.category,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
      } else {
        setGoals(prev => [data, ...prev]);
        setQuickStats(prev => ({ ...prev, activeGoals: prev.activeGoals + 1 }));
        setShowPresets(false);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-blue-900/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <Trophy className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Goals & Achievements</h3>
                  <p className="text-blue-200/80 text-xs">
                    {quickStats.activeGoals} active • {quickStats.completedToday} completed today
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <Target className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300">{quickStats.activeGoals}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-300">{quickStats.totalPoints}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-4">
              {/* Goals Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-semibold flex items-center">
                    <Target className="w-4 h-4 mr-2 text-orange-400" />
                    Active Goals
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-orange-400 hover:bg-orange-500/10 h-6 px-2"
                    onClick={() => setShowPresets(!showPresets)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Goal
                  </Button>
                </div>
                
                {/* Preset Goals Selection */}
                {showPresets && (
                  <div className="mb-4 p-3 bg-gray-900/60 rounded-lg border border-gray-700/50">
                    <h5 className="text-white text-xs font-medium mb-2">Choose a preset goal:</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {PRESET_GOALS.map((preset, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="ghost"
                          className="text-left text-xs p-2 h-auto bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white"
                          onClick={() => createGoalFromPreset(preset)}
                        >
                          <div>
                            <div className="font-medium">{preset.title}</div>
                            <div className="text-xs text-gray-400">{preset.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2 text-xs text-gray-400 hover:text-white"
                      onClick={() => setShowPresets(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                
                {goals.length === 0 ? (
                  <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50 text-center">
                    <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs mb-2">No active goals yet</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-400 hover:bg-orange-500/10 text-xs"
                      onClick={() => setShowPresets(true)}
                    >
                      Create Your First Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goals.slice(0, 2).map((goal, index) => (
                      <div key={goal.id} className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-xs font-medium">{goal.title}</span>
                          <span className="text-blue-400 text-xs">
                            {goal.target_value ? Math.round((goal.current_value / goal.target_value) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${goal.target_value ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0}%` 
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {goal.current_value || 0}/{goal.target_value || 0} {goal.unit || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Section */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Recent Achievements
                </h4>
                
                {achievements.length === 0 ? (
                  <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50 text-center">
                    <Trophy className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">No achievements yet</p>
                    <p className="text-gray-500 text-xs mt-1">Complete goals to earn achievements!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/20 rounded-lg border border-yellow-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <div>
                              <span className="text-white text-xs font-medium">{achievement.title}</span>
                              <p className="text-gray-400 text-xs">{achievement.time}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                            +{achievement.points}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CompactGoalsAchievements;
