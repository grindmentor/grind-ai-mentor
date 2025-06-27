
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  onExerciseSelect: (exercise: Exercise) => void;
  placeholder?: string;
  showAddCustom?: boolean;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  onExerciseSelect,
  placeholder = "Search exercises...",
  showAddCustom = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchExercises();
    } else {
      setExercises([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const searchExercises = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_exercises_optimized', {
        search_query: searchQuery,
        limit_count: 20,
        search_user_id: user?.id || null
      });

      if (error) throw error;
      setExercises(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search exercises. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setSearchQuery('');
    setShowResults(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 bg-gray-800 border-gray-600 text-white focus:border-blue-500"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border-gray-600 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No exercises found for "{searchQuery}"
                {showAddCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Custom Exercise
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => handleExerciseSelect(exercise)}
                    className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium text-sm">
                            {exercise.name}
                          </h4>
                          {exercise.is_custom && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                            {exercise.difficulty_level}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            {exercise.equipment}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {exercise.primary_muscles.slice(0, 3).map((muscle, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-gray-600 text-gray-300 text-xs"
                            >
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Dumbbell className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
