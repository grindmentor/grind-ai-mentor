
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  force_type: 'Push' | 'Pull' | 'Static';
  mechanics: 'Compound' | 'Isolation';
  gif_url?: string;
  image_url?: string;
  form_cues?: string;
  muscle_bias?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSearchFilters {
  muscle_groups?: string[];
  equipment?: string;
  difficulty?: string;
  mechanics?: string;
}

export const useExerciseDatabase = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  // Search exercises with natural language
  const searchExercises = async (query: string, filters?: ExerciseSearchFilters) => {
    if (!query.trim() && !filters) {
      setExercises([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_exercises', {
        search_query: query.trim() || null,
        muscle_filter: filters?.muscle_groups || null,
        equipment_filter: filters?.equipment || null,
        limit_count: 20
      });

      if (error) throw error;

      setExercises(data || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search exercises. Please try again.',
        variant: 'destructive'
      });
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Get exercise suggestions based on input
  const getExerciseSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('name, primary_muscles')
        .or(`name.ilike.%${query}%,primary_muscles.cs.{${query}}`)
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;

      const uniqueSuggestions = new Set<string>();
      
      // Add exercise names
      data?.forEach(exercise => {
        if (exercise.name.toLowerCase().includes(query.toLowerCase())) {
          uniqueSuggestions.add(exercise.name);
        }
      });

      // Add muscle group suggestions
      data?.forEach(exercise => {
        exercise.primary_muscles?.forEach((muscle: string) => {
          if (muscle.toLowerCase().includes(query.toLowerCase())) {
            uniqueSuggestions.add(`${muscle} exercises`);
          }
        });
      });

      setSuggestions(Array.from(uniqueSuggestions).slice(0, 5));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  // Get exercises by muscle group
  const getExercisesByMuscle = async (muscleGroup: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .contains('primary_muscles', [muscleGroup])
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises by muscle:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Get random exercises for discovery
  const getRandomExercises = async (count: number = 6) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(count);

      if (error) throw error;
      
      // Shuffle the results
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
      setExercises(shuffled.slice(0, count));
    } catch (error) {
      console.error('Error fetching random exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    loading,
    suggestions,
    searchExercises,
    getExerciseSuggestions,
    getExercisesByMuscle,
    getRandomExercises
  };
};
