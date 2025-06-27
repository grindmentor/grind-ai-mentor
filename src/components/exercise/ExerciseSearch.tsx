
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level?: string;
  category: string;
  is_custom?: boolean;
}

interface ExerciseSearchProps {
  onExerciseSelect: (exercise: Exercise) => void;
  placeholder?: string;
  maxResults?: number;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  onExerciseSelect,
  placeholder = "Search exercises...",
  maxResults = 20
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchExercises = async (query: string = '') => {
    if (!user) return;

    setLoading(true);
    try {
      // Use the optimized search function with user context for custom exercises
      const { data, error } = await supabase.rpc('search_exercises_optimized', {
        search_query: query.trim(),
        muscle_filter: null,
        equipment_filter: null,
        limit_count: maxResults,
        search_user_id: user.id
      });

      if (error) {
        console.error('Error searching exercises:', error);
        
        // Fallback to basic search if optimized search fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('exercises')
          .select('*')
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,equipment.ilike.%${query}%`)
          .limit(maxResults);

        if (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
          setExercises([]);
        } else {
          setExercises(fallbackData || []);
        }
      } else {
        setExercises(data || []);
      }
      
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setExercises([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial load of popular exercises
  useEffect(() => {
    searchExercises('');
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(false);
    searchExercises(searchQuery);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent mx-auto mb-2" />
            <p className="text-blue-300/70">Searching exercises...</p>
          </div>
        ) : exercises.length === 0 && hasSearched ? (
          <div className="text-center py-4 text-blue-300/70">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 text-blue-400/50" />
            <p>No exercises found. Try a different search term.</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <Card 
              key={exercise.id}
              className="bg-blue-900/40 border-blue-500/40 hover:bg-blue-900/60 cursor-pointer transition-colors"
              onClick={() => handleExerciseSelect(exercise)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{exercise.name}</h4>
                    {exercise.description && (
                      <p className="text-sm text-blue-200/70 mt-1 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                        {exercise.equipment}
                      </Badge>
                      {exercise.difficulty_level && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                          {exercise.difficulty_level}
                        </Badge>
                      )}
                      {exercise.is_custom && (
                        <Badge className="text-xs bg-green-600/80 text-white">
                          Custom
                        </Badge>
                      )}
                    </div>
                    {exercise.primary_muscles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-300/70">
                          <span className="font-medium">Muscles: </span>
                          {exercise.primary_muscles.slice(0, 3).join(', ')}
                          {exercise.primary_muscles.length > 3 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
