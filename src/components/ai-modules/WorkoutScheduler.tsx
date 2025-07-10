import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Bell, Trash2, Target, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';

interface ScheduledWorkout {
  id: string;
  workout_name: string;
  scheduled_date: string;
  scheduled_time?: string;
  notes?: string;
  reminder_enabled: boolean;
  user_id: string;
  created_at: string;
}

interface WorkoutSchedulerProps {
  onBack: () => void;
}

export const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    workout_name: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
    reminder_enabled: true
  });

  useEffect(() => {
    if (user) {
      loadScheduledWorkouts();
    }
  }, [user]);

  const loadScheduledWorkouts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setScheduledWorkouts(data || []);
    } catch (error) {
      console.error('Error loading scheduled workouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled workouts.',
        variant: 'destructive'
      });
    }
  };

  const createScheduledWorkout = async () => {
    if (!user?.id || !formData.workout_name || !formData.scheduled_date) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in workout name and date.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .insert({
          user_id: user.id,
          workout_name: formData.workout_name,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time || null,
          notes: formData.notes || null,
          reminder_enabled: formData.reminder_enabled
        })
        .select()
        .single();

      if (error) throw error;

      setScheduledWorkouts(prev => [...prev, data]);
      setFormData({
        workout_name: '',
        scheduled_date: '',
        scheduled_time: '',
        notes: '',
        reminder_enabled: true
      });
      setShowCreateForm(false);

      // Schedule notification if enabled and browser supports it
      if (formData.reminder_enabled && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          scheduleWorkoutReminder(data);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              scheduleWorkoutReminder(data);
            }
          });
        }
      }

      toast({
        title: 'Workout Scheduled! 📅',
        description: `${formData.workout_name} scheduled for ${new Date(formData.scheduled_date).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error creating scheduled workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule workout.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleWorkoutReminder = (workout: ScheduledWorkout) => {
    // Simple reminder scheduling using setTimeout (for demo purposes)
    // In a real app, you'd want to use a service worker or push notifications
    const workoutDateTime = new Date(`${workout.scheduled_date}T${workout.scheduled_time || '12:00'}`);
    const reminderTime = workoutDateTime.getTime() - (30 * 60 * 1000); // 30 minutes before
    const timeUntilReminder = reminderTime - Date.now();

    if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(`Workout Reminder: ${workout.workout_name}`, {
              body: `Your workout "${workout.workout_name}" is starting in 30 minutes!`,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-192.png'
            });
          });
        }
      }, timeUntilReminder);
    }
  };

  const deleteScheduledWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      setScheduledWorkouts(prev => prev.filter(w => w.id !== workoutId));
      toast({
        title: 'Workout Cancelled',
        description: 'Scheduled workout has been removed.',
      });
    } catch (error) {
      console.error('Error deleting scheduled workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel workout.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No time set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-purple-900/30">
      <MobileHeader 
        title="Workout Scheduler" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Workout Scheduler</h1>
                <p className="text-gray-400">Plan and schedule your workouts</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Workout
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/30 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Schedule New Workout</CardTitle>
                    <CardDescription className="text-blue-200/80">
                      Plan your workout and set reminders
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-blue-200">Workout Name</Label>
                  <Input
                    value={formData.workout_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, workout_name: e.target.value }))}
                    placeholder="Push Day, Leg Day, Cardio Session..."
                    className="bg-blue-800/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-blue-200 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-blue-800/50 border-blue-500/30 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-blue-200 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Time (Optional)
                    </Label>
                    <Input
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                      className="bg-blue-800/50 border-blue-500/30 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-blue-200">Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Focus areas, equipment needed, etc..."
                    className="bg-blue-800/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_enabled: e.target.checked }))}
                    className="rounded border-blue-500/30"
                  />
                  <Label htmlFor="reminder" className="text-blue-200 flex items-center">
                    <Bell className="w-4 h-4 mr-1" />
                    Enable reminders
                  </Label>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={createScheduledWorkout}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? 'Scheduling...' : 'Schedule Workout'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-800/50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scheduled Workouts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-400" />
              Upcoming Workouts ({scheduledWorkouts.length})
            </h2>
            
            {scheduledWorkouts.length === 0 ? (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Workouts Scheduled</h3>
                  <p className="text-gray-400 mb-4">
                    Schedule your first workout to stay consistent with your fitness goals.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Your First Workout
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scheduledWorkouts.map((workout) => (
                  <Card key={workout.id} className="bg-gradient-to-r from-blue-900/20 to-purple-900/30 backdrop-blur-sm border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{workout.workout_name}</h3>
                            {workout.reminder_enabled && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                <Bell className="w-3 h-3 mr-1" />
                                Reminder On
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-blue-200 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(workout.scheduled_date)}
                            </p>
                            <p className="text-blue-200 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {formatTime(workout.scheduled_time)}
                            </p>
                            {workout.notes && (
                              <p className="text-gray-300 text-sm mt-2">{workout.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => deleteScheduledWorkout(workout.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};