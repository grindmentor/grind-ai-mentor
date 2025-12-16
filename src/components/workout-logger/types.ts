// ==========================================
// Workout Logger Types - Strict Definitions
// ==========================================

/** A single set within an exercise */
export interface WorkoutSet {
  /** Weight lifted (stored as string for input, can be number from DB) */
  weight: string;
  /** Number of repetitions */
  reps: string;
  /** Rate of Perceived Exertion (6-10 scale), stored in DB */
  rpe: number;
}

/** An exercise within a workout session */
export interface WorkoutExercise {
  /** Exercise name */
  name: string;
  /** Array of sets performed */
  sets: WorkoutSet[];
  /** Optional muscle group categorization */
  muscleGroup?: string;
}

/** A complete workout session */
export interface WorkoutSession {
  /** Unique identifier */
  id: string;
  /** Name of the workout */
  workout_name: string;
  /** Date of the session (ISO string) */
  session_date: string;
  /** Duration in minutes */
  duration_minutes: number;
  /** Array of exercises with their sets */
  exercises_data: WorkoutExercise[];
  /** Optional notes about the session */
  notes?: string;
  /** Optional workout type categorization */
  workout_type?: string;
  /** Optional estimated calories burned */
  calories_burned?: number;
}

/** Raw set data that may come from DB (looser types for parsing) */
export interface RawWorkoutSet {
  weight?: string | number | null;
  reps?: string | number | null;
  rpe?: number | null;
}

/** Raw exercise data that may come from DB */
export interface RawWorkoutExercise {
  name?: string;
  exercise_name?: string;
  sets?: RawWorkoutSet[];
  muscleGroup?: string;
}

// ==========================================
// Normalizer - Pure function to transform raw DB data
// ==========================================

const DEFAULT_RPE = 7;

/**
 * Normalizes a single raw set to a clean WorkoutSet with safe defaults
 */
export const normalizeSet = (rawSet: RawWorkoutSet | null | undefined): WorkoutSet => {
  if (!rawSet) {
    return { weight: '', reps: '', rpe: DEFAULT_RPE };
  }
  
  return {
    weight: rawSet.weight != null ? String(rawSet.weight) : '',
    reps: rawSet.reps != null ? String(rawSet.reps) : '',
    rpe: typeof rawSet.rpe === 'number' ? rawSet.rpe : DEFAULT_RPE
  };
};

/**
 * Normalizes raw exercises_data from DB to clean WorkoutExercise[]
 * Handles various edge cases and malformed data gracefully
 */
export const normalizeSessionExercises = (
  exercisesData: RawWorkoutExercise[] | null | undefined
): WorkoutExercise[] => {
  if (!Array.isArray(exercisesData)) {
    return [];
  }
  
  return exercisesData
    .filter((exercise): exercise is RawWorkoutExercise => exercise != null)
    .map((exercise, index) => ({
      name: exercise.name || exercise.exercise_name || `Exercise ${index + 1}`,
      sets: Array.isArray(exercise.sets) 
        ? exercise.sets.map(normalizeSet)
        : [{ weight: '', reps: '', rpe: DEFAULT_RPE }],
      muscleGroup: exercise.muscleGroup
    }));
};

/**
 * Creates a new empty set with defaults
 */
export const createEmptySet = (): WorkoutSet => ({
  weight: '',
  reps: '',
  rpe: DEFAULT_RPE
});

/**
 * Creates a new exercise with one empty set
 */
export const createExercise = (name: string, muscleGroup?: string): WorkoutExercise => ({
  name,
  sets: [createEmptySet()],
  muscleGroup
});
