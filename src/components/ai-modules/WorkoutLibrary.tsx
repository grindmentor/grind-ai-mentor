
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Zap, Target, Trophy, Clock, Dumbbell, Filter, Star, Grid, List } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAIExerciseSearch, curatedWorkoutTemplates, WorkoutTemplate } from "@/hooks/useAIExerciseSearch";

interface WorkoutLibraryProps {
  onBack: () => void;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'curated'>('curated');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { exercises, suggestions, loading, searchExercises, getSuggestions } = useAIExerciseSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
    if (query.trim()) {
      searchExercises(query);
    }
    getSuggestions(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchExercises(suggestion);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cardio': return <Zap className="w-5 h-5" />;
      case 'Strength': return <Dumbbell className="w-5 h-5" />;
      case 'Full Workout': return <Trophy className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'Split': return <Target className="w-5 h-5" />;
      case 'Cardio': return <Zap className="w-5 h-5" />;
      case 'Day': return <Dumbbell className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTemplateGradient = (type: string) => {
    switch (type) {
      case 'Split': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'Cardio': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'Day': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Cardio': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'Strength': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'Full Workout': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const filterTemplatesByType = (type: string) => {
    return curatedWorkoutTemplates.filter(template => template.type === type);
  };

  const renderTemplateGrid = (templates: WorkoutTemplate[]) => {
    const gridClass = viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'flex flex-col gap-3';
    
    return (
      <div className={gridClass}>
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`bg-gradient-to-br ${getTemplateGradient(template.type)} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${viewMode === 'list' ? 'flex-row' : ''}`}
            onClick={() => setSelectedTemplate(template)}
          >
            {viewMode === 'list' ? (
              <div className="flex items-center p-4 space-x-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getTemplateGradient(template.type)} flex-shrink-0`}>
                  {getTemplateIcon(template.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white group-hover:text-gray-100 text-lg font-semibold">{template.name}</h3>
                    <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{template.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{template.duration}</span>
                    </div>
                    <span>{template.exercises.length} exercises</span>
                    <span>{template.focus_areas.join(' • ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getTemplateGradient(template.type)}`}>
                      {getTemplateIcon(template.type)}
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-white group-hover:text-gray-100 text-lg">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300">
                    {template.focus_areas.join(' • ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{template.duration}</span>
                    </div>
                    <span className="text-gray-400">{template.exercises.length} exercises</span>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderExerciseGrid = () => {
    const gridClass = viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      : 'flex flex-col gap-3';
    
    return (
      <div className={gridClass}>
        {exercises.map((exercise, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br ${getCategoryGradient(exercise.category)} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${viewMode === 'list' ? 'flex-row' : ''}`}
          >
            {viewMode === 'list' ? (
              <div className="flex items-start p-4 space-x-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(exercise.category)} flex-shrink-0`}>
                  {getCategoryIcon(exercise.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white group-hover:text-gray-100 text-lg font-semibold">{exercise.name}</h3>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                    <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">{exercise.category}</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{exercise.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>🎯 {exercise.muscle_groups.join(' • ')}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{exercise.estimated_duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{exercise.equipment}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(exercise.category)}`}>
                      {getCategoryIcon(exercise.category)}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-white group-hover:text-gray-100 text-lg">
                    {exercise.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300">
                    🎯 {exercise.muscle_groups.join(' • ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {exercise.description}
                  </p>
                  {exercise.form_tips && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="text-blue-400 font-medium text-sm mb-1">Form Tips:</h4>
                      <p className="text-blue-300 text-xs">{exercise.form_tips}</p>
                    </div>
                  )}
                  {exercise.muscle_focus && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <h4 className="text-purple-400 font-medium text-sm mb-1">Muscle Focus:</h4>
                      <p className="text-purple-300 text-xs">{exercise.muscle_focus}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{exercise.estimated_duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Target className="w-3 h-3" />
                      <span>{exercise.equipment}</span>
                    </div>
                  </div>
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
                      AI Workout Library
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">Discover exercises and curated workouts with AI insights</p>
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

            {/* AI Search with Dynamic Suggestions */}
            <Card className="bg-gradient-to-r from-slate-900/40 to-gray-900/40 backdrop-blur-sm border-slate-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Sparkles className="w-5 h-5 mr-2 text-slate-400" />
                  AI Exercise Discovery
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Search for gym exercises with AI-powered insights and form guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="e.g., 'bench press form', 'quad exercises', 'compound movements'..."
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
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setActiveTab('curated')}
                variant={activeTab === 'curated' ? 'default' : 'outline'}
                className={activeTab === 'curated' ? 
                  'bg-slate-600/50 text-white' : 
                  'border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
                }
              >
                <Star className="w-4 h-4 mr-2" />
                Curated Library
              </Button>
              <Button
                onClick={() => setActiveTab('search')}
                variant={activeTab === 'search' ? 'default' : 'outline'}
                className={activeTab === 'search' ? 
                  'bg-slate-600/50 text-white' : 
                  'border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
                }
                disabled={!searchQuery}
              >
                <Filter className="w-4 h-4 mr-2" />
                Search Results ({exercises.length})
              </Button>
            </div>

            {/* Curated Library */}
            {activeTab === 'curated' && (
              <div className="space-y-8">
                {/* Workout Splits */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Workout Splits
                  </h2>
                  {renderTemplateGrid(filterTemplatesByType('Split'))}
                </div>

                {/* Cardio Exercises */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-red-400" />
                    Strength-Based Cardio
                  </h2>
                  {renderTemplateGrid(filterTemplatesByType('Cardio'))}
                </div>

                {/* Workout Days */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2 text-purple-400" />
                    Specialized Workout Days
                  </h2>
                  {renderTemplateGrid(filterTemplatesByType('Day'))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {activeTab === 'search' && (
              <>
                {exercises.length > 0 && renderExerciseGrid()}

                {/* Search States */}
                {!loading && searchQuery && exercises.length === 0 && (
                  <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No gym exercises found</h3>
                      <p className="text-gray-400 mb-4">
                        Try searching for strength training exercises, muscle groups, or equipment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Welcome State */}
            {activeTab === 'curated' && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 mt-8">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-500/20 to-gray-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Workout Library</h3>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Explore our curated collection of scientifically-backed workout programs and use AI search 
                    to discover exercises with detailed form guidance and muscle targeting information.
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
