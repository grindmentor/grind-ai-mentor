
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotebookPen, Plus, Target, Calendar, Award, AlertTriangle, Zap, ArrowLeft, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerMemory } from "@/hooks/useCustomerMemory";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/components/EnhancedToast";
import { playSuccessSound, playWarningSound } from "@/utils/soundEffects";

interface ExerciseEntry {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;
  notes?: string;
  workout_date: string;
  created_at: string;
}

interface ProgressSuggestion {
  type: 'weight_increase' | 'rep_increase' | 'set_increase' | 'form_focus' | 'deload';
  message: string;
  confidence: number;
}

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

const POPULAR_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-ups',
  'Barbell Row', 'Incline Bench Press', 'Romanian Deadlift', 'Dips',
  'Lateral Raises', 'Bicep Curls', 'Tricep Extensions', 'Leg Press'
];

const WorkoutLoggerAI = ({ onBack }: WorkoutLoggerAIProps) => {
  const { user } = useAuth();
  const { logInteraction, addToFavorites } = useCustomerMemory();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useUsageTracking();
  
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('log');
  const [suggestions, setSuggestions] = useState<ProgressSuggestion[]>([]);

  useEffect(() => {
    if (user) {
      loadExerciseHistory();
    }
  }, [user]);

  const loadExerciseHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progressive_overload_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercise history:', error);
      showErrorToast('Error', 'Failed to load exercise history');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (exerciseName: string, recentEntries: ExerciseEntry[]) => {
    if (recentEntries.length < 2) return [];

    const suggestions: ProgressSuggestion[] = [];
    const latest = recentEntries[0];
    const previous = recentEntries[1];

    // Check for stagnation
    if (latest.weight === previous.weight && latest.reps === previous.reps) {
      const stagnantSessions = recentEntries.filter(entry => 
        entry.weight === latest.weight && entry.reps === latest.reps
      ).length;

      if (stagnantSessions >= 3) {
        suggestions.push({
          type: 'weight_increase',
          message: `Consider increasing weight by 2.5-5kg. You've maintained ${latest.weight}kg for ${stagnantSessions} sessions.`,
          confidence: 85
        });
      } else if (stagnantSessions >= 2) {
        suggestions.push({
          type: 'rep_increase',
          message: `Try adding 1-2 more reps before increasing weight. Aim for ${latest.reps + 1}-${latest.reps + 2} reps.`,
          confidence: 75
        });
      }
    }

    // Check RPE progression
    if (latest.rpe && latest.rpe <= 7) {
      suggestions.push({
        type: 'weight_increase',
        message: `RPE of ${latest.rpe} suggests you can handle more weight. Try increasing by 2.5-5kg.`,
        confidence: 80
      });
    } else if (latest.rpe && latest.rpe >= 9) {
      suggestions.push({
        type: 'form_focus',
        message: `High RPE (${latest.rpe}) - focus on form and consider deloading if this continues.`,
        confidence: 70
      });
    }

    // Check for consistent progress
    const recentProgress = recentEntries.slice(0, 3);
    const hasProgressedRecently = recentProgress.some((entry, index) => {
      if (index === recentProgress.length - 1) return false;
      const next = recentProgress[index + 1];
      return entry.weight > next.weight || (entry.weight === next.weight && entry.reps > next.reps);
    });

    if (!hasProgressedRecently && recentEntries.length >= 4) {
      suggestions.push({
        type: 'deload',
        message: 'Consider a deload week (reduce weight by 10-15%) to recover and break through plateaus.',
        confidence: 65
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  const logExercise = async () => {
    if (!user) return;

    // Check usage limits
    if (!canUseFeature('progress_analyses')) {
      const remaining = getRemainingUsage('progress_analyses');
      showErrorToast('Usage Limit Reached', `You've reached your monthly limit. ${remaining} analyses remaining.`);
      playWarningSound();
      return;
    }

    const exerciseName = selectedExercise === 'custom' ? customExercise : selectedExercise;
    
    if (!exerciseName || !sets || !reps || !weight) {
      showErrorToast('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('progressive_overload_entries')
        .insert({
          user_id: user.id,
          exercise_name: exerciseName,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight),
          rpe: rpe ? parseInt(rpe) : null,
          notes: notes || null,
          workout_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Increment usage
      await incrementUsage('progress_analyses');
      
      // Log interaction
      await logInteraction('workout_logger', 'log_exercise', {
        exercise: exerciseName,
        weight: parseFloat(weight),
        sets: parseInt(sets),
        reps: parseInt(reps)
      });

      // Clear form
      setSelectedExercise('');
      setCustomExercise('');
      setSets('');
      setReps('');
      setWeight('');
      setRpe('');
      setNotes('');

      // Reload data
      await loadExerciseHistory();
      
      showSuccessToast('Exercise Logged!', `${exerciseName} has been added to your workout log`);
      playSuccessSound();
      
      // Generate suggestions for this exercise
      const exerciseHistory = exercises.filter(e => e.exercise_name.toLowerCase() === exerciseName.toLowerCase());
      if (exerciseHistory.length > 0) {
        const newSuggestions = generateSuggestions(exerciseName, exerciseHistory);
        setSuggestions(newSuggestions);
        if (newSuggestions.length > 0) {
          setActiveTab('suggestions');
        }
      }
    } catch (error) {
      console.error('Error logging exercise:', error);
      showErrorToast('Error', 'Failed to log exercise');
    } finally {
      setLoading(false);
    }
  };

  const getExerciseStats = (exerciseName: string) => {
    const exerciseEntries = exercises.filter(e => 
      e.exercise_name.toLowerCase() === exerciseName.toLowerCase()
    ).sort((a, b) => new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime());

    if (exerciseEntries.length === 0) return null;

    const first = exerciseEntries[0];
    const latest = exerciseEntries[exerciseEntries.length - 1];
    
    const weightIncrease = latest.weight - first.weight;
    const sessions = exerciseEntries.length;
    const daysSinceFirst = Math.floor(
      (new Date(latest.workout_date).getTime() - new Date(first.workout_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      firstWeight: first.weight,
      currentWeight: latest.weight,
      weightIncrease,
      sessions,
      daysSinceFirst,
      progressRate: daysSinceFirst > 0 ? (weightIncrease / daysSinceFirst * 7).toFixed(1) : '0'
    };
  };

  const uniqueExercises = [...new Set(exercises.map(e => e.exercise_name))];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-white">Workout Logger AI</h1>
        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
          Smart Tracking
        </Badge>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-700 rounded-xl flex items-center justify-center">
              <NotebookPen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Workout Logger AI</CardTitle>
              <CardDescription className="text-gray-400">
                Track your workouts with intelligent progression insights powered by AI
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Free Access
            </Badge>
            <Badge variant="outline" className="text-gray-400">
              {getRemainingUsage('progress_analyses')} logs remaining this month
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="log" className="data-[state=active]:bg-rose-600">Log Workout</TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-rose-600">Progress</TabsTrigger>
              <TabsTrigger value="suggestions" className="data-[state=active]:bg-rose-600">AI Insights</TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-rose-600">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="log" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Exercise</Label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {POPULAR_EXERCISES.map(exercise => (
                        <SelectItem key={exercise} value={exercise}>{exercise}</SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExercise === 'custom' && (
                    <Input
                      placeholder="Enter custom exercise name"
                      value={customExercise}
                      onChange={(e) => setCustomExercise(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Sets</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Reps</Label>
                  <Input
                    type="number"
                    placeholder="8"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="60"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">RPE (1-10) - Optional</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="8"
                    value={rpe}
                    onChange={(e) => setRpe(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Notes - Optional</Label>
                  <Input
                    placeholder="Form felt good, hit depth"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <Button 
                onClick={logExercise} 
                disabled={loading || !canUseFeature('progress_analyses')}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-medium py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Exercise
              </Button>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 mt-6">
              <div className="space-y-4">
                {uniqueExercises.slice(0, 6).map(exerciseName => {
                  const stats = getExerciseStats(exerciseName);
                  if (!stats) return null;

                  const progressPercentage = stats.firstWeight > 0 
                    ? (stats.weightIncrease / stats.firstWeight) * 100 
                    : 0;

                  return (
                    <Card key={exerciseName} className="bg-gray-800 border-gray-700">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-white">{exerciseName}</h3>
                          <Badge variant={stats.weightIncrease > 0 ? "default" : "secondary"} className="bg-rose-500/20 text-rose-400">
                            {stats.weightIncrease > 0 ? '+' : ''}{stats.weightIncrease}kg
                          </Badge>
                        </div>
                        
                        <Progress value={Math.min(progressPercentage, 100)} className="mb-3" />
                        
                        <div className="grid grid-cols-4 gap-2 text-sm text-gray-400">
                          <div>
                            <div className="font-medium text-white">{stats.firstWeight}kg</div>
                            <div>Starting</div>
                          </div>
                          <div>
                            <div className="font-medium text-white">{stats.currentWeight}kg</div>
                            <div>Current</div>
                          </div>
                          <div>
                            <div className="font-medium text-white">{stats.sessions}</div>
                            <div>Sessions</div>
                          </div>
                          <div>
                            <div className="font-medium text-white">{stats.progressRate}kg/week</div>
                            <div>Progress Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4 mt-6">
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <Alert key={index} className="bg-gray-800 border-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {suggestion.type === 'weight_increase' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {suggestion.type === 'rep_increase' && <Target className="w-4 h-4 text-blue-400" />}
                          {suggestion.type === 'form_focus' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                          {suggestion.type === 'deload' && <Zap className="w-4 h-4 text-orange-400" />}
                        </div>
                        <div className="flex-1">
                          <AlertDescription className="text-gray-300">
                            {suggestion.message}
                          </AlertDescription>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <NotebookPen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Log more exercises to get AI-powered progression insights!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-rose-400 mb-1">{exercises.length}</div>
                    <div className="text-sm text-gray-400">Total Logged</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-rose-400 mb-1">{uniqueExercises.length}</div>
                    <div className="text-sm text-gray-400">Exercises Tracked</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-rose-400 mb-1">
                      {uniqueExercises.reduce((total, exercise) => {
                        const stats = getExerciseStats(exercise);
                        return total + (stats?.weightIncrease || 0);
                      }, 0).toFixed(1)}kg
                    </div>
                    <div className="text-sm text-gray-400">Total Progress</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exercises.slice(0, 10).map((exercise, index) => (
                      <div key={exercise.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                        <div>
                          <div className="font-medium text-white">{exercise.exercise_name}</div>
                          <div className="text-sm text-gray-400">
                            {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
                            {exercise.rpe && ` • RPE ${exercise.rpe}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(exercise.workout_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutLoggerAI;
