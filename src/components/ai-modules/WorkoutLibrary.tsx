
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Zap, Target, Trophy, Clock, Dumbbell } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAIExerciseSearch } from "@/hooks/useAIExerciseSearch";

interface WorkoutLibraryProps {
  onBack: () => void;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, searchExercises } = useAIExerciseSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchExercises(query);
    }
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Cardio': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'Strength': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'Full Workout': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const popularSearches = [
    'chest workout',
    'leg day',
    'cardio HIIT',
    'back exercises',
    'full body routine',
    'abs workout',
    'shoulder training',
    'arms workout'
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900/10 to-gray-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
                  <p className="text-xs sm:text-sm text-gray-400">Discover exercises with AI-powered insights</p>
                </div>
              </div>
            </div>

            {/* AI Search */}
            <Card className="bg-gradient-to-r from-slate-900/40 to-gray-900/40 backdrop-blur-sm border-slate-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Sparkles className="w-5 h-5 mr-2 text-slate-400" />
                  AI Exercise Discovery
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Describe what you want to train and get personalized exercise recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="e.g., 'build bigger chest', 'improve cardio endurance', 'home leg workout'..."
                    className="bg-gray-800/50 border-slate-500/30 text-white pl-12 focus:border-slate-400 text-base"
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Popular Searches */}
                {!searchQuery && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Popular Searches:</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search) => (
                        <Button
                          key={search}
                          onClick={() => handleSearch(search)}
                          variant="outline"
                          size="sm"
                          className="border-slate-500/30 text-slate-400 hover:bg-slate-500/20 hover:border-slate-400"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exercise Results */}
            {exercises.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {exercises.map((exercise, index) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${getCategoryGradient(exercise.category)} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
                  >
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
                        {exercise.muscle_groups.join(' • ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {exercise.description}
                      </p>
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
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && searchQuery && exercises.length === 0 && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
                  <p className="text-gray-400 mb-4">
                    Try a different search term or browse our popular suggestions above.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Welcome State */}
            {!searchQuery && exercises.length === 0 && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-500/20 to-gray-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome to AI Workout Library</h3>
                  <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                    Discover personalized exercises powered by AI. Search for specific muscle groups, 
                    workout types, or describe your fitness goals to get scientifically-backed recommendations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Cardio</h4>
                      <p className="text-xs text-gray-400">HIIT, running, cycling</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Dumbbell className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Strength</h4>
                      <p className="text-xs text-gray-400">Weights, resistance</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Full Workouts</h4>
                      <p className="text-xs text-gray-400">Complete routines</p>
                    </div>
                  </div>
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
