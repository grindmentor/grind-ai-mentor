import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Dumbbell, 
  Clock, 
  Target, 
  Trash2,
  Calendar,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { useUserUnits } from '@/hooks/useUserUnits';
import WorkoutTemplateSelector from './WorkoutTemplateSelector';

interface WorkoutSet {
  weight: string | number;
  reps: string | number;
  rpe?: number;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  muscleGroup?: string;
}

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { units } = useUserUnits();
  const [activeTab, setActiveTab] = useState('current');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [isLogging, setIsLogging] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseMuscles, setCustomExerciseMuscles] = useState('');
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState('');

  // Common muscle groups for search suggestions
  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 
    'Legs', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 
    'Core', 'Abs', 'Forearms', 'Lats', 'Traps'
  ];

  useEffect(() => {
    if (user) {
      loadPreviousSessions();
    }
  }, [user]);

  const loadPreviousSessions = async () => {
    if (!user?.id) return;

    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPreviousSessions(data || []);
    } catch (error) {
      console.error('Error loading previous sessions:', error);
      toast.error('Failed to load previous sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // RIR conversion helper - converts RPE to RIR equivalent
  const convertRPEtoRIR = (rpe: number): number => {
    // RPE 6-10 scale to RIR 4-0 scale
    // RPE 6 = RIR 4, RPE 7 = RIR 3, RPE 8 = RIR 2, RPE 9 = RIR 1, RPE 10 = RIR 0
    if (rpe >= 10) return 0;
    if (rpe >= 9) return 1;
    if (rpe >= 8) return 2;
    if (rpe >= 7) return 3;
    if (rpe >= 6) return 4;
    return 5; // For RPE < 6, assume 5+ RIR
  };

  const getRIRFromRPE = (rpe: number | null): number => {
    if (!rpe) return 3; // Default to RIR 3
    return convertRPEtoRIR(rpe);
  };

  const getRIRLabel = (rir: number): string => {
    switch (rir) {
      case 0: return 'Failure (0 RIR)';
      case 1: return 'Very Hard (1 RIR)';
      case 2: return 'Hard (2 RIR)';
      case 3: return 'Moderate (3 RIR)';
      case 4: return 'Easy (4 RIR)';
      default: return 'Very Easy (5+ RIR)';
    }
  };

  const getRIRColor = (rir: number): string => {
    switch (rir) {
      case 0: return 'text-red-400 bg-red-500/20';
      case 1: return 'text-orange-400 bg-orange-500/20';
      case 2: return 'text-yellow-400 bg-yellow-500/20';
      case 3: return 'text-blue-400 bg-blue-500/20';
      case 4: return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const addExercise = (exerciseData: any) => {
    let exerciseName = '';
    
    if (typeof exerciseData === 'string') {
      // Custom exercise name
      exerciseName = exerciseData;
    } else {
      // Exercise object from database
      exerciseName = exerciseData.name;
    }

    const newExercise: WorkoutExercise = {
      name: exerciseName,
      sets: [{ weight: '', reps: '', rpe: 7 }] // Default to RPE 7 (RIR 3)
    };
    setExercises([...exercises, newExercise]);
    setExerciseSearch('');
    setShowExerciseSearch(false);
    setShowCustomExerciseForm(false);
    setCustomExerciseName('');
    setCustomExerciseMuscles('');
    setCustomExerciseEquipment('');
  };

  const createCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    try {
      // Save custom exercise to database if user is logged in
      if (user?.id) {
        const muscles = customExerciseMuscles.split(',').map(m => m.trim()).filter(m => m);
        
        const { error } = await supabase
          .from('user_custom_exercises')
          .insert({
            user_id: user.id,
            name: customExerciseName,
            primary_muscles: muscles.length > 0 ? muscles : ['Other'],
            secondary_muscles: [],
            equipment: customExerciseEquipment || 'Unknown',
            category: 'Custom',
            difficulty_level: 'Beginner'
          });

        if (error) throw error;
        toast.success('Custom exercise created!');
      }

      // Add to current workout
      addExercise(customExerciseName);
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      // Still add to workout even if database save fails
      addExercise(customExerciseName);
      toast.error('Exercise added to workout, but failed to save for future use');
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | number) => {
    const updatedExercises = [...exercises];
    
    // If we're adding a new set
    if (setIndex >= updatedExercises[exerciseIndex].sets.length) {
      updatedExercises[exerciseIndex].sets.push({ weight: '', reps: '', rpe: 7 });
    }
    
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    
    setExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, index) => index !== exerciseIndex));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, index) => index !== setIndex);
    
    // If no sets left, remove the exercise
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setExercises(updatedExercises);
  };

  const logWorkout = async () => {
    if (!user?.id || exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    setIsLogging(true);
    try {
      // Calculate total duration
      const duration = Math.max(1, Math.floor((Date.now() - startTime) / (1000 * 60)));
      
      // Save workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: duration,
          session_date: new Date().toISOString().split('T')[0],
          exercises_data: exercises,
          notes: workoutNotes
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save individual exercise entries (keeping RPE data, displaying as RIR)
      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          if (set.weight && set.reps) {
            await supabase
              .from('progressive_overload_entries')
              .insert({
                user_id: user.id,
                exercise_name: exercise.name,
                weight: parseFloat(set.weight.toString()),
                reps: parseInt(set.reps.toString()),
                sets: 1,
                rpe: set.rpe, // Keep storing as RPE in database
                workout_date: new Date().toISOString().split('T')[0],
                notes: `${workoutName} - Set ${exercise.sets.indexOf(set) + 1}`
              });
          }
        }
      }

      // Reset form
      setExercises([]);
      setWorkoutName('');
      setWorkoutNotes('');
      setStartTime(Date.now());
      
      toast.success(`Workout "${workoutName}" logged successfully!`);
      
      // Reload sessions
      await loadPreviousSessions();

    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setIsLogging(false);
    }
  };

  const ExerciseCard = ({ exercise, exerciseIndex }: { exercise: WorkoutExercise; exerciseIndex: number }) => (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{exercise.name}</h3>
          <Button
            onClick={() => removeExercise(exerciseIndex)}
            size="sm"
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {exercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="grid grid-cols-5 gap-3 items-center p-3 bg-gray-800/30 rounded-lg">
              <div className="text-center">
                <Label className="text-xs text-gray-400 block mb-1">Set</Label>
                <span className="text-white font-medium">{setIndex + 1}</span>
              </div>
              
              <div>
                <Label className="text-xs text-gray-400 block mb-1">Weight ({units.weightUnit})</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={units.weightUnit === 'kg' ? 'kg' : 'lbs'}
                  value={set.weight || ''}
                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white h-8 text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-400 block mb-1">Reps</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="12"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white h-8 text-sm"
                />
              </div>
              
              <div className="relative">
                <Label className="text-xs text-gray-400 block mb-1">
                  RIR
                  <span className="ml-1 text-orange-400 cursor-help" title="Reps in Reserve - How many more reps you could have done">ⓘ</span>
                </Label>
                <Select
                  value={getRIRFromRPE(set.rpe).toString()}
                  onValueChange={(value) => {
                    // Convert RIR back to RPE for storage
                    const rir = parseInt(value);
                    const rpe = rir === 0 ? 10 : rir === 1 ? 9 : rir === 2 ? 8 : rir === 3 ? 7 : rir === 4 ? 6 : 5;
                    updateSet(exerciseIndex, setIndex, 'rpe', rpe);
                  }}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="0" className="text-red-400">0 - Failure</SelectItem>
                    <SelectItem value="1" className="text-orange-400">1 - Very Hard</SelectItem>
                    <SelectItem value="2" className="text-yellow-400">2 - Hard</SelectItem>
                    <SelectItem value="3" className="text-blue-400">3 - Moderate</SelectItem>
                    <SelectItem value="4" className="text-green-400">4 - Easy</SelectItem>
                    <SelectItem value="5" className="text-gray-400">5+ - Very Easy</SelectItem>
                  </SelectContent>
                </Select>
                
                {set.rpe && (
                  <Badge className={`${getRIRColor(getRIRFromRPE(set.rpe))} text-xs mt-1 px-2 py-1`}>
                    {getRIRLabel(getRIRFromRPE(set.rpe))}
                  </Badge>
                )}
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => removeSet(exerciseIndex, setIndex)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            onClick={() => {
              const newSet = { weight: '', reps: '', rpe: 7 }; // Default to RPE 7 (RIR 3)
              updateSet(exerciseIndex, exercise.sets.length, 'weight', '');
            }}
            variant="outline"
            size="sm"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const loadWorkoutFromSession = (session: any) => {
    if (!session.exercises_data) return;
    
    // Load exercises from the session
    const loadedExercises = session.exercises_data.map((exercise: any) => ({
      name: exercise.name,
      sets: exercise.sets.map((set: any) => ({
        weight: '',
        reps: '',
        rpe: set.rpe || 7
      })),
      muscleGroup: exercise.muscleGroup
    }));
    
    setExercises(loadedExercises);
    setWorkoutName(`${session.workout_name} (Copy)`);
    setActiveTab('current');
    toast.success(`Loaded workout: ${session.workout_name}`);
  };

  const saveAsTemplate = async (session: any) => {
    if (!user?.id || !session.exercises_data) return;

    try {
      const templateData = {
        user_id: user.id,
        name: `${session.workout_name} Template`,
        program_data: {
          exercises: session.exercises_data.map((exercise: any) => ({
            name: exercise.name,
            sets: exercise.sets.length,
            muscleGroup: exercise.muscleGroup
          }))
        },
        description: `Template created from ${session.workout_name}`,
        difficulty_level: 'Intermediate'
      };

      const { error } = await supabase
        .from('training_programs')
        .insert([templateData]);

      if (error) throw error;
      
      toast.success('Workout saved as template!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save as template');
    }
  };

  const loadTemplateWorkout = (template: any) => {
    if (!template.program_data?.exercises) return;
    
    const loadedExercises = template.program_data.exercises.map((exercise: any) => ({
      name: exercise.name,
      sets: Array(exercise.sets || 1).fill(null).map(() => ({
        weight: '',
        reps: '',
        rpe: 7
      })),
      muscleGroup: exercise.muscleGroup
    }));
    
    setExercises(loadedExercises);
    setWorkoutName(template.name.replace(' Template', ''));
    toast.success(`Loaded template: ${template.name}`);
  };

  const deleteWorkoutSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPreviousSessions(previousSessions.filter(s => s.id !== sessionId));
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const PreviousSessionCard = ({ session }: { session: any }) => (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{session.workout_name}</h3>
            <p className="text-sm text-gray-400">
              {new Date(session.session_date).toLocaleDateString()} • {session.duration_minutes} min
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-orange-500/20 text-orange-400">
              {session.exercises_data?.length || 0} exercises
            </Badge>
            <Button
              onClick={() => loadWorkoutFromSession(session)}
              size="sm"
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/40"
            >
              Reuse
            </Button>
            <Button
              onClick={() => saveAsTemplate(session)}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Save Template
            </Button>
            <Button
              onClick={() => deleteWorkoutSession(session.id)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {session.exercises_data?.map((exercise: any, idx: number) => (
          <div key={idx} className="mb-3 last:mb-0">
            <h4 className="text-sm font-medium text-white mb-2">{exercise.name}</h4>
            <div className="space-y-1">
              {exercise.sets?.map((set: any, setIdx: number) => (
                <div key={setIdx} className="flex items-center justify-between text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                  <span>Set {setIdx + 1}</span>
                  <span>{set.weight}{units.weightUnit} × {set.reps} reps</span>
                  {set.rpe && (
                    <Badge className={`${getRIRColor(getRIRFromRPE(set.rpe))} text-xs px-2 py-1`}>
                      {getRIRFromRPE(set.rpe)} RIR
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {session.notes && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-400">{session.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800/50 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
            <Dumbbell className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Workout Logger</h1>
            <p className="text-gray-400 text-sm">Track sets, reps, and RIR</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/40 backdrop-blur-sm mobile-tabs">
          <TabsTrigger 
            value="current" 
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 mobile-tab-item"
          >
            Current Workout
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 mobile-tab-item"
          >
            Previous Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6 mt-0">
          {/* Workout Header */}
          <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workout-name" className="text-white mb-2 block">
                    Workout Name
                  </Label>
                  <Input
                    id="workout-name"
                    placeholder="e.g., Push Day, Leg Day"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Duration: {Math.floor((Date.now() - startTime) / (1000 * 60))} min
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="workout-notes" className="text-white mb-2 block">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="workout-notes"
                  placeholder="How did the workout feel? Any observations?"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Selector */}
          <WorkoutTemplateSelector 
            onSelectTemplate={loadTemplateWorkout}
            className="mb-4"
          />

          {/* Add Exercise - Fixed z-index and positioning */}
          <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 relative z-10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Add Exercise</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                    size="sm"
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/40"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse
                  </Button>
                  <Button
                    onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom
                  </Button>
                </div>
              </div>

              {showExerciseSearch && (
                <div className="mb-4 relative z-20">
                  <ExerciseSearch
                    onExerciseSelect={addExercise}
                    placeholder="Search exercises or muscle groups (e.g., 'chest', 'biceps', 'bench press')"
                    className="mb-3"
                  />
                </div>
              )}

              {showCustomExerciseForm && (
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-medium">Create Custom Exercise</h4>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Exercise Name *</Label>
                    <Input
                      placeholder="e.g., Cable Lateral Raises"
                      value={customExerciseName}
                      onChange={(e) => setCustomExerciseName(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Primary Muscles (optional)</Label>
                    <Input
                      placeholder="e.g., Shoulders, Chest (comma separated)"
                      value={customExerciseMuscles}
                      onChange={(e) => setCustomExerciseMuscles(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Equipment (optional)</Label>
                    <Input
                      placeholder="e.g., Cable Machine, Dumbbells"
                      value={customExerciseEquipment}
                      onChange={(e) => setCustomExerciseEquipment(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={createCustomExercise}
                      size="sm"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/40"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create & Add
                    </Button>
                    <Button
                      onClick={() => setShowCustomExerciseForm(false)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises - Lower z-index so dropdown appears above */}
          <div className="relative z-0">
            {exercises.length === 0 ? (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Exercises Added</h3>
                  <p className="text-gray-400">Add your first exercise to start logging your workout.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <ExerciseCard key={index} exercise={exercise} exerciseIndex={index} />
                ))}
              </div>
            )}
          </div>

          {/* Log Workout Button */}
          {exercises.length > 0 && (
            <Button
              onClick={logWorkout}
              disabled={isLogging || !workoutName.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3"
            >
              {isLogging ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Logging Workout...</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Log Workout
                </>
              )}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Previous Sessions</h2>
            <Badge className="bg-blue-500/20 text-blue-400">
              {previousSessions.length} sessions logged
            </Badge>
          </div>

          {isLoadingSessions ? (
            <div className="p-8">
              <LoadingSpinner size="lg" text="Loading workout history..." />
            </div>
          ) : previousSessions.length === 0 ? (
            <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Previous Sessions</h3>
                <p className="text-gray-400">Start logging workouts to see your training history here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {previousSessions.map((session) => (
                <PreviousSessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* RIR Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h3 className="text-blue-300 font-semibold mb-2">About RIR (Reps in Reserve)</h3>
              <p className="text-blue-200/80 text-sm mb-3">
                RIR indicates how many more reps you could have performed. It's a more intuitive way to track effort than RPE.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-red-300">• 0 RIR: Absolute failure</div>
                <div className="text-orange-300">• 1 RIR: Very close to failure</div>
                <div className="text-yellow-300">• 2 RIR: Hard, 2 reps left</div>
                <div className="text-blue-300">• 3+ RIR: Moderate effort</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutLoggerAI;
