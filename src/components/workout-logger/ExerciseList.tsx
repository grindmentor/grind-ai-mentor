import React from 'react';
import { Target } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import { WorkoutExercise, WorkoutSet } from './types';

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  weightUnit: string;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
}

const ExerciseList = React.memo(({
  exercises,
  weightUnit,
  onUpdateSet,
  onRemoveExercise,
  onRemoveSet,
  onAddSet
}: ExerciseListProps) => {
  if (exercises.length === 0) {
    return (
      <div 
        className="bg-card/30 border border-border/30 rounded-2xl p-8 text-center"
        role="status"
        aria-label="No exercises added yet"
      >
        <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" aria-hidden="true" />
        <h3 className="text-base font-medium text-foreground mb-2">No Exercises Added</h3>
        <p className="text-muted-foreground text-sm">
          Add your first exercise to start logging your workout.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Current workout exercises">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={`${exercise.name}-${index}`}
          exercise={exercise}
          exerciseIndex={index}
          weightUnit={weightUnit}
          onUpdateSet={onUpdateSet}
          onRemoveExercise={onRemoveExercise}
          onRemoveSet={onRemoveSet}
          onAddSet={onAddSet}
        />
      ))}
    </div>
  );
});

ExerciseList.displayName = 'ExerciseList';

export default ExerciseList;
