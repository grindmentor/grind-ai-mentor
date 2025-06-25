
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  // Basic info
  weight: number | null;
  height: number | null;
  age: number | null;
  birthday: string | null;
  
  // Fitness profile
  experience: string | null;
  activity: string | null;
  goal: string | null;
  
  // Additional context for AI
  injuries: string | null;
  dietary_preferences: string | null;
  training_preferences: string | null;
  
  // Preferences
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in' | 'in';
  
  // Calculated values
  tdee: number | null;
  bodyFatPercentage: number | null;
}

interface UserDataContextType {
  userData: UserData;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  getCleanUserContext: () => string;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  resetAIMemory: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [userData, setUserData] = useState<UserData>({
    weight: null,
    height: null,
    age: null,
    birthday: null,
    experience: null,
    activity: null,
    goal: null,
    injuries: null,
    dietary_preferences: null,
    training_preferences: null,
    weightUnit: 'lbs',
    heightUnit: 'ft-in',
    tdee: null,
    bodyFatPercentage: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      weightUnit: preferences.weight_unit,
      heightUnit: preferences.height_unit
    }));
  }, [preferences]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        let age = null;
        if (profile.birthday) {
          const today = new Date();
          const birthDate = new Date(profile.birthday);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        // Convert weight from lbs to preferred unit
        let weight = profile.weight;
        if (weight && preferences.weight_unit === 'kg') {
          weight = Math.round(weight * 0.453592);
        }

        // Convert height from inches to preferred unit
        let height = profile.height;
        if (height && preferences.height_unit === 'cm') {
          height = Math.round(height * 2.54);
        }

        // Get latest TDEE calculation
        const { data: tdeeData } = await supabase
          .from('tdee_calculations')
          .select('tdee')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setUserData(prev => ({
          ...prev,
          weight,
          height,
          age,
          birthday: profile.birthday,
          experience: profile.experience,
          activity: profile.activity,
          goal: profile.goal,
          injuries: profile.injuries || null,
          dietary_preferences: profile.dietary_preferences || null,
          training_preferences: profile.preferred_workout_style || null,
          tdee: tdeeData?.tdee || null,
          bodyFatPercentage: profile.body_fat_percentage || null
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user) return;

    try {
      // Update profile data
      const profileUpdates: any = {};
      if (updates.experience !== undefined) profileUpdates.experience = updates.experience;
      if (updates.activity !== undefined) profileUpdates.activity = updates.activity;
      if (updates.goal !== undefined) profileUpdates.goal = updates.goal;
      if (updates.injuries !== undefined) profileUpdates.injuries = updates.injuries;
      if (updates.dietary_preferences !== undefined) profileUpdates.dietary_preferences = updates.dietary_preferences;
      if (updates.training_preferences !== undefined) profileUpdates.preferred_workout_style = updates.training_preferences;
      if (updates.bodyFatPercentage !== undefined) profileUpdates.body_fat_percentage = updates.bodyFatPercentage;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);
      }

      setUserData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const getCleanUserContext = () => {
    const experienceMap: { [key: string]: string } = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'advanced': 'Advanced',
      'expert': 'Expert'
    };

    const activityMap: { [key: string]: string } = {
      'sedentary': 'Sedentary lifestyle',
      'lightly_active': 'Light activity (1-3 days/week)',
      'moderately_active': 'Moderate activity (3-5 days/week)',
      'very_active': 'Very active (6-7 days/week)',
      'extremely_active': 'Extremely active (2x/day or intense training)'
    };

    const goalMap: { [key: string]: string } = {
      'lose_weight': 'Weight loss',
      'maintain_weight': 'Weight maintenance',
      'gain_weight': 'Weight gain',
      'build_muscle': 'Muscle building',
      'improve_fitness': 'General fitness improvement',
      'cut': 'Cutting (fat loss while preserving muscle)',
      'bulk': 'Bulking (muscle gain)',
      'recomp': 'Body recomposition'
    };

    let context = "User Profile:\n";
    if (userData.age) context += `Age: ${userData.age} years\n`;
    if (userData.weight) context += `Weight: ${userData.weight}${userData.weightUnit}\n`;
    if (userData.height) context += `Height: ${userData.height}${userData.heightUnit === 'cm' ? 'cm' : '"'}\n`;
    if (userData.experience) context += `Training Experience: ${experienceMap[userData.experience] || userData.experience}\n`;
    if (userData.activity) context += `Activity Level: ${activityMap[userData.activity] || userData.activity}\n`;
    if (userData.goal) context += `Primary Goal: ${goalMap[userData.goal] || userData.goal}\n`;
    if (userData.bodyFatPercentage) context += `Body Fat: ${userData.bodyFatPercentage}%\n`;
    if (userData.tdee) context += `TDEE: ${userData.tdee} calories\n`;
    if (userData.injuries) context += `Injuries/Limitations: ${userData.injuries}\n`;
    if (userData.dietary_preferences) context += `Dietary Preferences: ${userData.dietary_preferences}\n`;
    if (userData.training_preferences) context += `Training Preferences: ${userData.training_preferences}\n`;

    return context;
  };

  const resetAIMemory = async () => {
    if (!user) return;

    try {
      // Clear AI-related data but keep basic measurements and preferences
      await supabase
        .from('profiles')
        .update({
          injuries: null,
          dietary_preferences: null,
          preferred_workout_style: null,
          experience: null,
          activity: null,
          goal: null
        })
        .eq('id', user.id);

      // Clear coach conversations
      await supabase
        .from('coach_conversations')
        .delete()
        .eq('user_id', user.id);

      setUserData(prev => ({
        ...prev,
        experience: null,
        activity: null,
        goal: null,
        injuries: null,
        dietary_preferences: null,
        training_preferences: null
      }));
    } catch (error) {
      console.error('Error resetting AI memory:', error);
    }
  };

  const refreshUserData = async () => {
    await loadUserData();
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      isLoading,
      refreshUserData,
      getCleanUserContext,
      updateUserData,
      resetAIMemory
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
