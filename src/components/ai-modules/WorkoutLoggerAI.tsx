
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Dumbbell, Clock, Target, Zap, Save, Import } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { useExerciseShare } from '@/contexts/ExerciseShareContext';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;
  notes?: string;
}

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

export const WorkoutLoggerAI: React.FC<WorkoutLoggerAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sharedExercises, clearExercises } = useExerciseShare();
  const isMobile = useIsMobile();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);

  // Import shared exercises on component mount
  useEffect(() => {
    if (sharedExercises.length > 0) {
      const importedExercises = sharedExercises.map(ex => ({
        id: Date.now().toString() + Math.random().toString(),
        name: ex.name,
        sets: 3,
        reps: 10,
        weight: 0,
        rpe: 7,
        notes: ''
      }));
      setExercises(prev => [...prev, ...importedExercises]);
      
      toast({
        title: 'Exercises Imported! 💪',
        description: `Added ${sharedExercises.length} exercises from Blueprint AI.`
      });
      
      clearExercises();
    }
  }, [sharedExercises, clearExercises, toast]);

  const addExercise = (exerciseData: any) => {
    // Handle both string and object exercise data
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(),
      name: typeof exerciseData === 'string' ? exerciseData : exerciseData.name,
      sets: 3,
      reps: 10,
      weight: 0,
      rpe: 7,
      notes: ''
    };
    setExercises(prev => [...prev, newExercise]);
    setShowExerciseSearch(false);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const logWorkout = async () => {
    if (!user || !workoutName.trim() || exercises.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please add workout name and at least one exercise.',
        variant: 'destructive'
      });
      return;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: 60, // Default duration
          exercises_data: exercises,
          notes: `Logged ${exercises.length} exercises`
        });

      if (error) throw error;

      // Log individual exercise entries for progressive overload tracking
      for (const exercise of exercises) {
        await supabase
          .from('progressive_overload_entries')
          .insert({
            user_id: user.id,
            exercise_name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rpe: exercise.rpe,
            notes: exercise.notes
          });
      }

      toast({
        title: 'Workout Logged! 💪',
        description: `Successfully logged ${exercises.length} exercises.`
      });

      // Reset form
      setWorkoutName('');
      setExercises([]);
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log workout. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
      <MobileHeader 
        title="Workout Logger AI" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Dumbbell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Workout Logger AI</CardTitle>
                <CardDescription className="text-blue-200/80">
                  Log your workouts with intelligent exercise tracking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-blue-200">Workout Name</Label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Full Body"
                className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-200">Exercises</h3>
                <Button
                  onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {showExerciseSearch && (
                <Card className="bg-blue-900/40 border-blue-500/40">
                  <CardContent className="p-4">
                    <ExerciseSearch
                      onExerciseSelect={addExercise}
                      placeholder="Search for exercises..."
                    />
                  </CardContent>
                </Card>
              )}

              {exercises.length === 0 ? (
                <div className="text-center py-8 text-blue-300/70">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
                  <p>No exercises added yet. Search and add exercises to start logging your workout.</p>
                  {sharedExercises.length > 0 && (
                    <p className="mt-2 text-blue-400">
                      <Import className="w-4 h-4 inline mr-1" />
                      {sharedExercises.length} exercises ready to import from Blueprint AI
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <Card key={exercise.id} className="bg-blue-900/40 border-blue-500/40">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{exercise.name}</h4>
                          <Button
                            onClick={() => removeExercise(exercise.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-blue-200 text-xs">Sets</Label>
                            <Input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                              className="bg-blue-800/50 border-blue-500/30 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-blue-200 text-xs">Reps</Label>
                            <Input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                              className="bg-blue-800/50 border-blue-500/30 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-blue-200 text-xs">Weight (lbs)</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                              className="bg-blue-800/50 border-blue-500/30 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-blue-200 text-xs">RPE</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={exercise.rpe}
                              onChange={(e) => updateExercise(exercise.id, 'rpe', parseInt(e.target.value) || 7)}
                              className="bg-blue-800/50 border-blue-500/30 text-white text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label className="text-blue-200 text-xs">Notes (optional)</Label>
                          <Input
                            value={exercise.notes || ''}
                            onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                            placeholder="Form notes, how it felt, etc."
                            className="bg-blue-800/50 border-blue-500/30 text-white text-sm placeholder:text-blue-400/50"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {exercises.length > 0 && (
              <Button
                onClick={logWorkout}
                disabled={isLogging || !workoutName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3"
              >
                {isLogging ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Logging Workout...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Log Workout
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutLoggerAI;
