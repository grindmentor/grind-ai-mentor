
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UnitsPreference {
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'in' | 'ft-in';
}

export const useUnitsPreference = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitsPreference>({
    weightUnit: 'kg',
    heightUnit: 'cm'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('weight_unit, height_unit')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user units:', error);
        } else if (data) {
          setUnits({
            weightUnit: data.weight_unit as 'kg' | 'lbs',
            heightUnit: data.height_unit as 'cm' | 'in' | 'ft-in'
          });
        }
      } catch (error) {
        console.error('Error loading units:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [user]);

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
      const feet = Math.floor(value);
      const inches = Math.round((value - feet) * 12);
      return `${feet}'${inches}"`;
    }
    return `${Math.round(value)} ${units.heightUnit}`;
  };

  return {
    units,
    loading,
    convertWeight,
    formatWeight,
    formatHeight
  };
};
