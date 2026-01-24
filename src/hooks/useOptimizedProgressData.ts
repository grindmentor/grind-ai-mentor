import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Timeout wrapper for Supabase queries
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

export const useOptimizedProgressData = (userId: string | null) => {
  return useQuery({
    queryKey: ['optimizedProgressData', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        // Optimized queries - fetch concurrently with timeout protection
        const [workoutData, progressEntriesData, recoveryData, goalsData, profileData, foodLogData] = await withTimeout(
          Promise.all([
            // Fetch recent workout sessions
            supabase
              .from('workout_sessions')
              .select('id, workout_name, session_date, duration_minutes')
              .eq('user_id', userId)
              .order('session_date', { ascending: false })
              .limit(20),
            
            // Also fetch progressive_overload_entries for workout data
            supabase
              .from('progressive_overload_entries')
              .select('exercise_name, weight, sets, reps, workout_date, rpe, created_at')
              .eq('user_id', userId)
              .order('workout_date', { ascending: false })
              .limit(20),
            
            // Only fetch last 14 days of recovery data for trends
            supabase
              .from('recovery_data')
              .select('sleep_hours, sleep_quality, energy_level, stress_level, recorded_date')
              .eq('user_id', userId)
              .order('recorded_date', { ascending: false })
              .limit(14),
            
            // Fetch active goals with progress tracking
            supabase
              .from('user_goals')
              .select('id, title, target_value, current_value, status, category, created_at, deadline')
              .eq('user_id', userId)
              .order('created_at', { ascending: false }),

            // Fetch user profile for body metrics
            supabase
              .from('profiles')
              .select('weight, height, goal, experience, body_fat_percentage')
              .eq('id', userId)
              .maybeSingle(),

            // Fetch recent food logs
            supabase
              .from('food_log_entries')
              .select('food_name, calories, protein, carbs, fat, logged_date')
              .eq('user_id', userId)
              .order('logged_date', { ascending: false })
              .limit(10)
          ]),
          10000 // 10 second timeout
        );

        // Handle errors gracefully - don't throw, just log
        if (workoutData.error) console.warn('Workout data error:', workoutData.error);
        if (progressEntriesData.error) console.warn('Progress entries error:', progressEntriesData.error);
        if (recoveryData.error) console.warn('Recovery data error:', recoveryData.error);
        if (goalsData.error) console.warn('Goals data error:', goalsData.error);
        if (profileData.error) console.warn('Profile data error:', profileData.error);
        if (foodLogData.error) console.warn('Food log data error:', foodLogData.error);

        // Combine workouts from both sources
        const progressEntries = progressEntriesData.data || [];
        const workoutSessions = workoutData.data || [];
        
        // Map workout sessions to a compatible format if needed
        const combinedWorkouts = progressEntries.length > 0 ? progressEntries : 
          workoutSessions.map(s => ({
            exercise_name: s.workout_name,
            weight: 0,
            sets: 1,
            reps: 1,
            workout_date: s.session_date,
            rpe: null,
            created_at: s.session_date
          }));

        return {
          workouts: combinedWorkouts,
          recovery: recoveryData.data || [],
          goals: goalsData.data || [],
          profile: profileData.data || null,
          foodLogs: foodLogData.data || []
        };
      } catch (error) {
        console.error('Progress data fetch failed:', error);
        // Return empty data rather than throwing to prevent UI crashes
        return {
          workouts: [],
          recovery: [],
          goals: [],
          profile: null,
          foodLogs: []
        };
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes cache  
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1, // Reduced retries for faster failure
    retryDelay: 1000, // 1 second retry delay
  });
};

// Hook for muscle group calculations
export const useMuscleGroupProgress = (workouts: any[]) => {
  if (!workouts || !Array.isArray(workouts)) {
    return {};
  }
  
  return workouts.reduce((acc, workout) => {
    if (!workout || !workout.exercise_name) return acc;
    
    const muscleGroup = getMuscleGroupFromExercise(workout.exercise_name);
    if (!acc[muscleGroup]) {
      acc[muscleGroup] = { totalVolume: 0, sessions: 0 };
    }
    acc[muscleGroup].totalVolume += (workout.weight || 0) * (workout.sets || 0) * (workout.reps || 0);
    acc[muscleGroup].sessions += 1;
    return acc;
  }, {});
};

// Helper function to map exercises to muscle groups
const getMuscleGroupFromExercise = (exerciseName: string): string => {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('bench') || name.includes('chest') || name.includes('push up')) return 'chest';
  if (name.includes('squat') || name.includes('leg') || name.includes('quad')) return 'legs';
  if (name.includes('deadlift') || name.includes('row') || name.includes('pull')) return 'back';
  if (name.includes('press') || name.includes('shoulder') || name.includes('lateral')) return 'shoulders';
  if (name.includes('curl') || name.includes('tricep') || name.includes('bicep')) return 'arms';
  if (name.includes('plank') || name.includes('crunch') || name.includes('abs')) return 'core';
  
  return 'other';
};