import { useState, useCallback, useEffect } from 'react';
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

export const useActivePlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active plan
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
        .eq('status', 'pending')
        .maybeSingle();
      
      if (error) throw error;
      return data as ScheduledWorkout | null;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000
  });

  // Fetch upcoming workouts
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
        .limit(7);
      
      if (error) throw error;
      return (data || []) as ScheduledWorkout[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000
  });

  // Create workout plan mutation
  const followPlanMutation = useMutation({
    mutationFn: async ({ template, schedule }: { template: WorkoutTemplate; schedule: ScheduleDay[] }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Deactivate any existing plans
      await supabase
        .from('active_workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Delete old scheduled workouts
      await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Create the active plan
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

      // Generate scheduled workouts for the next 4 weeks
      const scheduledWorkouts = [];
      const today = new Date();
      
      for (let week = 0; week < 4; week++) {
        for (const scheduleDay of schedule) {
          const targetDate = new Date(today);
          const currentDayOfWeek = today.getDay();
          let daysToAdd = scheduleDay.dayOfWeek - currentDayOfWeek;
          if (daysToAdd < 0 || (daysToAdd === 0 && week === 0)) {
            daysToAdd += 7;
          }
          daysToAdd += week * 7;
          targetDate.setDate(today.getDate() + daysToAdd);
          
          const dateStr = targetDate.toISOString().split('T')[0];
          
          scheduledWorkouts.push({
            user_id: user.id,
            plan_id: plan.id,
            workout_name: scheduleDay.workoutName,
            workout_data: template as unknown as Json,
            scheduled_date: dateStr,
            original_date: dateStr,
            day_of_week: scheduleDay.dayOfWeek,
            status: 'pending'
          });
        }
      }

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
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Plan Activated! 🎯',
        description: 'Your workout schedule has been set up. Check your dashboard for today\'s session.',
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

  // Reschedule workout mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ workoutId, newDate }: { workoutId: string; newDate: string }) => {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ 
          scheduled_date: newDate,
          status: 'rescheduled'
        })
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Workout Rescheduled',
        description: 'Your workout has been moved to the new date.',
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

  // Skip workout mutation
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
        description: 'No worries, rest is important too!',
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
    }
  });

  // Stop following plan
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
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-workouts'] });
      toast({
        title: 'Plan Stopped',
        description: 'You can start a new plan anytime.',
      });
    }
  });

  const getDayName = (dayOfWeek: number) => DAY_NAMES[dayOfWeek];

  return {
    activePlan,
    todaysWorkout,
    upcomingWorkouts: upcomingWorkouts || [],
    isLoading: planLoading || todayLoading || upcomingLoading,
    followPlan: followPlanMutation.mutate,
    isFollowing: followPlanMutation.isPending,
    rescheduleWorkout: rescheduleMutation.mutate,
    isRescheduling: rescheduleMutation.isPending,
    skipWorkout: skipWorkoutMutation.mutate,
    completeWorkout: completeWorkoutMutation.mutate,
    stopPlan: stopPlanMutation.mutate,
    getDayName
  };
};