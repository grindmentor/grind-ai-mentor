import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell, Plus, Save, Trash2, Calendar, TrendingUp, Target, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface WorkoutSet {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time?: number;
}

interface Workout {
  id?: string;
  workout_name: string;
  exercises: WorkoutSet[];
  total_duration?: number;
  notes?: string;
  created_at: string;
}

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({
    workout_name: '',
    exercises: [],
    created_at: new Date().toISOString()
  });
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentWorkouts();
    }
  }, [user]);

  const loadRecentWorkouts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load recent workouts');
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date());
    setCurrentWorkout({
      workout_name: `Workout ${new Date().toLocaleDateString()}`,
      exercises: [],
      created_at: new Date().toISOString()
    });
    toast.success('Workout started! 💪');
  };

  const addExercise = () => {
    const newExercise: WorkoutSet = {
      exercise: '',
      sets: 1,
      reps: 8,
      weight: 0
    };
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const updateExercise = (index: number, field: keyof WorkoutSet, value: any) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const removeExercise = (index: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const finishWorkout = async () => {
    if (!user || !canUseFeature('workout_timer_sessions') || currentWorkout.exercises.length === 0) {
      toast.error('Add at least one exercise before finishing');
      return;
    }

    const success = await incrementUsage('workout_timer_sessions');
    if (!success) return;

    try {
      const duration = workoutStartTime 
        ? Math.round((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60)
        : 0;

      const workoutToSave = {
        user_id: user.id,
        workout_name: currentWorkout.workout_name,
        exercises: currentWorkout.exercises,
        total_duration: duration,
        notes: currentWorkout.notes,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutToSave)
        .select()
        .single();

      if (error) throw error;

      setWorkouts(prev => [data, ...prev]);
      setIsWorkoutActive(false);
      setWorkoutStartTime(null);
      setCurrentWorkout({
        workout_name: '',
        exercises: [],
        created_at: new Date().toISOString()
      });

      toast.success(`Workout completed! Duration: ${duration} minutes`);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutStartTime(null);
    setCurrentWorkout({
      workout_name: '',
      exercises: [],
      created_at: new Date().toISOString()
    });
    toast.info('Workout cancelled');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-blue-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/20">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                    Workout Logger AI
                  </h1>
                  <p className="text-blue-200 text-lg">Track your training with intelligent insights</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="workout_timer_sessions" featureName="Workout Sessions" compact />
          </div>

          {/* Current Workout */}
          <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                  {isWorkoutActive ? 'Current Workout' : 'Start New Workout'}
                </CardTitle>
                {isWorkoutActive && workoutStartTime && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.round((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60)}m
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isWorkoutActive ? (
                <div className="text-center py-8">
                  <Dumbbell className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Ready to Start Training?</h3>
                  <p className="text-blue-200 mb-6">Log your exercises with sets, reps, and weights for detailed tracking</p>
                  <Button
                    onClick={startWorkout}
                    className="bg-gradient-to-r from-blue-500/80 to-blue-700/80 hover:from-blue-600/80 hover:to-blue-800/80 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 backdrop-blur-sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Workout Name */}
                  <div>
                    <label className="text-blue-200 text-sm mb-2 block">Workout Name</label>
                    <Input
                      value={currentWorkout.workout_name}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, workout_name: e.target.value }))}
                      className="bg-blue-800/30 border-blue-600/50 text-white focus:border-blue-500"
                      placeholder="Enter workout name..."
                    />
                  </div>

                  {/* Exercises */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">Exercises</h3>
                      <Button
                        onClick={addExercise}
                        size="sm"
                        className="bg-blue-500/20 hover:bg-blue-600/30 text-blue-300"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Exercise
                      </Button>
                    </div>

                    {currentWorkout.exercises.map((exercise, index) => (
                      <Card key={index} className="bg-blue-800/20 border-blue-600/30">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Exercise name (e.g., Bench Press)"
                              value={exercise.exercise}
                              onChange={(e) => updateExercise(index, 'exercise', e.target.value)}
                              className="bg-blue-700/30 border-blue-600/50 text-white focus:border-blue-500 flex-1 mr-4"
                            />
                            <Button
                              onClick={() => removeExercise(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-blue-200 text-xs mb-1 block">Sets</label>
                              <Input
                                type="number"
                                min="1"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                                className="bg-blue-700/30 border-blue-600/50 text-white focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-blue-200 text-xs mb-1 block">Reps</label>
                              <Input
                                type="number"
                                min="1"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                                className="bg-blue-700/30 border-blue-600/50 text-white focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-blue-200 text-xs mb-1 block">Weight (kg)</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={exercise.weight}
                                onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                                className="bg-blue-700/30 border-blue-600/50 text-white focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-blue-200 text-sm mb-2 block">Notes (Optional)</label>
                    <Input
                      value={currentWorkout.notes || ''}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-blue-800/30 border-blue-600/50 text-white focus:border-blue-500"
                      placeholder="How did the workout feel? Any observations..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={finishWorkout}
                      disabled={currentWorkout.exercises.length === 0 || !canUseFeature('workout_timer_sessions')}
                      className="bg-gradient-to-r from-green-500/80 to-green-700/80 hover:from-green-600/80 hover:to-green-800/80 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 backdrop-blur-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Finish Workout
                    </Button>
                    <Button
                      onClick={cancelWorkout}
                      variant="outline"
                      className="border-blue-600/50 text-blue-300 hover:bg-blue-800/50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                  <p className="text-blue-200">Loading workouts...</p>
                </div>
              ) : workouts.length > 0 ? (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="p-4 bg-blue-800/20 rounded-lg border border-blue-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{workout.workout_name}</h3>
                        <div className="flex items-center space-x-2 text-blue-200 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(workout.created_at).toLocaleDateString()}</span>
                          {workout.total_duration && (
                            <>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{formatDuration(workout.total_duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-blue-200 text-sm">
                        {workout.exercises.length} exercises • {workout.exercises.reduce((acc, ex) => acc + ex.sets, 0)} total sets
                      </div>
                      {workout.notes && (
                        <p className="text-blue-300 text-sm mt-2 italic">"{workout.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-300">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No workouts logged yet</p>
                  <p className="text-sm mt-1">Start your first workout to see it here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLoggerAI;
