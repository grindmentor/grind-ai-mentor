import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DietaryPreferences {
  id?: string;
  allergies: string[];
  dislikes: string[];
  preferences: string[];
  diet_type: string;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  setup_completed: boolean;
}

const defaultPreferences: DietaryPreferences = {
  allergies: [],
  dislikes: [],
  preferences: [],
  diet_type: 'balanced',
  target_calories: null,
  target_protein: null,
  target_carbs: null,
  target_fat: null,
  setup_completed: false,
};

// Diet type configurations - beginner friendly
export const dietTypeConfig = {
  'low-cal': { 
    label: 'Low-Cal / Cutting', 
    description: 'Fewer calories to lose fat while keeping protein high',
    icon: '🎯',
    proteinMin: 40 
  },
  'bulk': { 
    label: 'Bulk / Gain', 
    description: 'Extra calories and protein to build muscle',
    icon: '💪',
    proteinMin: 30 
  },
  'post-workout': { 
    label: 'Post-Workout', 
    description: 'High carbs + protein to refuel after training',
    icon: '🏋️',
    proteinMin: 30 
  },
  'balanced': { 
    label: 'Balanced', 
    description: 'Even split of protein, carbs, and fats',
    icon: '⚖️',
    proteinMin: 35 
  },
  'high-protein': { 
    label: 'High Protein', 
    description: 'Maximum protein for muscle building/retention',
    icon: '🥩',
    proteinMin: 45 
  },
  'personalized': { 
    label: 'Personalized', 
    description: 'Based on your profile and goals in settings',
    icon: '✨',
    proteinMin: 35 
  },
};

export function useDietaryPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DietaryPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dietary_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          id: data.id,
          allergies: data.allergies || [],
          dislikes: data.dislikes || [],
          preferences: data.preferences || [],
          diet_type: data.diet_type || 'balanced',
          target_calories: data.target_calories,
          target_protein: data.target_protein,
          target_carbs: data.target_carbs,
          target_fat: data.target_fat,
          setup_completed: data.setup_completed || false,
        });
      }
    } catch (error) {
      console.error('Error loading dietary preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Save preferences
  const savePreferences = async (updates: Partial<DietaryPreferences>) => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const newPrefs = { ...preferences, ...updates };
      
      const { error } = await supabase
        .from('dietary_preferences')
        .upsert({
          user_id: user.id,
          allergies: newPrefs.allergies,
          dislikes: newPrefs.dislikes,
          preferences: newPrefs.preferences,
          diet_type: newPrefs.diet_type,
          target_calories: newPrefs.target_calories,
          target_protein: newPrefs.target_protein,
          target_carbs: newPrefs.target_carbs,
          target_fat: newPrefs.target_fat,
          setup_completed: newPrefs.setup_completed,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(newPrefs);
      return true;
    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      toast({
        title: 'Error saving preferences',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Complete setup (mark as done)
  const completeSetup = async () => {
    return savePreferences({ setup_completed: true });
  };

  // Get protein minimum based on diet type
  const getProteinMinimum = (): number => {
    const config = dietTypeConfig[preferences.diet_type as keyof typeof dietTypeConfig];
    return config?.proteinMin || 35;
  };

  return {
    preferences,
    isLoading,
    isSaving,
    savePreferences,
    completeSetup,
    loadPreferences,
    getProteinMinimum,
    needsSetup: !preferences.setup_completed,
  };
}

// Hook to get user's daily targets from TDEE or dietary preferences
export function useDailyTargets() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<{
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  }>({
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  });

  useEffect(() => {
    const loadTargets = async () => {
      if (!user) return;

      try {
        // First check dietary_preferences for custom targets
        const { data: dietPrefs } = await supabase
          .from('dietary_preferences')
          .select('target_calories, target_protein, target_carbs, target_fat')
          .eq('user_id', user.id)
          .maybeSingle();

        if (dietPrefs?.target_calories) {
          setTargets({
            calories: dietPrefs.target_calories,
            protein: dietPrefs.target_protein,
            carbs: dietPrefs.target_carbs,
            fat: dietPrefs.target_fat,
          });
          return;
        }

        // Fallback to TDEE calculations
        const { data: tdeeData } = await supabase
          .from('tdee_calculations')
          .select('tdee, recommended_calories')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tdeeData) {
          const calories = tdeeData.recommended_calories || tdeeData.tdee;
          // Estimate macros from calories (balanced split)
          setTargets({
            calories,
            protein: Math.round(calories * 0.3 / 4), // 30% protein
            carbs: Math.round(calories * 0.4 / 4),   // 40% carbs
            fat: Math.round(calories * 0.3 / 9),     // 30% fat
          });
        }
      } catch (error) {
        console.error('Error loading daily targets:', error);
      }
    };

    loadTargets();
  }, [user]);

  return targets;
}
