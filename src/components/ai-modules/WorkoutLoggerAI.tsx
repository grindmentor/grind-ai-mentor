
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Dumbbell, Save, Import, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { CustomExerciseModal } from '@/components/exercise/CustomExerciseModal';
import { useExerciseShare } from '@/contexts/ExerciseShareContext';
import { useUserUnits } from '@/hooks/useUserUnits';
import { convertWeight, formatWeight } from '@/lib/unitConversions';
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

interface SavedExercise {
  id: string;
  name: string;
  description?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  category: string;
  is_custom: boolean;
}

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

export const WorkoutLoggerAI: React.FC<WorkoutLoggerAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sharedExercises, clearExercises } = useExerciseShare();
  const { units, loading: unitsLoading } = useUserUnits();
  const isMobile = useIsMobile();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savedExercises, setSavedExercises] = useState<SavedExercise[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [sessionStartTime] = useState(new Date());

  // Load saved exercises (both custom and imported from Blueprint AI)
  useEffect(() => {
    loadSavedExercises();
  }, [user]);

  // Import shared exercises from Blueprint AI and save them
  useEffect(() => {
    if (sharedExercises.length > 0) {
      saveImportedExercises(sharedExercises);
      clearExercises();
    }
  }, [sharedExercises, clearExercises, toast]);

  const loadSavedExercises = async () => {
    if (!user) return;

    try {
      // Load custom exercises
      const { data: customExercises, error: customError } = await supabase
        .from('user_custom_exercises')
        .select('*')
        .eq('user_id', user.id);

      if (customError) throw customError;

      // Load imported exercises from Blueprint AI
      const { data: importedExercises, error: importedError } = await supabase
        .from('user_saved_exercises')
        .select('*')
        .eq('user_id', user.id);

      if (importedError && importedError.code !== 'PGRST116') {
        console.error('Error loading imported exercises:', importedError);
      }

      const allSavedExercises: SavedExercise[] = [
        ...(customExercises || []).map(ex => ({ ...ex, is_custom: true })),
        ...(importedExercises || []).map(ex => ({ ...ex, is_custom: false }))
      ];

      setSavedExercises(allSavedExercises);
    } catch (error) {
      console.error('Error loading saved exercises:', error);
    }
  };

  const saveImportedExercises = async (exercisesToSave: any[]) => {
    if (!user) return;

    try {
      const exercisesData = exercisesToSave.map(ex => ({
        user_id: user.id,
        name: ex.name,
        description: ex.description || '',
        primary_muscles: ex.primary_muscles || [],
        secondary_muscles: ex.secondary_muscles || [],
        equipment: ex.equipment || 'Bodyweight',
        difficulty_level: ex.difficulty_level || 'Beginner',
        category: ex.category || 'Strength'
      }));

      const { error } = await supabase
        .from('user_saved_exercises')
        .upsert(exercisesData, { 
          onConflict: 'user_id,name',
          ignoreDuplicates: true 
        });

      if (error) throw error;

      toast({
        title: 'Exercises Saved! 💪',
        description: `Added ${exercisesToSave.length} exercises to your saved exercises.`
      });

      loadSavedExercises();
    } catch (error) {
      console.error('Error saving imported exercises:', error);
      toast({
        title: 'Error',
        description: 'Failed to save exercises. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const addExerciseFromSaved = (savedExercise: SavedExercise) => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(),
      name: savedExercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      rpe: 7,
      notes: ''
    };
    
    setExercises(prev => [...prev, newExercise]);
    
    toast({
      title: 'Exercise Added! 💪',
      description: `${savedExercise.name} has been added to your workout.`
    });
  };

  const removeSavedExercise = async (exerciseId: string, isCustom: boolean) => {
    if (!user) return;

    try {
      const tableName = isCustom ? 'user_custom_exercises' : 'user_saved_exercises';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      
      toast({
        title: 'Exercise Removed',
        description: 'Exercise has been removed from your saved exercises.'
      });
    } catch (error) {
      console.error('Error removing saved exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove exercise. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const addExercise = (exerciseData: any) => {
    console.log('Adding exercise:', exerciseData);
    
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
    
    toast({
      title: 'Exercise Added! 💪',
      description: `${newExercise.name} has been added to your workout.`
    });
  };

  const handleCustomExerciseCreated = (exercise: any) => {
    addExercise(exercise);
    loadSavedExercises(); // Refresh saved exercises list
    setShowCustomExerciseModal(false);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const formatWeightDisplay = (weight: number) => {
    if (unitsLoading) return `${weight} lbs`;
    return formatWeight(weight, units.weightUnit);
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
      const sessionEndTime = new Date();
      const durationMinutes = Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60));

      const exercisesForDb = exercises.map(ex => ({
        exercise_name: ex.name,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          id: `${ex.id}-set-${i + 1}`,
          reps: ex.reps,
          weight: ex.weight
        })),
        notes: ex.notes || '',
        rpe: ex.rpe || null
      }));

      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          session_date: new Date().toISOString().split('T')[0],
          duration_minutes: durationMinutes,
          exercises_data: exercisesForDb,
          notes: `Logged ${exercises.length} exercises`
        });

      if (sessionError) throw sessionError;

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
        description: `Successfully logged ${exercises.length} exercises. Duration: ${durationMinutes} minutes.`
      });

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

            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-900/40 border-blue-500/30">
                <TabsTrigger value="current" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Current Workout
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Saved Exercises
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-200">Exercises</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCustomExerciseModal(true)}
                      variant="outline"
                      className="border-blue-500/50 text-blue-300 hover:bg-blue-700/30"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Custom
                    </Button>
                    <Button
                      onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                </div>

                {showExerciseSearch && (
                  <Card className="bg-blue-900/40 border-blue-500/40">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Label className="text-blue-200">Search Exercises</Label>
                        <ExerciseSearch
                          onExerciseSelect={addExercise}
                          placeholder="Search for exercises..."
                          className="w-full"
                        />
                      </div>
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
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                              <Label className="text-blue-200 text-xs">Weight ({units.weightUnit})</Label>
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
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-200">
                    Saved Exercises ({savedExercises.length})
                  </h3>
                </div>

                {savedExercises.length === 0 ? (
                  <div className="text-center py-8 text-blue-300/70">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
                    <p>No saved exercises yet.</p>
                    <p className="text-sm mt-2">Create custom exercises or import from Blueprint AI to see them here.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {savedExercises.map((savedExercise) => (
                      <Card key={savedExercise.id} className="bg-blue-900/40 border-blue-500/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{savedExercise.name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    savedExercise.is_custom 
                                      ? 'border-green-400/30 text-green-300 bg-green-500/10' 
                                      : 'border-blue-400/30 text-blue-300 bg-blue-500/10'
                                  }`}
                                >
                                  {savedExercise.is_custom ? 'Custom' : 'Blueprint AI'}
                                </Badge>
                              </div>
                              
                              {savedExercise.description && (
                                <p className="text-blue-200/70 text-sm mb-2">{savedExercise.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                {savedExercise.primary_muscles.slice(0, 3).map((muscle, index) => (
                                  <Badge 
                                    key={index}
                                    variant="outline" 
                                    className="text-xs border-blue-400/20 text-blue-300 bg-blue-500/5"
                                  >
                                    {muscle}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-blue-200/60">
                                <span>{savedExercise.equipment}</span>
                                <span>{savedExercise.difficulty_level}</span>
                                <span>{savedExercise.category}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => addExerciseFromSaved(savedExercise)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                              <Button
                                onClick={() => removeSavedExercise(savedExercise.id, savedExercise.is_custom)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CustomExerciseModal
        isOpen={showCustomExerciseModal}
        onClose={() => setShowCustomExerciseModal(false)}
        onExerciseCreated={handleCustomExerciseCreated}
      />
    </div>
  );
};

export default WorkoutLoggerAI;
