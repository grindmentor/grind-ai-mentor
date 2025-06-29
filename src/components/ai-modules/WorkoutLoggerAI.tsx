
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Activity, Plus, Save, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    rpe?: number;
  }>;
}

interface WorkoutSession {
  id?: string;
  workout_name: string;
  duration_minutes: number;
  exercises_data: Exercise[];
  notes: string;
  session_date: string;
}

const WorkoutLoggerAI = () => {
  const { user } = useAuth();
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession>({
    workout_name: '',
    duration_minutes: 0,
    exercises_data: [],
    notes: '',
    session_date: new Date().toISOString().split('T')[0]
  });
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      loadRecentWorkouts();
    }
  }, [user]);

  const loadRecentWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const startWorkout = () => {
    setIsLogging(true);
    setStartTime(new Date());
    setCurrentWorkout({
      workout_name: '',
      duration_minutes: 0,
      exercises_data: [],
      notes: '',
      session_date: new Date().toISOString().split('T')[0]
    });
  };

  const addExercise = () => {
    const exerciseName = prompt('Enter exercise name:');
    if (!exerciseName) return;

    setCurrentWorkout(prev => ({
      ...prev,
      exercises_data: [
        ...prev.exercises_data,
        {
          name: exerciseName,
          sets: [{ reps: 0, weight: 0, rpe: undefined }]
        }
      ]
    }));
  };

  const addSet = (exerciseIndex: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises_data: prev.exercises_data.map((exercise, index) => 
        index === exerciseIndex
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: 0, weight: 0, rpe: undefined }]
            }
          : exercise
      )
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight' | 'rpe', value: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises_data: prev.exercises_data.map((exercise, exIndex) => 
        exIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, setIdx) => 
                setIdx === setIndex
                  ? { ...set, [field]: value }
                  : set
              )
            }
          : exercise
      )
    }));
  };

  const saveWorkout = async () => {
    if (!user || !currentWorkout.workout_name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    if (currentWorkout.exercises_data.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    const duration = startTime 
      ? Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))
      : currentWorkout.duration_minutes;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([{
          user_id: user.id,
          workout_name: currentWorkout.workout_name,
          duration_minutes: duration,
          exercises_data: currentWorkout.exercises_data,
          notes: currentWorkout.notes,
          session_date: currentWorkout.session_date
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Workout saved successfully!');
      setIsLogging(false);
      setStartTime(null);
      loadRecentWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      setIsLogging(false);
      setStartTime(null);
      setCurrentWorkout({
        workout_name: '',
        duration_minutes: 0,
        exercises_data: [],
        notes: '',
        session_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const getCurrentDuration = () => {
    if (!startTime) return '00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-400" />
            Workout Logger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isLogging ? (
            <>
              {/* Start Workout */}
              <div className="text-center">
                <Button
                  onClick={startWorkout}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Workout
                </Button>
              </div>

              {/* Recent Workouts */}
              <div className="space-y-3">
                <h3 className="text-white font-medium">Recent Workouts</h3>
                {recentWorkouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No workouts logged yet</p>
                    <p className="text-gray-500 text-sm">Start your first workout to track progress</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentWorkouts.map((workout) => (
                      <Card key={workout.id} className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">{workout.workout_name}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm">
                                <span className="text-gray-400 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(workout.session_date).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {workout.duration_minutes} min
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              {workout.exercises_data?.length || 0} exercises
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Active Workout */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-orange-400 font-medium">Active Workout</h3>
                  <div className="text-orange-400 font-mono text-lg">
                    {getCurrentDuration()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Workout Name</Label>
                    <Input
                      value={currentWorkout.workout_name}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, workout_name: e.target.value }))}
                      placeholder="e.g., Push Day, Legs, Full Body..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {currentWorkout.exercises_data.map((exercise, exerciseIndex) => (
                    <Card key={exerciseIndex} className="bg-gray-800/50 border-gray-700/50">
                      <CardContent className="p-4">
                        <h4 className="text-white font-medium mb-3">{exercise.name}</h4>
                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                              <span className="text-gray-400 text-sm">Set {setIndex + 1}</span>
                              <Input
                                type="number"
                                placeholder="Reps"
                                value={set.reps || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                              />
                              <Input
                                type="number"
                                placeholder="Weight"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                              />
                              <Input
                                type="number"
                                placeholder="RPE"
                                min="1"
                                max="10"
                                value={set.rpe || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', Number(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                              />
                            </div>
                          ))}
                          <Button
                            onClick={() => addSet(exerciseIndex)}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    onClick={addExercise}
                    variant="outline"
                    className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>

                  <div>
                    <Label className="text-gray-300">Notes</Label>
                    <Textarea
                      value={currentWorkout.notes}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="How did the workout feel? Any observations..."
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={saveWorkout}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Workout
                    </Button>
                    <Button
                      onClick={cancelWorkout}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutLoggerAI;
