import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Check, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { RateLimitBadge } from '@/components/ui/rate-limit-badge';
import { MobileHeader } from '@/components/MobileHeader';

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
    <div className="min-h-screen bg-background">
      <MobileHeader title="Habit Tracker" onBack={onBack} />
      
      <div className="p-4 max-w-4xl mx-auto pb-24">
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Build lasting habits
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Add New Habit */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-base flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary" />
                  Add New Habit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-medium">Habit Name</label>
                  <Input
                    placeholder="e.g., Drink 8 glasses of water"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-muted/30 border-border text-foreground focus:border-primary h-10"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-medium">Description (Optional)</label>
                  <Input
                    placeholder="Why is this habit important?"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-muted/30 border-border text-foreground focus:border-primary h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-medium">Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 bg-muted/30 border border-border text-foreground rounded-lg focus:border-primary text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-card">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={addHabit}
                  disabled={!newHabit.name.trim() || !canUseFeature('habit_checks')}
                  className="w-full bg-primary hover:bg-primary/90 native-press"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </CardContent>
            </Card>

            {/* Daily Overview */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-base flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-medium">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-muted/30 border-border text-foreground focus:border-primary h-10"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-xl">
                    <div className="text-2xl font-bold text-foreground">{streakData.completedToday}</div>
                    <div className="text-muted-foreground text-xs">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-xl">
                    <div className="text-2xl font-bold text-foreground">{streakData.totalHabits}</div>
                    <div className="text-muted-foreground text-xs">Total</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-xl">
                    <div className="text-2xl font-bold text-primary">{streakData.completionRate}%</div>
                    <div className="text-muted-foreground text-xs">Rate</div>
                  </div>
                </div>

                {streakData.totalHabits > 0 && (
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${streakData.completionRate}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-base flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map(category => {
                  const categoryHabits = habits.filter(h => h.category === category);
                  const categoryCompleted = habitLogs.filter(log => 
                    log.completed && habits.find(h => h.id === log.habit_id)?.category === category
                  ).length;
                  
                  if (categoryHabits.length === 0) return null;
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border/50">
                      <Badge className={getCategoryColor(category)}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-foreground font-semibold text-sm">{categoryCompleted}/{categoryHabits.length}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Habits List */}
          {habits.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-base flex items-center">
                  <Check className="w-5 h-5 mr-2 text-primary" />
                  Your Habits - {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((habit) => {
                    const isCompleted = getHabitStatus(habit.id);
                    
                    return (
                      <div 
                        key={habit.id} 
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all native-press ${
                          isCompleted 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-muted/30 border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-medium text-sm truncate">{habit.name}</h3>
                            {habit.description && (
                              <p className="text-muted-foreground text-xs truncate">{habit.description}</p>
                            )}
                          </div>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'border-2 border-muted-foreground/30'
                          }`}>
                            {isCompleted && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(habit.category)}>
                            {habit.category}
                          </Badge>
                          <span className={`text-xs ${isCompleted ? 'text-green-400' : 'text-muted-foreground'}`}>
                            {isCompleted ? 'Done' : 'Pending'}
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
            <div className="empty-state-premium">
              <div className="empty-state-icon">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground text-sm">
                Create your first habit to start tracking
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
