
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIExercise {
  name: string;
  category: 'Strength' | 'Full Workout';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchExercises = useCallback(async (query: string) => {
    if (!query.trim()) {
      setExercises([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const { data, error } = await supabase.functions.invoke('exercise-search-ai', {
          body: { query },
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (abortController.signal.aborted) {
          return;
        }

        if (error) throw error;

        // Filter results to only include gym exercises
        const filteredExercises = (data.exercises || []).filter((exercise: AIExercise) => {
          const isStrengthExercise = exercise.category === 'Strength' || exercise.category === 'Full Workout';
          const hasGymEquipment = exercise.equipment && 
            (exercise.equipment.toLowerCase().includes('barbell') ||
             exercise.equipment.toLowerCase().includes('dumbbell') ||
             exercise.equipment.toLowerCase().includes('cable') ||
             exercise.equipment.toLowerCase().includes('machine') ||
             exercise.equipment.toLowerCase().includes('bench') ||
             exercise.equipment.toLowerCase().includes('rack') ||
             exercise.equipment.toLowerCase() === 'bodyweight');
          
          return isStrengthExercise && hasGymEquipment;
        });

        setExercises(filteredExercises);
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }
        console.error('Error searching exercises:', err);
        setError('Failed to search exercises');
        setExercises([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500); // 500ms debounce
  }, []);

  return {
    exercises,
    loading,
    error,
    searchExercises
  };
};
