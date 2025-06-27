
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id: string;
  exercise_name: string;
  exercise_id?: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id?: string;
  user_id: string;
  workout_name: string;
  start_time: string;
  end_time?: string;
  session_date: string;
  exercises_data: WorkoutExercise[];
  notes?: string;
  duration_minutes?: number;
}

export const useWorkoutData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);

  // Load user's workout sessions
  const loadWorkoutSessions = async (limit: number = 10) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setWorkoutSessions(data || []);
    } catch (error) {
      console.error('Error loading workout sessions:', error);
      toast({
        title: 'Error loading workouts',
        description: 'Failed to load your workout history.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get previous weight for a specific exercise
  const getPreviousWeight = async (exerciseName: string): Promise<number | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('exercises_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Search through recent sessions to find the exercise
      for (const session of data || []) {
        const exercises = session.exercises_data as WorkoutExercise[];
        const foundExercise = exercises?.find(ex => 
          ex.exercise_name.toLowerCase() === exerciseName.toLowerCase()
        );
        
        if (foundExercise && foundExercise.sets?.length > 0) {
          // Return the highest weight from the most recent session
          const weights = foundExercise.sets
            .map(set => set.weight || 0)
            .filter(weight => weight > 0);
          
          if (weights.length > 0) {
            return Math.max(...weights);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting previous weight:', error);
      return null;
    }
  };

  // Save workout session
  const saveWorkoutSession = async (workoutData: Omit<WorkoutSession, 'user_id'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const sessionData = {
        ...workoutData,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert([sessionData]);

      if (error) throw error;

      toast({
        title: 'Workout saved! 🎉',
        description: 'Your workout has been successfully recorded.',
      });

      // Reload sessions to include the new one
      await loadWorkoutSessions();
      
      return true;
    } catch (error) {
      console.error('Error saving workout session:', error);
      toast({
        title: 'Error saving workout',
        description: 'Failed to save your workout. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Get workout statistics
  const getWorkoutStats = () => {
    const totalWorkouts = workoutSessions.length;
    const totalSets = workoutSessions.reduce((sum, session) => {
      return sum + session.exercises_data.reduce((exerciseSum, exercise) => {
        return exerciseSum + exercise.sets.length;
      }, 0);
    }, 0);

    const recentWorkouts = workoutSessions.slice(0, 5);
    
    return {
      totalWorkouts,
      totalSets,
      recentWorkouts
    };
  };

  useEffect(() => {
    if (user) {
      loadWorkoutSessions();
    }
  }, [user]);

  return {
    loading,
    workoutSessions,
    loadWorkoutSessions,
    getPreviousWeight,
    saveWorkoutSession,
    getWorkoutStats
  };
};
