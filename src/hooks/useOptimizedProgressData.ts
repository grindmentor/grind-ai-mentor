import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProgressData = (userId: string | null) => {
  return useQuery({
    queryKey: ['optimizedProgressData', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Optimized queries - fetch concurrently with better error handling
      const [workoutData, recoveryData, goalsData, profileData] = await Promise.all([
        // Only fetch last 20 workouts for better calculations
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
          .single()
      ]);

      // Handle errors gracefully - don't throw, just log and return empty data
      if (workoutData.error) {
        console.warn('Workout data error:', workoutData.error);
      }
      if (recoveryData.error) {
        console.warn('Recovery data error:', recoveryData.error);
      }
      if (goalsData.error) {
        console.warn('Goals data error:', goalsData.error);
      }
      if (profileData.error) {
        console.warn('Profile data error:', profileData.error);
      }

      return {
        workouts: workoutData.data || [],
        recovery: recoveryData.data || [],
        goals: goalsData.data || [],
        profile: profileData.data || null
      };
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - faster updates
    gcTime: 2 * 60 * 1000, // 2 minutes cache  
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchInterval: false, // Disable auto-refetch
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