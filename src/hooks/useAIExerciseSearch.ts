import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionOptimization } from './useConnectionOptimization';

export interface AIExercise {
  name: string;
  category: 'Strength' | 'Full Workout';
  muscle_groups: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  estimated_duration: string;
  form_tips?: string;
  muscle_focus?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'Split' | 'Cardio' | 'Day';
  description: string;
  exercises: string[];
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus_areas: string[];
}

// Session cache for AI responses
const aiCache = new Map<string, { data: AIExercise[]; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

export const useAIExerciseSearch = () => {
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { optimizedSettings } = useConnectionOptimization();

  // Lightweight predefined search suggestions
  const popularSearches = [
    'chest workout', 'leg day', 'back exercises', 'shoulder training',
    'arms workout', 'deadlift', 'squat', 'bench press',
    'pull ups', 'rows', 'tricep', 'bicep', 'leg press'
  ];

  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    suggestionTimeoutRef.current = setTimeout(() => {
      const queryLower = query.toLowerCase();
      const filtered = popularSearches
        .filter(search => search.toLowerCase().includes(queryLower))
        .slice(0, optimizedSettings.lowDataMode ? 3 : 6);
      
      setSuggestions(filtered);
    }, 100);
  }, [optimizedSettings.lowDataMode]);

  const searchExercises = useCallback(async (query: string) => {
    if (!query.trim()) {
      setExercises([]);
      return;
    }

    // Check cache first
    const cacheKey = `${query.toLowerCase().trim()}_${optimizedSettings.pageSize}`;
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setExercises(cached.data);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Get suggestions immediately
    getSuggestions(query);

    // Debounce the search with connection-aware delay
    const debounceDelay = optimizedSettings.lowDataMode ? 800 : 400;
    
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const { data, error } = await supabase.functions.invoke('exercise-search-ai', {
          body: { 
            query,
            maxResults: optimizedSettings.pageSize,
            maxTokens: optimizedSettings.maxTokens
          },
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (abortController.signal.aborted) return;
        if (error) throw error;

        // Filter for gym-only strength exercises (optimized filtering)
        const filteredExercises = (data.exercises || [])
          .filter((exercise: AIExercise) => {
            const isStrength = exercise.category === 'Strength' || exercise.category === 'Full Workout';
            const hasGymEquipment = /barbell|dumbbell|cable|machine|bench|rack|bodyweight/i.test(exercise.equipment);
            const isNotCardio = !/running|cycling|treadmill|elliptical|cardio|hiit/i.test(
              exercise.name + ' ' + exercise.description
            );
            return isStrength && hasGymEquipment && isNotCardio;
          })
          .slice(0, optimizedSettings.pageSize);

        // Cache the results
        aiCache.set(cacheKey, {
          data: filteredExercises,
          timestamp: Date.now()
        });

        setExercises(filteredExercises);
      } catch (err) {
        if (abortController.signal.aborted) return;
        
        console.error('Error searching exercises:', err);
        setError('Failed to search exercises');
        setExercises([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, debounceDelay);
  }, [getSuggestions, optimizedSettings]);

  return {
    exercises,
    suggestions,
    loading,
    error,
    searchExercises,
    getSuggestions
  };
};

// Curated workout templates (unchanged for compatibility)
export const curatedWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'push-pull-legs',
    name: 'Push/Pull/Legs Split',
    type: 'Split',
    description: 'Classic 3-day split focusing on movement patterns for optimal recovery',
    exercises: ['Bench Press', 'Overhead Press', 'Deadlift', 'Pull-ups', 'Squats', 'Leg Press'],
    duration: '45-60 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Full Body', 'Strength', 'Hypertrophy']
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    type: 'Split',
    description: '4-day split alternating between upper and lower body training',
    exercises: ['Bench Press', 'Rows', 'Squats', 'Romanian Deadlifts', 'Shoulder Press'],
    duration: '50-70 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Strength', 'Muscle Building']
  },
  {
    id: 'bro-split',
    name: 'Bodybuilder Split',
    type: 'Split',
    description: '5-day split targeting one muscle group per session for maximum volume',
    exercises: ['Chest Press', 'Back Rows', 'Shoulder Press', 'Arm Curls', 'Leg Extensions'],
    duration: '60-90 minutes',
    difficulty: 'Advanced',
    focus_areas: ['Hypertrophy', 'Isolation']
  },
  {
    id: 'full-body',
    name: 'Full Body Routine',
    type: 'Split',
    description: '3-day full body workout hitting all major muscle groups',
    exercises: ['Squats', 'Bench Press', 'Deadlifts', 'Pull-ups', 'Overhead Press'],
    duration: '60-75 minutes',
    difficulty: 'Beginner',
    focus_areas: ['Strength', 'Full Body']
  },
  {
    id: 'powerlifting',
    name: 'Powerlifting Split',
    type: 'Split',
    description: 'Competition-focused training for squat, bench, and deadlift',
    exercises: ['Back Squat', 'Bench Press', 'Deadlift', 'Close-Grip Bench', 'Romanian Deadlift'],
    duration: '75-90 minutes',
    difficulty: 'Advanced',
    focus_areas: ['Strength', 'Competition']
  },

  // Cardio Exercises (gym-based only)
  {
    id: 'hiit-strength',
    name: 'HIIT Strength Circuits',
    type: 'Cardio',
    description: 'High-intensity intervals combining strength movements for cardio benefits',
    exercises: ['Kettlebell Swings', 'Burpees', 'Mountain Climbers', 'Battle Ropes', 'Box Jumps'],
    duration: '20-30 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Cardio', 'Fat Loss', 'Conditioning']
  },
  {
    id: 'circuit-training',
    name: 'Strength Circuit',
    type: 'Cardio',
    description: 'Non-stop circuit of strength exercises for cardiovascular benefits',
    exercises: ['Dumbbell Thrusters', 'Renegade Rows', 'Jump Squats', 'Push-up Variations'],
    duration: '25-35 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Cardio', 'Strength Endurance']
  },
  {
    id: 'metcon',
    name: 'Metabolic Conditioning',
    type: 'Cardio',
    description: 'High-intensity metabolic workout using compound movements',
    exercises: ['Clean and Press', 'Goblet Squats', 'Farmer Walks', 'Sled Pushes'],
    duration: '15-25 minutes',
    difficulty: 'Advanced',
    focus_areas: ['Conditioning', 'Power', 'Fat Loss']
  },

  // Specific Workout Days
  {
    id: 'leg-day',
    name: 'Leg Day Destroyer',
    type: 'Day',
    description: 'Complete lower body workout targeting quads, hamstrings, and glutes',
    exercises: ['Back Squats', 'Romanian Deadlifts', 'Leg Press', 'Walking Lunges', 'Calf Raises'],
    duration: '60-75 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Legs', 'Glutes', 'Strength']
  },
  {
    id: 'chest-day',
    name: 'Chest Development',
    type: 'Day',
    description: 'Comprehensive chest workout with multiple angles and rep ranges',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Flyes', 'Dips'],
    duration: '45-60 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Chest', 'Triceps', 'Hypertrophy']
  },
  {
    id: 'back-day',
    name: 'Back Builder',
    type: 'Day',
    description: 'Complete back development focusing on width and thickness',
    exercises: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Cable Rows', 'Face Pulls'],
    duration: '50-65 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Back', 'Lats', 'Rhomboids']
  },
  {
    id: 'arm-day',
    name: 'Arm Annihilation',
    type: 'Day',
    description: 'Dedicated arm workout for maximum bicep and tricep development',
    exercises: ['Barbell Curls', 'Close-Grip Bench Press', 'Hammer Curls', 'Tricep Dips'],
    duration: '40-50 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Arms', 'Biceps', 'Triceps']
  },
  {
    id: 'shoulder-day',
    name: 'Shoulder Sculptor',
    type: 'Day',
    description: 'Complete shoulder development with all three deltoid heads',
    exercises: ['Overhead Press', 'Lateral Raises', 'Rear Delt Flyes', 'Upright Rows'],
    duration: '45-55 minutes',
    difficulty: 'Intermediate',
    focus_areas: ['Shoulders', 'Deltoids', 'Stability']
  },
  {
    id: 'power-day',
    name: 'Power & Explosiveness',
    type: 'Day',
    description: 'Olympic lifts and power movements for athletic development',
    exercises: ['Power Cleans', 'Push Press', 'Box Jumps', 'Medicine Ball Slams'],
    duration: '45-60 minutes',
    difficulty: 'Advanced',
    focus_areas: ['Power', 'Explosiveness', 'Athletics']
  },
  {
    id: 'core-stability',
    name: 'Core & Stability',
    type: 'Day',
    description: 'Comprehensive core workout for strength and stability',
    exercises: ['Planks', 'Dead Bugs', 'Pallof Press', 'Russian Twists', 'Hanging Leg Raises'],
    duration: '30-40 minutes',
    difficulty: 'Beginner',
    focus_areas: ['Core', 'Stability', 'Functional']
  }
];
