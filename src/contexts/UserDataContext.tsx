
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
  
  // Preferences
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in' | 'in';
  
  // Calculated values
  bmi: number | null;
  tdee: number | null;
}

interface UserDataContextType {
  userData: UserData;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  getPrefilledData: () => any;
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
    weightUnit: 'lbs',
    heightUnit: 'ft-in',
    bmi: null,
    tdee: null
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

        // Calculate BMI if we have weight and height
        let bmi = null;
        if (profile.weight && profile.height) {
          const weightKg = profile.weight * 0.453592;
          const heightM = (profile.height * 2.54) / 100;
          bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
        }

        setUserData(prev => ({
          ...prev,
          weight,
          height,
          age,
          birthday: profile.birthday,
          experience: profile.experience,
          activity: profile.activity,
          goal: profile.goal,
          bmi
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    await loadUserData();
  };

  const getPrefilledData = () => {
    return {
      weight: userData.weight || '',
      height: userData.height || '',
      age: userData.age || '',
      experience: userData.experience || '',
      activity: userData.activity || '',
      goal: userData.goal || '',
      weightUnit: userData.weightUnit,
      heightUnit: userData.heightUnit,
      bmi: userData.bmi,
      tdee: userData.tdee
    };
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      isLoading,
      refreshUserData,
      getPrefilledData
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
