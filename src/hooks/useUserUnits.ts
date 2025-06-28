
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserUnits {
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'in' | 'ft-in';
}

export const useUserUnits = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<UserUnits>({
    weightUnit: 'lbs',
    heightUnit: 'ft-in'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserUnits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('weight_unit, height_unit')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user units:', error);
        } else if (data) {
          setUnits({
            weightUnit: data.weight_unit as 'kg' | 'lbs',
            heightUnit: data.height_unit as 'cm' | 'in' | 'ft-in'
          });
        }
      } catch (error) {
        console.error('Error loading user units:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserUnits();
  }, [user]);

  return { units, loading };
};
