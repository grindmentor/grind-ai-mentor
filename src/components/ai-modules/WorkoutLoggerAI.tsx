import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUserUnits } from '@/hooks/useUserUnits';
import WorkoutTemplateSelector from './WorkoutTemplateSelector';
import { useAppSync } from '@/utils/appSynchronization';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';
import {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  SessionHeader,
  ExerciseAddSection,
  ExerciseList,
  HistoryList,
  RIRInfoCard
} from '@/components/workout-logger';

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { units } = useUserUnits();
  const { invalidateCache, emit } = useAppSync();
  const [activeTab, setActiveTab] = useState('current');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [isLogging, setIsLogging] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<WorkoutSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

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
      setPreviousSessions((data || []) as WorkoutSession[]);
    } catch (error) {
      console.error('Error loading previous sessions:', error);
      toast.error('Failed to load previous sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const addExercise = useCallback((exerciseData: any) => {
    const exerciseName = typeof exerciseData === 'string' ? exerciseData : exerciseData.name;
    const newExercise: WorkoutExercise = {
      name: exerciseName,
      sets: [{ weight: '', reps: '', rpe: 7 }]
    };
    setExercises(prev => [...prev, newExercise]);
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | number) => {
    setExercises(prev => {
      const updated = [...prev];
      if (setIndex >= updated[exerciseIndex].sets.length) {
        updated[exerciseIndex].sets.push({ weight: '', reps: '', rpe: 7 });
      }
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value
      };
      return updated;
    });
  }, []);

  const removeExercise = useCallback((exerciseIndex: number) => {
    const exerciseToRemove = exercises[exerciseIndex];
    triggerHapticFeedback('light');
    
    setExercises(prev => prev.filter((_, index) => index !== exerciseIndex));
    
    toast.success(`${exerciseToRemove.name} removed`, {
      action: {
        label: 'Undo',
        onClick: () => {
          triggerHapticFeedback('light');
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
  }, [exercises]);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    const exerciseName = exercises[exerciseIndex]?.name;
    const removedSet = exercises[exerciseIndex]?.sets[setIndex];
    
    triggerHapticFeedback('light');
    
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, index) => index !== setIndex);
      if (updated[exerciseIndex].sets.length === 0) {
        updated.splice(exerciseIndex, 1);
      }
      return updated;
    });
    
    toast.success('Set removed', {
      action: {
        label: 'Undo',
        onClick: () => {
          triggerHapticFeedback('light');
          setExercises(prev => {
            const restored = [...prev];
            const existingIndex = restored.findIndex(e => e.name === exerciseName);
            if (existingIndex >= 0) {
              restored[existingIndex].sets.splice(setIndex, 0, removedSet);
            } else {
              restored.splice(exerciseIndex, 0, { name: exerciseName, sets: [removedSet] });
            }
            return restored;
          });
          toast.success('Set restored');
        }
      },
      duration: 3000,
    });
  }, [exercises]);

  const addSet = useCallback((exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets.push({ weight: '', reps: '', rpe: 7 });
      return updated;
    });
  }, []);

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
      const duration = Math.max(1, Math.floor((Date.now() - startTime) / (1000 * 60)));
      
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: duration,
          session_date: new Date().toISOString().split('T')[0],
          exercises_data: exercises,
          notes: workoutNotes
        });

      if (sessionError) throw sessionError;

      // Save individual exercise entries
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
                rpe: set.rpe,
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
      
      invalidateCache(`workout-sessions-${user.id}`);
      invalidateCache(`progress-data`);
      emit('workouts:updated', user.id);
      emit('progress:updated', user.id);
      
      toast.success(`Workout "${workoutName}" logged successfully!`);
      await loadPreviousSessions();

    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setIsLogging(false);
    }
  };

  const loadWorkoutFromSession = useCallback((session: WorkoutSession) => {
    if (!session.exercises_data) return;
    
    const loadedExercises = session.exercises_data.map((exercise: any) => ({
      name: exercise.name,
      sets: exercise.sets.map((set: any) => ({
        weight: set.weight || '',
        reps: set.reps || '',
        rpe: set.rpe || 7
      })),
      muscleGroup: exercise.muscleGroup
    }));
    
    setExercises(loadedExercises);
    setWorkoutName(session.workout_name);
    setActiveTab('current');
    toast.success(`Loaded: ${session.workout_name}`);
  }, []);

  const saveAsTemplate = useCallback(async (session: WorkoutSession) => {
    if (!user?.id || !session.exercises_data) {
      toast.error('No workout data to save as template');
      return;
    }

    try {
      const templateData = {
        user_id: user.id,
        name: `${session.workout_name} Template`,
        program_data: {
          exercises: session.exercises_data.map((exercise: any, index: number) => ({
            name: exercise.name || `Exercise ${index + 1}`,
            sets: exercise.sets?.length || 3,
            muscleGroup: exercise.muscleGroup || 'General',
            targetReps: exercise.sets?.[0]?.reps?.toString() || '8-12',
            notes: `Template from ${session.workout_name}`,
            targetWeight: exercise.sets?.[0]?.weight?.toString() || '',
            rpe: exercise.sets?.[0]?.rpe || 7
          }))
        },
        description: `Template created from "${session.workout_name}"`,
        difficulty_level: 'Intermediate',
        duration_weeks: 4
      };

      const { error } = await supabase
        .from('training_programs')
        .insert([templateData]);

      if (error) throw error;
      toast.success(`Template "${templateData.name}" saved!`);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  }, [user?.id]);

  const loadTemplateWorkout = useCallback((template: any) => {
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
  }, []);

  const deleteWorkoutSession = useCallback(async (sessionId: string) => {
    const sessionToDelete = previousSessions.find(s => s.id === sessionId);
    if (!sessionToDelete) return;
    
    triggerHapticFeedback('medium');
    setPreviousSessions(prev => prev.filter(s => s.id !== sessionId));
    
    toast.success('Workout deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          triggerHapticFeedback('light');
          setPreviousSessions(prev => [sessionToDelete, ...prev]);
          
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
      setPreviousSessions(prev => [sessionToDelete, ...prev]);
      triggerHapticFeedback('error');
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  }, [previousSessions, user?.id, invalidateCache, emit]);

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
            <SessionHeader
              workoutName={workoutName}
              workoutNotes={workoutNotes}
              startTime={startTime}
              onWorkoutNameChange={setWorkoutName}
              onWorkoutNotesChange={setWorkoutNotes}
            />

            <WorkoutTemplateSelector 
              onSelectTemplate={loadTemplateWorkout}
              className="mb-2"
            />

            <ExerciseAddSection
              userId={user?.id}
              onAddExercise={addExercise}
            />

            <div className="relative z-0">
              <ExerciseList
                exercises={exercises}
                weightUnit={units.weightUnit}
                onUpdateSet={updateSet}
                onRemoveExercise={removeExercise}
                onRemoveSet={removeSet}
                onAddSet={addSet}
              />
            </div>

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
            <HistoryList
              sessions={previousSessions}
              isLoading={isLoadingSessions}
              weightUnit={units.weightUnit}
              onLoadSession={loadWorkoutFromSession}
              onSaveAsTemplate={saveAsTemplate}
              onDeleteSession={deleteWorkoutSession}
            />
          </TabsContent>
        </Tabs>

        <RIRInfoCard />
      </div>
    </div>
  );
};

export default WorkoutLoggerAI;
