
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CustomerProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  fitness_goals: string | null;
  experience_level: string | null;
  preferred_workout_style: string | null;
  dietary_preferences: string | null;
  interaction_count: number;
  last_active: string;
  favorite_features: string[];
  notes: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

interface InteractionLog {
  id: string;
  user_id: string;
  feature_used: string;
  interaction_type: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export const useCustomerMemory = () => {
  const { user } = useAuth();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interactionHistory, setInteractionHistory] = useState<InteractionLog[]>([]);

  useEffect(() => {
    if (user) {
      loadCustomerProfile();
      loadInteractionHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCustomerProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading customer profile:', error);
        return;
      }

      if (data) {
        setCustomerProfile(data as CustomerProfile);
      } else {
        // Create new customer profile
        await createCustomerProfile();
      }
    } catch (error) {
      console.error('Error loading customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomerProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
          interaction_count: 1,
          last_active: new Date().toISOString(),
          favorite_features: [],
          subscription_tier: 'free'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer profile:', error);
        return;
      }

      setCustomerProfile(data as CustomerProfile);
    } catch (error) {
      console.error('Error creating customer profile:', error);
    }
  };

  const loadInteractionHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interaction_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading interaction history:', error);
        return;
      }

      setInteractionHistory((data || []) as InteractionLog[]);
    } catch (error) {
      console.error('Error loading interaction history:', error);
    }
  };

  const updateCustomerProfile = async (updates: Partial<Omit<CustomerProfile, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user || !customerProfile) return;

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer profile:', error);
        return;
      }

      setCustomerProfile(data as CustomerProfile);
    } catch (error) {
      console.error('Error updating customer profile:', error);
    }
  };

  const logInteraction = async (featureUsed: string, interactionType: string, metadata: Record<string, any> = {}) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('interaction_logs')
        .insert({
          user_id: user.id,
          feature_used: featureUsed,
          interaction_type: interactionType,
          metadata,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging interaction:', error);
        return;
      }

      // Update interaction count
      if (customerProfile) {
        await updateCustomerProfile({
          interaction_count: customerProfile.interaction_count + 1
        });
      }

      // Reload interaction history
      await loadInteractionHistory();
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  const addToFavorites = async (feature: string) => {
    if (!customerProfile) return;

    const updatedFavorites = [...customerProfile.favorite_features];
    if (!updatedFavorites.includes(feature)) {
      updatedFavorites.push(feature);
      await updateCustomerProfile({ favorite_features: updatedFavorites });
    }
  };

  const removeFromFavorites = async (feature: string) => {
    if (!customerProfile) return;

    const updatedFavorites = customerProfile.favorite_features.filter(f => f !== feature);
    await updateCustomerProfile({ favorite_features: updatedFavorites });
  };

  const getCustomerInsights = () => {
    if (!customerProfile || !interactionHistory.length) return null;

    const featureUsage = interactionHistory.reduce((acc, log) => {
      acc[log.feature_used] = (acc[log.feature_used] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedFeature = Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const daysSinceFirstUse = Math.floor(
      (new Date().getTime() - new Date(customerProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      mostUsedFeature,
      totalInteractions: customerProfile.interaction_count,
      daysSinceFirstUse,
      averageInteractionsPerDay: daysSinceFirstUse > 0 ? (customerProfile.interaction_count / daysSinceFirstUse).toFixed(1) : '0',
      favoriteFeatures: customerProfile.favorite_features,
      subscriptionTier: customerProfile.subscription_tier
    };
  };

  return {
    customerProfile,
    interactionHistory,
    loading,
    updateCustomerProfile,
    logInteraction,
    addToFavorites,
    removeFromFavorites,
    getCustomerInsights,
    refreshProfile: loadCustomerProfile
  };
};
