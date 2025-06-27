import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Play, Save, Minus, Sparkles, Zap, Timer, Trophy, Target, TrendingUp, Dumbbell, Clock, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExerciseDatabase, Exercise } from "@/hooks/useExerciseDatabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  rir: number;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

interface WorkoutSession {
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
  start_time: string;
  end_time?: string;
  notes?: string;
}

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { exercises, loading, suggestions, searchExercises, getExerciseSuggestions, getRandomExercises } = useExerciseDatabase();
  
  const [workout, setWorkout] = useState<WorkoutSession>({
    name: 'New Workout',
    exercises: [],
    start_time: new Date().toISOString(),
    notes: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Custom exercise form
  const [customExercise, setCustomExercise] = useState({
    name: '',
    muscle_groups: '',
    equipment: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });

  // Timer for workout duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        const startTime = new Date(workout.start_time).getTime();
        const now = new Date().getTime();
        setWorkoutDuration(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workout.start_time]);

  // Load random exercises on mount
  useEffect(() => {
    if (activeTab === 'search' && exercises.length === 0 && !searchQuery) {
      getRandomExercises(8);
    }
  }, [activeTab]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchExercises(searchQuery);
        getExerciseSuggestions(searchQuery);
      } else {
        getRandomExercises(8);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise,
      sets: [{
        id: Date.now().toString(),
        reps: 8,
        weight: 0,
        rir: 2
      }],
      notes: ''
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setSearchQuery('');
    setSelectedExercise(null);
    toast({
      title: "Exercise added! 💪",
      description: `${exercise.name} has been added to your workout.`,
    });
  };

  const addCustomExercise = async () => {
    if (!customExercise.name.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter an exercise name.",
        variant: "destructive"
      });
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: customExercise.name,
      description: 'Custom exercise',
      instructions: '',
      primary_muscles: customExercise.muscle_groups.split(',').map(m => m.trim()).filter(Boolean),
      secondary_muscles: [],
      equipment: customExercise.equipment || 'Unknown',
      difficulty_level: customExercise.difficulty,
      category: 'Strength',
      force_type: 'Push',
      mechanics: 'Compound',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    addExerciseToWorkout(exercise);
    
    // Reset form
    setCustomExercise({
      name: '',
      muscle_groups: '',
      equipment: '',
      difficulty: 'Beginner'
    });
    
    setActiveTab('search');
  };

  const addSet = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: [...ex.sets, {
                id: Date.now().toString(),
                reps: ex.sets[ex.sets.length - 1]?.reps || 8,
                weight: ex.sets[ex.sets.length - 1]?.weight || 0,
                rir: ex.sets[ex.sets.length - 1]?.rir || 2
              }]
            }
          : ex
      )
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: ex.sets.map(set => 
                set.id === setId ? { ...set, [field]: value } : set
              )
            }
          : ex
      )
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: ex.sets.filter(set => set.id !== setId)
            }
          : ex
      )
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkout(prev => ({
      ...prev,
      start_time: new Date().toISOString()
    }));
    toast({
      title: "Workout started! 🔥",
      description: "Time to build strength!",
    });
  };

  const finishWorkout = async () => {
    if (!user) return;

    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    
    if (totalSets === 0) {
      toast({
        title: "Add some exercises first!",
        description: "Your workout needs at least one set to be saved.",
        variant: "destructive"
      });
      return;
    }

    try {
      const workoutData = {
        user_id: user.id,
        workout_name: workout.name,
        start_time: workout.start_time,
        end_time: new Date().toISOString(),
        notes: workout.notes,
        exercises: workout.exercises,
        duration_minutes: Math.round(workoutDuration / 60),
        session_date: new Date().toISOString().split('T')[0],
        exercises_data: workout.exercises
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert([workoutData]);

      if (error) throw error;

      toast({
        title: "Workout completed! 🎉",
        description: `Great job! You completed ${totalSets} sets in ${Math.round(workoutDuration / 60)} minutes.`,
      });

      // Reset workout
      setWorkout({
        name: 'New Workout',
        exercises: [],
        start_time: new Date().toISOString(),
        notes: ''
      });
      setIsWorkoutActive(false);
      setWorkoutDuration(0);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error saving workout",
        description: "Please try again.",
        variant: "destructive",
      });
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

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchExercises(suggestion);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900/10 to-violet-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="text-white hover:bg-gray-800/50 backdrop-blur-sm"
                  size={isMobile ? "sm" : "default"}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isMobile ? "Back" : "Back to Dashboard"}
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500/20 to-violet-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-indigo-400/20">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                      Workout Logger
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">Track your workouts with our exercise database</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isWorkoutActive && (
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                    <Timer className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-mono">{formatDuration(workoutDuration)}</span>
                  </div>
                )}
                {!isWorkoutActive ? (
                  <Button 
                    onClick={startWorkout}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                ) : (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Workout Name */}
            <Card className="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 backdrop-blur-sm border-indigo-500/30">
              <CardContent className="p-4">
                <Input
                  value={workout.name}
                  onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800/50 border-indigo-500/30 text-white text-lg font-semibold focus:border-indigo-400"
                  placeholder="Give your workout a name..."
                />
              </CardContent>
            </Card>

            {/* Exercise Search/Add Section */}
            <Card className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-sm border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Sparkles className="w-5 h-5 mr-2 text-violet-400" />
                  Add Exercises
                </CardTitle>
                <CardDescription className="text-violet-200/70">
                  Search from our curated database of gym exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-violet-900/30">
                    <TabsTrigger value="search" className="data-[state=active]:bg-violet-500/30">
                      <Search className="w-4 h-4 mr-2" />
                      Search Database
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="data-[state=active]:bg-violet-500/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Custom
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400" />
                      <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search exercises, muscle groups, or equipment..."
                        className="bg-gray-800/50 border-violet-500/30 text-white pl-12 focus:border-violet-400"
                      />
                      {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Suggestions:</h3>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <Button
                              key={suggestion}
                              onClick={() => handleSuggestionClick(suggestion)}
                              variant="outline"
                              size="sm"
                              className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:border-violet-400"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercise Results */}
                    {exercises.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {exercises.map((exercise) => (
                          <Card
                            key={exercise.id}
                            className="bg-gray-800/30 border-gray-600/50 hover:bg-gray-700/40 transition-all cursor-pointer group"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Dumbbell className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-white group-hover:text-violet-300 truncate">
                                        {exercise.name}
                                      </h4>
                                      <p className="text-sm text-gray-400 truncate">
                                        🎯 {exercise.primary_muscles.join(', ')}
                                      </p>
                                      {exercise.secondary_muscles.length > 0 && (
                                        <p className="text-xs text-gray-500 truncate">
                                          Secondary: {exercise.secondary_muscles.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                  <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                                    {exercise.difficulty_level}
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedExercise(exercise);
                                          }}
                                          className="p-1 h-6 w-6"
                                        >
                                          <Info className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View details</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <Button
                                    onClick={() => addExerciseToWorkout(exercise)}
                                    variant="outline"
                                    size="sm"
                                    className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>🏋️ {exercise.equipment}</span>
                                <span>{exercise.mechanics} • {exercise.force_type}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {!loading && searchQuery && exercises.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No exercises found. Try a different search term or create a custom exercise!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-4">
                      <Input
                        value={customExercise.name}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Exercise name (e.g., 'Cable Crossovers')"
                        className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400"
                      />
                      <Input
                        value={customExercise.muscle_groups}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, muscle_groups: e.target.value }))}
                        placeholder="Muscle groups (e.g., 'Chest, Triceps')"
                        className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400"
                      />
                      <Input
                        value={customExercise.equipment}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, equipment: e.target.value }))}
                        placeholder="Equipment (e.g., 'Cable Machine')"
                        className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400"
                      />
                      <select
                        value={customExercise.difficulty}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' }))}
                        className="w-full bg-gray-800/50 border border-violet-500/30 text-white rounded-md px-3 py-2 focus:border-violet-400"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <Button
                        onClick={addCustomExercise}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Exercise
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
              <Card className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-gray-600/50 fixed inset-4 z-50 overflow-y-auto">
                <CardHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl">{selectedExercise.name}</CardTitle>
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Primary Muscles:</span>
                      <p className="text-white">{selectedExercise.primary_muscles.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Equipment:</span>
                      <p className="text-white">{selectedExercise.equipment}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Difficulty:</span>
                      <Badge className={getDifficultyColor(selectedExercise.difficulty_level)}>
                        {selectedExercise.difficulty_level}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <p className="text-white">{selectedExercise.mechanics} • {selectedExercise.force_type}</p>
                    </div>
                  </div>
                  
                  {selectedExercise.description && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Description</h4>
                      <p className="text-gray-300">{selectedExercise.description}</p>
                    </div>
                  )}
                  
                  {selectedExercise.instructions && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Instructions</h4>
                      <p className="text-gray-300">{selectedExercise.instructions}</p>
                    </div>
                  )}
                  
                  {selectedExercise.form_cues && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="text-blue-400 font-medium mb-2">Form Cues</h4>
                      <p className="text-blue-300 text-sm">{selectedExercise.form_cues}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        addExerciseToWorkout(selectedExercise);
                        setSelectedExercise(null);
                      }}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Workout
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedExercise(null)}
                      className="border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workout Exercises */}
            <div className="space-y-4">
              {workout.exercises.map((workoutExercise, exerciseIndex) => (
                <Card key={workoutExercise.id} className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border-gray-600/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Dumbbell className="w-5 h-5 text-violet-400" />
                        <div>
                          <CardTitle className="text-white text-lg">{workoutExercise.exercise.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>{workoutExercise.exercise.primary_muscles.join(', ')}</span>
                            <Badge className={getDifficultyColor(workoutExercise.exercise.difficulty_level)}>
                              {workoutExercise.exercise.difficulty_level}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeExercise(workoutExercise.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Sets */}
                    <div className="space-y-2">
                      {workoutExercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                          <div className="w-12 text-center text-sm font-medium text-violet-400">
                            Set {setIndex + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Weight</label>
                              <Input
                                type="number"
                                value={set.weight}
                                onChange={(e) => updateSet(workoutExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Reps</label>
                              <Input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateSet(workoutExercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400"
                                placeholder="8"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">RIR</label>
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                value={set.rir}
                                onChange={(e) => updateSet(workoutExercise.id, set.id, 'rir', parseInt(e.target.value) || 0)}
                                className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400"
                                placeholder="2"
                              />
                            </div>
                          </div>
                          {workoutExercise.sets.length > 1 && (
                            <Button
                              onClick={() => removeSet(workoutExercise.id, set.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => addSet(workoutExercise.id)}
                      variant="outline"
                      size="sm"
                      className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:border-violet-400 w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Set
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Finish Workout */}
            {workout.exercises.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={finishWorkout}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg"
                  size="lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Complete Workout
                </Button>
              </div>
            )}

            {workout.exercises.length === 0 && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-violet-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to start your workout?</h3>
                  <p className="text-gray-400 mb-4">
                    Search our comprehensive exercise database to begin tracking your workout!
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

export default WorkoutLoggerAI;
