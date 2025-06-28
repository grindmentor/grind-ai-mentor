import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Dumbbell, Save, Import, Settings, Trash2, Info, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { CustomExerciseModal } from '@/components/exercise/CustomExerciseModal';
import { useExerciseShare } from '@/contexts/ExerciseShareContext';
import { useUnitsPreference } from '@/hooks/useUnitsPreference';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  rpe: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
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

// Training tips and form cues for common exercises
const exerciseTips: { [key: string]: { formCues: string[]; tips: string[] } } = {
  'bench press': {
    formCues: ['Retract shoulder blades', 'Plant feet firmly', 'Arch back slightly', 'Lower bar to chest'],
    tips: ['Focus on controlled descent', 'Drive through heels', 'Keep wrists straight']
  },
  'squat': {
    formCues: ['Feet shoulder-width apart', 'Knees track over toes', 'Chest up, core tight', 'Hip hinge first'],
    tips: ['Go as deep as mobility allows', 'Drive through heels', 'Keep knees aligned']
  },
  'deadlift': {
    formCues: ['Bar close to shins', 'Straight back', 'Shoulders over bar', 'Hip hinge movement'],
    tips: ['Engage lats to keep bar close', 'Drive hips forward at top', 'Control the descent']
  },
  'pull-up': {
    formCues: ['Full hang at bottom', 'Pull chest to bar', 'Engage core', 'Control descent'],
    tips: ['Focus on lat engagement', 'Avoid swinging', 'Full range of motion']
  },
  'push-up': {
    formCues: ['Straight line from head to heels', 'Hands under shoulders', 'Core engaged', 'Full range'],
    tips: ['Lower chest to ground', 'Push through palms', 'Keep body rigid']
  }
};

export const WorkoutLoggerAI: React.FC<WorkoutLoggerAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sharedExercises, clearExercises } = useExerciseShare();
  const { units, loading: unitsLoading, formatWeight } = useUnitsPreference();
  const isMobile = useIsMobile();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savedExercises, setSavedExercises] = useState<SavedExercise[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [showRpeInfo, setShowRpeInfo] = useState(false);

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
  }, [sharedExercises, clearExercises]);

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
      sets: [{
        id: '1',
        reps: 10,
        weight: 0,
        rpe: 7
      }],
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
      sets: [{
        id: '1',
        reps: 10,
        weight: 0,
        rpe: 7
      }],
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
    loadSavedExercises();
    setShowCustomExerciseModal(false);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: [...ex.sets, {
              id: (ex.sets.length + 1).toString(),
              reps: 10,
              weight: ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].weight : 0,
              rpe: 7
            }]
          }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? {
            ...ex,
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, notes } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const getExerciseTips = (exerciseName: string) => {
    const key = exerciseName.toLowerCase();
    for (const tipKey in exerciseTips) {
      if (key.includes(tipKey)) {
        return exerciseTips[tipKey];
      }
    }
    return null;
  };

  const formatWeightDisplay = (weight: number) => {
    if (unitsLoading) return `${weight} kg`;
    return formatWeight(weight);
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

    // Check if all exercises have at least one set
    const exercisesWithoutSets = exercises.filter(ex => ex.sets.length === 0);
    if (exercisesWithoutSets.length > 0) {
      toast({
        title: 'Incomplete Exercises',
        description: 'All exercises must have at least one set.',
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
        sets: ex.sets.map((set, index) => ({
          id: `${ex.id}-set-${index + 1}`,
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe
        })),
        notes: ex.notes || ''
      }));

      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          session_date: new Date().toISOString().split('T')[0],
          duration_minutes: durationMinutes,
          exercises_data: exercisesForDb,
          notes: `Logged ${exercises.length} exercises with ${exercises.reduce((total, ex) => total + ex.sets.length, 0)} total sets`
        });

      if (sessionError) throw sessionError;

      // Log individual sets for progressive overload tracking
      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          await supabase
            .from('progressive_overload_entries')
            .insert({
              user_id: user.id,
              exercise_name: exercise.name,
              sets: 1, // Each entry represents one set
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe,
              notes: exercise.notes
            });
        }
      }

      const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);
      toast({
        title: 'Workout Logged! 💪',
        description: `Successfully logged ${exercises.length} exercises with ${totalSets} sets. Duration: ${durationMinutes} minutes.`
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
                  Advanced set-by-set tracking with RPE and form guidance
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

            {/* RPE Information */}
            <Card className="bg-blue-900/40 border-blue-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <Label className="text-blue-200 font-semibold">RPE (Rate of Perceived Exertion)</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRpeInfo(!showRpeInfo)}
                    className="text-blue-300 hover:bg-blue-700/30"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
                {showRpeInfo && (
                  <div className="space-y-2 text-sm text-blue-200/80">
                    <p className="mb-2">RPE measures how hard an exercise feels on a scale of 1-10:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div><strong>RPE 6-7:</strong> Could do 3-4 more reps</div>
                      <div><strong>RPE 8:</strong> Could do 2-3 more reps</div>
                      <div><strong>RPE 9:</strong> Could do 1 more rep</div>
                      <div><strong>RPE 10:</strong> Absolute maximum effort</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <div className="space-y-6">
                    {exercises.map((exercise) => {
                      const tips = getExerciseTips(exercise.name);
                      return (
                        <Card key={exercise.id} className="bg-blue-900/40 border-blue-500/40">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-white text-lg">{exercise.name}</h4>
                              <Button
                                onClick={() => removeExercise(exercise.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Sets */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-blue-200 font-medium">Sets</Label>
                                <Button
                                  onClick={() => addSet(exercise.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/50 text-blue-300 hover:bg-blue-700/30"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Set
                                </Button>
                              </div>
                              
                              {exercise.sets.map((set, index) => (
                                <div key={set.id} className="bg-blue-800/30 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-200 font-medium text-sm">Set {index + 1}</span>
                                    {exercise.sets.length > 1 && (
                                      <Button
                                        onClick={() => removeSet(exercise.id, set.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-blue-200 text-xs">Reps</Label>
                                      <Input
                                        type="number"
                                        value={set.reps}
                                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                        className="bg-blue-700/50 border-blue-500/30 text-white text-sm h-8"
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-blue-200 text-xs">Weight ({units.weightUnit})</Label>
                                      <Input
                                        type="number"
                                        step="0.5"
                                        value={set.weight}
                                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                        className="bg-blue-700/50 border-blue-500/30 text-white text-sm h-8"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-blue-200 text-xs">RPE</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={set.rpe}
                                        onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseInt(e.target.value) || 7)}
                                        className="bg-blue-700/50 border-blue-500/30 text-white text-sm h-8"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Form Tips */}
                            {tips && (
                              <div className="mb-4 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                                <h5 className="text-green-300 font-medium text-sm mb-2">Form Cues & Tips</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-green-400 font-medium">Form Cues:</span>
                                    <ul className="list-disc list-inside text-green-200/80 mt-1">
                                      {tips.formCues.map((cue, i) => <li key={i}>{cue}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="text-green-400 font-medium">Tips:</span>
                                    <ul className="list-disc list-inside text-green-200/80 mt-1">
                                      {tips.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Notes */}
                            <div>
                              <Label className="text-blue-200 text-xs">Exercise Notes (optional)</Label>
                              <Input
                                value={exercise.notes || ''}
                                onChange={(e) => updateExerciseNotes(exercise.id, e.target.value)}
                                placeholder="How did it feel? Form adjustments, etc."
                                className="bg-blue-800/50 border-blue-500/30 text-white text-sm placeholder:text-blue-400/50 mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
                        Log Workout ({exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets)
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
