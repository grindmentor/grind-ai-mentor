/**
 * DEPRECATED: Use useUserData() from '@/contexts/UserDataContext' instead.
 * This hook now delegates to UserDataContext for single source of truth.
 */

import { useUserData } from '@/contexts/UserDataContext';
import { useCallback } from 'react';

interface UserData {
  height: number | null;
  weight: number | null;
  age: number | null;
  experience: string | null;
  activity: string | null;
  goal: string | null;
}

export const useDataPersistence = () => {
  const { userData, isLoading, refreshUserData, updateUserData, getCleanUserContext } = useUserData();

  // Map UserDataContext shape to legacy shape
  const legacyUserData: UserData = {
    height: userData.height,
    weight: userData.weight,
    age: userData.age,
    experience: userData.experience,
    activity: userData.activity,
    goal: userData.goal,
  };

  // Delegate save to context
  const saveUserData = useCallback(async (updates: Partial<UserData>) => {
    await updateUserData(updates);
    return true;
  }, [updateUserData]);

  // Use context's format function
  const formatForAI = useCallback(() => {
    return getCleanUserContext();
  }, [getCleanUserContext]);

  return {
    userData: legacyUserData,
    isLoading,
    saveUserData,
    reloadUserData: refreshUserData,
    formatForAI,
    hasCompleteProfile: !!(userData.height && userData.weight && userData.goal),
  };
};
