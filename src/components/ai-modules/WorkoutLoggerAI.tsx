
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Save, Minus, Sparkles, Dumbbell, Info, MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExerciseDatabase, Exercise } from "@/hooks/useExerciseDatabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { MobileOptimized, TouchButton } from "@/components/ui/mobile-optimized";
import { SmoothTransition } from "@/components/ui/smooth-transition";
import { AITypingIndicator } from "@/components/ui/ai-typing-indicator";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
  previousWeight?: number; // For recommendation
}

interface WorkoutSession {
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
  start_time: string;
  end_time?: string;
  notes?: string;
}

interface CustomExercise {
  name: string;
  muscle_groups: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  const [activeTab, setActiveTab] = useState('search');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Custom exercise form
  const [customExercise, setCustomExercise] = useState<CustomExercise>({
    name: '',
    muscle_groups: '',
    equipment: '',
    difficulty: 'Beginner'
  });

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

  // Load previous weight for exercise recommendation
  const loadPreviousWeight = async (exerciseName: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('exercises_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Find the most recent usage of this exercise
      for (const session of data || []) {
        const exercises = session.exercises_data as any[];
        const foundExercise = exercises?.find(ex => 
          ex.exercise?.name === exerciseName || ex.exercise_name === exerciseName
        );
        
        if (foundExercise && foundExercise.sets?.length > 0) {
          // Return the highest weight from the last session
          const weights = foundExercise.sets.map((set: any) => set.weight || 0);
          return Math.max(...weights);
        }
      }
    } catch (error) {
      console.error('Error loading previous weight:', error);
    }
    
    return null;
  };

  const addExerciseToWorkout = async (exercise: Exercise) => {
    const previousWeight = await loadPreviousWeight(exercise.name);
    
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise,
      sets: [{
        id: Date.now().toString(),
        reps: 8,
        weight: 0
      }],
      notes: '',
      previousWeight: previousWeight || undefined
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setSearchQuery('');
    setSelectedExercise(null);
    toast({
      title: "Exercise added! 💪",
      description: previousWeight 
        ? `${exercise.name} added. Last used: ${previousWeight}kg`
        : `${exercise.name} has been added to your workout.`,
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

    if (!user) return;

    try {
      // Save custom exercise to database
      const exerciseData = {
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
        external_id: `custom_${user.id}_${Date.now()}`
      };

      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

      if (error) throw error;

      addExerciseToWorkout(data);
      
      // Reset form
      setCustomExercise({
        name: '',
        muscle_groups: '',
        equipment: '',
        difficulty: 'Beginner'
      });
      
      setActiveTab('search');
    } catch (error) {
      console.error('Error saving custom exercise:', error);
      toast({
        title: "Error saving exercise",
        description: "Please try again.",
        variant: "destructive",
      });
    }
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
                weight: ex.sets[ex.sets.length - 1]?.weight || 0
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

  const saveWorkout = async () => {
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
        session_date: new Date().toISOString().split('T')[0],
        exercises_data: workout.exercises.map(ex => ({
          exercise_name: ex.exercise.name,
          exercise_id: ex.exercise.id,
          exercise: ex.exercise,
          sets: ex.sets,
          notes: ex.notes
        })),
        duration_minutes: 0 // We removed timer, so duration is 0
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert([workoutData]);

      if (error) throw error;

      toast({
        title: "Workout saved! 🎉",
        description: `Great job! You completed ${totalSets} sets.`,
      });

      // Reset workout
      setWorkout({
        name: 'New Workout',
        exercises: [],
        start_time: new Date().toISOString(),
        notes: ''
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error saving workout",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          message: userMessage,
          context: 'exercise_form_coach'
        }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || "I'm here to help with exercise form and technique!"
      }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setChatLoading(false);
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
    <MobileOptimized>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900/10 to-violet-800/20 text-white">
          <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 pt-safe">
                <TouchButton
                  onClick={onBack}
                  className="text-white hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors font-medium flex items-center space-x-2 px-3 py-2 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Dashboard</span>
                </TouchButton>
                
                <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                  Workout Logger
                </h1>
                
                <TouchButton
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 px-3 py-2 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                </TouchButton>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Workout Name */}
              <Card className="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 backdrop-blur-sm border-indigo-500/30">
                <CardContent className="p-4">
                  <Input
                    value={workout.name}
                    onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800/50 border-indigo-500/30 text-white text-lg font-semibold focus:border-indigo-400 h-12"
                    placeholder="Give your workout a name..."
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Exercise Search/Add Section */}
                  <Card className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-sm border-violet-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                        <Sparkles className="w-5 h-5 mr-2 text-violet-400" />
                        Add Exercises
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 bg-violet-900/30">
                          <TabsTrigger value="search" className="data-[state=active]:bg-violet-500/30">
                            <Search className="w-4 h-4 mr-2" />
                            {isMobile ? "Search" : "Search Database"}
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
                              placeholder="Search exercises..."
                              className="bg-gray-800/50 border-violet-500/30 text-white pl-12 focus:border-violet-400 h-12"
                            />
                            {loading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>

                          {/* Search Suggestions */}
                          {suggestions.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-400 mb-3">Suggestions:</h3>
                              <div className="flex flex-wrap gap-2">
                                {suggestions.slice(0, isMobile ? 3 : 6).map((suggestion) => (
                                  <TouchButton
                                    key={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:border-violet-400 px-3 py-1 rounded-lg text-sm"
                                  >
                                    {suggestion}
                                  </TouchButton>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Exercise Results - Mobile optimized */}
                          {exercises.length > 0 && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {exercises.map((exercise) => (
                                <Card
                                  key={exercise.id}
                                  className="bg-gray-800/30 border-gray-600/50 hover:bg-gray-700/40 transition-all cursor-pointer group"
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      {/* Exercise Header */}
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                                          <Dumbbell className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                                          <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-white group-hover:text-violet-300 leading-tight">
                                              {exercise.name}
                                            </h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                              🎯 {exercise.primary_muscles.slice(0, 2).join(', ')}
                                              {exercise.primary_muscles.length > 2 && '...'}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <TouchButton
                                          onClick={() => addExerciseToWorkout(exercise)}
                                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex-shrink-0 ml-2"
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          Add
                                        </TouchButton>
                                      </div>
                                      
                                      {/* Exercise Details */}
                                      <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center space-x-3">
                                          <span>🏋️ {exercise.equipment}</span>
                                          <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                                            {exercise.difficulty_level}
                                          </Badge>
                                        </div>
                                        <span>{exercise.mechanics} • {exercise.force_type}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4">
                          <div className="space-y-4">
                            <Input
                              value={customExercise.name}
                              onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Exercise name"
                              className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400 h-12"
                            />
                            <Input
                              value={customExercise.muscle_groups}
                              onChange={(e) => setCustomExercise(prev => ({ ...prev, muscle_groups: e.target.value }))}
                              placeholder="Muscle groups (e.g., 'Chest, Triceps')"
                              className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400 h-12"
                            />
                            <Input
                              value={customExercise.equipment}
                              onChange={(e) => setCustomExercise(prev => ({ ...prev, equipment: e.target.value }))}
                              placeholder="Equipment"
                              className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400 h-12"
                            />
                            <TouchButton
                              onClick={addCustomExercise}
                              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-12 font-medium"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Custom Exercise
                            </TouchButton>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Workout Exercises */}
                  <div className="space-y-4">
                    {workout.exercises.map((workoutExercise) => (
                      <Card key={workoutExercise.id} className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border-gray-600/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <Dumbbell className="w-5 h-5 text-violet-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-white text-base sm:text-lg leading-tight">
                                  {workoutExercise.exercise.name}
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-2 text-sm">
                                  <span>{workoutExercise.exercise.primary_muscles.slice(0, 2).join(', ')}</span>
                                  {workoutExercise.previousWeight && (
                                    <span className="text-gray-500 text-xs">
                                      (Last: {workoutExercise.previousWeight}kg)
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <TouchButton
                              onClick={() => removeExercise(workoutExercise.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg flex-shrink-0"
                            >
                              <Minus className="w-4 h-4" />
                            </TouchButton>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            {workoutExercise.sets.map((set, setIndex) => (
                              <div key={set.id} className="flex items-center space-x-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                                <div className="w-12 text-center text-sm font-medium text-violet-400 flex-shrink-0">
                                  Set {setIndex + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
                                    <Input
                                      type="number"
                                      value={set.weight}
                                      onChange={(e) => updateSet(workoutExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                      className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400 h-10"
                                      placeholder={workoutExercise.previousWeight ? workoutExercise.previousWeight.toString() : "0"}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Reps</label>
                                    <Input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => updateSet(workoutExercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                      className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400 h-10"
                                      placeholder="8"
                                    />
                                  </div>
                                </div>
                                {workoutExercise.sets.length > 1 && (
                                  <TouchButton
                                    onClick={() => removeSet(workoutExercise.id, set.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg flex-shrink-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </TouchButton>
                                )}
                              </div>
                            ))}
                          </div>

                          <TouchButton
                            onClick={() => addSet(workoutExercise.id)}
                            className="border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:border-violet-400 w-full h-10 rounded-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Set
                          </TouchButton>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Save Workout */}
                  {workout.exercises.length > 0 && (
                    <div className="flex justify-center pt-4">
                      <TouchButton 
                        onClick={saveWorkout}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg rounded-xl font-medium"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Workout
                      </TouchButton>
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

                {/* AI Chat Sidebar */}
                {showAIChat && (
                  <div className="lg:col-span-1">
                    <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-purple-500/30 sticky top-4">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg flex items-center">
                            <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
                            AI Form Coach
                          </CardTitle>
                          <TouchButton
                            onClick={() => setShowAIChat(false)}
                            className="text-gray-400 hover:text-white p-1 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </TouchButton>
                        </div>
                        <CardDescription className="text-purple-200/70">
                          Ask about exercise form, technique, or muscle targeting
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                          {chatMessages.map((message, index) => (
                            <SmoothTransition key={index} show={true} type="slideUp">
                              <div className={`p-3 rounded-xl max-w-[85%] ${
                                message.role === 'user' 
                                  ? 'bg-purple-600/30 text-white ml-auto' 
                                  : 'bg-gray-800/50 text-gray-100'
                              }`}>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                            </SmoothTransition>
                          ))}
                          
                          <AITypingIndicator 
                            isVisible={chatLoading} 
                            message="AI is analyzing..." 
                            variant="shimmer"
                          />
                        </div>
                        
                        <div className="p-4 border-t border-purple-500/30">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Ask about form..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                              className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400 h-10 rounded-lg"
                            />
                            <TouchButton
                              onClick={sendChatMessage}
                              className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                            >
                              <Send className="w-4 h-4 text-white" />
                            </TouchButton>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </MobileOptimized>
  );
};

export default WorkoutLoggerAI;
