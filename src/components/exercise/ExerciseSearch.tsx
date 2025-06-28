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

  // Muscle group mappings for better search - only include primary target muscles
  const muscleGroupMappings: { [key: string]: string[] } = {
    'chest': ['Chest', 'Pectorals', 'Pecs'],
    'back': ['Back', 'Lats', 'Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Lower Trapezius'],
    'shoulders': ['Shoulders', 'Deltoids', 'Anterior Deltoid', 'Posterior Deltoid', 'Lateral Deltoid'],
    'biceps': ['Biceps', 'Biceps Brachii'],
    'triceps': ['Triceps', 'Triceps Brachii'],
    'quadriceps': ['Quadriceps', 'Quads', 'Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    'hamstrings': ['Hamstrings', 'Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    'hamstring': ['Hamstrings', 'Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    'glutes': ['Glutes', 'Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus'],
    'calves': ['Calves', 'Gastrocnemius', 'Soleus'],
    'abs': ['Abs', 'Abdominals', 'Rectus Abdominis'],
    'core': ['Core', 'Abs', 'Abdominals', 'Obliques'],
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

  // More precise muscle matching function
  const isExactMuscleMatch = (muscle: string, searchVariations: string[]): boolean => {
    const muscleLower = muscle.toLowerCase();
    return searchVariations.some(variation => {
      const variationLower = variation.toLowerCase();
      // Exact match or muscle starts with variation (e.g., "Hamstrings" matches "hamstring")
      return muscleLower === variationLower || 
             muscleLower.startsWith(variationLower) ||
             variationLower.startsWith(muscleLower);
    });
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
            limit_count: 20,
            search_user_id: user?.id || null
          });

        if (optimizedError) {
          console.warn('Optimized search failed, falling back to enhanced search:', optimizedError);
          
          // Enhanced fallback search with better muscle group matching
          const { data: basicData, error: basicError } = await supabase
            .from('exercises')
            .select('id, name, description, primary_muscles, secondary_muscles, equipment, difficulty_level, category')
            .eq('is_active', true)
            .limit(50); // Get more results for better filtering

          if (basicError) {
            console.error('Basic search failed:', basicError);
            throw basicError;
          }

          // Filter results with improved logic for muscle group searches
          searchResults = (basicData || [])
            .filter(exercise => {
              const searchLower = searchQuery.toLowerCase();
              const exerciseNameLower = exercise.name.toLowerCase();
              const equipmentLower = exercise.equipment.toLowerCase();
              
              // For muscle group searches, be very strict - only primary muscle matches
              if (isMuscleGroupSearch) {
                // Only return exercises where the primary muscles exactly match the search
                return exercise.primary_muscles.some(muscle => 
                  isExactMuscleMatch(muscle, muscleVariations)
                );
              }
              
              // For non-muscle group searches (exercise names, equipment, etc.)
              // Check name match first (highest priority)
              if (exerciseNameLower.includes(searchLower)) return true;
              
              // Check equipment match
              if (equipmentLower.includes(searchLower)) return true;
              
              // Check muscle matches (both primary and secondary for general searches)
              const allMuscles = [...exercise.primary_muscles, ...exercise.secondary_muscles];
              return allMuscles.some(muscle => muscle.toLowerCase().includes(searchLower));
            })
            .map(ex => ({ ...ex, is_custom: false }));
        } else {
          searchResults = optimizedData || [];
          
          // If we got results from optimized search but it's a muscle group search,
          // filter to only include exercises that primarily target the searched muscle
          if (isMuscleGroupSearch && searchResults.length > 0) {
            const exactMatches = searchResults.filter(exercise => 
              exercise.primary_muscles.some(muscle => 
                isExactMuscleMatch(muscle, muscleVariations)
              )
            );
            
            // Use exact matches if we have them, otherwise keep all results
            if (exactMatches.length > 0) {
              searchResults = exactMatches;
            }
          }
        }

        // Sort results for muscle group searches
        if (isMuscleGroupSearch) {
          searchResults.sort((a, b) => {
            // First sort by name alphabetically
            return a.name.localeCompare(b.name);
          });
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

        console.log('Search results:', searchResults.length, 'exercises found');
        setExercises(searchResults);
        setShowDropdown(true); // Always show dropdown when there's a search query
      } catch (err) {
        console.error('Exercise search error:', err);
        setError('Failed to search exercises. Please try again.');
        setExercises([]);
        setShowDropdown(true); // Still show dropdown for custom exercise option
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
                  Add "{searchQuery}" as custom exercise
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
