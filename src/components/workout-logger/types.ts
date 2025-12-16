export interface WorkoutSet {
  weight: string | number;
  reps: string | number;
  rpe?: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  muscleGroup?: string;
}

export interface WorkoutSession {
  id: string;
  workout_name: string;
  session_date: string;
  duration_minutes: number;
  exercises_data: WorkoutExercise[];
  notes?: string;
  workout_type?: string;
  calories_burned?: number;
}
