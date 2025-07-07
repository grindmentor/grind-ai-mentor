import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  height: number | null;
  weight: number | null;
  age: number | null;
  experience: string | null;
  activity: string | null;
  goal: string | null;
  // Add other common user data fields
}

export const useDataPersistence = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    height: null,
    weight: null,
    age: null,
    experience: null,
    activity: null,
    goal: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from profile
  const loadUserData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('height, weight, birthday, experience, activity, goal')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user data:', error);
        return;
      }

      if (profile) {
        const age = profile.birthday 
          ? new Date().getFullYear() - new Date(profile.birthday).getFullYear()
          : null;

        setUserData({
          height: profile.height,
          weight: profile.weight,
          age,
          experience: profile.experience,
          activity: profile.activity,
          goal: profile.goal,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save user data to profile
  const saveUserData = useCallback(async (updates: Partial<UserData>) => {
    if (!user?.id) return;

    try {
      // Convert age back to birthday if provided
      const profileUpdates: any = { ...updates };
      if (updates.age !== undefined) {
        profileUpdates.birthday = new Date(new Date().getFullYear() - updates.age, 0, 1);
        delete profileUpdates.age;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileUpdates,
        });

      if (error) throw error;

      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updates,
      }));

      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }, [user?.id]);

  // Format user data for AI prompts
  const formatForAI = useCallback(() => {
    const parts = [];
    
    if (userData.height) parts.push(`Height: ${userData.height}cm`);
    if (userData.weight) parts.push(`Weight: ${userData.weight}kg`);
    if (userData.age) parts.push(`Age: ${userData.age} years`);
    if (userData.experience) parts.push(`Experience: ${userData.experience}`);
    if (userData.activity) parts.push(`Activity Level: ${userData.activity}`);
    if (userData.goal) parts.push(`Primary Goal: ${userData.goal}`);

    return parts.length > 0 
      ? `User Profile: ${parts.join(', ')}`
      : 'No user profile data available';
  }, [userData]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userData,
    isLoading,
    saveUserData,
    reloadUserData: loadUserData,
    formatForAI,
    hasCompleteProfile: !!(userData.height && userData.weight && userData.goal),
  };
};