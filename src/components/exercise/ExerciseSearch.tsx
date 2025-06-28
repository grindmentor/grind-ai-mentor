
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
        
        // Enhanced search that handles muscle groups better
        let searchResults: Exercise[] = [];
        
        // First try the optimized search function
        const { data: optimizedData, error: optimizedError } = await supabase
          .rpc('search_exercises_optimized', {
            search_query: searchQuery,
            limit_count: 15,
            search_user_id: user?.id || null
          });

        if (optimizedError) {
          console.warn('Optimized search failed, falling back to basic search:', optimizedError);
          
          // Enhanced fallback search for muscle groups
          const { data: basicData, error: basicError } = await supabase
            .from('exercises')
            .select('id, name, description, primary_muscles, secondary_muscles, equipment, difficulty_level, category')
            .or(`name.ilike.%${searchQuery}%,primary_muscles.cs.{${searchQuery}},secondary_muscles.cs.{${searchQuery}}`)
            .eq('is_active', true)
            .limit(15);

          if (basicError) {
            console.error('Basic search also failed:', basicError);
            throw basicError;
          }

          searchResults = basicData?.map(ex => ({ ...ex, is_custom: false })) || [];
        } else {
          searchResults = optimizedData || [];
        }

        // Filter and sort results to prioritize muscle group matches
        const isLikelyMuscleGroup = searchQuery.toLowerCase().match(/^(chest|back|shoulders|arms|biceps|triceps|legs|quadriceps|hamstrings|glutes|calves|core|abs|forearms|lats|traps)$/);
        
        if (isLikelyMuscleGroup) {
          // Sort muscle group matches to the top
          searchResults.sort((a, b) => {
            const aMatchesPrimary = a.primary_muscles.some(muscle => 
              muscle.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const bMatchesPrimary = b.primary_muscles.some(muscle => 
              muscle.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            if (aMatchesPrimary && !bMatchesPrimary) return -1;
            if (!aMatchesPrimary && bMatchesPrimary) return 1;
            
            const aMatchesSecondary = a.secondary_muscles.some(muscle => 
              muscle.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const bMatchesSecondary = b.secondary_muscles.some(muscle => 
              muscle.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            if (aMatchesSecondary && !bMatchesSecondary) return -1;
            if (!aMatchesSecondary && bMatchesSecondary) return 1;
            
            return a.name.localeCompare(b.name);
          });
        }

        setExercises(searchResults);
        setShowDropdown(searchResults.length > 0);
      } catch (err) {
        console.error('Exercise search error:', err);
        setError('Failed to search exercises. Please try again.');
        setExercises([]);
        setShowDropdown(false);
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

      {showDropdown && !isLoading && (
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
              
              {searchQuery.trim() && (
                <div className="border-t border-gray-600/30">
                  <button
                    onClick={handleAddCustomExercise}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700/50 flex items-center text-blue-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add "{searchQuery}" as custom exercise
                  </button>
                </div>
              )}
            </>
          )}

          {exercises.length === 0 && searchQuery.trim() && (
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
