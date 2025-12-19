import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Plus, Check, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { RateLimitBadge } from '@/components/ui/rate-limit-badge';
import { MobileHeader } from '@/components/MobileHeader';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HabitTrackerProps {
  onBack: () => void;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
  color?: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ onBack }) => {
  const navigate = useNavigate();
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

  // MobileHeader handles returnTo state automatically from location.state
  // This is only a fallback for truly orphan navigation scenarios
  const handleBackNavigation = useCallback(() => {
    const state = (window.history.state?.usr as { returnTo?: string } | null);
    if (state?.returnTo) {
      navigate(state.returnTo);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/modules');
    }
  }, [navigate]);

  const handleRefresh = async () => {
    await Promise.all([loadHabits(), loadHabitLogs()]);
  };

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
    const colors: Record<string, string> = {
      fitness: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      nutrition: 'bg-green-500/20 text-green-400 border-green-500/30',
      sleep: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      mindfulness: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      productivity: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[category] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Habit Tracker" onBack={handleBackNavigation} />
      
      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="list">
        <div className="px-4 pb-28">
          {/* Hero */}
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-3 border border-green-500/20" aria-hidden="true">
              <Zap className="w-7 h-7 text-green-400" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Habit Tracker</h2>
            <p className="text-sm text-muted-foreground">Build lasting habits with science</p>
          </div>

          {/* Date Selector */}
          <div className="mb-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-muted/30 border-border h-11 rounded-xl"
              aria-label="Select date"
            />
          </div>

          {/* Today's Progress */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-green-400" />
                  Today's Progress
                </h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {streakData.completionRate}%
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-foreground">{streakData.completedToday}</div>
                  <div className="text-[10px] text-muted-foreground">Done</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-foreground">{streakData.totalHabits}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-green-400">{streakData.completionRate}%</div>
                  <div className="text-[10px] text-muted-foreground">Rate</div>
                </div>
              </div>

              {streakData.totalHabits > 0 && (
                <div className="w-full bg-muted/50 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${streakData.completionRate}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Habit */}
          <Card className="bg-card/50 border-border/50 mb-4">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">Add New Habit</span>
              </div>

              <Input
                placeholder="Habit name (e.g., Drink 8 glasses of water)"
                value={newHabit.name}
                onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                className="bg-muted/30 border-border h-11 rounded-xl"
                aria-label="Enter habit name"
              />
              
              <Input
                placeholder="Description (optional)"
                value={newHabit.description}
                onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                className="bg-muted/30 border-border h-11 rounded-xl"
                aria-label="Enter habit description"
              />

              <Select
                value={newHabit.category}
                onValueChange={(value) => setNewHabit(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger 
                  className="bg-muted/30 border-border h-11 rounded-xl"
                  aria-label="Select category"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={addHabit}
                disabled={!newHabit.name.trim() || !canUseFeature('habit_checks')}
                className="w-full h-11 bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Button>
            </CardContent>
          </Card>

          {/* Habits List */}
          {habits.length > 0 ? (
            <div className="space-y-2">
              <h3 className="caption-premium px-1 mb-2">Your Habits</h3>
              {habits.map((habit) => {
                const isCompleted = getHabitStatus(habit.id);
                
                return (
                  <button 
                    key={habit.id} 
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all native-press text-left",
                      isCompleted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-card/50 border-border/50 hover:border-primary/30'
                    )}
                    aria-label={`${isCompleted ? 'Uncheck' : 'Check'} ${habit.name}`}
                    aria-pressed={isCompleted}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-medium text-sm truncate">{habit.name}</h4>
                        {habit.description && (
                          <p className="text-muted-foreground text-xs truncate">{habit.description}</p>
                        )}
                        <Badge className={cn("mt-2 text-[10px]", getCategoryColor(habit.category))}>
                          {habit.category}
                        </Badge>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all",
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-muted-foreground/30'
                      )}>
                        {isCompleted && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
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
      </PullToRefresh>
    </div>
  );
};

export default HabitTracker;
