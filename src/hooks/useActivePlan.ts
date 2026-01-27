import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WorkoutTemplate } from '@/data/expandedWorkoutTemplates';
import { Json } from '@/integrations/supabase/types';

export interface ScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  workoutName: string;
  workoutType: string;
}

export interface ActivePlan {
  id: string;
  user_id: string;
  template_id: string;
  template_title: string;
  template_data: WorkoutTemplate;
  schedule: ScheduleDay[];
  start_date: string;
  is_active: boolean;
  current_week: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledWorkout {
  id: string;
  user_id: string;
  plan_id: string;
  workout_name: string;
  workout_data: Json;
  scheduled_date: string;
  original_date: string;
  day_of_week: number;
  status: 'pending' | 'completed' | 'skipped' | 'rescheduled';
  completed_session_id: string | null;
  notes: string | null;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to generate scheduled workouts for a plan
const generateScheduledWorkouts = (
  userId: string,
  planId: string,
  template: WorkoutTemplate,
  schedule: ScheduleDay[],
  weeksToGenerate: number = 4,
  startFromDate?: Date
) => {
  const scheduledWorkouts: Array<{
    user_id: string;
    plan_id: string;
    workout_name: string;
    workout_data: Json;
    scheduled_date: string;
    original_date: string;
    day_of_week: number;
    status: 'pending';
  }> = [];
  
  const startDate = startFromDate || new Date();
  startDate.setHours(0, 0, 0, 0);
  const startDayOfWeek = startDate.getDay();
  
  // Sort schedule by day of week for consistent ordering
  const sortedSchedule = [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  
  // Track generated dates to prevent duplicates
  const generatedDates = new Set<string>();

  for (let week = 0; week < weeksToGenerate; week++) {
    for (const scheduleDay of sortedSchedule) {
      // Calculate days until this scheduled day
      let daysUntil = scheduleDay.dayOfWeek - startDayOfWeek;
      
      // For week 0, skip days that have already passed (negative daysUntil)
      if (week === 0 && daysUntil < 0) {
        continue;
      }
      
      // For future weeks, ensure we go forward
      if (week > 0 || daysUntil < 0) {
        // Calculate from start of next week
        daysUntil = (scheduleDay.dayOfWeek - startDayOfWeek + 7) % 7;
        if (daysUntil === 0 && week > 0) daysUntil = 7; // Same day next week
      }
      
      // Add weeks offset
      const totalDays = daysUntil + (week * 7);
      
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + totalDays);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      // Prevent duplicate dates
      const uniqueKey = `${dateStr}-${scheduleDay.workoutName}`;
      if (generatedDates.has(uniqueKey)) continue;
      generatedDates.add(uniqueKey);

      scheduledWorkouts.push({
        user_id: userId,
        plan_id: planId,
        workout_name: scheduleDay.workoutName,
        workout_data: template as unknown as Json,
        scheduled_date: dateStr,
        original_date: dateStr,
        day_of_week: scheduleDay.dayOfWeek,
        status: 'pending' as const
      });
    }
  }

  return scheduledWorkouts;
};

export const useActivePlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the currently active plan
  const { data: activePlan, isLoading: planLoading } = useQuery({
    queryKey: ['active-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('active_workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        template_data: data.template_data as unknown as WorkoutTemplate,
        schedule: (data.schedule as unknown as ScheduleDay[]) || []
      } as ActivePlan;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Fetch ALL user plans (active and inactive) for plan management
  const { data: allPlans, isLoading: allPlansLoading } = useQuery({
    queryKey: ['all-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('active_workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(plan => ({
        ...plan,
        template_data: plan.template_data as unknown as WorkoutTemplate,
        schedule: (plan.schedule as unknown as ScheduleDay[]) || []
      })) as ActivePlan[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Fetch today's scheduled workout
  const { data: todaysWorkout, isLoading: todayLoading } = useQuery({
    queryKey: ['todays-workout', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .in('status', ['pending', 'rescheduled'])
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as ScheduledWorkout | null;
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000
  });

  // Fetch upcoming workouts (next 7 days)
  const { data: upcomingWorkouts, isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcoming-workouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', today)
        .lte('scheduled_date', nextWeek.toISOString().split('T')[0])
        .in('status', ['pending', 'rescheduled'])
        .order('scheduled_date', { ascending: true })
        .limit(14); // Allow for potentially 2 workouts per day
      
      if (error) throw error;
      return (data || []) as ScheduledWorkout[];
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000
  });

  // Get schedule health - check if we need to extend
  const { data: scheduleHealth } = useQuery({
    queryKey: ['schedule-health', user?.id, activePlan?.id],
    queryFn: async () => {
      if (!user?.id || !activePlan?.id) return null;
      
      const twoWeeksOut = new Date();
      twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
      
      const { count, error } = await supabase
        .from('scheduled_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('plan_id', activePlan.id)
        .eq('status', 'pending')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .lte('scheduled_date', twoWeeksOut.toISOString().split('T')[0]);
      
      if (error) return null;
      
      return {
        pendingCount: count || 0,
        needsExtension: (count || 0) < activePlan.schedule.length * 2
      };
    },
    enabled: !!user?.id && !!activePlan?.id,
    staleTime: 5 * 60 * 1000
  });

  // Auto-extend schedule mutation
  const extendScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !activePlan) throw new Error('No active plan');
      
      // Find the latest scheduled date
      const { data: latestWorkout } = await supabase
        .from('scheduled_workouts')
        .select('scheduled_date')
        .eq('user_id', user.id)
        .eq('plan_id', activePlan.id)
        .order('scheduled_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const startDate = latestWorkout 
        ? new Date(latestWorkout.scheduled_date)
        : new Date();
      startDate.setDate(startDate.getDate() + 1);
      
      const newWorkouts = generateScheduledWorkouts(
        user.id,
        activePlan.id,
        activePlan.template_data,
        activePlan.schedule,
        2, // Generate 2 more weeks
        startDate
      );
      
      if (newWorkouts.length > 0) {
        const { error } = await supabase
          .from('scheduled_workouts')
          .insert(newWorkouts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-health'] });
    }
  });

  // Create/follow workout plan mutation
  const followPlanMutation = useMutation({
    mutationFn: async ({ template, schedule }: { template: WorkoutTemplate; schedule: ScheduleDay[] }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Deactivate any existing active plans
      await supabase
        .from('active_workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Delete pending scheduled workouts from old active plan
      await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Create the new active plan
      const { data: plan, error: planError } = await supabase
        .from('active_workout_plans')
        .insert({
          user_id: user.id,
          template_id: template.id,
          template_title: template.title,
          template_data: template as unknown as Json,
          schedule: schedule as unknown as Json,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true,
          current_week: 1
        })
        .select()
        .single();

      if (planError) throw planError;

      // Generate scheduled workouts for 4 weeks
      const scheduledWorkouts = generateScheduledWorkouts(
        user.id,
        plan.id,
        template,
        schedule,
        4
      );

      if (scheduledWorkouts.length > 0) {
        const { error: scheduleError } = await supabase
          .from('scheduled_workouts')
          .insert(scheduledWorkouts);
        if (scheduleError) throw scheduleError;
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-plan'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-health'] });
      toast({
        title: 'Plan Activated! 🎯',
        description: 'Your workout schedule is ready. Check today\'s session.',
      });
    },
    onError: (error) => {
      console.error('Error following plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate workout plan. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Switch to existing plan mutation
  const switchPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Deactivate all plans
      await supabase
        .from('active_workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Delete pending scheduled workouts
      await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Get the plan to activate
      const { data: plan, error: fetchError } = await supabase
        .from('active_workout_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;

      // Activate the selected plan
      const { error: activateError } = await supabase
        .from('active_workout_plans')
        .update({ 
          is_active: true, 
          updated_at: new Date().toISOString(),
          start_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', planId);

      if (activateError) throw activateError;

      // Generate new scheduled workouts
      const template = plan.template_data as unknown as WorkoutTemplate;
      const schedule = (plan.schedule as unknown as ScheduleDay[]) || [];
      
      const scheduledWorkouts = generateScheduledWorkouts(
        user.id,
        planId,
        template,
        schedule,
        4
      );

      if (scheduledWorkouts.length > 0) {
        const { error: scheduleError } = await supabase
          .from('scheduled_workouts')
          .insert(scheduledWorkouts);
        if (scheduleError) throw scheduleError;
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-plan'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-health'] });
      toast({
        title: 'Plan Switched',
        description: 'Your schedule has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error switching plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch plans.',
        variant: 'destructive'
      });
    }
  });

  // Delete a saved plan
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Delete associated scheduled workouts
      await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('plan_id', planId);

      // Delete the plan
      const { error } = await supabase
        .from('active_workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-plan'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Plan Deleted',
        description: 'The workout plan has been removed.',
      });
    }
  });

  // Reschedule workout mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ workoutId, newDate }: { workoutId: string; newDate: string }) => {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ 
          scheduled_date: newDate,
          status: 'pending'
        })
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Workout Rescheduled',
        description: 'Your workout has been moved.',
      });
    },
    onError: (error) => {
      console.error('Error rescheduling:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule workout.',
        variant: 'destructive'
      });
    }
  });

  // Skip workout mutation - marks as skipped
  const skipWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ status: 'skipped' })
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Workout Skipped',
        description: 'Rest is important too!',
      });
    }
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async ({ workoutId, sessionId }: { workoutId: string; sessionId?: string }) => {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ 
          status: 'completed',
          completed_session_id: sessionId || null
        })
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-health'] });
    }
  });

  // Stop following plan (deactivate without deleting)
  const stopPlanMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('active_workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-plan'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Plan Paused',
        description: 'You can resume or start a new plan anytime.',
      });
    }
  });

  const getDayName = (dayOfWeek: number) => DAY_NAMES[dayOfWeek];

  // Get current position in split cycle
  const getCurrentSplitPosition = useCallback(() => {
    if (!activePlan || !upcomingWorkouts || upcomingWorkouts.length === 0) return null;
    
    const schedule = activePlan.schedule;
    const today = new Date().toISOString().split('T')[0];
    
    // Count completed workouts this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    return {
      totalDays: schedule.length,
      scheduleDays: schedule.map(s => getDayName(s.dayOfWeek)),
      nextWorkout: upcomingWorkouts[0]?.workout_name || null
    };
  }, [activePlan, upcomingWorkouts]);

  return {
    // Active plan data
    activePlan,
    todaysWorkout,
    upcomingWorkouts: upcomingWorkouts || [],
    allPlans: allPlans || [],
    scheduleHealth,
    
    // Loading states
    isLoading: planLoading || todayLoading || upcomingLoading,
    isLoadingAllPlans: allPlansLoading,
    
    // Plan management
    followPlan: followPlanMutation.mutateAsync,
    isFollowing: followPlanMutation.isPending,
    switchPlan: switchPlanMutation.mutateAsync,
    isSwitching: switchPlanMutation.isPending,
    deletePlan: deletePlanMutation.mutate,
    stopPlan: stopPlanMutation.mutate,
    
    // Workout management
    rescheduleWorkout: rescheduleMutation.mutate,
    isRescheduling: rescheduleMutation.isPending,
    skipWorkout: skipWorkoutMutation.mutate,
    completeWorkout: completeWorkoutMutation.mutate,
    
    // Schedule extension
    extendSchedule: extendScheduleMutation.mutate,
    
    // Utilities
    getDayName,
    getCurrentSplitPosition
  };
};
