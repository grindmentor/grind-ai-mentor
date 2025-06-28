import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Exercise {
  id: string;
  name: string;
  description: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  category: string;
  is_custom?: boolean;
}

interface ExerciseSearchProps {
  onExerciseSelect: (exercise: Exercise | string) => void;
  placeholder?: string;
  className?: string;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  onExerciseSelect,
  placeholder = "Search exercises...",
  className = ""
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Very specific muscle group mappings - only exact matches
  const muscleGroupMappings: { [key: string]: string[] } = {
    'chest': ['Chest', 'Pectorals', 'Pecs'],
    'back': ['Back', 'Lats', 'Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Lower Trapezius'],
    'shoulders': ['Shoulders', 'Deltoids', 'Anterior Deltoid', 'Posterior Deltoid', 'Lateral Deltoid'],
    'biceps': ['Biceps', 'Biceps Brachii'],
    'triceps': ['Triceps', 'Triceps Brachii'],
    'quadriceps': ['Quadriceps', 'Quads', 'Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius'],
    'quads': ['Quadriceps', 'Quads', 'Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius'],
    'hamstrings': ['Hamstrings', 'Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    'hamstring': ['Hamstrings', 'Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    'glutes': ['Glutes', 'Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus'],
    'calves': ['Calves', 'Gastrocnemius', 'Soleus'],
    'abs': ['Abs', 'Abdominals', 'Rectus Abdominis'],
    'core': ['Core', 'Abs', 'Abdominals', 'Obliques', 'Transverse Abdominis'],
    'forearms': ['Forearms', 'Wrist Flexors', 'Wrist Extensors'],
    'lats': ['Lats', 'Latissimus Dorsi'],
    'traps': ['Traps', 'Trapezius', 'Upper Trapezius', 'Middle Trapezius', 'Lower Trapezius']
  };

  const getMuscleVariations = (searchTerm: string): string[] => {
    const term = searchTerm.toLowerCase();
    return muscleGroupMappings[term] || [searchTerm];
  };

  const isLikelyMuscleGroupSearch = (query: string): boolean => {
    const term = query.toLowerCase().trim();
    return Object.keys(muscleGroupMappings).includes(term);
  };

  // EXTREMELY strict muscle matching - exact match only for muscle group searches
  const isExactMuscleMatch = (primaryMuscles: string[], searchVariations: string[]): boolean => {
    console.log('Checking muscle match:', { primaryMuscles, searchVariations });
    
    return primaryMuscles.some(muscle => {
      // For muscle group searches, we need EXACT matches only
      const exactMatch = searchVariations.some(variation => {
        const muscleLower = muscle.toLowerCase().trim();
        const variationLower = variation.toLowerCase().trim();
        
        // Only exact matches or very specific muscle names
        const isExact = muscleLower === variationLower;
        
        console.log('Muscle comparison:', { 
          muscle: muscleLower, 
          variation: variationLower, 
          isExact 
        });
        
        return isExact;
      });
      
      return exactMatch;
    });
  };

  // More targeted filtering to exclude specific false positives for hamstring searches
  const shouldExcludeExercise = (exercise: Exercise, searchQuery: string): boolean => {
    const searchLower = searchQuery.toLowerCase().trim();
    const exerciseLower = exercise.name.toLowerCase();
    
    // Specific exclusions for hamstring searches
    if (searchLower === 'hamstring' || searchLower === 'hamstrings') {
      // Only exclude exercises that are clearly NOT hamstring exercises
      const armExercisePatterns = [
        'chinup',
        'chin-up', 
        'chin up',
        'pullup',
        'pull-up',
        'pull up',
        'dumbbell curl', // Specific to arm curls, not leg curls
        'barbell curl', // Specific to arm curls, not leg curls
        'hammer curl',
        'bicep curl',
        'concentration curl',
        'preacher curl',
        'tricep',
        'triceps',
        'overhead press',
        'bench press',
        'shoulder press'
      ];
      
      const shouldExclude = armExercisePatterns.some(pattern => {
        // More precise matching - look for exact phrases or whole words
        if (pattern.includes(' ')) {
          // For multi-word patterns, check if the exercise name contains the exact phrase
          return exerciseLower.includes(pattern);
        } else {
          // For single words, check as whole word boundaries where possible
          const regex = new RegExp(`\\b${pattern}\\b`, 'i');
          return regex.test(exerciseLower);
        }
      });
      
      if (shouldExclude) {
        console.log(`Excluding ${exercise.name} from hamstring search due to pattern match`);
      }
      
      return shouldExclude;
    }
    
    return false;
  };

  useEffect(() => {
    const searchExercises = async () => {
      if (!searchQuery.trim()) {
        setExercises([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Searching for exercises with query:', searchQuery);
        
        const isMuscleGroupSearch = isLikelyMuscleGroupSearch(searchQuery);
        const muscleVariations = getMuscleVariations(searchQuery.trim());
        console.log('Is muscle group search:', isMuscleGroupSearch, 'Variations:', muscleVariations);

        let searchResults: Exercise[] = [];
        
        // First try the optimized search function
        const { data: optimizedData, error: optimizedError } = await supabase
          .rpc('search_exercises_optimized', {
            search_query: searchQuery,
            limit_count: 100, // Get more results for better filtering
            search_user_id: user?.id || null
          });

        if (optimizedError) {
          console.warn('Optimized search failed, falling back to basic search:', optimizedError);
          
          // Enhanced fallback search with strict filtering
          let query = supabase
            .from('exercises')
            .select('id, name, description, primary_muscles, secondary_muscles, equipment, difficulty_level, category')
            .eq('is_active', true);

          // For muscle group searches, be very specific about muscle filtering
          if (isMuscleGroupSearch) {
            // Don't use text search for muscle group queries, rely on array matching
            console.log('Using strict muscle-only search');
          } else {
            // For non-muscle searches, use text matching
            query = query.or(`name.ilike.%${searchQuery}%,equipment.ilike.%${searchQuery}%`);
          }

          const { data: basicData, error: basicError } = await query.limit(100);

          if (basicError) {
            console.error('Basic search failed:', basicError);
            throw basicError;
          }

          searchResults = (basicData || []).map(ex => ({ ...ex, is_custom: false }));
        } else {
          searchResults = optimizedData || [];
        }

        console.log('Raw search results before filtering:', searchResults.length);

        // Apply EXTREMELY strict filtering for muscle group searches
        if (isMuscleGroupSearch) {
          console.log('Applying ultra-strict muscle group filtering for:', searchQuery);
          
          searchResults = searchResults.filter(exercise => {
            // First check if it should be excluded based on exercise name patterns
            if (shouldExcludeExercise(exercise, searchQuery)) {
              return false;
            }
            
            // Then check for exact muscle matches in PRIMARY muscles only
            const isMatch = isExactMuscleMatch(exercise.primary_muscles, muscleVariations);
            
            if (!isMatch) {
              console.log(`Filtering out ${exercise.name}:`, {
                primaryMuscles: exercise.primary_muscles,
                searchVariations: muscleVariations,
                reason: 'No exact primary muscle match'
              });
            } else {
              console.log(`Keeping ${exercise.name}:`, {
                primaryMuscles: exercise.primary_muscles,
                reason: 'Exact primary muscle match found'
              });
            }
            
            return isMatch;
          });
          
          console.log('After ultra-strict filtering:', searchResults.length, 'exercises remain');
        } else {
          // For non-muscle group searches (exercise names, equipment, etc.)
          const searchLower = searchQuery.toLowerCase();
          searchResults = searchResults.filter(exercise => {
            const exerciseNameLower = exercise.name.toLowerCase();
            const equipmentLower = exercise.equipment.toLowerCase();
            
            // Check name match first (highest priority)
            if (exerciseNameLower.includes(searchLower)) return true;
            
            // Check equipment match
            if (equipmentLower.includes(searchLower)) return true;
            
            // Check muscle matches (both primary and secondary for general searches)
            const allMuscles = [...exercise.primary_muscles, ...exercise.secondary_muscles];
            return allMuscles.some(muscle => muscle.toLowerCase().includes(searchLower));
          });
        }

        // Sort results
        if (isMuscleGroupSearch) {
          searchResults.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          // For general searches, sort by relevance
          searchResults.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return a.name.localeCompare(b.name);
          });
        }

        // Limit results
        searchResults = searchResults.slice(0, 20);

        console.log('Final search results:', {
          count: searchResults.length,
          exercises: searchResults.map(ex => ({ name: ex.name, primaryMuscles: ex.primary_muscles }))
        });
        
        setExercises(searchResults);
        setShowDropdown(true);
      } catch (err) {
        console.error('Exercise search error:', err);
        setError('Failed to search exercises. Please try again.');
        setExercises([]);
        setShowDropdown(true);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchExercises, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.id]);

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAddCustomExercise = () => {
    if (searchQuery.trim()) {
      onExerciseSelect(searchQuery.trim());
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 text-sm z-50">
          {error}
        </div>
      )}

      {showDropdown && !isLoading && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
          {exercises.length > 0 && (
            <>
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700/50 border-b border-gray-600/30 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {exercise.primary_muscles.join(', ')} • {exercise.equipment}
                    {exercise.is_custom && <span className="text-blue-400"> • Custom</span>}
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-600/30">
                <button
                  onClick={handleAddCustomExercise}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700/50 flex items-center text-blue-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create "{searchQuery}" as custom exercise
                </button>
              </div>
            </>
          )}

          {exercises.length === 0 && (
            <div className="px-4 py-3 text-center">
              <div className="text-gray-400 text-sm mb-2">
                No exercises found for "{searchQuery}"
              </div>
              <button
                onClick={handleAddCustomExercise}
                className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create "{searchQuery}" as custom exercise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
