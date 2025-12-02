import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Dumbbell, 
  Timer, 
  TrendingUp, 
  Calendar,
  Target,
  Play,
  Pause,
  RotateCcw,
  Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/ui/app-shell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

interface WorkoutSession {
  id?: string;
  workout_name: string;
  duration_minutes: number;
  exercises_data: Exercise[];
  session_date: string;
  notes?: string;
}

const WorkoutLogger = () => {
  const { user } = useAuth();
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [savedExercises, setSavedExercises] = useState<string[]>([]);

  // Popular exercises list (fallback)
  const popularExercises = [
    'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
    'Pull-ups', 'Dips', 'Incline Bench Press', 'Romanian Deadlift', 'Lat Pulldown',
    'Leg Press', 'Shoulder Press', 'Bicep Curls', 'Tricep Extensions', 'Leg Curls'
  ];

  useEffect(() => {
    if (user) {
      loadRecentWorkouts();
      loadSavedExercises();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const loadRecentWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const loadSavedExercises = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_saved_exercises')
        .select('name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const exerciseNames = data?.map(e => e.name) || [];
      setSavedExercises(exerciseNames);
    } catch (error) {
      console.error('Error loading saved exercises:', error);
    }
  };

  const startWorkout = () => {
    const newWorkout: WorkoutSession = {
      workout_name: `Workout ${new Date().toLocaleDateString()}`,
      duration_minutes: 0,
      exercises_data: [],
      session_date: new Date().toISOString().split('T')[0],
      notes: ''
    };
    
    setCurrentWorkout(newWorkout);
    setIsWorkoutActive(true);
    setWorkoutTimer(0);
    
    const interval = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resumeWorkout = () => {
    setIsWorkoutActive(true);
    const interval = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const addExercise = () => {
    if (!currentWorkout) return;
    
    const exerciseName = selectedExercise || customExerciseName;
    if (!exerciseName.trim()) {
      toast.error('Please select or enter an exercise name');
      return;
    }

    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: exerciseName,
      sets: [],
      notes: ''
    };

    setCurrentWorkout({
      ...currentWorkout,
      exercises_data: [...currentWorkout.exercises_data, newExercise]
    });

    setSelectedExercise('');
    setCustomExerciseName('');
  };

  const addSet = (exerciseId: string) => {
    if (!currentWorkout) return;

    const newSet: ExerciseSet = {
      id: crypto.randomUUID(),
      reps: 0,
      weight: 0,
      rpe: undefined,
      completed: false
    };

    setCurrentWorkout({
      ...currentWorkout,
      exercises_data: currentWorkout.exercises_data.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    });
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: any) => {
    if (!currentWorkout) return;

    setCurrentWorkout({
      ...currentWorkout,
      exercises_data: currentWorkout.exercises_data.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    });
  };

  const saveWorkout = async () => {
    if (!currentWorkout || !user) return;

    try {
      const duration = Math.floor(workoutTimer / 60);
      const workoutData = {
        ...currentWorkout,
        duration_minutes: duration,
        user_id: user.id
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert(workoutData);

      if (error) throw error;

      // Save progressive overload entries
      for (const exercise of currentWorkout.exercises_data) {
        for (const set of exercise.sets) {
          if (set.completed && set.weight > 0 && set.reps > 0) {
            await supabase
              .from('progressive_overload_entries')
              .insert({
                user_id: user.id,
                exercise_name: exercise.name,
                sets: 1,
                reps: set.reps,
                weight: set.weight,
                rpe: set.rpe,
                workout_date: currentWorkout.session_date
              });
          }
        }
      }

      setCurrentWorkout(null);
      setIsWorkoutActive(false);
      setWorkoutTimer(0);
      if (timerInterval) clearInterval(timerInterval);
      
      loadRecentWorkouts();
      toast.success('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppShell title="Workout Logger" showBackButton>
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-900/10 to-green-900/20 p-4 space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Workout Logger
            </h1>
          </div>
        </motion.div>

        <Tabs defaultValue={currentWorkout ? "active" : "start"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="start">Start Workout</TabsTrigger>
            <TabsTrigger value="active" disabled={!currentWorkout}>Active Workout</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="start" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Start New Workout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={startWorkout}
                    disabled={currentWorkout !== null}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Begin Workout
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Ready to crush your goals? Let's get started!
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {currentWorkout && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Workout Timer */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Timer className="h-5 w-5" />
                          <span className="text-lg font-semibold">Workout Time</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-400">
                          {formatTime(workoutTimer)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isWorkoutActive ? (
                          <Button onClick={pauseWorkout} variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button onClick={resumeWorkout} variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button onClick={saveWorkout} variant="default" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add Exercise */}
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Exercise
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-[100]">
                          {savedExercises.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                Your Saved Exercises
                              </div>
                              {savedExercises.map((exercise) => (
                                <SelectItem key={`saved-${exercise}`} value={exercise}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    {exercise}
                                  </div>
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                                Popular Exercises
                              </div>
                            </>
                          )}
                          {popularExercises.map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="Or type custom exercise"
                        value={customExerciseName}
                        onChange={(e) => setCustomExerciseName(e.target.value)}
                      />
                      
                      <Button onClick={addExercise} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise List */}
                <div className="space-y-4">
                  {currentWorkout.exercises_data.map((exercise, exerciseIndex) => (
                    <Card key={exercise.id} className="bg-card/50 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={set.id} className="grid grid-cols-5 gap-2 items-center p-2 bg-muted/30 rounded">
                            <span className="text-sm font-medium">Set {setIndex + 1}</span>
                            <Input
                              type="number"
                              placeholder="Weight"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                              className="h-8"
                            />
                            <Input
                              type="number"
                              placeholder="RPE"
                              min="1"
                              max="10"
                              value={set.rpe || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseInt(e.target.value) || undefined)}
                              className="h-8"
                            />
                            <Button
                              variant={set.completed ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                              className="h-8"
                            >
                              ✓
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          onClick={() => addSet(exercise.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Set
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentWorkouts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No workouts logged yet. Start your first workout!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentWorkouts.map((workout) => (
                        <div key={workout.id} className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{workout.workout_name}</h3>
                            <Badge variant="secondary">
                              {workout.duration_minutes}m
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(workout.session_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            {workout.exercises_data?.length || 0} exercises completed
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default WorkoutLogger;