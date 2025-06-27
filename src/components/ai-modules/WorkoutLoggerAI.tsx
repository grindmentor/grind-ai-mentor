
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Play, Save, Minus, Sparkles, Zap, Timer, Trophy, Target, TrendingUp, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  rir: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
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

// Large exercise database
const EXERCISE_DATABASE: Exercise[] = [
  // Chest
  { id: '1', name: 'Barbell Bench Press', muscle_groups: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '2', name: 'Dumbbell Bench Press', muscle_groups: ['Chest', 'Triceps'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '3', name: 'Incline Barbell Press', muscle_groups: ['Upper Chest', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '4', name: 'Incline Dumbbell Press', muscle_groups: ['Upper Chest', 'Triceps'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '5', name: 'Decline Bench Press', muscle_groups: ['Lower Chest', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '6', name: 'Chest Flyes', muscle_groups: ['Chest'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '7', name: 'Cable Flyes', muscle_groups: ['Chest'], equipment: 'Cable Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '8', name: 'Push-ups', muscle_groups: ['Chest', 'Triceps'], equipment: 'Bodyweight', difficulty: 'Beginner', category: 'Strength' },
  { id: '9', name: 'Dips', muscle_groups: ['Chest', 'Triceps'], equipment: 'Dip Station', difficulty: 'Intermediate', category: 'Strength' },
  
  // Back
  { id: '10', name: 'Deadlift', muscle_groups: ['Back', 'Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty: 'Advanced', category: 'Strength' },
  { id: '11', name: 'Pull-ups', muscle_groups: ['Lats', 'Biceps'], equipment: 'Pull-up Bar', difficulty: 'Intermediate', category: 'Strength' },
  { id: '12', name: 'Chin-ups', muscle_groups: ['Lats', 'Biceps'], equipment: 'Pull-up Bar', difficulty: 'Intermediate', category: 'Strength' },
  { id: '13', name: 'Barbell Rows', muscle_groups: ['Lats', 'Rhomboids'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '14', name: 'Dumbbell Rows', muscle_groups: ['Lats', 'Rhomboids'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '15', name: 'Lat Pulldowns', muscle_groups: ['Lats', 'Biceps'], equipment: 'Cable Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '16', name: 'Cable Rows', muscle_groups: ['Lats', 'Rhomboids'], equipment: 'Cable Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '17', name: 'T-Bar Rows', muscle_groups: ['Lats', 'Rhomboids'], equipment: 'T-Bar', difficulty: 'Intermediate', category: 'Strength' },
  { id: '18', name: 'Face Pulls', muscle_groups: ['Rear Delts', 'Rhomboids'], equipment: 'Cable Machine', difficulty: 'Beginner', category: 'Strength' },
  
  // Legs
  { id: '19', name: 'Back Squat', muscle_groups: ['Quadriceps', 'Glutes'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '20', name: 'Front Squat', muscle_groups: ['Quadriceps', 'Core'], equipment: 'Barbell', difficulty: 'Advanced', category: 'Strength' },
  { id: '21', name: 'Romanian Deadlift', muscle_groups: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '22', name: 'Bulgarian Split Squats', muscle_groups: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells', difficulty: 'Intermediate', category: 'Strength' },
  { id: '23', name: 'Leg Press', muscle_groups: ['Quadriceps', 'Glutes'], equipment: 'Leg Press Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '24', name: 'Leg Curls', muscle_groups: ['Hamstrings'], equipment: 'Leg Curl Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '25', name: 'Leg Extensions', muscle_groups: ['Quadriceps'], equipment: 'Leg Extension Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '26', name: 'Walking Lunges', muscle_groups: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '27', name: 'Calf Raises', muscle_groups: ['Calves'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  
  // Shoulders
  { id: '28', name: 'Overhead Press', muscle_groups: ['Shoulders', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '29', name: 'Dumbbell Shoulder Press', muscle_groups: ['Shoulders', 'Triceps'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '30', name: 'Lateral Raises', muscle_groups: ['Side Delts'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '31', name: 'Rear Delt Flyes', muscle_groups: ['Rear Delts'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '32', name: 'Arnold Press', muscle_groups: ['Shoulders'], equipment: 'Dumbbells', difficulty: 'Intermediate', category: 'Strength' },
  { id: '33', name: 'Upright Rows', muscle_groups: ['Shoulders', 'Traps'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  
  // Arms
  { id: '34', name: 'Barbell Curls', muscle_groups: ['Biceps'], equipment: 'Barbell', difficulty: 'Beginner', category: 'Strength' },
  { id: '35', name: 'Dumbbell Curls', muscle_groups: ['Biceps'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '36', name: 'Hammer Curls', muscle_groups: ['Biceps', 'Forearms'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
  { id: '37', name: 'Close-Grip Bench Press', muscle_groups: ['Triceps', 'Chest'], equipment: 'Barbell', difficulty: 'Intermediate', category: 'Strength' },
  { id: '38', name: 'Tricep Dips', muscle_groups: ['Triceps'], equipment: 'Dip Station', difficulty: 'Intermediate', category: 'Strength' },
  { id: '39', name: 'Tricep Pushdowns', muscle_groups: ['Triceps'], equipment: 'Cable Machine', difficulty: 'Beginner', category: 'Strength' },
  { id: '40', name: 'Overhead Tricep Extension', muscle_groups: ['Triceps'], equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Strength' },
];

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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  
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

  // Search exercises
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = EXERCISE_DATABASE.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_groups.some(group => group.toLowerCase().includes(searchQuery.toLowerCase())) ||
        exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredExercises([]);
    }
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
    toast({
      title: "Exercise added! 💪",
      description: `${exercise.name} has been added to your workout.`,
    });
  };

  const addCustomExercise = () => {
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
      muscle_groups: customExercise.muscle_groups.split(',').map(m => m.trim()).filter(Boolean),
      equipment: customExercise.equipment || 'Unknown',
      difficulty: customExercise.difficulty,
      category: 'Strength'
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
                    <p className="text-xs sm:text-sm text-gray-400">Track your workouts and progressive overload</p>
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
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-violet-900/30">
                    <TabsTrigger value="search" className="data-[state=active]:bg-violet-500/30">
                      <Search className="w-4 h-4 mr-2" />
                      Search
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
                        placeholder="Search exercises (e.g., 'bench press', 'squats', 'back')..."
                        className="bg-gray-800/50 border-violet-500/30 text-white pl-12 focus:border-violet-400"
                      />
                    </div>

                    {filteredExercises.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {filteredExercises.map((exercise) => (
                          <Card
                            key={exercise.id}
                            onClick={() => addExerciseToWorkout(exercise)}
                            className="bg-gray-800/30 border-gray-600/50 hover:bg-gray-700/40 transition-all cursor-pointer group"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Dumbbell className="w-4 h-4 text-violet-400" />
                                  <h4 className="font-semibold text-white group-hover:text-violet-300">
                                    {exercise.name}
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                                    {exercise.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>🎯 {exercise.muscle_groups.join(', ')}</span>
                                <span>🏋️ {exercise.equipment}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {searchQuery && filteredExercises.length === 0 && (
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
                            <span>{workoutExercise.exercise.muscle_groups.join(', ')}</span>
                            <Badge className={getDifficultyColor(workoutExercise.exercise.difficulty)}>
                              {workoutExercise.exercise.difficulty}
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
                    Search for exercises or create custom ones to begin tracking your workout!
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
