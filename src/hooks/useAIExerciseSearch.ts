
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIExercise {
  name: string;
  category: 'Cardio' | 'Strength' | 'Full Workout';
  muscle_groups: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  estimated_duration: string;
}

export const useAIExerciseSearch = () => {
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchExercises = useCallback(async (query: string) => {
    if (!query.trim()) {
      setExercises([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('exercise-search-ai', {
        body: { query }
      });

      if (error) throw error;

      setExercises(data.exercises || []);
    } catch (err) {
      console.error('Error searching exercises:', err);
      setError('Failed to search exercises');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exercises,
    loading,
    error,
    searchExercises
  };
};
