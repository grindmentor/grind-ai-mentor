
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NotebookPen, ArrowLeft, Plus, TrendingUp, Sparkles, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/UsageIndicator';

interface WorkoutLoggerAIProps {
  onBack: () => void;
}

interface WorkoutEntry {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  logged_at: string;
}

interface WorkoutSession {
  id: string;
  workout_name: string;
  duration_minutes: number;
  logged_at: string;
  exercises: WorkoutEntry[];
}

const WorkoutLoggerAI: React.FC<WorkoutLoggerAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutEntry[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [newExercise, setNewExercise] = useState({
    exercise_name: '',
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  });
  const [aiInsights, setAiInsights] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWorkoutSessions();
    }
  }, [user]);

  const loadWorkoutSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (*)
        `)
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWorkoutSessions(data || []);
    } catch (error) {
      console.error('Error loading workout sessions:', error);
    }
  };

  const startWorkout = () => {
    setStartTime(new Date());
    setWorkoutName(`Workout ${new Date().toLocaleDateString()}`);
    setCurrentWorkout([]);
    toast.success('Workout started!');
  };

  const addExercise = () => {
    if (!newExercise.exercise_name.trim() || !newExercise.sets || !newExercise.reps) {
      toast.error('Please fill in exercise name, sets, and reps');
      return;
    }

    const exercise: WorkoutEntry = {
      id: crypto.randomUUID(),
      exercise_name: newExercise.exercise_name.trim(),
      sets: parseInt(newExercise.sets),
      reps: parseInt(newExercise.reps),
      weight: parseFloat(newExercise.weight) || 0,
      notes: newExercise.notes.trim() || undefined,
      logged_at: new Date().toISOString()
    };

    setCurrentWorkout(prev => [...prev, exercise]);
    setNewExercise({ exercise_name: '', sets: '', reps: '', weight: '', notes: '' });
    toast.success('Exercise added!');
  };

  const finishWorkout = async () => {
    if (!user || !startTime || currentWorkout.length === 0) return;

    try {
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
      
      // Save workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: duration
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save exercises
      const exercisesData = currentWorkout.map(exercise => ({
        ...exercise,
        user_id: user.id,
        workout_session_id: session.id
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      // Reset current workout
      setCurrentWorkout([]);
      setStartTime(null);
      setWorkoutName('');
      
      // Reload sessions
      loadWorkoutSessions();
      
      toast.success('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const generateInsights = async () => {
    if (workoutSessions.length === 0 || !canUseFeature('progress_analyses')) return;
    
    const success = await incrementUsage('progress_analyses');
    if (!success) return;

    setIsAnalyzing(true);

    try {
      const recentWorkouts = workoutSessions.slice(0, 5);
      const workoutSummary = recentWorkouts.map(session => 
        `${session.workout_name} (${session.duration_minutes} min):
${session.exercises.map(ex => `  - ${ex.exercise_name}: ${ex.sets}x${ex.reps} @ ${ex.weight}kg`).join('\n')}`
      ).join('\n\n');

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Analyze these recent workout sessions and provide insights:

${workoutSummary}

Please provide:
1. Progress analysis and trends
2. Strength gains or plateaus
3. Training balance assessment
4. Recommendations for improvement
5. Potential issues or imbalances
6. Next steps for progression

Base your analysis on exercise science principles and progressive overload concepts.`,
          feature: 'progress_analyses'
        }
      });

      if (error) throw error;
      setAiInsights(data.response);
      toast.success('Insights generated successfully!');
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isWorkoutActive = startTime !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-rose-900/20 to-rose-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-rose-200 hover:text-white hover:bg-rose-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500/20 to-rose-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/25 border border-rose-400/20">
                  <NotebookPen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-300 to-rose-100 bg-clip-text text-transparent">
                    Workout Logger AI
                  </h1>
                  <p className="text-rose-200 text-lg">Smart exercise tracking with AI-powered insights</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="progress_analyses" featureName="Progress Analyses" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-powered workout analysis and progression insights
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Workout */}
            <Card className="bg-rose-900/20 border-rose-600/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Dumbbell className="w-5 h-5 mr-3 text-rose-400" />
                    {isWorkoutActive ? 'Active Workout' : 'Start Workout'}
                  </CardTitle>
                  {isWorkoutActive && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Live
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isWorkoutActive ? (
                  <Button
                    onClick={startWorkout}
                    className="w-full bg-gradient-to-r from-rose-500/80 to-rose-700/80 hover:from-rose-600/80 hover:to-rose-800/80 backdrop-blur-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Workout
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-rose-200 text-sm font-medium">Workout Name</label>
                      <Input
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Exercise name"
                        value={newExercise.exercise_name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, exercise_name: e.target.value }))}
                        className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm"
                      />
                      <div className="grid grid-cols-3 gap-1">
                        <Input
                          placeholder="Sets"
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                          className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm text-xs"
                        />
                        <Input
                          placeholder="Reps"
                          type="number"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                          className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm text-xs"
                        />
                        <Input
                          placeholder="Weight"
                          type="number"
                          step="0.5"
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                          className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm text-xs"
                        />
                      </div>
                    </div>

                    <Input
                      placeholder="Notes (optional)"
                      value={newExercise.notes}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-rose-800/20 border-rose-600/50 text-white focus:border-rose-500 backdrop-blur-sm"
                    />

                    <Button
                      onClick={addExercise}
                      className="w-full bg-rose-600/20 hover:bg-rose-700/30 border border-rose-500/30 backdrop-blur-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>

                    {currentWorkout.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-white font-medium">Current Session:</h3>
                        {currentWorkout.map((exercise, index) => (
                          <div key={exercise.id} className="p-3 bg-rose-800/20 backdrop-blur-sm rounded-lg border border-rose-600/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-medium text-sm">{exercise.exercise_name}</h4>
                                <p className="text-rose-200 text-xs">
                                  {exercise.sets} sets × {exercise.reps} reps
                                  {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          onClick={finishWorkout}
                          className="w-full bg-gradient-to-r from-green-500/80 to-green-700/80 hover:from-green-600/80 hover:to-green-800/80"
                        >
                          Finish Workout
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-rose-900/20 border-rose-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-rose-400" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateInsights}
                  disabled={isAnalyzing || workoutSessions.length === 0 || !canUseFeature('progress_analyses')}
                  className="w-full bg-rose-600/20 hover:bg-rose-700/30 border border-rose-500/30 backdrop-blur-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Generate Insights
                    </>
                  )}
                </Button>

                {aiInsights ? (
                  <div className="bg-rose-800/20 backdrop-blur-sm rounded-xl p-4 border border-rose-600/30 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-rose-100 text-sm leading-relaxed">{aiInsights}</pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-rose-800/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">No Insights Yet</h3>
                    <p className="text-rose-200 text-sm">
                      Complete some workouts and click "Generate Insights" for AI analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className="bg-rose-900/20 border-rose-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <NotebookPen className="w-5 h-5 mr-3 text-rose-400" />
                  Recent Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workoutSessions.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {workoutSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-rose-800/20 backdrop-blur-sm rounded-lg border border-rose-600/30">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-medium text-sm">{session.workout_name}</h3>
                          <Badge className="bg-rose-600/20 text-rose-300 border-rose-500/30 text-xs">
                            {session.duration_minutes}min
                          </Badge>
                        </div>
                        <p className="text-rose-200 text-xs mb-2">
                          {new Date(session.logged_at).toLocaleDateString()}
                        </p>
                        <div className="space-y-1">
                          {session.exercises?.slice(0, 3).map((exercise, index) => (
                            <p key={index} className="text-rose-200 text-xs">
                              {exercise.exercise_name}: {exercise.sets}×{exercise.reps}
                              {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                            </p>
                          ))}
                          {session.exercises?.length > 3 && (
                            <p className="text-rose-400 text-xs">
                              +{session.exercises.length - 3} more exercises
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-rose-800/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <NotebookPen className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">No Workouts Yet</h3>
                    <p className="text-rose-200 text-sm">
                      Start your first workout to begin tracking your progress
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLoggerAI;
