import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { backgroundSync } from '@/services/backgroundSyncService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Hook for saving data with offline support
export const useOfflineData = () => {
  const { user } = useAuth();

  // Save workout session with offline support
  const saveWorkout = useCallback(async (workoutData: {
    workout_name: string;
    duration_minutes: number;
    workout_type?: string;
    calories_burned?: number;
    exercises_data?: any;
    notes?: string;
    session_date?: string;
  }) => {
    const data = {
      ...workoutData,
      id: crypto.randomUUID(),
      session_date: workoutData.session_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      // Queue for later sync
      await backgroundSync.queueForSync('workout-save', data, user?.id);
      toast.info('Workout saved offline', {
        description: 'Will sync when back online'
      });
      return { data, offline: true };
    }

    // Try to save directly
    try {
      const { data: savedData, error } = await supabase
        .from('workout_sessions')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return { data: savedData, offline: false };
    } catch (error) {
      // Queue for retry
      await backgroundSync.queueForSync('workout-save', data, user?.id);
      toast.warning('Saved locally', {
        description: 'Will sync when connection improves'
      });
      return { data, offline: true };
    }
  }, [user?.id]);

  // Save food log with offline support
  const saveFoodLog = useCallback(async (foodData: {
    food_name: string;
    meal_type: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    portion_size?: string;
    logged_date?: string;
  }) => {
    const data = {
      ...foodData,
      id: crypto.randomUUID(),
      logged_date: foodData.logged_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      await backgroundSync.queueForSync('food-log', data, user?.id);
      toast.info('Food logged offline', {
        description: 'Will sync when back online'
      });
      return { data, offline: true };
    }

    try {
      const { data: savedData, error } = await supabase
        .from('food_log_entries')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return { data: savedData, offline: false };
    } catch (error) {
      await backgroundSync.queueForSync('food-log', data, user?.id);
      toast.warning('Saved locally', {
        description: 'Will sync when connection improves'
      });
      return { data, offline: true };
    }
  }, [user?.id]);

  // Save recovery data with offline support
  const saveRecoveryData = useCallback(async (recoveryData: {
    sleep_hours?: number;
    sleep_quality?: number;
    energy_level?: number;
    soreness_level?: number;
    stress_level?: number;
    notes?: string;
    recorded_date?: string;
  }) => {
    const data = {
      ...recoveryData,
      id: crypto.randomUUID(),
      recorded_date: recoveryData.recorded_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      await backgroundSync.queueForSync('recovery-data', data, user?.id);
      toast.info('Recovery data saved offline');
      return { data, offline: true };
    }

    try {
      const { data: savedData, error } = await supabase
        .from('recovery_data')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return { data: savedData, offline: false };
    } catch (error) {
      await backgroundSync.queueForSync('recovery-data', data, user?.id);
      return { data, offline: true };
    }
  }, [user?.id]);

  // Save progress entry with offline support
  const saveProgressEntry = useCallback(async (progressData: {
    exercise_name: string;
    sets: number;
    reps: number;
    weight: number;
    rpe?: number;
    notes?: string;
    workout_date?: string;
  }) => {
    const data = {
      ...progressData,
      id: crypto.randomUUID(),
      workout_date: progressData.workout_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      await backgroundSync.queueForSync('progress-entry', data, user?.id);
      toast.info('Progress saved offline');
      return { data, offline: true };
    }

    try {
      const { data: savedData, error } = await supabase
        .from('progressive_overload_entries')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return { data: savedData, offline: false };
    } catch (error) {
      await backgroundSync.queueForSync('progress-entry', data, user?.id);
      return { data, offline: true };
    }
  }, [user?.id]);

  return {
    saveWorkout,
    saveFoodLog,
    saveRecoveryData,
    saveProgressEntry,
    isOnline: navigator.onLine
  };
};

export default useOfflineData;
