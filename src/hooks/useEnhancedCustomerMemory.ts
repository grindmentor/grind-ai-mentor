
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { customerProfile, updateCustomerProfile, logInteraction } = useCustomerMemory();
  const [detailedData, setDetailedData] = useState<DetailedUserData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load detailed user data from various tables
  useEffect(() => {
    if (user && customerProfile) {
      loadDetailedUserData();
    }
  }, [user, customerProfile]);

  const loadDetailedUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load TDEE calculations for body stats
      const { data: tdeeData } = await supabase
        .from('tdee_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Load cut calculations for goals
      const { data: cutData } = await supabase
        .from('cut_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Load habits for preferences
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      // Load meal plans for dietary preferences
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('user_requirements')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Compile detailed data
      const compiled: DetailedUserData = {
        // From profiles
        height: profile?.height,
        weight: profile?.weight,
        activityLevel: profile?.activity,
        experienceLevel: profile?.experience,
        fitnessGoals: profile?.goal ? [profile.goal] : [],
        
        // From TDEE data
        age: tdeeData?.[0]?.age,
        gender: tdeeData?.[0]?.gender,
        
        // From cut calculations
        targetWeight: cutData?.[0]?.target_weight,
        startingWeight: cutData?.[0]?.current_weight,
        bodyFatPercentage: cutData?.[0]?.current_bf_percentage,
        
        // From habits
        workoutPreferences: habits?.map(h => h.name) || [],
        
        // From meal plans (extract dietary info from requirements)
        dietaryRestrictions: extractDietaryInfo(mealPlans),
        
        // From customer profile
        preferredUnits: 'imperial', // Default, can be updated
        soundEnabled: true,
        notifications: true,
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
