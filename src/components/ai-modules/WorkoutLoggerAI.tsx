import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Dumbbell, Play, Save, Minus, Search, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  user_id?: string;
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  rir: number; // Reps in Reserve
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

const COMMON_EXERCISES: Exercise[] = [
  { id: 'squat', name: 'Barbell Squat', muscle_group: 'Legs', equipment: 'Barbell' },
  { id: 'bench', name: 'Bench Press', muscle_group: 'Chest', equipment: 'Barbell' },
  { id: 'deadlift', name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell' },
  { id: 'ohp', name: 'Overhead Press', muscle_group: 'Shoulders', equipment: 'Barbell' },
  { id: 'row', name: 'Barbell Row', muscle_group: 'Back', equipment: 'Barbell' },
  { id: 'pullup', name: 'Pull-up', muscle_group: 'Back', equipment: 'Bodyweight' },
  { id: 'dip', name: 'Dips', muscle_group: 'Chest', equipment: 'Bodyweight' },
  { id: 'curls', name: 'Barbell Curls', muscle_group: 'Arms', equipment: 'Barbell' },
  { id: 'tricep', name: 'Tricep Extensions', muscle_group: 'Arms', equipment: 'Dumbbell' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable' }
];

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [workout, setWorkout] = useState<WorkoutSession>({
    name: 'New Workout',
    exercises: [],
    start_time: new Date().toISOString(),
    notes: ''
  });
  
  const [exercises, setExercises] = useState<Exercise[]>(COMMON_EXERCISES);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserExercises();
    }
  }, [user]);

  const loadUserExercises = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data) {
        setExercises([...COMMON_EXERCISES, ...data]);
      }
    } catch (error) {
      console.error('Error loading user exercises:', error);
    }
  };

  const addCustomExercise = async () => {
    if (!user || !newExerciseName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .insert([{
          user_id: user.id,
          name: newExerciseName,
          muscle_group: 'Custom',
          equipment: 'Various'
        }])
        .select()
        .single();

      if (error) throw error;

      setExercises([...exercises, data]);
      setNewExerciseName('');
      setShowAddExercise(false);
      
      toast({
        title: "Exercise added!",
        description: `${newExerciseName} has been added to your exercise database.`,
      });
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      toast({
        title: "Error adding exercise",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise,
      sets: [{
        id: Date.now().toString(),
        reps: 0,
        weight: 0,
        rir: 2
      }],
      notes: ''
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
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
                reps: ex.sets[ex.sets.length - 1]?.reps || 0,
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

  const addSectionBreak = () => {
    const sectionBreak: WorkoutExercise = {
      id: `section-${Date.now()}`,
      exercise: { id: 'section', name: '--- Section Break ---', muscle_group: 'Break' },
      sets: [],
      notes: ''
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, sectionBreak]
    }));
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkout(prev => ({
      ...prev,
      start_time: new Date().toISOString()
    }));
  };

  const finishWorkout = async () => {
    if (!user) return;

    try {
      const workoutData = {
        user_id: user.id,
        name: workout.name,
        start_time: workout.start_time,
        end_time: new Date().toISOString(),
        notes: workout.notes,
        exercises: workout.exercises.filter(ex => ex.exercise.id !== 'section'), // Remove section breaks
        total_sets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
        duration_minutes: Math.round((new Date().getTime() - new Date(workout.start_time).getTime()) / 60000)
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert([workoutData]);

      if (error) throw error;

      toast({
        title: "Workout saved!",
        description: `${workout.name} has been logged successfully.`,
      });

      // Reset workout
      setWorkout({
        name: 'New Workout',
        exercises: [],
        start_time: new Date().toISOString(),
        notes: ''
      });
      setIsWorkoutActive(false);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error saving workout",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
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
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500/20 to-purple-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/20">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Workout Logger
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">Track your training sessions</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isWorkoutActive ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Button 
                    onClick={startWorkout}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                )}
              </div>
            </div>

            {/* Workout Name */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4">
                <Input
                  value={workout.name}
                  onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white text-lg font-semibold"
                  placeholder="Workout name..."
                />
              </CardContent>
            </Card>

            {/* Add Exercise */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Plus className="w-5 h-5 mr-2 text-blue-500" />
                  Add Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search exercises..."
                      className="bg-gray-800 border-gray-700 text-white pl-10"
                    />
                  </div>
                  <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Custom
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Custom Exercise</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          value={newExerciseName}
                          onChange={(e) => setNewExerciseName(e.target.value)}
                          placeholder="Exercise name..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={addCustomExercise}
                            className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                          >
                            Add Exercise
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddExercise(false)}
                            className="border-gray-600 text-white hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {filteredExercises.map((exercise) => (
                    <Button
                      key={exercise.id}
                      onClick={() => addExerciseToWorkout(exercise)}
                      variant="outline"
                      className="justify-start border-gray-600 text-white hover:bg-gray-800 text-left p-3"
                    >
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-xs text-gray-400">{exercise.muscle_group}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={addSectionBreak}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Add Section Break
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Workout Exercises */}
            <div className="space-y-4">
              {workout.exercises.map((workoutExercise, exerciseIndex) => (
                <Card key={workoutExercise.id} className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                  {workoutExercise.exercise.id === 'section' ? (
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center">
                        <div className="flex-1 h-px bg-gray-600"></div>
                        <div className="px-4 text-gray-400 font-medium">Section Break</div>
                        <div className="flex-1 h-px bg-gray-600"></div>
                        <Button
                          onClick={() => removeExercise(workoutExercise.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">{workoutExercise.exercise.name}</CardTitle>
                            <CardDescription>{workoutExercise.exercise.muscle_group}</CardDescription>
                          </div>
                          <Button
                            onClick={() => removeExercise(workoutExercise.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Sets */}
                        <div className="space-y-2">
                          {workoutExercise.sets.map((set, setIndex) => (
                            <div key={set.id} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-800/50 rounded-lg">
                              <div className="w-12 text-center text-sm font-medium text-gray-400">
                                Set {setIndex + 1}
                              </div>
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Weight</label>
                                  <Input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => updateSet(workoutExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                    className="bg-gray-700 border-gray-600 text-white text-center"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Reps</label>
                                  <Input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => updateSet(workoutExercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                    className="bg-gray-700 border-gray-600 text-white text-center"
                                    placeholder="0"
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
                                    className="bg-gray-700 border-gray-600 text-white text-center"
                                    placeholder="2"
                                  />
                                </div>
                              </div>
                              {workoutExercise.sets.length > 1 && (
                                <Button
                                  onClick={() => removeSet(workoutExercise.id, set.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
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
                          className="border-gray-600 text-white hover:bg-gray-800 w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Set
                        </Button>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* Finish Workout */}
            {workout.exercises.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={finishWorkout}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                  size="lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Finish Workout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkoutLoggerAI;
