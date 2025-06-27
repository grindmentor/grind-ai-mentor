
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  force_type: string;
  mechanics: string;
  gif_url?: string;
  image_url?: string;
  form_cues?: string;
  muscle_bias?: string;
  is_active: boolean;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export const useExerciseDatabase = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cache, setCache] = useState<Map<string, Exercise[]>>(new Map());

  // Get cached exercises or fetch new ones
  const getCachedOrFetch = async (key: string, fetchFn: () => Promise<Exercise[]>) => {
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = await fetchFn();
    setCache(prev => new Map(prev.set(key, result)));
    return result;
  };

  // Search exercises with caching
  const searchExercises = async (query: string, muscleFilter?: string[], equipmentFilter?: string) => {
    const cacheKey = `search-${query}-${muscleFilter?.join(',') || ''}-${equipmentFilter || ''}`;
    
    setLoading(true);
    try {
      const results = await getCachedOrFetch(cacheKey, async () => {
        const { data, error } = await supabase.rpc('search_exercises', {
          search_query: query,
          muscle_filter: muscleFilter || null,
          equipment_filter: equipmentFilter || null,
          limit_count: 20
        });

        if (error) throw error;
        return data || [];
      });

      setExercises(results);
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

  // Get exercise suggestions based on query
  const getExerciseSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get unique muscle groups and equipment that match the query
      const { data, error } = await supabase
        .from('exercises')
        .select('primary_muscles, equipment')
        .is('is_active', true)
        .limit(100);

      if (error) throw error;

      const muscleSet = new Set<string>();
      const equipmentSet = new Set<string>();

      data?.forEach(exercise => {
        exercise.primary_muscles?.forEach((muscle: string) => {
          if (muscle.toLowerCase().includes(query.toLowerCase())) {
            muscleSet.add(muscle);
          }
        });
        
        if (exercise.equipment?.toLowerCase().includes(query.toLowerCase())) {
          equipmentSet.add(exercise.equipment);
        }
      });

      const suggestions = [
        ...Array.from(muscleSet).slice(0, 3),
        ...Array.from(equipmentSet).slice(0, 2)
      ].slice(0, 5);

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  // Get random exercises for initial display
  const getRandomExercises = async (limit: number = 12) => {
    const cacheKey = `random-${limit}`;
    
    setLoading(true);
    try {
      const results = await getCachedOrFetch(cacheKey, async () => {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .is('is_active', true)
          .order('name')
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      setExercises(results);
    } catch (error) {
      console.error('Error fetching random exercises:', error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load exercises. Please try again.',
        variant: 'destructive'
      });
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Get exercises by muscle group
  const getExercisesByMuscle = async (muscleGroup: string) => {
    const cacheKey = `muscle-${muscleGroup}`;
    
    setLoading(true);
    try {
      const results = await getCachedOrFetch(cacheKey, async () => {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .contains('primary_muscles', [muscleGroup])
          .is('is_active', true)
          .order('name')
          .limit(20);

        if (error) throw error;
        return data || [];
      });

      setExercises(results);
    } catch (error) {
      console.error('Error fetching exercises by muscle:', error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load exercises. Please try again.',
        variant: 'destructive'
      });
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Get exercise by ID
  const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .is('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      return null;
    }
  };

  // Clear cache (useful for refreshing data)
  const clearCache = () => {
    setCache(new Map());
  };

  return {
    exercises,
    loading,
    suggestions,
    searchExercises,
    getExerciseSuggestions,
    getRandomExercises,
    getExercisesByMuscle,
    getExerciseById,
    clearCache
  };
};
