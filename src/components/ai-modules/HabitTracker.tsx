
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Plus, Flame, Target, Calendar, Zap, Trophy, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUsageTracking } from "@/hooks/useUsageTracking";

interface HabitTrackerProps {
  onBack: () => void;
}

interface Habit {
  id: string;
  name: string;
  category: 'fitness' | 'nutrition' | 'recovery' | 'mindset';
  color: string;
  completed_today: boolean;
  streak: number;
}

const HabitTracker = ({ onBack }: HabitTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;

    try {
      // Load habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // Load today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (completionsError) throw completionsError;

      const completedHabitIds = new Set(completionsData?.map(c => c.habit_id) || []);

      // Calculate streaks for each habit
      const habitsWithStreaks = await Promise.all(
        (habitsData || []).map(async (habit) => {
          const streak = await calculateStreak(habit.id);
          return {
            ...habit,
            category: habit.category as 'fitness' | 'nutrition' | 'recovery' | 'mindset',
            completed_today: completedHabitIds.has(habit.id),
            streak
          };
        })
      );

      setHabits(habitsWithStreaks);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast({
        title: "Error loading habits",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = async (habitId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('completed_date')
        .eq('habit_id', habitId)
        .order('completed_date', { ascending: false })
        .limit(100);

      if (error || !data) return 0;

      let streak = 0;
      const today = new Date();
      let currentDate = new Date(today);

      for (const completion of data) {
        const completionDate = new Date(completion.completed_date);
        const dateString = currentDate.toISOString().split('T')[0];
        const completionString = completionDate.toISOString().split('T')[0];

        if (dateString === completionString) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user || !canUseFeature('habit_checks')) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      if (habit.completed_today) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user.id)
          .eq('completed_date', today);

        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_date: today
          });

        if (error) throw error;
        
        // Track usage
        await incrementUsage('habit_checks');
      }

      // Reload habits to update streaks
      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error updating habit",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const addHabit = async () => {
    if (!newHabit.trim() || !user) return;
    
    try {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
      const categories: ('fitness' | 'nutrition' | 'recovery' | 'mindset')[] = ['fitness', 'nutrition', 'recovery', 'mindset'];
      
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabit,
          category: categories[Math.floor(Math.random() * categories.length)],
          color: colors[Math.floor(Math.random() * colors.length)]
        });

      if (error) throw error;

      setNewHabit('');
      setShowAddForm(false);
      await loadHabits();

      toast({
        title: "Habit added!",
        description: "Your new habit has been created.",
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: "Error adding habit",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 21) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💪';
    return '🌱';
  };

  const completedToday = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 text-white flex items-center justify-center" style={{fontFamily: 'Nunito, sans-serif'}}>
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="text-yellow-200">Loading your habits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 text-white p-6" style={{fontFamily: 'Nunito, sans-serif'}}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-yellow-200 hover:text-white hover:bg-yellow-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/25">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                  Habit Tracker
                </h1>
                <p className="text-yellow-200 text-lg">Build consistent fitness and wellness habits</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            {completionRate}% Today
          </Badge>
        </div>

        {/* Daily Progress Banner */}
        <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Today's Progress</h2>
                <p className="text-yellow-200">{completedToday} of {totalHabits} habits completed</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-yellow-400 mb-1">{completionRate}%</div>
                <div className="w-24 h-3 bg-yellow-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Habits Section */}
          <div className="lg:col-span-2">
            <Card className="bg-yellow-900/50 border-yellow-600/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">Today's Habits</CardTitle>
                    <CardDescription className="text-yellow-200">
                      Check off your daily habits to build powerful streaks
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Habit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showAddForm && (
                  <Card className="bg-yellow-800/30 border-yellow-600/30">
                    <CardContent className="p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter new habit (e.g., '20 push-ups', 'Read 15 minutes')"
                          value={newHabit}
                          onChange={(e) => setNewHabit(e.target.value)}
                          className="bg-yellow-700/40 border-yellow-600/50 text-white focus:border-yellow-500"
                          onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                        />
                        <Button 
                          onClick={addHabit} 
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {habits.map((habit) => (
                    <Card
                      key={habit.id}
                      className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        habit.completed_today 
                          ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                          : 'bg-yellow-800/30 border-yellow-700/50 hover:border-yellow-600/70'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full ${habit.color} flex items-center justify-center transition-all duration-300 ${
                            habit.completed_today ? 'scale-110' : ''
                          }`}>
                            {habit.completed_today && <CheckCircle className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold ${habit.completed_today ? 'text-yellow-300' : 'text-white'}`}>
                                {habit.name}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getStreakEmoji(habit.streak)}</span>
                                <Badge className={`${
                                  habit.streak >= 7 
                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }`}>
                                  <Flame className="w-3 h-3 mr-1" />
                                  {habit.streak} day streak
                                </Badge>
                              </div>
                            </div>
                            <p className="text-yellow-200 text-sm capitalize mt-1">{habit.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {habits.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">No habits yet</h3>
                      <p className="text-yellow-300">Add your first habit to start building consistency!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Leaderboard */}
            <Card className="bg-yellow-900/50 border-yellow-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Streak Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits
                    .sort((a, b) => b.streak - a.streak)
                    .slice(0, 3)
                    .map((habit, index) => (
                      <div key={habit.id} className="flex items-center space-x-3 p-2 bg-yellow-800/20 rounded-lg">
                        <div className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{habit.name}</p>
                          <p className="text-yellow-300 text-xs">{habit.streak} days strong</p>
                        </div>
                      </div>
                    ))}
                  {habits.length === 0 && (
                    <p className="text-yellow-400 text-center text-sm">Add habits to see your streaks!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Habit Tips */}
            <Card className="bg-yellow-900/50 border-yellow-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">💡 Success Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-yellow-200">
                  <div className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>Start with 2-3 habits maximum</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>Stack new habits with existing routines</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Flame className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>Focus on consistency over perfection</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>Celebrate small wins daily</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="text-white font-semibold mb-1">Keep Going!</h3>
                <p className="text-yellow-200 text-sm">
                  Every habit completed is a step towards your best self
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
