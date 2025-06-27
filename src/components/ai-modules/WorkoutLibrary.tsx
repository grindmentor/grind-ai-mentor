
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Dumbbell, Filter, Info } from 'lucide-react';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface WorkoutLibraryProps {
  onBack: () => void;
  navigationSource?: 'dashboard' | 'library';
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ 
  onBack,
  navigationSource = 'dashboard'
}) => {
  const { exercises, loading, searchExercises, getRandomExercises } = useExerciseDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with a few sample exercises instead of loading all
  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing WorkoutLibrary with sample exercises');
      getRandomExercises(8);
      setIsInitialized(true);
    }
  }, [isInitialized, getRandomExercises]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      console.log('Searching for:', query);
      await searchExercises(query);
    } else {
      // Reset to sample exercises when search is cleared
      await getRandomExercises(8);
    }
  };

  const filterExercises = () => {
    if (selectedFilter === 'all') return exercises;
    return exercises.filter(exercise => 
      exercise.difficulty_level?.toLowerCase() === selectedFilter.toLowerCase()
    );
  };

  const filteredExercises = filterExercises();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-orange-500/20">
        <div className="p-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500/30 to-red-500/40 flex items-center justify-center border border-orange-500/30">
              <Dumbbell className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Workout Library</h1>
              <p className="text-xs text-orange-300/80">Science-backed exercises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Search Section */}
        <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/30">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-orange-800/30 border-orange-500/40 text-white placeholder:text-orange-300/70 focus:border-orange-400"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                  className={selectedFilter === 'all' 
                    ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' 
                    : 'border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                  }
                >
                  All
                </Button>
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <Button
                    key={level}
                    variant={selectedFilter === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(level)}
                    className={selectedFilter === level 
                      ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' 
                      : 'border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            {filteredExercises.length === 0 ? (
              <Card className="bg-gray-900/40 border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {searchQuery ? `Search Results (${filteredExercises.length})` : `Featured Exercises (${filteredExercises.length})`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map((exercise) => (
                    <Card 
                      key={exercise.id}
                      className="bg-gradient-to-br from-gray-900/60 to-gray-800/80 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-white text-lg group-hover:text-orange-300 transition-colors">
                            {exercise.name}
                          </CardTitle>
                          <Badge className={getDifficultyColor(exercise.difficulty_level || 'Beginner')}>
                            {exercise.difficulty_level || 'Beginner'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {exercise.description && (
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {exercise.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-400">Primary:</span>
                            {exercise.primary_muscles?.map((muscle, index) => (
                              <Badge 
                                key={index}
                                variant="outline" 
                                className="text-xs border-orange-500/40 text-orange-400 bg-orange-500/10"
                              >
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Equipment: {exercise.equipment}</span>
                            <span>{exercise.mechanics || 'Compound'}</span>
                          </div>
                        </div>

                        {exercise.form_cues && (
                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-400 mb-1">Form Tips</p>
                                <p className="text-xs text-blue-300/90">{exercise.form_cues}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutLibrary;
