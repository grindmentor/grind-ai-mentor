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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  category: string;
  force_type: string;
  mechanics: string;
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
  
  const [workout, setWorkout] = useState<WorkoutSession>({
    name: 'New Workout',
    exercises: [],
    start_time: new Date().toISOString(),
    notes: ''
  });
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Search exercises in database
  const searchExercises = async (query: string) => {
    if (!query.trim()) {
      setExercises([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`name.ilike.%${query}%, primary_muscles.cs.{${query}}, equipment.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: "Search failed",
        description: "Could not search exercises. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchExercises(searchQuery);
      } else {
        setExercises([]);
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
                    <p className="text-xs sm:text-sm text-gray-400">Track your workouts with precision</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowAIChat(!showAIChat)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Coach
                </Button>
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
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                      <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                                        {exercise.difficulty_level}
                                      </Badge>
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
                      </TabsContent>

                      <TabsContent value="custom" className="space-y-4">
                        <div className="space-y-4">
                          <Input
                            value={customExercise.name}
                            onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Exercise name"
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
                            placeholder="Equipment"
                            className="bg-gray-800/50 border-violet-500/30 text-white focus:border-violet-400"
                          />
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

                {/* Workout Exercises */}
                <div className="space-y-4">
                  {workout.exercises.map((workoutExercise) => (
                    <Card key={workoutExercise.id} className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border-gray-600/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Dumbbell className="w-5 h-5 text-violet-400" />
                            <div>
                              <CardTitle className="text-white text-lg">{workoutExercise.exercise.name}</CardTitle>
                              <CardDescription className="flex items-center space-x-2">
                                <span>{workoutExercise.exercise.primary_muscles.join(', ')}</span>
                                {workoutExercise.previousWeight && (
                                  <span className="text-gray-500 text-sm">
                                    (Last: {workoutExercise.previousWeight}kg)
                                  </span>
                                )}
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
                        <div className="space-y-2">
                          {workoutExercise.sets.map((set, setIndex) => (
                            <div key={set.id} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                              <div className="w-12 text-center text-sm font-medium text-violet-400">
                                Set {setIndex + 1}
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
                                  <Input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => updateSet(workoutExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                    className="bg-gray-700/50 border-gray-600/50 text-white text-center focus:border-violet-400"
                                    placeholder={workoutExercise.previousWeight ? workoutExercise.previousWeight.toString() : "0"}
                                    style={{ 
                                      color: !set.weight && workoutExercise.previousWeight ? '#9ca3af' : 'white'
                                    }}
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

                {/* Save Workout */}
                {workout.exercises.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={saveWorkout}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg"
                      size="lg"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Workout
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAIChat(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-purple-200/70">
                        Ask about exercise form, technique, or muscle targeting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-64 overflow-y-auto space-y-3 bg-gray-800/30 rounded-lg p-3">
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-400 text-sm">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            Ask me about exercise form, muscle targeting, or technique tips!
                          </div>
                        )}
                        {chatMessages.map((msg, index) => (
                          <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg text-sm ${
                              msg.role === 'user' 
                                ? 'bg-purple-500/20 text-purple-200' 
                                : 'bg-gray-700/50 text-gray-200'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="text-left">
                            <div className="inline-block p-2 rounded-lg text-sm bg-gray-700/50 text-gray-200">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about form..."
                          className="bg-gray-800/50 border-purple-500/30 text-white focus:border-purple-400"
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          disabled={chatLoading}
                        />
                        <Button
                          onClick={sendChatMessage}
                          disabled={chatLoading || !chatInput.trim()}
                          size="sm"
                          className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
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
  );
};

export default WorkoutLoggerAI;
