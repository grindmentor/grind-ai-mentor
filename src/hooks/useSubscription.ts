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
    fridge_scan_uses: number; // Daily limit for FridgeScan (resets daily)
  };
}

// Simplified Premium-only subscription system
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '5 AI queries per month',
      'Basic workout logging',
      'Food search (USDA)',
      'Essential fitness tracking'
    ],
    limits: {
      coach_gpt_queries: 5,
      meal_plan_generations: 0,
      food_log_analyses: 3,
      tdee_calculations: 2,
      habit_checks: 10,
      training_programs: 0,
      progress_analyses: 1,
      cut_calc_uses: 2,
      workout_timer_sessions: 5,
      food_photo_analyses: 0,
      fridge_scan_uses: 0 // Free users don't get FridgeScan
    }
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [
      'Unlimited text-based AI prompts',
      '30 photo uploads per month',
      'Exclusive access to Physique AI',
      'Smart Training & Meal Plans',
      'FridgeScan AI (5 scans/day)',
      'Advanced progress tracking',
      'Priority support'
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
      food_photo_analyses: 30,
      fridge_scan_uses: 5 // 5 scans per day for premium
    }
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  
  // Initialize from localStorage cache for instant display
  const getInitialState = () => {
    if (typeof window !== 'undefined' && user?.id) {
      const cached = localStorage.getItem(`myotopia_sub_${user.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore */ }
      }
    }
    return { tier: 'free', end: null, billing: null, hasUnlimitedUsage: false };
  };
  
  const initial = user ? getInitialState() : { tier: 'free', end: null, billing: null, hasUnlimitedUsage: false };
  
  const [currentTier, setCurrentTier] = useState<string>(initial.tier);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(initial.end);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | null>(null);
  const [hasUnlimitedUsage, setHasUnlimitedUsage] = useState<boolean>(initial.hasUnlimitedUsage || false);
  const [isLoading, setIsLoading] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const cacheRef = useRef<{ tier: string; end: string | null; billing: 'monthly' | 'annual' | null; hasUnlimitedUsage?: boolean } | null>(null);
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
        setHasUnlimitedUsage(cached.hasUnlimitedUsage || false);
      }
      
      // Check subscription status from server
      checkSubscription();
    } else if (!user) {
      setCurrentTier('free');
      setSubscriptionEnd(null);
      setBillingCycle(null);
      setHasUnlimitedUsage(false);
      cacheRef.current = null;
      initRef.current = false;
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Check cache freshness (10 seconds for more responsive updates)
      const now = Date.now();
      if (cacheRef.current && (now - lastCheckRef.current) < 10000) {
        setIsLoading(false);
        return;
      }

      // Call server-side function to check subscription using role-based access control
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        // Default to free tier on error
        setCurrentTier('free');
        setSubscriptionEnd(null);
        setBillingCycle(null);
        setHasUnlimitedUsage(false);
        return;
      }

      if (data) {
        const newTier = data.subscription_tier?.toLowerCase() || 'free';
        const newEnd = data.subscription_end;
        const newBilling = data.billing_cycle;
        const newUnlimited = data.has_unlimited_usage || false;

        setCurrentTier(newTier);
        setSubscriptionEnd(newEnd);
        setBillingCycle(newBilling);
        setHasUnlimitedUsage(newUnlimited);
        cacheRef.current = { tier: newTier, end: newEnd, billing: newBilling, hasUnlimitedUsage: newUnlimited };
        lastCheckRef.current = now;
        
        // Save to localStorage for instant loading on next visit
        if (user?.id) {
          try {
            localStorage.setItem(`myotopia_sub_${user.id}`, JSON.stringify({ 
              tier: newTier, 
              end: newEnd, 
              billing: newBilling,
              hasUnlimitedUsage: newUnlimited
            }));
          } catch { /* ignore storage errors */ }
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to free tier on error
      setCurrentTier('free');
      setSubscriptionEnd(null);
      setBillingCycle(null);
      setHasUnlimitedUsage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = currentTier !== 'free';
  const currentTierData = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.free;

  return {
    currentTier,
    currentTierData,
    subscriptionEnd,
    billingCycle,
    isSubscribed,
    isLoading,
    hasUnlimitedUsage,
    refreshSubscription: checkSubscription,
    isUnlimited: (featureKey: keyof SubscriptionTier['limits']) => {
      // Users with unlimited_usage role bypass all limits
      if (hasUnlimitedUsage) return true;
      return currentTierData.limits[featureKey] === -1;
    }
  };
};
