
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Target, Timer, Dumbbell } from 'lucide-react';
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

interface WorkoutDetailModalProps {
  workout: WorkoutTemplate;
  onClose: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addExerciseToLog = async (exercise: Exercise) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: `${workout.title} - ${exercise.name}`,
          duration_minutes: 30,
          exercises_data: [{
            id: exercise.id,
            exercise_name: exercise.name,
            sets: Array.from({ length: exercise.sets }, (_, i) => ({
              id: `${exercise.id}-set-${i + 1}`,
              reps: parseInt(exercise.reps.split('-')[0]) || 10,
              weight: 0
            })),
            notes: exercise.notes || ''
          }],
          notes: `Added from Blueprint AI - ${exercise.name}`
        });

      if (error) throw error;

      toast({
        title: 'Exercise Added! 💪',
        description: `${exercise.name} has been added to your workout log.`,
      });
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to add exercise to your log.',
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white pr-8">
              {workout.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Workout Info */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getDifficultyColor(workout.difficulty)}>
              {workout.difficulty}
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
              <Timer className="w-3 h-3 mr-1" />
              {workout.duration}
            </Badge>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
              {workout.exercises.length} exercises
            </Badge>
          </div>

          {/* Description */}
          <p className="text-gray-300 leading-relaxed">{workout.description}</p>

          {/* Focus Areas */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {workout.focus.map((focus, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="border-orange-500/30 text-orange-400 bg-orange-500/10"
                >
                  {focus}
                </Badge>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Dumbbell className="w-5 h-5 mr-2" />
              Exercises
            </h3>
            
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {index + 1}. {exercise.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
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
                      onClick={() => addExerciseToLog(exercise)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Log
                    </Button>
                  </div>
                  
                  {/* Primary Muscles */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {exercise.primary_muscles.map((muscle, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline" 
                        className="border-green-500/30 text-green-400 bg-green-500/10 text-xs"
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  {/* Equipment */}
                  <div className="flex items-center text-xs text-gray-500">
                    <Dumbbell className="w-3 h-3 mr-1" />
                    {exercise.equipment}
                  </div>

                  {/* Notes */}
                  {exercise.notes && (
                    <p className="text-gray-400 text-sm mt-2 italic">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
