
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowLeft, Plus, Check, X, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/UsageIndicator';
import { RateLimitBadge } from '@/components/ui/rate-limit-badge';

interface HabitTrackerProps {
  onBack: () => void;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'fitness'
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      loadHabits();
      loadHabitLogs();
    }
  }, [user, selectedDate]);

  const loadHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadHabitLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate);

      if (error) throw error;
      setHabitLogs(data || []);
    } catch (error) {
      console.error('Error loading habit logs:', error);
    }
  };

  const addHabit = async () => {
    if (!newHabit.name.trim() || !user) return;
    if (!canUseFeature('habit_checks')) return;
    
    const success = await incrementUsage('habit_checks');
    if (!success) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabit.name.trim(),
          description: newHabit.description.trim() || null,
          category: newHabit.category
        })
        .select()
        .single();

      if (error) throw error;

      setHabits(prev => [data, ...prev]);
      setNewHabit({ name: '', description: '', category: 'fitness' });
      toast.success('Habit added successfully!');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to add habit');
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;

    const existingLog = habitLogs.find(log => log.habit_id === habitId);

    try {
      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('habit_logs')
          .update({ completed: !existingLog.completed })
          .eq('id', existingLog.id);

        if (error) throw error;

        setHabitLogs(prev => 
          prev.map(log => 
            log.id === existingLog.id 
              ? { ...log, completed: !log.completed }
              : log
          )
        );
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            date: selectedDate,
            completed: true
          })
          .select()
          .single();

        if (error) throw error;
        setHabitLogs(prev => [...prev, data]);
      }

      toast.success('Habit updated!');
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const getHabitStatus = (habitId: string) => {
    const log = habitLogs.find(log => log.habit_id === habitId);
    return log?.completed || false;
  };

  const getStreakData = () => {
    // This would typically calculate streaks from historical data
    // For now, showing today's completion rate
    const completedToday = habitLogs.filter(log => log.completed).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    return {
      completedToday,
      totalHabits,
      completionRate
    };
  };

  const streakData = getStreakData();
  const categories = ['fitness', 'nutrition', 'sleep', 'mindfulness', 'productivity'];

  const getCategoryColor = (category: string) => {
    const colors = {
      fitness: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      nutrition: 'bg-green-500/20 text-green-300 border-green-500/30',
      sleep: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      mindfulness: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      productivity: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900/20 to-yellow-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
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
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-yellow-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/25 border border-yellow-400/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                    Habit Tracker
                  </h1>
                  <p className="text-yellow-200 text-lg">Build lasting fitness and wellness habits</p>
                </div>
              </div>
            </div>
            
            <RateLimitBadge featureKey="habit_checks" featureName="Habit checks" showProgress />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Track daily habits and build consistency
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add New Habit */}
            <Card className="bg-yellow-900/20 border-yellow-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Plus className="w-5 h-5 mr-3 text-yellow-400" />
                  Add New Habit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-yellow-200 text-sm font-medium">Habit Name</label>
                  <Input
                    placeholder="e.g., Drink 8 glasses of water"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-yellow-800/20 border-yellow-600/50 text-white focus:border-yellow-500 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-yellow-200 text-sm font-medium">Description (Optional)</label>
                  <Input
                    placeholder="Why is this habit important?"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-yellow-800/20 border-yellow-600/50 text-white focus:border-yellow-500 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-yellow-200 text-sm font-medium">Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-yellow-800/20 border border-yellow-600/50 text-white rounded-lg focus:border-yellow-500 backdrop-blur-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-yellow-800">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={addHabit}
                  disabled={!newHabit.name.trim() || !canUseFeature('habit_checks')}
                  className="w-full bg-gradient-to-r from-yellow-500/80 to-yellow-700/80 hover:from-yellow-600/80 hover:to-yellow-800/80 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </CardContent>
            </Card>

            {/* Daily Overview */}
            <Card className="bg-yellow-900/20 border-yellow-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-yellow-400" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-yellow-200 text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-yellow-800/20 border-yellow-600/50 text-white focus:border-yellow-500 backdrop-blur-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{streakData.completedToday}</div>
                    <div className="text-yellow-200 text-sm">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{streakData.totalHabits}</div>
                    <div className="text-yellow-200 text-sm">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{streakData.completionRate}%</div>
                    <div className="text-yellow-200 text-sm">Rate</div>
                  </div>
                </div>

                {streakData.totalHabits > 0 && (
                  <div className="w-full bg-yellow-800/20 rounded-full h-3 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${streakData.completionRate}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-yellow-900/20 border-yellow-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-yellow-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryHabits = habits.filter(h => h.category === category);
                    const categoryCompleted = habitLogs.filter(log => 
                      log.completed && habits.find(h => h.id === log.habit_id)?.category === category
                    ).length;
                    
                    if (categoryHabits.length === 0) return null;
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-yellow-800/20 backdrop-blur-sm rounded-lg border border-yellow-600/30">
                        <div>
                          <Badge className={getCategoryColor(category)}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{categoryCompleted}/{categoryHabits.length}</div>
                          <div className="text-yellow-200 text-xs">completed</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habits List */}
          {habits.length > 0 && (
            <Card className="bg-yellow-900/20 border-yellow-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Check className="w-5 h-5 mr-3 text-yellow-400" />
                  Your Habits - {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habits.map((habit) => {
                    const isCompleted = getHabitStatus(habit.id);
                    
                    return (
                      <div 
                        key={habit.id} 
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isCompleted 
                            ? 'bg-green-600/20 border-green-500/30 backdrop-blur-sm' 
                            : 'bg-yellow-800/20 border-yellow-600/30 hover:bg-yellow-700/30 backdrop-blur-sm'
                        }`}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{habit.name}</h3>
                            {habit.description && (
                              <p className="text-yellow-200 text-sm">{habit.description}</p>
                            )}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isCompleted 
                              ? 'bg-green-500 border-green-400' 
                              : 'border-yellow-600 hover:border-yellow-500'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(habit.category)}>
                            {habit.category}
                          </Badge>
                          <span className={`text-sm ${isCompleted ? 'text-green-300' : 'text-yellow-300'}`}>
                            {isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {habits.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-yellow-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No habits yet</h3>
              <p className="text-yellow-200">Add your first habit to start building consistency</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
