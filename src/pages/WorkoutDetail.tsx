import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/ui/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Timer, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  primary_muscles: string[];
  equipment: string;
  difficulty_level: string;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  category: 'Split Programs' | 'Single Workouts' | 'Cardio';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  focus: string[];
  exercises: Exercise[];
  color: string;
}

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const workoutData = location.state?.workout;
    if (!workoutData) {
      navigate('/blueprint-ai');
      return;
    }
    setWorkout(workoutData);
  }, [location, navigate]);

  const addExerciseToSavedList = async (exercise: Exercise) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_saved_exercises')
        .upsert({
          user_id: user.id,
          name: exercise.name,
          description: `${exercise.sets} sets × ${exercise.reps} reps with ${exercise.rest} rest`,
          primary_muscles: exercise.primary_muscles,
          secondary_muscles: [],
          equipment: exercise.equipment,
          difficulty_level: exercise.difficulty_level,
          category: 'Strength'
        }, {
          onConflict: 'user_id,name',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: 'Exercise Saved! 💪',
        description: `${exercise.name} has been added to your saved exercises. You can now find it in the Workout Logger.`,
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to save exercise to your list.',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'Intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'Advanced': return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  if (!workout) {
    return (
      <AppShell title="Loading..." showBackButton>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={workout.title} showBackButton>
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
          {/* Workout Info */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getDifficultyColor(workout.difficulty)}>
              {workout.difficulty}
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              <Timer className="w-3 h-3 mr-1" />
              {workout.duration}
            </Badge>
            <Badge variant="outline" className="border-accent/30 text-accent-foreground bg-accent/10">
              {workout.exercises.length} exercises
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{workout.description}</p>

          {/* Focus Areas */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {workout.focus.map((focus, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="border-border text-muted-foreground bg-muted"
                >
                  {focus}
                </Badge>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Dumbbell className="w-5 h-5 mr-2" />
              Exercises
            </h3>
            
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        {index + 1}. {exercise.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {exercise.sets} sets × {exercise.reps}
                        </span>
                        <span className="flex items-center">
                          <Timer className="w-3 h-3 mr-1" />
                          {exercise.rest} rest
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => addExerciseToSavedList(exercise)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  
                  {/* Primary Muscles */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {exercise.primary_muscles.map((muscle, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline" 
                        className="border-border text-muted-foreground bg-muted text-xs"
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  {/* Equipment */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Dumbbell className="w-3 h-3 mr-1" />
                    {exercise.equipment}
                  </div>

                  {/* Notes */}
                  {exercise.notes && (
                    <p className="text-muted-foreground text-sm mt-2 italic">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default WorkoutDetail;
