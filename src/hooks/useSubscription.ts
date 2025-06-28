
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
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
    monthlyPrice: 0,
    annualPrice: 0,
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
      training_programs: 0,
      progress_analyses: 1,
      cut_calc_uses: 2,
      workout_timer_sessions: 3,
      food_photo_analyses: 2
    }
  },
  basic: {
    name: 'Basic',
    monthlyPrice: 10,
    annualPrice: 100,
    features: [
      '50 CoachGPT queries/month',
      '15 MealPlanAI generations',
      '50 Smart Food Log analyses',
      '20 TDEE calculations',
      '10 Smart Training programs',
      '15 Physique AI analyses',
      '200 Habit checks',
      'Science-backed recommendations'
    ],
    limits: {
      coach_gpt_queries: 50,
      meal_plan_generations: 15,
      food_log_analyses: 50,
      tdee_calculations: 20,
      habit_checks: 200,
      training_programs: 10,
      progress_analyses: 15,
      cut_calc_uses: 20,
      workout_timer_sessions: 50,
      food_photo_analyses: 25
    }
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 15,
    annualPrice: 150,
    features: [
      'Unlimited CoachGPT queries',
      'Unlimited meal plans', 
      'Unlimited food logging',
      'Unlimited Smart Training',
      'Unlimited Physique AI',
      'Priority support',
      'All future features',
      'Custom workout creation',
      'Advanced analytics'
    ],
    limits: {
      coach_gpt_queries: -1,
      meal_plan_generations: -1,
      food_log_analyses: -1,
      tdee_calculations: -1,
      habit_checks: -1,
      training_programs: -1,
      progress_analyses: -1,
      cut_calc_uses: -1,
      workout_timer_sessions: -1,
      food_photo_analyses: -1
    }
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const cacheRef = useRef<{ tier: string; end: string | null; billing: 'monthly' | 'annual' | null } | null>(null);
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (user && !initRef.current) {
      initRef.current = true;
      
      // Set cached data immediately if available
      const cached = cacheRef.current;
      if (cached) {
        setCurrentTier(cached.tier);
        setSubscriptionEnd(cached.end);
        setBillingCycle(cached.billing);
      }
      
      // Check subscription status
      checkSubscription();
    } else if (!user) {
      setCurrentTier('free');
      setSubscriptionEnd(null);
      setBillingCycle(null);
      cacheRef.current = null;
      initRef.current = false;
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Special handling for premium users
      if (user.email === 'emilbelq@gmail.com' || user.email === 'lucasblandquist@gmail.com') {
        const newStatus = { tier: 'premium', end: null, billing: null };
        setCurrentTier('premium');
        setSubscriptionEnd(null);
        setBillingCycle(null);
        cacheRef.current = newStatus;
        lastCheckRef.current = Date.now();
        return;
      }

      // Check cache freshness (10 seconds for more responsive updates)
      const now = Date.now();
      if (cacheRef.current && (now - lastCheckRef.current) < 10000) {
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        const newTier = data.subscription_tier?.toLowerCase() || 'free';
        const newEnd = data.subscription_end;
        const newBilling = data.billing_cycle;

        setCurrentTier(newTier);
        setSubscriptionEnd(newEnd);
        setBillingCycle(newBilling);
        cacheRef.current = { tier: newTier, end: newEnd, billing: newBilling };
        lastCheckRef.current = now;
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
    billingCycle,
    isSubscribed,
    isLoading,
    refreshSubscription: checkSubscription
  };
};
