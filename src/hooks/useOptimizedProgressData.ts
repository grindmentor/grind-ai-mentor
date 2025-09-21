import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProgressData = (userId: string | null) => {
  return useQuery({
    queryKey: ['optimizedProgressData', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Optimized queries - fetch only recent data needed for display
      const [workoutData, recoveryData, goalsData] = await Promise.all([
        // Only fetch last 10 workouts for calculations
        supabase
          .from('progressive_overload_entries')
          .select('exercise_name, weight, sets, reps, workout_date, created_at')
          .eq('user_id', userId)
          .order('workout_date', { ascending: false })
          .limit(10),
        
        // Only fetch last 7 days of recovery data
        supabase
          .from('recovery_data')
          .select('sleep_hours, sleep_quality, energy_level, stress_level, recorded_date')
          .eq('user_id', userId)
          .order('recorded_date', { ascending: false })
          .limit(7),
        
        // Fetch all goals (simpler query that's less likely to fail)
        supabase
          .from('user_goals')
          .select('id, title, target_value, current_value, status, category, created_at')
          .eq('user_id', userId)
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

      return {
        workouts: workoutData.data || [],
        recovery: recoveryData.data || [],
        goals: goalsData.data || []
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
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