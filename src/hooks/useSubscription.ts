import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionTier {
  name: string;
  price: number;
  features: string[];
  limits: {
    coach_gpt_queries: number;
    meal_plan_generations: number;
    food_log_analyses: number;
    tdee_calculations: number;
    habit_checks: number;
    training_programs: number;
    progress_analyses: number;
    cut_calc_uses: number;
    workout_timer_sessions: number;
    food_photo_analyses: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic AI coaching',
      'Limited usage',
      'Essential calculators'
    ],
    limits: {
      coach_gpt_queries: 3,
      meal_plan_generations: 1,
      food_log_analyses: 5,
      tdee_calculations: 2,
      habit_checks: 10,
      training_programs: 1,
      progress_analyses: 1,
      cut_calc_uses: 2,
      workout_timer_sessions: 3,
      food_photo_analyses: 2
    }
  },
  basic: {
    name: 'Basic',
    price: 10,
    features: [
      '30 CoachGPT queries/month',
      '8 MealPlanAI generations',
      '25 Smart Food Log analyses',
      '10 TDEE calculations',
      '5 Smart Training programs',
      '5 Progress photo analyses',
      '100 Habit checks',
      'Science-backed recommendations'
    ],
    limits: {
      coach_gpt_queries: 30,
      meal_plan_generations: 8,
      food_log_analyses: 25,
      tdee_calculations: 10,
      habit_checks: 100,
      training_programs: 5,
      progress_analyses: 5,
      cut_calc_uses: 10,
      workout_timer_sessions: 25,
      food_photo_analyses: 10
    }
  },
  premium: {
    name: 'Premium',
    price: 15,
    features: [
      'Unlimited queries',
      'Unlimited meal plans', 
      'Unlimited food logging',
      '20 photos/month',
      'Priority support',
      'All future features'
    ],
    limits: {
      coach_gpt_queries: -1, // -1 means unlimited
      meal_plan_generations: -1,
      food_log_analyses: -1,
      tdee_calculations: -1,
      habit_checks: -1,
      training_programs: -1,
      progress_analyses: -1,
      cut_calc_uses: -1,
      workout_timer_sessions: -1,
      food_photo_analyses: 20 // Limited to 20 per month
    }
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      // Check if user has active subscription
      const { data, error } = await supabase
        .from('payments')
        .select('subscription_tier, created_at, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data && data.length > 0) {
        const subscription = data[0];
        const tier = subscription.subscription_tier?.toLowerCase() || 'free';
        setCurrentTier(tier);
        
        // Calculate subscription end date (30 days from payment)
        const paymentDate = new Date(subscription.created_at);
        const endDate = new Date(paymentDate);
        endDate.setMonth(endDate.getMonth() + 1);
        setSubscriptionEnd(endDate.toISOString());
      } else {
        setCurrentTier('free');
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = currentTier !== 'free';
  const currentTierData = SUBSCRIPTION_TIERS[currentTier];

  return {
    currentTier,
    currentTierData,
    subscriptionEnd,
    isSubscribed,
    isLoading,
    refreshSubscription: checkSubscription
  };
};
