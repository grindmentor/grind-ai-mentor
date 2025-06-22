import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Plus, Flame, Target, Calendar } from "lucide-react";
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>
            <p className="text-gray-400">Build consistent fitness and wellness habits</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Flame className="w-3 h-3 mr-1" />
          All data saved to your profile
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          {completedToday}/{totalHabits} completed today ({completionRate}%)
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Today's Habits</CardTitle>
                  <CardDescription className="text-gray-400">
                    Check off your daily habits to build streaks
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddForm && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter new habit (e.g., 'Read 20 minutes')"
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                    />
                    <Button onClick={addHabit} className="bg-green-500 hover:bg-green-600">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      habit.completed_today 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full ${habit.color} flex items-center justify-center`}>
                        {habit.completed_today && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${habit.completed_today ? 'text-green-400' : 'text-white'}`}>
                            {habit.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getStreakEmoji(habit.streak)}</span>
                            <Badge className={`${
                              habit.streak >= 7 
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {habit.streak} day streak
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm capitalize">{habit.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {habits.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500">No habits yet</p>
                    <p className="text-gray-600 text-sm">Add your first habit to start tracking!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      className="text-gray-700"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="36"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-green-500"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - completedToday / Math.max(totalHabits, 1))}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="36"
                      cx="48"
                      cy="48"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  </div>
                </div>
                <p className="text-gray-400">{completedToday} of {totalHabits} habits completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Streak Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((habit, index) => (
                    <div key={habit.id} className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{habit.name}</p>
                        <p className="text-gray-400 text-xs">{habit.streak} days</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">💡 Habit Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Start with 2-3 habits max</p>
                <p>• Stack habits with existing routines</p>
                <p>• Track your streaks for motivation</p>
                <p>• Focus on consistency over perfection</p>
                <p>• Celebrate small wins daily</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
