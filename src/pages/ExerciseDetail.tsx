import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/ui/app-shell';
import { Badge } from '@/components/ui/badge';
import { Target, Dumbbell, Clock, AlertCircle } from 'lucide-react';

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
  description?: string;
  form_cues?: string[];
  alternatives?: string[];
}

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const exerciseData = location.state?.exercise;
    if (!exerciseData) {
      navigate('/blueprint-ai');
      return;
    }
    setExercise(exerciseData);
  }, [location, navigate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'advanced': return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  if (!exercise) {
    return (
      <AppShell title="Loading..." showBackButton>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={exercise.name} showBackButton>
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Target className="w-4 h-4 mr-2" />
                Sets × Reps
              </div>
              <p className="text-foreground font-semibold">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Rest
              </div>
              <p className="text-foreground font-semibold">{exercise.rest}</p>
            </div>
          </div>

          {/* Difficulty and Equipment */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(exercise.difficulty_level)}>
              {exercise.difficulty_level}
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              <Dumbbell className="w-3 h-3 mr-1" />
              {exercise.equipment}
            </Badge>
          </div>

          {/* Primary Muscles */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Primary Muscles
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.primary_muscles.map((muscle, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="border-border text-muted-foreground bg-muted"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {exercise.description}
              </p>
            </div>
          )}

          {/* Form Cues */}
          {exercise.form_cues && exercise.form_cues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Form Cues
              </h3>
              <ul className="space-y-1">
                {exercise.form_cues.map((cue, index) => (
                  <li key={index} className="text-muted-foreground text-sm flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Alternatives</h3>
              <div className="space-y-1">
                {exercise.alternatives.map((alt, index) => (
                  <p key={index} className="text-muted-foreground text-sm">
                    • {alt}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              <p className="text-muted-foreground text-sm bg-muted p-3 rounded-lg">
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default ExerciseDetail;
