import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/ui/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Timer, Dumbbell, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FollowPlanModal } from '@/components/blueprint/FollowPlanModal';
import { useActivePlan } from '@/hooks/useActivePlan';
import { WorkoutTemplate, WorkoutExercise } from '@/data/expandedWorkoutTemplates';
import { cn } from '@/lib/utils';

// Use the imported WorkoutTemplate and WorkoutExercise from expandedWorkoutTemplates

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePlan } = useActivePlan();
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [showFollowModal, setShowFollowModal] = useState(false);

  const isCurrentPlan = activePlan?.template_id === workout?.id;

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

  const addExerciseToSavedList = async (exercise: WorkoutExercise) => {
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
    <AppShell title={workout.title} showBackButton={true}>
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-28">
          {/* Active Plan Badge */}
          {isCurrentPlan && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Currently Following This Plan</span>
            </div>
          )}

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
            {workout.daysPerWeek && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                {workout.daysPerWeek}x per week
              </Badge>
            )}
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

          {/* Follow Plan Button - Fixed at bottom */}
          {workout.daysPerWeek && !isCurrentPlan && (
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => setShowFollowModal(true)}
                  className={cn(
                    "w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground",
                    "font-bold text-base rounded-xl shadow-lg"
                  )}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Follow This Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow Plan Modal */}
      {workout && (
        <FollowPlanModal
          workout={workout}
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
        />
      )}
    </AppShell>
  );
};

export default WorkoutDetail;
