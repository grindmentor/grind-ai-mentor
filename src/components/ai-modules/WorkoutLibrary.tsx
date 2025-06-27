
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Zap, Target, Trophy, Clock, Dumbbell, Filter, Star, Grid, List, Info, Play } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExerciseDatabase, Exercise } from "@/hooks/useExerciseDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkoutLibraryProps {
  onBack: () => void;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    difficulty: '',
    equipment: '',
    muscleGroup: '',
    mechanics: ''
  });
  
  const { exercises, loading, suggestions, searchExercises, getExerciseSuggestions, getRandomExercises, getExercisesByMuscle } = useExerciseDatabase();

  // Load random exercises on mount
  useEffect(() => {
    getRandomExercises(12);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || Object.values(filters).some(f => f)) {
        const searchFilters = {
          muscle_groups: filters.muscleGroup ? [filters.muscleGroup] : undefined,
          equipment: filters.equipment || undefined,
          difficulty: filters.difficulty || undefined,
          mechanics: filters.mechanics || undefined
        };
        searchExercises(searchQuery, searchFilters);
        if (searchQuery.trim()) {
          getExerciseSuggestions(searchQuery);
        }
      } else {
        getRandomExercises(12);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      equipment: '',
      muscleGroup: '',
      mechanics: ''
    });
    setSearchQuery('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMechanicsColor = (mechanics: string) => {
    switch (mechanics) {
      case 'Compound': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Isolation': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const renderExerciseGrid = () => {
    const gridClass = viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      : 'flex flex-col gap-3';
    
    return (
      <div className={gridClass}>
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={`bg-gradient-to-br from-slate-900/60 to-gray-800/60 backdrop-blur-sm border-slate-600/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${viewMode === 'list' ? 'flex-row' : ''}`}
          >
            {viewMode === 'list' ? (
              <div className="flex items-start p-4 space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600/50 to-gray-700/50 flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white group-hover:text-gray-100 text-lg font-semibold truncate">{exercise.name}</h3>
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>{exercise.difficulty_level}</Badge>
                    <Badge className={getMechanicsColor(exercise.mechanics)}>{exercise.mechanics}</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{exercise.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>🎯 {exercise.primary_muscles.join(' • ')}</span>
                    <span>🏋️ {exercise.equipment}</span>
                    <span>{exercise.force_type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(exercise);
                    }}
                    className="text-slate-400 hover:text-slate-300 hover:bg-slate-500/20"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600/50 to-gray-700/50">
                      <Dumbbell className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                        {exercise.difficulty_level}
                      </Badge>
                      <Badge className={getMechanicsColor(exercise.mechanics)}>
                        {exercise.mechanics}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-white group-hover:text-gray-100 text-lg">
                    {exercise.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300">
                    🎯 {exercise.primary_muscles.join(' • ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {exercise.description}
                  </p>
                  
                  {exercise.secondary_muscles.length > 0 && (
                    <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3">
                      <h4 className="text-slate-400 font-medium text-sm mb-1">Secondary Muscles:</h4>
                      <p className="text-slate-300 text-xs">{exercise.secondary_muscles.join(', ')}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span>🏋️ {exercise.equipment}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span>{exercise.force_type}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(exercise);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-500/30 text-slate-400 hover:bg-slate-500/20 hover:border-slate-400"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900/10 to-gray-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="text-white hover:bg-gray-800/50 backdrop-blur-sm w-fit"
                  size={isMobile ? "sm" : "default"}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isMobile ? "Back" : "Back to Dashboard"}
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-slate-500/20 to-gray-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-400/20">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-400 to-gray-500 bg-clip-text text-transparent">
                      Exercise Library
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">Comprehensive database of gym-based strength exercises</p>
                  </div>
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 
                    'bg-slate-600/50 text-white' : 
                    'border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 
                    'bg-slate-600/50 text-white' : 
                    'border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="bg-gradient-to-r from-slate-900/40 to-gray-900/40 backdrop-blur-sm border-slate-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Search className="w-5 h-5 mr-2 text-slate-400" />
                  Exercise Search & Filters
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Search our comprehensive database of gym-based strength exercises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search exercises, muscle groups, or equipment..."
                    className="bg-gray-800/50 border-slate-500/30 text-white pl-12 focus:border-slate-400 text-base"
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Dynamic Search Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Search Suggestions:</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          variant="outline"
                          size="sm"
                          className="border-slate-500/30 text-slate-400 hover:bg-slate-500/20 hover:border-slate-400"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="bg-gray-800/50 border-slate-500/30 text-white">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.muscleGroup} onValueChange={(value) => setFilters(prev => ({ ...prev, muscleGroup: value }))}>
                    <SelectTrigger className="bg-gray-800/50 border-slate-500/30 text-white">
                      <SelectValue placeholder="Muscle Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Muscles</SelectItem>
                      <SelectItem value="Chest">Chest</SelectItem>
                      <SelectItem value="Lats">Back</SelectItem>
                      <SelectItem value="Shoulders">Shoulders</SelectItem>
                      <SelectItem value="Quadriceps">Legs</SelectItem>
                      <SelectItem value="Biceps">Arms</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.equipment} onValueChange={(value) => setFilters(prev => ({ ...prev, equipment: value }))}>
                    <SelectTrigger className="bg-gray-800/50 border-slate-500/30 text-white">
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Equipment</SelectItem>
                      <SelectItem value="Barbell">Barbell</SelectItem>
                      <SelectItem value="Dumbbells">Dumbbells</SelectItem>
                      <SelectItem value="Cable Machine">Cable Machine</SelectItem>
                      <SelectItem value="Pull-up Bar">Pull-up Bar</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.mechanics} onValueChange={(value) => setFilters(prev => ({ ...prev, mechanics: value }))}>
                    <SelectTrigger className="bg-gray-800/50 border-slate-500/30 text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="Compound">Compound</SelectItem>
                      <SelectItem value="Isolation">Isolation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {Object.values(filters).some(f => f) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="border-slate-500/30 text-slate-400 hover:bg-slate-500/20"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Exercise Results */}
            {exercises.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {searchQuery || Object.values(filters).some(f => f) ? 'Search Results' : 'Featured Exercises'} ({exercises.length})
                  </h2>
                </div>
                {renderExerciseGrid()}
              </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && (
              <Card className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-gray-600/50 fixed inset-4 z-50 overflow-y-auto">
                <CardHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl mb-2">{selectedExercise.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(selectedExercise.difficulty_level)}>
                          {selectedExercise.difficulty_level}
                        </Badge>
                        <Badge className={getMechanicsColor(selectedExercise.mechanics)}>
                          {selectedExercise.mechanics}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExercise(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Primary Muscles</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedExercise.primary_muscles.map((muscle) => (
                            <Badge key={muscle} variant="outline" className="border-blue-500/30 text-blue-400">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {selectedExercise.secondary_muscles.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Secondary Muscles</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedExercise.secondary_muscles.map((muscle) => (
                              <Badge key={muscle} variant="outline" className="border-purple-500/30 text-purple-400">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Equipment & Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Equipment:</span>
                            <span className="text-white">{selectedExercise.equipment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Force Type:</span>
                            <span className="text-white">{selectedExercise.force_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white">{selectedExercise.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedExercise.description && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Description</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedExercise.description}</p>
                    </div>
                  )}
                  
                  {selectedExercise.instructions && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Instructions</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedExercise.instructions}</p>
                    </div>
                  )}
                  
                  {selectedExercise.form_cues && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Form Cues
                      </h4>
                      <p className="text-blue-300 text-sm leading-relaxed">{selectedExercise.form_cues}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4 border-t border-gray-700/50">
                    <Button
                      onClick={() => setSelectedExercise(null)}
                      className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search States */}
            {!loading && (searchQuery || Object.values(filters).some(f => f)) && exercises.length === 0 && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search terms or filters to find exercises.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-slate-500/30 text-slate-400 hover:bg-slate-500/20"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Welcome State */}
            {!searchQuery && !Object.values(filters).some(f => f) && exercises.length > 0 && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 mt-8">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-500/20 to-gray-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Comprehensive Exercise Database</h3>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Explore our curated collection of gym-based strength training exercises. Each exercise includes detailed 
                    instructions, form cues, muscle targeting information, and difficulty ratings to help you train effectively.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkoutLibrary;
