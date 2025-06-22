
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UsageLimits {
  coach_gpt_queries: number;
  meal_plan_generations: number;
  food_log_analyses: number;
  tdee_calculations: number;
  habit_checks: number;
  training_programs: number;
  progress_analyses: number;
  cut_calc_uses: number;
  workout_timer_sessions: number;
}

interface CurrentUsage {
  coach_gpt_queries: number;
  meal_plan_generations: number;
  food_log_analyses: number;
  tdee_calculations: number;
  habit_checks: number;
  training_programs: number;
  progress_analyses: number;
  cut_calc_uses: number;
  workout_timer_sessions: number;
}

export const TIER_LIMITS: Record<string, UsageLimits> = {
  free: {
    coach_gpt_queries: 3,
    meal_plan_generations: 1,
    food_log_analyses: 5,
    tdee_calculations: 2,
    habit_checks: 10,
    training_programs: 1,
    progress_analyses: 1,
    cut_calc_uses: 2,
    workout_timer_sessions: 3
  },
  basic: {
    coach_gpt_queries: 30,
    meal_plan_generations: 8,
    food_log_analyses: 25,
    tdee_calculations: 10,
    habit_checks: 100,
    training_programs: 5,
    progress_analyses: 5,
    cut_calc_uses: 10,
    workout_timer_sessions: 25
  },
  premium: {
    coach_gpt_queries: -1, // -1 means unlimited
    meal_plan_generations: -1,
    food_log_analyses: -1,
    tdee_calculations: -1,
    habit_checks: -1,
    training_programs: -1,
    progress_analyses: 15, // Even premium has a reasonable limit for expensive photo analysis
    cut_calc_uses: -1,
    workout_timer_sessions: -1
  }
};

export const useUsageTracking = () => {
  const { user } = useAuth();
  const [currentUsage, setCurrentUsage] = useState<CurrentUsage | null>(null);
  const [userTier, setUserTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageData();
      fetchUserTier();
    }
  }, [user]);

  const fetchUsageData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_current_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching usage:', error);
        return;
      }

      if (data && data.length > 0) {
        setCurrentUsage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTier = async () => {
    if (!user) return;

    try {
      // Check for active payment/subscription
      const { data: payments, error } = await supabase
        .from('payments')
        .select('subscription_tier, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      if (payments && payments.length > 0) {
        const tier = payments[0].subscription_tier?.toLowerCase() || 'free';
        setUserTier(tier);
      } else {
        setUserTier('free');
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
  };

  const canUseFeature = (featureKey: keyof UsageLimits): boolean => {
    if (!currentUsage) return false;
    
    const limits = TIER_LIMITS[userTier];
    const limit = limits[featureKey];
    
    // Unlimited access
    if (limit === -1) return true;
    
    // Check if under limit
    return currentUsage[featureKey] < limit;
  };

  const incrementUsage = async (featureKey: keyof UsageLimits): Promise<boolean> => {
    if (!user || !currentUsage) return false;

    // Check if user can use this feature
    if (!canUseFeature(featureKey)) {
      return false;
    }

    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      
      const { error } = await supabase
        .from('user_usage')
        .update({
          [featureKey]: currentUsage[featureKey] + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('month_year', currentMonth);

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Update local state only after successful database update
      setCurrentUsage(prev => prev ? {
        ...prev,
        [featureKey]: prev[featureKey] + 1
      } : null);

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const getRemainingUsage = (featureKey: keyof UsageLimits): number => {
    if (!currentUsage) return 0;
    
    const limits = TIER_LIMITS[userTier];
    const limit = limits[featureKey];
    
    // Unlimited access
    if (limit === -1) return -1;
    
    return Math.max(0, limit - currentUsage[featureKey]);
  };

  const getUsagePercentage = (featureKey: keyof UsageLimits): number => {
    if (!currentUsage)   return 0;
    
    const limits = TIER_LIMITS[userTier];
    const limit = limits[featureKey];
    
    // Unlimited access
    if (limit === -1) return 0;
    
    return Math.min(100, (currentUsage[featureKey] / limit) * 100);
  };

  return {
    currentUsage,
    userTier,
    loading,
    canUseFeature,
    incrementUsage,
    getRemainingUsage,
    getUsagePercentage,
    limits: TIER_LIMITS[userTier],
    refreshUsage: fetchUsageData
  };
};
