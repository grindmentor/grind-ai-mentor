/**
 * Enhanced Customer Memory Hook
 * Aggregates user data from canonical sources (UserDataContext, PreferencesContext)
 * and provides utility functions for prefilling forms and personalization.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerMemory } from './useCustomerMemory';

interface DetailedUserData {
  // Personal Info
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  activityLevel?: string;
  
  // Fitness Profile
  fitnessGoals?: string[];
  experienceLevel?: string;
  workoutPreferences?: string[];
  equipmentAccess?: string[];
  timeAvailable?: string;
  
  // Nutrition
  dietaryRestrictions?: string[];
  allergies?: string[];
  mealPreferences?: string[];
  budgetRange?: string;
  cookingSkill?: string;
  
  // Preferences & Settings
  preferredUnits?: 'metric' | 'imperial';
  notifications?: boolean;
  soundEnabled?: boolean;
  themePreference?: 'light' | 'dark' | 'auto';
  
  // Usage Patterns
  mostActiveTime?: string;
  preferredWorkoutDuration?: number;
  consistencyScore?: number;
  lastActiveFeatures?: string[];
  
  // Progress Tracking
  startingWeight?: number;
  targetWeight?: number;
  bodyFatPercentage?: number;
  measurementHistory?: Array<{
    date: string;
    weight?: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
  }>;
}

export const useEnhancedCustomerMemory = () => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { preferences } = usePreferences();
  const { customerProfile, logInteraction } = useCustomerMemory();
  const [detailedData, setDetailedData] = useState<DetailedUserData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load detailed user data from various tables
  useEffect(() => {
    if (user && userData) {
      loadDetailedUserData();
    }
  }, [user, userData]);

  const loadDetailedUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load additional data not in UserDataContext
      const [cutData, habits, mealPlans] = await Promise.all([
        // Load cut calculations for goals
        supabase
          .from('cut_calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // Load habits for preferences
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id),

        // Load meal plans for dietary preferences
        supabase
          .from('meal_plans')
          .select('user_requirements')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Compile detailed data from canonical sources + additional queries
      const compiled: DetailedUserData = {
        // From UserDataContext (canonical source)
        height: userData.height ?? undefined,
        weight: userData.weight ?? undefined,
        age: userData.age ?? undefined,
        activityLevel: userData.activity ?? undefined,
        experienceLevel: userData.experience ?? undefined,
        fitnessGoals: userData.goal ? [userData.goal] : [],
        bodyFatPercentage: userData.bodyFatPercentage ?? undefined,
        
        // From cut calculations
        targetWeight: cutData.data?.target_weight ?? undefined,
        startingWeight: cutData.data?.current_weight ?? undefined,
        
        // From habits
        workoutPreferences: habits.data?.map(h => h.name) || [],
        
        // From meal plans (extract dietary info from requirements)
        dietaryRestrictions: extractDietaryInfo(mealPlans.data || []),
        
        // From PreferencesContext
        preferredUnits: preferences.weight_unit === 'kg' ? 'metric' : 'imperial',
        soundEnabled: true,
        notifications: preferences.notifications,
      };

      setDetailedData(compiled);
    } catch (error) {
      console.error('Error loading detailed user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractDietaryInfo = (mealPlans: any[]) => {
    const restrictions: string[] = [];
    mealPlans?.forEach(plan => {
      const req = plan.user_requirements?.toLowerCase() || '';
      if (req.includes('vegetarian')) restrictions.push('vegetarian');
      if (req.includes('vegan')) restrictions.push('vegan');
      if (req.includes('keto')) restrictions.push('ketogenic');
      if (req.includes('paleo')) restrictions.push('paleo');
      if (req.includes('gluten')) restrictions.push('gluten-free');
      if (req.includes('dairy')) restrictions.push('dairy-free');
    });
    return [...new Set(restrictions)];
  };

  const updateDetailedData = async (updates: Partial<DetailedUserData>) => {
    setDetailedData(prev => ({ ...prev, ...updates }));
    
    // Update relevant tables based on the data type
    if (updates.height || updates.weight || updates.activityLevel) {
      await supabase
        .from('profiles')
        .update({
          height: updates.height,
          weight: updates.weight,
          activity: updates.activityLevel
        })
        .eq('id', user?.id);
    }

    // Log the update
    await logInteraction('profile_update', 'data_update', { 
      updatedFields: Object.keys(updates),
      timestamp: new Date().toISOString()
    });
  };

  const getSmartPrefills = () => {
    return {
      // For TDEE Calculator
      age: detailedData.age,
      height: detailedData.height,
      weight: detailedData.weight,
      gender: detailedData.gender,
      activityLevel: detailedData.activityLevel,
      
      // For Cut Calc
      currentWeight: detailedData.weight,
      targetWeight: detailedData.targetWeight,
      currentBF: detailedData.bodyFatPercentage,
      
      // For Meal Plans
      dietaryRestrictions: detailedData.dietaryRestrictions,
      allergies: detailedData.allergies,
      budget: detailedData.budgetRange,
      
      // For Training
      experience: detailedData.experienceLevel,
      equipment: detailedData.equipmentAccess,
      timeAvailable: detailedData.timeAvailable,
      
      // For Settings
      units: detailedData.preferredUnits,
      soundEnabled: detailedData.soundEnabled,
      notifications: detailedData.notifications,
    };
  };

  const getPersonalizationInsights = () => {
    const insights = [];
    
    if (detailedData.fitnessGoals?.length) {
      insights.push(`Focused on: ${detailedData.fitnessGoals.join(', ')}`);
    }
    
    if (detailedData.experienceLevel) {
      insights.push(`${detailedData.experienceLevel} level athlete`);
    }
    
    if (detailedData.dietaryRestrictions?.length) {
      insights.push(`Follows: ${detailedData.dietaryRestrictions.join(', ')} diet`);
    }
    
    if (detailedData.workoutPreferences?.length) {
      insights.push(`Prefers: ${detailedData.workoutPreferences.slice(0, 3).join(', ')}`);
    }

    return insights;
  };

  return {
    detailedData,
    isLoading,
    updateDetailedData,
    getSmartPrefills,
    getPersonalizationInsights,
    refreshData: loadDetailedUserData
  };
};
