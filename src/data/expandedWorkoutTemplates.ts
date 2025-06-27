
export const expandedWorkoutTemplates = [
  {
    id: 'push-pull-legs-beginner',
    title: 'Push Pull Legs - Beginner',
    category: 'Split Programs' as const,
    duration: '45-60 mins',
    difficulty: 'Beginner' as const,
    description: 'A classic 6-day split focusing on push movements (chest, shoulders, triceps), pull movements (back, biceps), and legs. Perfect for beginners to intermediate lifters.',
    focus: ['Hypertrophy', 'Strength', 'Muscle Building'],
    color: 'from-blue-500 to-cyan-500',
    exercises: [
      // PUSH DAY A
      {
        id: 'push-1',
        name: 'Barbell Bench Press',
        sets: 4,
        reps: '8-10',
        rest: '2-3 mins',
        primary_muscles: ['Chest', 'Triceps', 'Shoulders'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Focus on controlled movement and full range of motion'
      },
      {
        id: 'push-2',
        name: 'Overhead Press',
        sets: 3,
        reps: '8-10',
        rest: '2 mins',
        primary_muscles: ['Shoulders', 'Triceps'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Keep core tight and avoid arching back'
      },
      {
        id: 'push-3',
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10-12',
        rest: '90 secs',
        primary_muscles: ['Upper Chest', 'Shoulders'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner',
        notes: 'Use 30-45 degree incline'
      },
      {
        id: 'push-4',
        name: 'Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: '60 secs',
        primary_muscles: ['Side Delts'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner',
        notes: 'Keep slight bend in elbows, control the negative'
      },
      {
        id: 'push-5',
        name: 'Tricep Dips',
        sets: 3,
        reps: '10-15',
        rest: '90 secs',
        primary_muscles: ['Triceps'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner',
        notes: 'Use bench or parallel bars, keep body upright'
      },
      {
        id: 'push-6',
        name: 'Diamond Push-ups',
        sets: 3,
        reps: '8-12',
        rest: '60 secs',
        primary_muscles: ['Triceps', 'Chest'],
        equipment: 'Bodyweight',
        difficulty_level: 'Intermediate',
        notes: 'Form diamond with hands, focus on tricep engagement'
      }
    ]
  },
  {
    id: 'pull-day-routine',
    title: 'Pull Day - Back & Biceps',
    category: 'Single Workouts' as const,
    duration: '50-70 mins',
    difficulty: 'Intermediate' as const,
    description: 'Comprehensive pull day targeting all back muscles and biceps for maximum development.',
    focus: ['Back Development', 'Bicep Growth', 'Pulling Strength'],
    color: 'from-green-500 to-emerald-500',
    exercises: [
      {
        id: 'pull-1',
        name: 'Deadlifts',
        sets: 4,
        reps: '5-6',
        rest: '3 mins',
        primary_muscles: ['Lower Back', 'Hamstrings', 'Glutes'],
        equipment: 'Barbell',
        difficulty_level: 'Advanced',
        notes: 'Maintain neutral spine, drive through heels'
      },
      {
        id: 'pull-2',
        name: 'Pull-ups',
        sets: 4,
        reps: '6-10',
        rest: '2 mins',
        primary_muscles: ['Lats', 'Biceps'],
        equipment: 'Pull-up Bar',
        difficulty_level: 'Intermediate',
        notes: 'Full range of motion, control the descent'
      },
      {
        id: 'pull-3',
        name: 'Barbell Rows',
        sets: 4,
        reps: '8-10',
        rest: '2 mins',
        primary_muscles: ['Middle Back', 'Lats'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Squeeze shoulder blades, keep torso stable'
      },
      {
        id: 'pull-4',
        name: 'Lat Pulldowns',
        sets: 3,
        reps: '10-12',
        rest: '90 secs',
        primary_muscles: ['Lats', 'Rhomboids'],
        equipment: 'Cable Machine',
        difficulty_level: 'Beginner',
        notes: 'Pull to upper chest, focus on lat engagement'
      },
      {
        id: 'pull-5',
        name: 'Cable Rows',
        sets: 3,
        reps: '10-12',
        rest: '90 secs',
        primary_muscles: ['Middle Back', 'Rear Delts'],
        equipment: 'Cable Machine',
        difficulty_level: 'Beginner',
        notes: 'Keep chest up, squeeze at the back'
      },
      {
        id: 'pull-6',
        name: 'Barbell Curls',
        sets: 3,
        reps: '10-12',
        rest: '60 secs',
        primary_muscles: ['Biceps'],
        equipment: 'Barbell',
        difficulty_level: 'Beginner',
        notes: 'Control the weight, avoid swinging'
      },
      {
        id: 'pull-7',
        name: 'Hammer Curls',
        sets: 3,
        reps: '12-15',
        rest: '60 secs',
        primary_muscles: ['Biceps', 'Forearms'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner',
        notes: 'Neutral grip, squeeze at the top'
      }
    ]
  },
  {
    id: 'legs-day-routine',
    title: 'Leg Day - Quads, Glutes & Hamstrings',
    category: 'Single Workouts' as const,
    duration: '60-80 mins',
    difficulty: 'Intermediate' as const,
    description: 'Complete lower body workout targeting quads, glutes, hamstrings, and calves for balanced leg development.',
    focus: ['Leg Strength', 'Glute Development', 'Athletic Performance'],
    color: 'from-red-500 to-pink-500',
    exercises: [
      {
        id: 'legs-1',
        name: 'Back Squats',
        sets: 4,
        reps: '6-8',
        rest: '3 mins',
        primary_muscles: ['Quads', 'Glutes'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Go parallel or below, drive through heels'
      },
      {
        id: 'legs-2',
        name: 'Romanian Deadlifts',
        sets: 4,
        reps: '8-10',
        rest: '2-3 mins',
        primary_muscles: ['Hamstrings', 'Glutes'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Hinge at hips, feel stretch in hamstrings'
      },
      {
        id: 'legs-3',
        name: 'Bulgarian Split Squats',
        sets: 3,
        reps: '10-12 each',
        rest: '2 mins',
        primary_muscles: ['Quads', 'Glutes'],
        equipment: 'Dumbbells',
        difficulty_level: 'Intermediate',
        notes: 'Rear foot elevated, focus on front leg'
      },
      {
        id: 'legs-4',
        name: 'Leg Press',
        sets: 3,
        reps: '12-15',
        rest: '90 secs',
        primary_muscles: ['Quads', 'Glutes'],
        equipment: 'Leg Press Machine',
        difficulty_level: 'Beginner',
        notes: 'Full range of motion, control the negative'
      },
      {
        id: 'legs-5',
        name: 'Walking Lunges',
        sets: 3,
        reps: '12-15 each',
        rest: '90 secs',
        primary_muscles: ['Quads', 'Glutes'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner',
        notes: 'Step forward, keep torso upright'
      },
      {
        id: 'legs-6',
        name: 'Calf Raises',
        sets: 4,
        reps: '15-20',
        rest: '60 secs',
        primary_muscles: ['Calves'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner',
        notes: 'Full range of motion, pause at top'
      },
      {
        id: 'legs-7',
        name: 'Glute Bridges',
        sets: 3,
        reps: '15-20',
        rest: '60 secs',
        primary_muscles: ['Glutes'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner',
        notes: 'Squeeze glutes at top, hold for 1 sec'
      }
    ]
  },
  {
    id: 'push-day-b',
    title: 'Push Day B - Advanced',
    category: 'Single Workouts' as const,
    duration: '55-75 mins',
    difficulty: 'Advanced' as const,
    description: 'Advanced push day variation with emphasis on compound movements and muscle building techniques.',
    focus: ['Strength', 'Hypertrophy', 'Power'],
    color: 'from-purple-500 to-violet-500',
    exercises: [
      {
        id: 'push-b1',
        name: 'Incline Barbell Press',
        sets: 4,
        reps: '6-8',
        rest: '3 mins',
        primary_muscles: ['Upper Chest', 'Shoulders'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Focus on upper chest development'
      },
      {
        id: 'push-b2',
        name: 'Dumbbell Shoulder Press',
        sets: 4,
        reps: '8-10',
        rest: '2 mins',
        primary_muscles: ['Shoulders', 'Triceps'],
        equipment: 'Dumbbells',
        difficulty_level: 'Intermediate',
        notes: 'Better range of motion than barbell'
      },
      {
        id: 'push-b3',
        name: 'Weighted Dips',
        sets: 3,
        reps: '8-12',
        rest: '2 mins',
        primary_muscles: ['Lower Chest', 'Triceps'],
        equipment: 'Dip Belt',
        difficulty_level: 'Advanced',
        notes: 'Add weight for progression'
      },
      {
        id: 'push-b4',
        name: 'Arnold Press',
        sets: 3,
        reps: '10-12',
        rest: '90 secs',
        primary_muscles: ['Shoulders'],
        equipment: 'Dumbbells',
        difficulty_level: 'Intermediate',
        notes: 'Rotate palms during movement'
      },
      {
        id: 'push-b5',
        name: 'Close-Grip Bench Press',
        sets: 3,
        reps: '10-12',
        rest: '90 secs',
        primary_muscles: ['Triceps', 'Chest'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        notes: 'Hands closer than shoulder width'
      },
      {
        id: 'push-b6',
        name: 'Cable Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: '60 secs',
        primary_muscles: ['Side Delts'],
        equipment: 'Cable Machine',
        difficulty_level: 'Beginner',
        notes: 'Constant tension through range'
      }
    ]
  }
];
