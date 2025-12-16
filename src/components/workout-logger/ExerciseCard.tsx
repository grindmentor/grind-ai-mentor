import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from './types';
import SetRow from './SetRow';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  weightUnit: string;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
}

const ExerciseCard = React.memo(({
  exercise,
  exerciseIndex,
  weightUnit,
  onUpdateSet,
  onRemoveExercise,
  onRemoveSet,
  onAddSet
}: ExerciseCardProps) => {
  const exerciseNumber = exerciseIndex + 1;
  
  return (
    <article 
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden"
      aria-label={`Exercise ${exerciseNumber}: ${exercise.name}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">{exercise.name}</h3>
          <Button
            onClick={() => onRemoveExercise(exerciseIndex)}
            size="icon"
            variant="ghost"
            className="h-11 w-11 min-h-[44px] min-w-[44px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
            aria-label={`Remove exercise: ${exercise.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2" role="list" aria-label={`Sets for ${exercise.name}`}>
          {exercise.sets.map((set, setIndex) => (
            <SetRow
              key={setIndex}
              set={set}
              setIndex={setIndex}
              weightUnit={weightUnit}
              onUpdateSet={(field, value) => onUpdateSet(exerciseIndex, setIndex, field, value)}
              onRemoveSet={() => onRemoveSet(exerciseIndex, setIndex)}
            />
          ))}
          
          <Button
            onClick={() => onAddSet(exerciseIndex)}
            variant="outline"
            className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl h-11 min-h-[44px] mt-2"
            aria-label={`Add another set to ${exercise.name}`}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Set
          </Button>
        </div>
      </div>
    </article>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

export default ExerciseCard;
