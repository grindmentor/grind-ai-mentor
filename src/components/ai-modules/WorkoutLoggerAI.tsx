import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Dumbbell, 
  Clock, 
  Target, 
  Trash2,
  Calendar,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { useUserUnits } from '@/hooks/useUserUnits';
import WorkoutTemplateSelector from './WorkoutTemplateSelector';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { handleAsync } from '@/utils/errorHandler';
import { useAppSync } from '@/utils/appSynchronization';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

interface WorkoutSet {
  weight: string | number;
  reps: string | number;
  rpe?: number;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  muscleGroup?: string;
}

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { units } = useUserUnits();
  const { actions } = useGlobalState();
  const { getCache, setCache, invalidateCache, emit } = useAppSync();
  const [activeTab, setActiveTab] = useState('current');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [isLogging, setIsLogging] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseMuscles, setCustomExerciseMuscles] = useState('');
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState('');

  // Common muscle groups for search suggestions
  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 
    'Legs', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 
    'Core', 'Abs', 'Forearms', 'Lats', 'Traps'
  ];

  useEffect(() => {
    if (user) {
      loadPreviousSessions();
    }
  }, [user]);

  const loadPreviousSessions = async () => {
    if (!user?.id) return;

    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPreviousSessions(data || []);
    } catch (error) {
      console.error('Error loading previous sessions:', error);
      toast.error('Failed to load previous sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // RIR conversion helper - converts RPE to RIR equivalent
  const convertRPEtoRIR = (rpe: number): number => {
    // RPE 6-10 scale to RIR 4-0 scale
    // RPE 6 = RIR 4, RPE 7 = RIR 3, RPE 8 = RIR 2, RPE 9 = RIR 1, RPE 10 = RIR 0
    if (rpe >= 10) return 0;
    if (rpe >= 9) return 1;
    if (rpe >= 8) return 2;
    if (rpe >= 7) return 3;
    if (rpe >= 6) return 4;
    return 5; // For RPE < 6, assume 5+ RIR
  };

  const getRIRFromRPE = (rpe: number | null): number => {
    if (!rpe) return 3; // Default to RIR 3
    return convertRPEtoRIR(rpe);
  };

  const getRIRLabel = (rir: number): string => {
    switch (rir) {
      case 0: return 'Failure (0 RIR)';
      case 1: return 'Very Hard (1 RIR)';
      case 2: return 'Hard (2 RIR)';
      case 3: return 'Moderate (3 RIR)';
      case 4: return 'Easy (4 RIR)';
      default: return 'Very Easy (5+ RIR)';
    }
  };

  const getRIRColor = (rir: number): string => {
    switch (rir) {
      case 0: return 'text-red-400 bg-red-500/20';
      case 1: return 'text-orange-400 bg-orange-500/20';
      case 2: return 'text-yellow-400 bg-yellow-500/20';
      case 3: return 'text-blue-400 bg-blue-500/20';
      case 4: return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const addExercise = (exerciseData: any) => {
    let exerciseName = '';
    
    if (typeof exerciseData === 'string') {
      // Custom exercise name
      exerciseName = exerciseData;
    } else {
      // Exercise object from database
      exerciseName = exerciseData.name;
    }

    const newExercise: WorkoutExercise = {
      name: exerciseName,
      sets: [{ weight: '', reps: '', rpe: 7 }] // Default to RPE 7 (RIR 3)
    };
    setExercises([...exercises, newExercise]);
    setExerciseSearch('');
    setShowExerciseSearch(false);
    setShowCustomExerciseForm(false);
    setCustomExerciseName('');
    setCustomExerciseMuscles('');
    setCustomExerciseEquipment('');
  };

  const createCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    try {
      // Save custom exercise to database if user is logged in
      if (user?.id) {
        const muscles = customExerciseMuscles.split(',').map(m => m.trim()).filter(m => m);
        
        const { error } = await supabase
          .from('user_custom_exercises')
          .insert({
            user_id: user.id,
            name: customExerciseName,
            primary_muscles: muscles.length > 0 ? muscles : ['Other'],
            secondary_muscles: [],
            equipment: customExerciseEquipment || 'Unknown',
            category: 'Custom',
            difficulty_level: 'Beginner'
          });

        if (error) throw error;
        toast.success('Custom exercise created!');
      }

      // Add to current workout
      addExercise(customExerciseName);
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      // Still add to workout even if database save fails
      addExercise(customExerciseName);
      toast.error('Exercise added to workout, but failed to save for future use');
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | number) => {
    const updatedExercises = [...exercises];
    
    // If we're adding a new set
    if (setIndex >= updatedExercises[exerciseIndex].sets.length) {
      updatedExercises[exerciseIndex].sets.push({ weight: '', reps: '', rpe: 7 });
    }
    
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    
    setExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    const exerciseToRemove = exercises[exerciseIndex];
    
    // Trigger haptic feedback
    triggerHapticFeedback('light');
    
    // Optimistic remove
    setExercises(prev => prev.filter((_, index) => index !== exerciseIndex));
    
    // Show toast with undo (only for current workout being built, not DB)
    toast.success(`${exerciseToRemove.name} removed`, {
      action: {
        label: 'Undo',
        onClick: () => {
          triggerHapticFeedback('light');
          // Restore at original position
          setExercises(prev => {
            const newExercises = [...prev];
            newExercises.splice(exerciseIndex, 0, exerciseToRemove);
            return newExercises;
          });
          toast.success('Exercise restored');
        }
      },
      duration: 4000,
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    const removedSet = updatedExercises[exerciseIndex].sets[setIndex];
    const exerciseName = updatedExercises[exerciseIndex].name;
    
    // Trigger haptic
    triggerHapticFeedback('light');
    
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, index) => index !== setIndex);
    
    // If no sets left, remove the exercise
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setExercises(updatedExercises);
    
    // Show toast with undo
    toast.success('Set removed', {
      action: {
        label: 'Undo',
        onClick: () => {
          triggerHapticFeedback('light');
          setExercises(prev => {
            const restored = [...prev];
            // Find exercise or recreate it
            const existingExerciseIndex = restored.findIndex(e => e.name === exerciseName);
            if (existingExerciseIndex >= 0) {
              restored[existingExerciseIndex].sets.splice(setIndex, 0, removedSet);
            } else {
              // Exercise was removed, add it back
              restored.splice(exerciseIndex, 0, {
                name: exerciseName,
                sets: [removedSet],
                muscleGroup: exercises[exerciseIndex]?.muscleGroup
              });
            }
            return restored;
          });
          toast.success('Set restored');
        }
      },
      duration: 3000,
    });
  };

  const logWorkout = async () => {
    if (!user?.id || exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    setIsLogging(true);
    try {
      // Calculate total duration
      const duration = Math.max(1, Math.floor((Date.now() - startTime) / (1000 * 60)));
      
      // Save workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: duration,
          session_date: new Date().toISOString().split('T')[0],
          exercises_data: exercises,
          notes: workoutNotes
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save individual exercise entries (keeping RPE data, displaying as RIR)
      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          if (set.weight && set.reps) {
            await supabase
              .from('progressive_overload_entries')
              .insert({
                user_id: user.id,
                exercise_name: exercise.name,
                weight: parseFloat(set.weight.toString()),
                reps: parseInt(set.reps.toString()),
                sets: 1,
                rpe: set.rpe, // Keep storing as RPE in database
                workout_date: new Date().toISOString().split('T')[0],
                notes: `${workoutName} - Set ${exercise.sets.indexOf(set) + 1}`
              });
          }
        }
      }

      // Reset form
      setExercises([]);
      setWorkoutName('');
      setWorkoutNotes('');
      setStartTime(Date.now());
      
      // Invalidate related caches
      invalidateCache(`workout-sessions-${user.id}`);
      invalidateCache(`progress-data`);
      
      // Emit events for other components
      emit('workouts:updated', user.id);
      emit('progress:updated', user.id);
      
      toast.success(`Workout "${workoutName}" logged successfully!`);
      
      // Reload sessions
      await loadPreviousSessions();

    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setIsLogging(false);
    }
  };

  const ExerciseCard = ({ exercise, exerciseIndex }: { exercise: WorkoutExercise; exerciseIndex: number }) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">{exercise.name}</h3>
          <Button
            onClick={() => removeExercise(exerciseIndex)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {exercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="bg-muted/30 rounded-xl p-3 border border-border/30">
              <div className="grid grid-cols-5 gap-2 items-center">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Set</span>
                  <span className="text-foreground font-medium text-sm">{setIndex + 1}</span>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground block mb-1">{units.weightUnit}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground h-9 text-sm rounded-lg"
                    onBlur={(e) => e.target.blur()}
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground block mb-1">Reps</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground h-9 text-sm rounded-lg"
                    onBlur={(e) => e.target.blur()}
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground block mb-1">RIR</Label>
                  <Select
                    value={getRIRFromRPE(set.rpe).toString()}
                    onValueChange={(value) => {
                      const rir = parseInt(value);
                      const rpe = rir === 0 ? 10 : rir === 1 ? 9 : rir === 2 ? 8 : rir === 3 ? 7 : rir === 4 ? 6 : 5;
                      updateSet(exerciseIndex, setIndex, 'rpe', rpe);
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50 text-foreground h-9 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl z-50">
                      <SelectItem value="0" className="text-destructive">0</SelectItem>
                      <SelectItem value="1" className="text-orange-400">1</SelectItem>
                      <SelectItem value="2" className="text-yellow-400">2</SelectItem>
                      <SelectItem value="3" className="text-primary">3</SelectItem>
                      <SelectItem value="4" className="text-green-400">4</SelectItem>
                      <SelectItem value="5" className="text-muted-foreground">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={() => removeSet(exerciseIndex, setIndex)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button
            onClick={() => {
              const newSet = { weight: '', reps: '', rpe: 7 };
              updateSet(exerciseIndex, exercise.sets.length, 'weight', '');
            }}
            variant="outline"
            size="sm"
            className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl h-10 mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Set
          </Button>
        </div>
      </div>
    </div>
  );

  const loadWorkoutFromSession = (session: any) => {
    if (!session.exercises_data) return;
    
    // Load exercises from the session
    const loadedExercises = session.exercises_data.map((exercise: any) => ({
      name: exercise.name,
      sets: exercise.sets.map((set: any) => ({
        weight: '',
        reps: '',
        rpe: set.rpe || 7
      })),
      muscleGroup: exercise.muscleGroup
    }));
    
    setExercises(loadedExercises);
    // Generate a new workout name with today's date instead of (Copy)
    const today = new Date().toLocaleDateString();
    setWorkoutName(`${session.workout_name} - ${today}`);
    setActiveTab('current');
    toast.success(`Loaded workout: ${session.workout_name}`);
  };

  const saveAsTemplate = async (session: any) => {
    if (!user?.id || !session.exercises_data) {
      toast.error('No workout data to save as template');
      return;
    }

    try {
      // Validate exercises_data structure
      if (!Array.isArray(session.exercises_data) || session.exercises_data.length === 0) {
        throw new Error('Invalid workout data - no exercises found');
      }

      // Ensure session has required fields
      const workoutName = session.workout_name || 'Unnamed Workout';
      const sessionDate = session.session_date || new Date().toISOString().split('T')[0];

      const templateData = {
        user_id: user.id,
        name: `${workoutName} Template`,
        program_data: {
          exercises: session.exercises_data.map((exercise: any, index: number) => {
            // Robust data extraction with fallbacks
            const exerciseName = exercise.name || exercise.exercise_name || `Exercise ${index + 1}`;
            const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
            const targetReps = sets.length > 0 && sets[0].reps ? sets[0].reps.toString() : '8-12';
            
            return {
              name: exerciseName,
              sets: sets.length || 3,
              muscleGroup: exercise.muscleGroup || 'General',
              targetReps: targetReps,
              notes: `Template from ${workoutName}`,
              targetWeight: sets.length > 0 && sets[0].weight ? sets[0].weight.toString() : '',
              rpe: sets.length > 0 && sets[0].rpe ? sets[0].rpe : 7
            };
          })
        },
        description: `Template created from "${workoutName}" on ${new Date(sessionDate).toLocaleDateString()}`,
        difficulty_level: 'Intermediate',
        duration_weeks: 4
      };

      console.log('Saving template with data:', templateData);

      const { data, error } = await supabase
        .from('training_programs')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Template save error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      toast.success(`Template "${templateData.name}" saved successfully!`);
      return data;
    } catch (error) {
      console.error('Error saving template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save template: ${errorMessage}`);
      throw error;
    }
  };

  const loadTemplateWorkout = (template: any) => {
    if (!template.program_data?.exercises) return;
    
    const loadedExercises = template.program_data.exercises.map((exercise: any) => ({
      name: exercise.name,
      sets: Array(exercise.sets || 1).fill(null).map(() => ({
        weight: '',
        reps: '',
        rpe: 7
      })),
      muscleGroup: exercise.muscleGroup
    }));
    
    setExercises(loadedExercises);
    setWorkoutName(template.name.replace(' Template', ''));
    toast.success(`Loaded template: ${template.name}`);
  };

  const deleteWorkoutSession = async (sessionId: string) => {
    // Get the session for potential undo
    const sessionToDelete = previousSessions.find(s => s.id === sessionId);
    if (!sessionToDelete) return;
    
    // Trigger haptic feedback
    triggerHapticFeedback('medium');
    
    // Optimistic delete
    setPreviousSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Show toast with undo
    toast.success('Workout deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          triggerHapticFeedback('light');
          
          // Restore locally first
          setPreviousSessions(prev => [sessionToDelete, ...prev]);
          
          // Re-insert to database
          try {
            const { error } = await supabase
              .from('workout_sessions')
              .insert([{
                user_id: user?.id,
                workout_name: sessionToDelete.workout_name,
                workout_type: sessionToDelete.workout_type,
                duration_minutes: sessionToDelete.duration_minutes,
                exercises_data: sessionToDelete.exercises_data,
                notes: sessionToDelete.notes,
                session_date: sessionToDelete.session_date,
                calories_burned: sessionToDelete.calories_burned,
              }]);
            
            if (error) throw error;
            
            // Refresh to get new IDs
            loadPreviousSessions();
            toast.success('Workout restored');
          } catch (error) {
            console.error('Failed to restore workout:', error);
            setPreviousSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
            toast.error('Failed to restore workout');
          }
        }
      },
      duration: 5000,
    });

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      triggerHapticFeedback('success');
      invalidateCache(`workouts-${user?.id}`);
      emit('workouts:updated');
    } catch (error) {
      // Rollback on error
      setPreviousSessions(prev => [sessionToDelete, ...prev]);
      triggerHapticFeedback('error');
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const PreviousSessionCard = ({ session }: { session: any }) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-base truncate">{session.workout_name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(session.session_date).toLocaleDateString()} • {session.duration_minutes} min
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {session.exercises_data?.length || 0} exercises
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => loadWorkoutFromSession(session)}
            size="sm"
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-8 text-xs rounded-lg"
          >
            Reuse
          </Button>
          <Button
            onClick={() => saveAsTemplate(session)}
            size="sm"
            variant="outline"
            className="border-border/50 text-muted-foreground hover:bg-muted/30 h-8 text-xs rounded-lg"
          >
            Save Template
          </Button>
          <Button
            onClick={() => deleteWorkoutSession(session.id)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {session.exercises_data?.map((exercise: any, idx: number) => (
          <div key={idx} className="mb-3 last:mb-0">
            <h4 className="text-sm font-medium text-foreground mb-2">{exercise.name}</h4>
            <div className="space-y-1">
              {exercise.sets?.map((set: any, setIdx: number) => (
                <div key={setIdx} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30">
                  <span>Set {setIdx + 1}</span>
                  <span>{set.weight}{units.weightUnit} × {set.reps} reps</span>
                  {set.rpe && (
                    <Badge className={`${getRIRColor(getRIRFromRPE(set.rpe))} text-xs px-2 py-0.5 rounded-md`}>
                      {getRIRFromRPE(set.rpe)} RIR
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {session.notes && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-4 flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground">Workout Logger</h1>
            <p className="text-xs text-muted-foreground">Track sets, reps, and RIR</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div 
        className="p-4 space-y-5 pb-safe-bottom"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top) + 16px)' }}
      >
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border/50 rounded-xl h-11 p-1">
            <TabsTrigger 
              value="current" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-sm font-medium"
            >
              Current Workout
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-sm font-medium"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 mt-0">
            {/* Workout Header */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workout-name" className="text-foreground mb-2 block text-sm font-medium">
                    Workout Name
                  </Label>
                  <Input
                    id="workout-name"
                    placeholder="e.g., Push Day, Leg Day"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground rounded-xl h-11"
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Duration: {Math.floor((Date.now() - startTime) / (1000 * 60))} min
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="workout-notes" className="text-foreground mb-2 block text-sm font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="workout-notes"
                  placeholder="How did the workout feel? Any observations?"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="bg-background/50 border-border/50 text-foreground rounded-xl resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Template Selector */}
            <WorkoutTemplateSelector 
              onSelectTemplate={loadTemplateWorkout}
              className="mb-2"
            />

            {/* Add Exercise */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold text-sm">Add Exercise</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                    size="sm"
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-8 text-xs rounded-lg"
                  >
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    Browse
                  </Button>
                  <Button
                    onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
                    size="sm"
                    variant="outline"
                    className="border-border/50 text-muted-foreground hover:bg-muted/30 h-8 text-xs rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Custom
                  </Button>
                </div>
              </div>

              {showExerciseSearch && (
                <div className="mb-4 relative z-20">
                  <ExerciseSearch
                    onExerciseSelect={addExercise}
                    placeholder="Search exercises or muscle groups..."
                    className="mb-3"
                  />
                </div>
              )}

              {showCustomExerciseForm && (
                <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/30">
                  <h4 className="text-foreground font-medium text-sm">Create Custom Exercise</h4>
                  
                  <div>
                    <Label className="text-muted-foreground text-xs mb-1.5 block">Exercise Name *</Label>
                    <Input
                      placeholder="e.g., Cable Lateral Raises"
                      value={customExerciseName}
                      onChange={(e) => setCustomExerciseName(e.target.value)}
                      className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-xs mb-1.5 block">Primary Muscles (optional)</Label>
                    <Input
                      placeholder="e.g., Shoulders, Chest"
                      value={customExerciseMuscles}
                      onChange={(e) => setCustomExerciseMuscles(e.target.value)}
                      className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-xs mb-1.5 block">Equipment (optional)</Label>
                    <Input
                      placeholder="e.g., Cable Machine"
                      value={customExerciseEquipment}
                      onChange={(e) => setCustomExerciseEquipment(e.target.value)}
                      className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={createCustomExercise}
                      size="sm"
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 h-9 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create & Add
                    </Button>
                    <Button
                      onClick={() => setShowCustomExerciseForm(false)}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Exercises */}
            <div className="relative z-0">
              {exercises.length === 0 ? (
                <div className="bg-card/30 border border-border/30 rounded-2xl p-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-base font-medium text-foreground mb-2">No Exercises Added</h3>
                  <p className="text-muted-foreground text-sm">Add your first exercise to start logging your workout.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <ExerciseCard key={index} exercise={exercise} exerciseIndex={index} />
                  ))}
                </div>
              )}
            </div>

            {/* Log Workout Button */}
            {exercises.length > 0 && (
              <Button
                onClick={logWorkout}
                disabled={isLogging || !workoutName.trim()}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
              >
                {isLogging ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Logging...</span>
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Log Workout
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Previous Sessions</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {previousSessions.length} logged
              </Badge>
            </div>

            {isLoadingSessions ? (
              <div className="p-8 flex justify-center">
                <LoadingSpinner size="lg" text="Loading workout history..." />
              </div>
            ) : previousSessions.length === 0 ? (
              <div className="bg-card/30 border border-border/30 rounded-2xl p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-base font-medium text-foreground mb-2">No Previous Sessions</h3>
                <p className="text-muted-foreground text-sm">Start logging workouts to see your training history here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {previousSessions.map((session) => (
                  <PreviousSessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>
      </Tabs>

      {/* RIR Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-foreground font-semibold mb-2 text-sm">About RIR (Reps in Reserve)</h3>
            <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
              RIR indicates how many more reps you could have performed. It's a more intuitive way to track effort than RPE.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-destructive">• 0 RIR: Absolute failure</div>
              <div className="text-orange-400">• 1 RIR: Very close to failure</div>
              <div className="text-yellow-400">• 2 RIR: Hard, 2 reps left</div>
              <div className="text-primary">• 3+ RIR: Moderate effort</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WorkoutLoggerAI;
