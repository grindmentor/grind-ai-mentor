/**
 * DEPRECATED: Use usePreferences() from '@/contexts/PreferencesContext' instead.
 * This hook now delegates to PreferencesContext for single source of truth.
 */

import { usePreferences } from '@/contexts/PreferencesContext';

interface UserUnits {
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'in' | 'ft-in';
}

export const useUserUnits = () => {
  const { preferences, isLoading } = usePreferences();
  
  const units: UserUnits = {
    weightUnit: preferences.weight_unit,
    heightUnit: preferences.height_unit
  };

  return { units, loading: isLoading };
};
