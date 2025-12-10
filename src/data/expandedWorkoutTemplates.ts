export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  primary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  notes?: string;
  description?: string;
  form_cues?: string[];
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  category: 'Split Programs' | 'Single Workouts' | 'Cardio' | 'Full Body';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  focus: string[];
  color: string;
  daysPerWeek?: number;
  exercises: WorkoutExercise[];
}

export const expandedWorkoutTemplates: WorkoutTemplate[] = [
  // ====== PUSH/PULL/LEGS PROGRAMS ======
  {
    id: 'ppl-beginner',
    title: 'Push Pull Legs - Beginner',
    category: 'Split Programs',
    duration: '45-60 mins',
    difficulty: 'Beginner',
    daysPerWeek: 3,
    description: 'Classic 3-day PPL split perfect for beginners. Focuses on compound movements with moderate volume to build a strength foundation.',
    focus: ['Hypertrophy', 'Strength Foundation', 'Evidence-Based'],
    color: 'from-blue-500 to-cyan-500',
    exercises: [
      // PUSH DAY
      { id: 'ppl-b-push-1', name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest: '2-3 min', primary_muscles: ['Chest', 'Triceps', 'Shoulders'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Main compound lift - focus on form', description: 'The king of chest exercises. Drive through your feet, keep shoulder blades pinched.', form_cues: ['Arch upper back slightly', 'Lower bar to mid-chest', 'Push bar in slight arc toward face'] },
      { id: 'ppl-b-push-2', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Shoulders', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Keep core tight, no back lean', description: 'Primary shoulder builder. Squeeze glutes and brace core throughout.', form_cues: ['Start bar at collarbone', 'Push head through at top', 'Keep wrists straight'] },
      { id: 'ppl-b-push-3', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Upper Chest', 'Shoulders'], equipment: 'Dumbbells', difficulty_level: 'Beginner', notes: '30-45° incline angle', description: 'Targets upper chest fibers for balanced chest development.' },
      { id: 'ppl-b-push-4', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Side Delts'], equipment: 'Dumbbells', difficulty_level: 'Beginner', notes: 'Control the negative, slight lean forward', description: 'Isolation for wider shoulders. Lead with elbows, not hands.' },
      { id: 'ppl-b-push-5', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Triceps'], equipment: 'Cable', difficulty_level: 'Beginner', notes: 'Keep elbows pinned to sides' },
      // PULL DAY
      { id: 'ppl-b-pull-1', name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '2-3 min', primary_muscles: ['Back', 'Biceps'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Pull to lower chest, squeeze back', description: 'Fundamental back builder. Keep torso at 45° angle.', form_cues: ['Initiate with elbows', 'Squeeze shoulder blades', 'Control the descent'] },
      { id: 'ppl-b-pull-2', name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Lats', 'Biceps'], equipment: 'Cable', difficulty_level: 'Beginner', notes: 'Pull to upper chest, lean back slightly', description: 'Builds lat width. Focus on pulling elbows down and back.' },
      { id: 'ppl-b-pull-3', name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Middle Back', 'Rear Delts'], equipment: 'Cable', difficulty_level: 'Beginner', notes: 'Keep chest up, squeeze at contraction' },
      { id: 'ppl-b-pull-4', name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60 sec', primary_muscles: ['Rear Delts', 'Rotator Cuff'], equipment: 'Cable', difficulty_level: 'Beginner', notes: 'Pull to face level, external rotation at end', description: 'Essential for shoulder health and posture.' },
      { id: 'ppl-b-pull-5', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60 sec', primary_muscles: ['Biceps'], equipment: 'Barbell', difficulty_level: 'Beginner', notes: 'No swinging, control the weight' },
      // LEG DAY
      { id: 'ppl-b-legs-1', name: 'Barbell Back Squat', sets: 3, reps: '8-10', rest: '3 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Go parallel or below, drive through heels', description: 'The king of leg exercises. Builds total lower body strength.', form_cues: ['Brace core hard', 'Knees track over toes', 'Chest up throughout'] },
      { id: 'ppl-b-legs-2', name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Hinge at hips, feel hamstring stretch', description: 'Best hamstring builder. Keep bar close to legs.' },
      { id: 'ppl-b-legs-3', name: 'Leg Press', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Quads', 'Glutes'], equipment: 'Machine', difficulty_level: 'Beginner', notes: 'Full range of motion, dont lock knees' },
      { id: 'ppl-b-legs-4', name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '90 sec', primary_muscles: ['Quads', 'Glutes'], equipment: 'Bodyweight', difficulty_level: 'Beginner', notes: 'Keep torso upright' },
      { id: 'ppl-b-legs-5', name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: '60 sec', primary_muscles: ['Calves'], equipment: 'Machine', difficulty_level: 'Beginner', notes: 'Full stretch at bottom, pause at top' }
    ]
  },

  {
    id: 'ppl-intermediate',
    title: 'Push Pull Legs - Intermediate',
    category: 'Split Programs',
    duration: '60-75 mins',
    difficulty: 'Intermediate',
    daysPerWeek: 6,
    description: '6-day PPL split with higher volume and intensity. Based on research showing 10-20 sets per muscle group per week is optimal for hypertrophy.',
    focus: ['Hypertrophy', 'Volume Progression', 'Evidence-Based'],
    color: 'from-purple-500 to-pink-500',
    exercises: [
      // PUSH A (Chest Focus)
      { id: 'ppl-i-pusha-1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Heavy day - focus on progressive overload' },
      { id: 'ppl-i-pusha-2', name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Upper Chest'], equipment: 'Dumbbells', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-pusha-3', name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Chest'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'ppl-i-pusha-4', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Shoulders'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-pusha-5', name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '60 sec', primary_muscles: ['Side Delts'], equipment: 'Dumbbells', difficulty_level: 'Beginner' },
      { id: 'ppl-i-pusha-6', name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Triceps'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      // PULL A (Back Focus)
      { id: 'ppl-i-pulla-1', name: 'Deadlifts', sets: 4, reps: '5-6', rest: '3-4 min', primary_muscles: ['Back', 'Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Advanced', notes: 'Heavy compound - maintain neutral spine' },
      { id: 'ppl-i-pulla-2', name: 'Pull-ups', sets: 4, reps: '6-10', rest: '2 min', primary_muscles: ['Lats', 'Biceps'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-pulla-3', name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Middle Back'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-pulla-4', name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60 sec', primary_muscles: ['Rear Delts'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'ppl-i-pulla-5', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60 sec', primary_muscles: ['Biceps'], equipment: 'Barbell', difficulty_level: 'Beginner' },
      { id: 'ppl-i-pulla-6', name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Biceps', 'Forearms'], equipment: 'Dumbbells', difficulty_level: 'Beginner' },
      // LEGS A (Quad Focus)
      { id: 'ppl-i-legsa-1', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-legsa-2', name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ppl-i-legsa-3', name: 'Leg Press', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Quads'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'ppl-i-legsa-4', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Hamstrings'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'ppl-i-legsa-5', name: 'Calf Raises', sets: 4, reps: '12-15', rest: '60 sec', primary_muscles: ['Calves'], equipment: 'Machine', difficulty_level: 'Beginner' }
    ]
  },

  // ====== UPPER/LOWER SPLIT ======
  {
    id: 'upper-lower-4day',
    title: 'Upper/Lower Split - 4 Day',
    category: 'Split Programs',
    duration: '50-65 mins',
    difficulty: 'Intermediate',
    daysPerWeek: 4,
    description: 'Balanced 4-day split hitting each muscle group twice per week. Research shows 2x frequency is optimal for most lifters.',
    focus: ['Balanced Development', 'Optimal Frequency', 'Evidence-Based'],
    color: 'from-green-500 to-emerald-500',
    exercises: [
      // UPPER A
      { id: 'ul-uppera-1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ul-uppera-2', name: 'Barbell Rows', sets: 4, reps: '6-8', rest: '2-3 min', primary_muscles: ['Back', 'Biceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ul-uppera-3', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Shoulders'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ul-uppera-4', name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Lats'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'ul-uppera-5', name: 'Dumbbell Curls', sets: 3, reps: '10-12', rest: '60 sec', primary_muscles: ['Biceps'], equipment: 'Dumbbells', difficulty_level: 'Beginner' },
      { id: 'ul-uppera-6', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Triceps'], equipment: 'Cable', difficulty_level: 'Beginner' },
      // LOWER A
      { id: 'ul-lowera-1', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ul-lowera-2', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2-3 min', primary_muscles: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'ul-lowera-3', name: 'Leg Press', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Quads'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'ul-lowera-4', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Hamstrings'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'ul-lowera-5', name: 'Standing Calf Raises', sets: 4, reps: '12-15', rest: '60 sec', primary_muscles: ['Calves'], equipment: 'Machine', difficulty_level: 'Beginner' }
    ]
  },

  // ====== FULL BODY PROGRAMS ======
  {
    id: 'full-body-3x',
    title: 'Full Body 3x Per Week',
    category: 'Full Body',
    duration: '45-60 mins',
    difficulty: 'Beginner',
    daysPerWeek: 3,
    description: 'Perfect for beginners or those with limited time. High frequency, moderate volume approach backed by research.',
    focus: ['Beginner Friendly', 'Time Efficient', 'Evidence-Based'],
    color: 'from-orange-500 to-amber-500',
    exercises: [
      { id: 'fb3-1', name: 'Barbell Back Squat', sets: 3, reps: '8-10', rest: '2-3 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'fb3-2', name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest: '2-3 min', primary_muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'fb3-3', name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Back', 'Biceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'fb3-4', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Shoulders'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'fb3-5', name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'fb3-6', name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60 sec', primary_muscles: ['Rear Delts'], equipment: 'Cable', difficulty_level: 'Beginner' }
    ]
  },

  // ====== STRENGTH FOCUSED ======
  {
    id: 'strength-5x5',
    title: 'Strength 5x5 Program',
    category: 'Split Programs',
    duration: '45-60 mins',
    difficulty: 'Intermediate',
    daysPerWeek: 3,
    description: 'Classic strength program focusing on heavy compound lifts. Simple, effective, and time-tested.',
    focus: ['Strength', 'Progressive Overload', 'Compound Focus'],
    color: 'from-red-500 to-rose-500',
    exercises: [
      { id: 's5x5-1', name: 'Barbell Back Squat', sets: 5, reps: '5', rest: '3-5 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate', notes: 'Add 2.5kg each session when possible' },
      { id: 's5x5-2', name: 'Barbell Bench Press', sets: 5, reps: '5', rest: '3-5 min', primary_muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 's5x5-3', name: 'Barbell Rows', sets: 5, reps: '5', rest: '3 min', primary_muscles: ['Back', 'Biceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 's5x5-4', name: 'Overhead Press', sets: 5, reps: '5', rest: '3 min', primary_muscles: ['Shoulders'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 's5x5-5', name: 'Deadlifts', sets: 1, reps: '5', rest: '5 min', primary_muscles: ['Back', 'Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Advanced', notes: 'One heavy set after warmup' }
    ]
  },

  // ====== SINGLE WORKOUTS ======
  {
    id: 'push-day-complete',
    title: 'Complete Push Day',
    category: 'Single Workouts',
    duration: '50-70 mins',
    difficulty: 'Intermediate',
    description: 'Comprehensive push workout targeting chest, shoulders, and triceps with optimal exercise selection.',
    focus: ['Chest', 'Shoulders', 'Triceps', 'Hypertrophy'],
    color: 'from-blue-600 to-indigo-600',
    exercises: [
      { id: 'cpd-1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cpd-2', name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: '2 min', primary_muscles: ['Upper Chest'], equipment: 'Dumbbells', difficulty_level: 'Intermediate' },
      { id: 'cpd-3', name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Chest'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'cpd-4', name: 'Overhead Press', sets: 4, reps: '8-10', rest: '2 min', primary_muscles: ['Shoulders', 'Triceps'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cpd-5', name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '60 sec', primary_muscles: ['Side Delts'], equipment: 'Dumbbells', difficulty_level: 'Beginner' },
      { id: 'cpd-6', name: 'Tricep Dips', sets: 3, reps: '10-15', rest: '90 sec', primary_muscles: ['Triceps'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      { id: 'cpd-7', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Triceps'], equipment: 'Cable', difficulty_level: 'Beginner' }
    ]
  },

  {
    id: 'pull-day-complete',
    title: 'Complete Pull Day',
    category: 'Single Workouts',
    duration: '50-70 mins',
    difficulty: 'Intermediate',
    description: 'Full back and biceps workout for maximum pulling strength and muscle development.',
    focus: ['Back', 'Biceps', 'Rear Delts', 'Hypertrophy'],
    color: 'from-green-600 to-teal-600',
    exercises: [
      { id: 'cpull-1', name: 'Deadlifts', sets: 4, reps: '5-6', rest: '3-4 min', primary_muscles: ['Back', 'Hamstrings'], equipment: 'Barbell', difficulty_level: 'Advanced' },
      { id: 'cpull-2', name: 'Pull-ups', sets: 4, reps: '6-10', rest: '2 min', primary_muscles: ['Lats', 'Biceps'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      { id: 'cpull-3', name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '2 min', primary_muscles: ['Middle Back'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cpull-4', name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: '90 sec', primary_muscles: ['Middle Back'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'cpull-5', name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60 sec', primary_muscles: ['Rear Delts'], equipment: 'Cable', difficulty_level: 'Beginner' },
      { id: 'cpull-6', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60 sec', primary_muscles: ['Biceps'], equipment: 'Barbell', difficulty_level: 'Beginner' },
      { id: 'cpull-7', name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60 sec', primary_muscles: ['Biceps', 'Forearms'], equipment: 'Dumbbells', difficulty_level: 'Beginner' }
    ]
  },

  {
    id: 'leg-day-complete',
    title: 'Complete Leg Day',
    category: 'Single Workouts',
    duration: '55-75 mins',
    difficulty: 'Intermediate',
    description: 'Comprehensive lower body workout hitting quads, hamstrings, glutes, and calves.',
    focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    color: 'from-red-600 to-pink-600',
    exercises: [
      { id: 'cleg-1', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '3 min', primary_muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cleg-2', name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '2-3 min', primary_muscles: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cleg-3', name: 'Leg Press', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Quads'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'cleg-4', name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each', rest: '90 sec', primary_muscles: ['Quads', 'Glutes'], equipment: 'Dumbbells', difficulty_level: 'Intermediate' },
      { id: 'cleg-5', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '90 sec', primary_muscles: ['Hamstrings'], equipment: 'Machine', difficulty_level: 'Beginner' },
      { id: 'cleg-6', name: 'Hip Thrusts', sets: 3, reps: '10-12', rest: '2 min', primary_muscles: ['Glutes'], equipment: 'Barbell', difficulty_level: 'Intermediate' },
      { id: 'cleg-7', name: 'Standing Calf Raises', sets: 4, reps: '12-15', rest: '60 sec', primary_muscles: ['Calves'], equipment: 'Machine', difficulty_level: 'Beginner' }
    ]
  },

  // ====== CARDIO ======
  {
    id: 'hiit-cardio',
    title: 'HIIT Cardio Session',
    category: 'Cardio',
    duration: '20-30 mins',
    difficulty: 'Intermediate',
    description: 'High-intensity interval training for maximum calorie burn and cardiovascular fitness.',
    focus: ['Fat Loss', 'Conditioning', 'HIIT'],
    color: 'from-yellow-500 to-orange-500',
    exercises: [
      { id: 'hiit-1', name: 'Burpees', sets: 4, reps: '30 sec work / 30 sec rest', rest: '30 sec', primary_muscles: ['Full Body'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      { id: 'hiit-2', name: 'Mountain Climbers', sets: 4, reps: '30 sec work / 30 sec rest', rest: '30 sec', primary_muscles: ['Core', 'Shoulders'], equipment: 'Bodyweight', difficulty_level: 'Beginner' },
      { id: 'hiit-3', name: 'Jump Squats', sets: 4, reps: '30 sec work / 30 sec rest', rest: '30 sec', primary_muscles: ['Quads', 'Glutes'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' },
      { id: 'hiit-4', name: 'High Knees', sets: 4, reps: '30 sec work / 30 sec rest', rest: '30 sec', primary_muscles: ['Quads', 'Core'], equipment: 'Bodyweight', difficulty_level: 'Beginner' },
      { id: 'hiit-5', name: 'Plank Jacks', sets: 4, reps: '30 sec work / 30 sec rest', rest: '30 sec', primary_muscles: ['Core', 'Shoulders'], equipment: 'Bodyweight', difficulty_level: 'Intermediate' }
    ]
  }
];
