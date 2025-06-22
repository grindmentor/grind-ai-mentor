
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
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

export const useUsageTracking = () => {
  const { user } = useAuth();
  const { currentTierData, currentTier } = useSubscription();
  const [currentUsage, setCurrentUsage] = useState<CurrentUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageData();
    } else {
      setLoading(false);
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
      } else {
        setCurrentUsage({
          coach_gpt_queries: 0,
          meal_plan_generations: 0,
          food_log_analyses: 0,
          tdee_calculations: 0,
          habit_checks: 0,
          training_programs: 0,
          progress_analyses: 0,
          cut_calc_uses: 0,
          workout_timer_sessions: 0
        });
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (featureKey: keyof UsageLimits): boolean => {
    if (!currentUsage || !currentTierData) return false;
    
    const limit = currentTierData.limits[featureKey];
    
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
      const currentMonth = new Date().toISOString().substring(0, 7);
      
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
    if (!currentUsage || !currentTierData) return 0;
    
    const limit = currentTierData.limits[featureKey];
    
    // Unlimited access
    if (limit === -1) return -1;
    
    return Math.max(0, limit - currentUsage[featureKey]);
  };

  const getUsagePercentage = (featureKey: keyof UsageLimits): number => {
    if (!currentUsage || !currentTierData) return 0;
    
    const limit = currentTierData.limits[featureKey];
    
    // Unlimited access
    if (limit === -1) return 0;
    
    return Math.min(100, (currentUsage[featureKey] / limit) * 100);
  };

  return {
    currentUsage,
    loading,
    canUseFeature,
    incrementUsage,
    getRemainingUsage,
    getUsagePercentage,
    limits: currentTierData?.limits,
    userTier: currentTier,
    refreshUsage: fetchUsageData
  };
};
