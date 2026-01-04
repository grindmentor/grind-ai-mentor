/**
 * Smart User Data Hook
 * Provides aggregated user data from UserDataContext (single source of truth)
 * with utility functions for prefilling forms and formatting values.
 */

import { useMemo, useCallback } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { usePreferences } from '@/contexts/PreferencesContext';

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
  const { userData, isLoading: userLoading } = useUserData();
  const { preferences, isLoading: prefsLoading } = usePreferences();

  // Derive smart data from canonical sources
  const smartData = useMemo<SmartUserData | null>(() => {
    if (!userData) return null;

    return {
      // Personal Info - directly from UserDataContext
      age: userData.age ?? undefined,
      height: userData.height ?? undefined,
      weight: userData.weight ?? undefined,
      birthday: userData.birthday ?? undefined,
      gender: undefined, // Only available from TDEE calculations
      
      // Fitness Profile
      activityLevel: userData.activity ?? undefined,
      experienceLevel: userData.experience ?? undefined,
      fitnessGoals: userData.goal ?? undefined,
      bodyFatPercentage: userData.bodyFatPercentage ?? undefined,
      
      // Preferences - from PreferencesContext
      weightUnit: preferences.weight_unit,
      heightUnit: preferences.height_unit,
      
      // Calculated Values - from UserDataContext
      tdee: userData.tdee ?? undefined,
      bmr: undefined, // Would need separate fetch
      recommendedCalories: undefined,
      
      // Training Data
      targetWeight: undefined,
      currentBF: userData.bodyFatPercentage ?? undefined,
      targetBF: undefined,
    };
  }, [userData, preferences]);

  const getPrefillData = useCallback((options: SmartPrefillOptions = {}) => {
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
  }, [smartData]);

  const getFormattedValue = useCallback((field: keyof SmartUserData): string => {
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
  }, [smartData]);

  const { refreshUserData } = useUserData();

  return {
    smartData,
    isLoading: userLoading || prefsLoading,
    getPrefillData,
    getFormattedValue,
    refreshData: refreshUserData,
    hasBasicInfo: !!(smartData?.age && smartData?.height && smartData?.weight),
    hasFitnessProfile: !!(smartData?.activityLevel && smartData?.experienceLevel && smartData?.fitnessGoals),
    hasCalculatedData: !!(smartData?.tdee || smartData?.bmr),
  };
};
