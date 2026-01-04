/**
 * DEPRECATED: Use usePreferences() from '@/contexts/PreferencesContext' instead.
 * This hook now delegates to PreferencesContext for single source of truth.
 */

import { usePreferences } from '@/contexts/PreferencesContext';

interface UnitsPreference {
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'in' | 'ft-in';
}

export const useUnitsPreference = () => {
  const { preferences, isLoading } = usePreferences();
  
  const units: UnitsPreference = {
    weightUnit: preferences.weight_unit,
    heightUnit: preferences.height_unit
  };

  const convertWeight = (value: number, targetUnit?: 'kg' | 'lbs') => {
    const target = targetUnit || units.weightUnit;
    if (target === 'kg') {
      return value / 2.20462;
    }
    return value * 2.20462;
  };

  const formatWeight = (value: number) => {
    return `${value.toFixed(1)} ${units.weightUnit}`;
  };

  const formatHeight = (value: number) => {
    if (units.heightUnit === 'ft-in') {
      const feet = Math.floor(value / 12);
      const inches = Math.round(value % 12);
      return `${feet}'${inches}"`;
    }
    return `${Math.round(value)} ${units.heightUnit}`;
  };

  return {
    units,
    loading: isLoading,
    convertWeight,
    formatWeight,
    formatHeight
  };
};
