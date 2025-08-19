import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const DataPersistence: React.FC = () => {
  const { user } = useAuth();

  // Auto-save user actions to database
  const persistUserAction = useCallback(async (
    action: string, 
    data: any, 
    tableName: string
  ) => {
    if (!user) return;

    const actionData = {
      ...data,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from(tableName)
        .insert(actionData);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to persist data:', error);
      // Store in localStorage for retry later
      const offlineData = JSON.parse(localStorage.getItem('offline_data') || '[]');
      offlineData.push({ tableName, data: actionData, timestamp: Date.now() });
      localStorage.setItem('offline_data', JSON.stringify(offlineData));
    }
  }, [user]);

  // Process offline data when coming online
  const processOfflineData = useCallback(async () => {
    const offlineData = JSON.parse(localStorage.getItem('offline_data') || '[]');
    if (offlineData.length === 0) return;

    for (const item of offlineData) {
      try {
        await supabase.from(item.tableName).insert(item.data);
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    }
    
    // Clear processed data
    localStorage.removeItem('offline_data');
  }, []);

  // Listen for data persistence events
  useEffect(() => {
    const handleWorkoutSave = (event: CustomEvent) => {
      persistUserAction('workout-save', event.detail, 'workout_sessions');
    };

    const handleFoodLogSave = (event: CustomEvent) => {
      persistUserAction('food-log', event.detail, 'food_log_entries');
    };

    const handleProgressUpdate = (event: CustomEvent) => {
      persistUserAction('progress-update', event.detail, 'progress_photos');
    };

    const handleGoalUpdate = (event: CustomEvent) => {
      persistUserAction('goal-update', event.detail, 'user_goals');
    };

    const handlePreferenceUpdate = (event: CustomEvent) => {
      persistUserAction('preference-update', event.detail, 'user_preferences');
    };

    const handleHabitCompletion = (event: CustomEvent) => {
      persistUserAction('habit-completion', event.detail, 'habit_completions');
    };

    // Listen for custom persistence events
    window.addEventListener('workout-save', handleWorkoutSave as EventListener);
    window.addEventListener('food-log-save', handleFoodLogSave as EventListener);
    window.addEventListener('progress-update', handleProgressUpdate as EventListener);
    window.addEventListener('goal-update', handleGoalUpdate as EventListener);
    window.addEventListener('preference-update', handlePreferenceUpdate as EventListener);
    window.addEventListener('habit-completion', handleHabitCompletion as EventListener);

    return () => {
      window.removeEventListener('workout-save', handleWorkoutSave as EventListener);
      window.removeEventListener('food-log-save', handleFoodLogSave as EventListener);
      window.removeEventListener('progress-update', handleProgressUpdate as EventListener);
      window.removeEventListener('goal-update', handleGoalUpdate as EventListener);
      window.removeEventListener('preference-update', handlePreferenceUpdate as EventListener);
      window.removeEventListener('habit-completion', handleHabitCompletion as EventListener);
    };
  }, [persistUserAction]);

  // Auto-sync preferences on changes
  useEffect(() => {
    const syncPreferences = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          localStorage.setItem('user-preferences', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to sync preferences:', error);
      }
    };

    syncPreferences();
  }, [user]);

  // Process offline data when online
  useEffect(() => {
    const handleOnline = () => {
      processOfflineData();
    };

    window.addEventListener('online', handleOnline);
    
    // Process any existing offline data
    if (navigator.onLine) {
      processOfflineData();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [processOfflineData]);

  // Periodic sync for critical data
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          localStorage.setItem('user-profile', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to sync profile data:', error);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user]);

  return null; // This is a background data persistence service
};

// Utility functions for triggering data persistence
export const persistWorkout = (workoutData: any) => {
  window.dispatchEvent(new CustomEvent('workout-save', { detail: workoutData }));
};

export const persistFoodLog = (foodData: any) => {
  window.dispatchEvent(new CustomEvent('food-log-save', { detail: foodData }));
};

export const persistProgress = (progressData: any) => {
  window.dispatchEvent(new CustomEvent('progress-update', { detail: progressData }));
};

export const persistGoal = (goalData: any) => {
  window.dispatchEvent(new CustomEvent('goal-update', { detail: goalData }));
};

export const persistPreference = (preferenceData: any) => {
  window.dispatchEvent(new CustomEvent('preference-update', { detail: preferenceData }));
};

export const persistHabitCompletion = (habitData: any) => {
  window.dispatchEvent(new CustomEvent('habit-completion', { detail: habitData }));
};

export default DataPersistence;