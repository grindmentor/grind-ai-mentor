
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';

interface SmartUserData {
  // Personal Info
  age?: number;
  height?: number;
  weight?: number;
  birthday?: string;
  gender?: string;
  
  // Fitness Profile
  activityLevel?: string;
  experienceLevel?: string;
  fitnessGoals?: string;
  bodyFatPercentage?: number;
  
  // Preferences
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in' | 'in';
  
  // Calculated Values
  tdee?: number;
  bmr?: number;
  recommendedCalories?: number;
  
  // Training Data
  targetWeight?: number;
  currentBF?: number;
  targetBF?: number;
}

interface SmartPrefillOptions {
  includeCalculated?: boolean;
  includePersonal?: boolean;
  includeFitness?: boolean;
  includePreferences?: boolean;
}

export const useSmartUserData = () => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { preferences } = usePreferences();
  const [smartData, setSmartData] = useState<SmartUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && userData && preferences) {
      compileSmartData();
    }
  }, [user, userData, preferences]);

  const compileSmartData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get latest TDEE data
      const { data: tdeeData } = await supabase
        .from('tdee_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get latest cut calculation data
      const { data: cutData } = await supabase
        .from('cut_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Compile all user data into smart format
      const compiled: SmartUserData = {
        // Personal Info
        age: userData.age || undefined,
        height: userData.height || undefined,
        weight: userData.weight || undefined,
        birthday: userData.birthday || undefined,
        gender: tdeeData?.gender || undefined,
        
        // Fitness Profile
        activityLevel: userData.activity || undefined,
        experienceLevel: userData.experience || undefined,
        fitnessGoals: userData.goal || undefined,
        bodyFatPercentage: userData.bodyFatPercentage || cutData?.current_bf_percentage || undefined,
        
        // Preferences
        weightUnit: preferences.weight_unit,
        heightUnit: preferences.height_unit,
        
        // Calculated Values
        tdee: userData.tdee || tdeeData?.tdee || undefined,
        bmr: tdeeData?.bmr || undefined,
        recommendedCalories: tdeeData?.recommended_calories || undefined,
        
        // Training Data
        targetWeight: cutData?.target_weight || undefined,
        currentBF: cutData?.current_bf_percentage || undefined,
        targetBF: cutData?.target_bf_percentage || undefined,
      };

      setSmartData(compiled);
    } catch (error) {
      console.error('Error compiling smart user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrefillData = (options: SmartPrefillOptions = {}) => {
    const {
      includeCalculated = true,
      includePersonal = true,
      includeFitness = true,
      includePreferences = true
    } = options;

    if (!smartData) return {};

    const prefillData: Partial<SmartUserData> = {};

    if (includePersonal) {
      if (smartData.age) prefillData.age = smartData.age;
      if (smartData.height) prefillData.height = smartData.height;
      if (smartData.weight) prefillData.weight = smartData.weight;
      if (smartData.birthday) prefillData.birthday = smartData.birthday;
      if (smartData.gender) prefillData.gender = smartData.gender;
    }

    if (includeFitness) {
      if (smartData.activityLevel) prefillData.activityLevel = smartData.activityLevel;
      if (smartData.experienceLevel) prefillData.experienceLevel = smartData.experienceLevel;
      if (smartData.fitnessGoals) prefillData.fitnessGoals = smartData.fitnessGoals;
      if (smartData.bodyFatPercentage) prefillData.bodyFatPercentage = smartData.bodyFatPercentage;
    }

    if (includePreferences) {
      prefillData.weightUnit = smartData.weightUnit;
      prefillData.heightUnit = smartData.heightUnit;
    }

    if (includeCalculated) {
      if (smartData.tdee) prefillData.tdee = smartData.tdee;
      if (smartData.bmr) prefillData.bmr = smartData.bmr;
      if (smartData.recommendedCalories) prefillData.recommendedCalories = smartData.recommendedCalories;
      if (smartData.targetWeight) prefillData.targetWeight = smartData.targetWeight;
      if (smartData.currentBF) prefillData.currentBF = smartData.currentBF;
      if (smartData.targetBF) prefillData.targetBF = smartData.targetBF;
    }

    return prefillData;
  };

  const getFormattedValue = (field: keyof SmartUserData) => {
    if (!smartData || !smartData[field]) return '';

    const value = smartData[field];

    switch (field) {
      case 'weight':
        return `${value} ${smartData.weightUnit}`;
      case 'height':
        if (smartData.heightUnit === 'ft-in' && typeof value === 'number') {
          const feet = Math.floor(value / 12);
          const inches = value % 12;
          return `${feet}'${inches}"`;
        }
        return `${value} ${smartData.heightUnit === 'cm' ? 'cm' : 'in'}`;
      case 'bodyFatPercentage':
      case 'currentBF':
      case 'targetBF':
        return `${value}%`;
      case 'tdee':
      case 'bmr':
      case 'recommendedCalories':
        return `${value} cal`;
      case 'age':
        return `${value} years`;
      default:
        return String(value);
    }
  };

  const refreshData = () => {
    compileSmartData();
  };

  return {
    smartData,
    isLoading,
    getPrefillData,
    getFormattedValue,
    refreshData,
    hasBasicInfo: !!(smartData?.age && smartData?.height && smartData?.weight),
    hasFitnessProfile: !!(smartData?.activityLevel && smartData?.experienceLevel && smartData?.fitnessGoals),
    hasCalculatedData: !!(smartData?.tdee || smartData?.bmr),
  };
};
