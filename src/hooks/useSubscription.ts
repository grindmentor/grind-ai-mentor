
import { useState, useEffect, useRef } from 'react';
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
      training_programs: 0,
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
      '5 Physique AI analyses', // Updated name
      '100 Habit checks',
      'Science-backed recommendations'
    ],
    limits: {
      coach_gpt_queries: 30,
      meal_plan_generations: 8,
      food_log_analyses: 25,
      tdee_calculations: 10,
      habit_checks: 100,
      training_programs: 5, // Increased from 0 to allow Basic tier access
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
      'Unlimited Smart Training',
      'Unlimited Physique AI', // Updated name
      'Priority support',
      'All future features'
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
      food_photo_analyses: 20
    }
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const lastCheckRef = useRef<number>(0);
  const cacheRef = useRef<{ tier: string; end: string | null } | null>(null);
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (user && !initRef.current) {
      initRef.current = true;
      
      // Set cached data immediately
      const cached = cacheRef.current;
      if (cached) {
        setCurrentTier(cached.tier);
        setSubscriptionEnd(cached.end);
      }
      
      // Check subscription status in background
      checkSubscription();
    } else if (!user) {
      setCurrentTier('free');
      setSubscriptionEnd(null);
      cacheRef.current = null;
      initRef.current = false;
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      // Special handling for emilbelq@gmail.com
      if (user.email === 'emilbelq@gmail.com') {
        const newStatus = { tier: 'premium', end: null };
        setCurrentTier('premium');
        setSubscriptionEnd(null);
        cacheRef.current = newStatus;
        lastCheckRef.current = Date.now();
        return;
      }

      // Check cache freshness (30 seconds)
      const now = Date.now();
      if (cacheRef.current && (now - lastCheckRef.current) < 30000) {
        return;
      }

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

      let newTier = 'free';
      let newEnd = null;

      if (data && data.length > 0) {
        const subscription = data[0];
        const tier = subscription.subscription_tier?.toLowerCase() || 'free';
        
        // Check if subscription is still valid (within 30 days)
        const paymentDate = new Date(subscription.created_at);
        const endDate = new Date(paymentDate);
        endDate.setMonth(endDate.getMonth() + 1);
        
        if (new Date() <= endDate) {
          newTier = tier;
          newEnd = endDate.toISOString();
        }
      }

      // Only update if changed to prevent flickering
      if (newTier !== currentTier || newEnd !== subscriptionEnd) {
        setCurrentTier(newTier);
        setSubscriptionEnd(newEnd);
        cacheRef.current = { tier: newTier, end: newEnd };
      }
      
      lastCheckRef.current = now;
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const isSubscribed = currentTier !== 'free';
  const currentTierData = SUBSCRIPTION_TIERS[currentTier];

  return {
    currentTier,
    currentTierData,
    subscriptionEnd,
    isSubscribed,
    isLoading: false, // Always false to eliminate loading states
    refreshSubscription: checkSubscription
  };
};
