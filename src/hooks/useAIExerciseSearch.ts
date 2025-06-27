
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

export const useAIExerciseSearch = () => {
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Predefined search suggestions for quick access
  const popularSearches = [
    'chest workout', 'leg day', 'back exercises', 'shoulder training',
    'arms workout', 'deadlift variations', 'squat techniques', 'bench press',
    'pull ups', 'rows', 'tricep exercises', 'bicep curls', 'leg press',
    'overhead press', 'lat pulldowns', 'cable exercises'
  ];

  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    suggestionTimeoutRef.current = setTimeout(() => {
      const queryLower = query.toLowerCase();
      const filtered = popularSearches.filter(search => 
        search.toLowerCase().includes(queryLower)
      );
      
      // Add dynamic suggestions based on query
      const dynamicSuggestions = [];
      if (queryLower.includes('chest')) {
        dynamicSuggestions.push('chest press variations', 'chest fly exercises', 'incline chest workout');
      }
      if (queryLower.includes('leg')) {
        dynamicSuggestions.push('leg day routine', 'quad exercises', 'hamstring workouts');
      }
      if (queryLower.includes('back')) {
        dynamicSuggestions.push('back muscle building', 'lat exercises', 'rhomboid training');
      }
      if (queryLower.includes('arm')) {
        dynamicSuggestions.push('arm pump workout', 'bicep and tricep', 'forearm exercises');
      }

      const allSuggestions = [...new Set([...filtered, ...dynamicSuggestions])].slice(0, 6);
      setSuggestions(allSuggestions);
    }, 150);
  }, []);

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

    // Get suggestions immediately
    getSuggestions(query);

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

        // Strict filtering for gym-only strength exercises
        const filteredExercises = (data.exercises || []).filter((exercise: AIExercise) => {
          const isStrengthOnly = exercise.category === 'Strength' || exercise.category === 'Full Workout';
          const hasGymEquipment = exercise.equipment && 
            (exercise.equipment.toLowerCase().includes('barbell') ||
             exercise.equipment.toLowerCase().includes('dumbbell') ||
             exercise.equipment.toLowerCase().includes('cable') ||
             exercise.equipment.toLowerCase().includes('machine') ||
             exercise.equipment.toLowerCase().includes('bench') ||
             exercise.equipment.toLowerCase().includes('rack') ||
             exercise.equipment.toLowerCase() === 'bodyweight');
          
          // Exclude cardio terms
          const exerciseName = exercise.name.toLowerCase();
          const isCardio = exerciseName.includes('running') || 
                          exerciseName.includes('cycling') || 
                          exerciseName.includes('treadmill') ||
                          exerciseName.includes('elliptical') ||
                          exerciseName.includes('rowing machine') ||
                          exerciseName.includes('jump') ||
                          exercise.category === 'Cardio';

          // Exclude stretching/flexibility
          const isStretching = exerciseName.includes('stretch') ||
                             exerciseName.includes('yoga') ||
                             exerciseName.includes('mobility');
          
          return isStrengthOnly && hasGymEquipment && !isCardio && !isStretching;
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
  }, [getSuggestions]);

  return {
    exercises,
    suggestions,
    loading,
    error,
    searchExercises,
    getSuggestions
  };
};

// Curated workout templates for the library
export const curatedWorkoutTemplates: WorkoutTemplate[] = [
  // Workout Splits
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
