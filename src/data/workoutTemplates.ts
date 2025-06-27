
export const workoutTemplates = [
  // SPLIT PROGRAMS
  {
    id: 'ppl-1',
    title: 'Push Pull Legs (6-Day)',
    category: 'Split Programs' as const,
    duration: '60-75 minutes',
    difficulty: 'Intermediate' as const,
    description: 'Classic PPL split focusing on progressive overload and muscle hypertrophy',
    focus: ['Hypertrophy', 'Strength', 'Volume'],
    color: 'bg-gradient-to-br from-blue-900/50 to-indigo-900/60 border-blue-500/50',
    exercises: [
      {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        sets: 4,
        reps: '6-8',
        rest: '3-4 minutes',
        primary_muscles: ['Chest', 'Triceps', 'Front Deltoids'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        description: 'Compound movement targeting chest, triceps, and front deltoids',
        form_cues: ['Retract shoulder blades', 'Feet firmly planted', 'Control the descent'],
        alternatives: ['Dumbbell Bench Press', 'Incline Bench Press']
      },
      {
        id: 'overhead-press',
        name: 'Overhead Press',
        sets: 3,
        reps: '8-10',
        rest: '2-3 minutes',
        primary_muscles: ['Shoulders', 'Triceps', 'Core'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate',
        description: 'Standing overhead press for shoulder strength and stability'
      },
      {
        id: 'dips',
        name: 'Weighted Dips',
        sets: 3,
        reps: '10-12',
        rest: '2 minutes',
        primary_muscles: ['Chest', 'Triceps'],
        equipment: 'Dip Station',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        sets: 4,
        reps: '12-15',
        rest: '90 seconds',
        primary_muscles: ['Side Deltoids'],
        equipment: 'Dumbbells',
        difficulty_level: 'Beginner'
      }
    ]
  },
  
  {
    id: 'upper-lower-1',
    title: 'Upper/Lower Split (4-Day)',
    category: 'Split Programs' as const,
    duration: '75-90 minutes',
    difficulty: 'Beginner' as const,
    description: 'Balanced upper/lower split perfect for building strength and size',
    focus: ['Strength', 'Hypertrophy', 'Balance'],
    color: 'bg-gradient-to-br from-green-900/50 to-emerald-900/60 border-green-500/50',
    exercises: [
      {
        id: 'pull-ups',
        name: 'Pull-ups',
        sets: 4,
        reps: '6-10',
        rest: '3 minutes',
        primary_muscles: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: 'Pull-up Bar',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'rows',
        name: 'Barbell Rows',
        sets: 4,
        reps: '8-10',
        rest: '2-3 minutes',
        primary_muscles: ['Lats', 'Rhomboids', 'Rear Delts'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'bench-press-upper',
        name: 'Bench Press',
        sets: 4,
        reps: '6-8',
        rest: '3 minutes',
        primary_muscles: ['Chest', 'Triceps', 'Front Deltoids'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      }
    ]
  },

  {
    id: 'full-body-1',
    title: 'Full Body Strength (3-Day)',
    category: 'Split Programs' as const,
    duration: '60-75 minutes',
    difficulty: 'Beginner' as const,
    description: 'Complete full-body routine focusing on compound movements',
    focus: ['Strength', 'Functional', 'Beginner-Friendly'],
    color: 'bg-gradient-to-br from-purple-900/50 to-violet-900/60 border-purple-500/50',
    exercises: [
      {
        id: 'squats-fb',
        name: 'Barbell Back Squats',
        sets: 4,
        reps: '8-10',
        rest: '3-4 minutes',
        primary_muscles: ['Quadriceps', 'Glutes', 'Core'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'deadlifts-fb',
        name: 'Conventional Deadlifts',
        sets: 3,
        reps: '5-6',
        rest: '4-5 minutes',
        primary_muscles: ['Hamstrings', 'Glutes', 'Back'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'press-fb',
        name: 'Overhead Press',
        sets: 3,
        reps: '8-10',
        rest: '2-3 minutes',
        primary_muscles: ['Shoulders', 'Triceps'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      }
    ]
  },

  // SINGLE WORKOUTS
  {
    id: 'leg-day-1',
    title: 'Leg Day Hypertrophy',
    category: 'Single Workouts' as const,
    duration: '75-90 minutes',
    difficulty: 'Intermediate' as const,
    description: 'High-volume leg workout targeting quads, hamstrings, and glutes',
    focus: ['Hypertrophy', 'Volume', 'Leg Development'],
    color: 'bg-gradient-to-br from-red-900/50 to-pink-900/60 border-red-500/50',
    exercises: [
      {
        id: 'squats-leg',
        name: 'Barbell Back Squats',
        sets: 4,
        reps: '8-12',
        rest: '3 minutes',
        primary_muscles: ['Quadriceps', 'Glutes'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'rdl-leg',
        name: 'Romanian Deadlifts',
        sets: 4,
        reps: '10-12',
        rest: '2-3 minutes',
        primary_muscles: ['Hamstrings', 'Glutes'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        sets: 3,
        reps: '15-20',
        rest: '2 minutes',
        primary_muscles: ['Quadriceps', 'Glutes'],
        equipment: 'Leg Press Machine',
        difficulty_level: 'Beginner'
      },
      {
        id: 'leg-curls',
        name: 'Leg Curls',
        sets: 3,
        reps: '12-15',
        rest: '90 seconds',
        primary_muscles: ['Hamstrings'],
        equipment: 'Leg Curl Machine',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'push-day-1',
    title: 'Push Day Power',
    category: 'Single Workouts' as const,
    duration: '60-75 minutes',
    difficulty: 'Advanced' as const,
    description: 'Heavy pushing movements for chest, shoulders, and triceps',
    focus: ['Strength', 'Power', 'Upper Body'],
    color: 'bg-gradient-to-br from-orange-900/50 to-red-900/60 border-orange-500/50',
    exercises: [
      {
        id: 'bench-power',
        name: 'Barbell Bench Press',
        sets: 5,
        reps: '3-5',
        rest: '4-5 minutes',
        primary_muscles: ['Chest', 'Triceps', 'Shoulders'],
        equipment: 'Barbell',
        difficulty_level: 'Advanced'
      },
      {
        id: 'incline-db',
        name: 'Incline Dumbbell Press',
        sets: 4,
        reps: '6-8',
        rest: '3 minutes',
        primary_muscles: ['Upper Chest', 'Shoulders'],
        equipment: 'Dumbbells',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'overhead-db',
        name: 'Dumbbell Shoulder Press',
        sets: 4,
        reps: '8-10',
        rest: '2-3 minutes',
        primary_muscles: ['Shoulders', 'Triceps'],
        equipment: 'Dumbbells',
        difficulty_level: 'Intermediate'
      }
    ]
  },

  {
    id: 'pull-day-1',
    title: 'Pull Day Volume',
    category: 'Single Workouts' as const,
    duration: '70-85 minutes',
    difficulty: 'Intermediate' as const,
    description: 'High-volume pulling workout for back and bicep development',
    focus: ['Hypertrophy', 'Volume', 'Back Development'],
    color: 'bg-gradient-to-br from-teal-900/50 to-cyan-900/60 border-teal-500/50',
    exercises: [
      {
        id: 'pullups-vol',
        name: 'Wide-Grip Pull-ups',
        sets: 4,
        reps: '8-12',
        rest: '3 minutes',
        primary_muscles: ['Lats', 'Rhomboids'],
        equipment: 'Pull-up Bar',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'rows-vol',
        name: 'Barbell Rows',
        sets: 4,
        reps: '10-12',
        rest: '2-3 minutes',
        primary_muscles: ['Lats', 'Rhomboids', 'Rear Delts'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'cable-rows',
        name: 'Cable Rows',
        sets: 3,
        reps: '12-15',
        rest: '2 minutes',
        primary_muscles: ['Mid Traps', 'Rhomboids'],
        equipment: 'Cable Machine',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'arm-blast',
    title: 'Arm Blast',
    category: 'Single Workouts' as const,
    duration: '45-60 minutes',
    difficulty: 'Beginner' as const,
    description: 'Focused arm workout targeting biceps and triceps',
    focus: ['Hypertrophy', 'Arms', 'Isolation'],
    color: 'bg-gradient-to-br from-yellow-900/50 to-orange-900/60 border-yellow-500/50',
    exercises: [
      {
        id: 'close-grip-bench',
        name: 'Close-Grip Bench Press',
        sets: 4,
        reps: '8-10',
        rest: '3 minutes',
        primary_muscles: ['Triceps', 'Chest'],
        equipment: 'Barbell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'barbell-curls',
        name: 'Barbell Curls',
        sets: 4,
        reps: '10-12',
        rest: '2 minutes',
        primary_muscles: ['Biceps'],
        equipment: 'Barbell',
        difficulty_level: 'Beginner'
      },
      {
        id: 'tricep-dips',
        name: 'Tricep Dips',
        sets: 3,
        reps: '12-15',
        rest: '90 seconds',
        primary_muscles: ['Triceps'],
        equipment: 'Parallel Bars',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'core-strength',
    title: 'Core Strength Circuit',
    category: 'Single Workouts' as const,
    duration: '30-45 minutes',
    difficulty: 'Beginner' as const,
    description: 'Comprehensive core workout for stability and strength',
    focus: ['Core', 'Stability', 'Functional'],
    color: 'bg-gradient-to-br from-indigo-900/50 to-blue-900/60 border-indigo-500/50',
    exercises: [
      {
        id: 'planks',
        name: 'Plank Hold',
        sets: 3,
        reps: '60 seconds',
        rest: '90 seconds',
        primary_muscles: ['Core', 'Shoulders'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      },
      {
        id: 'dead-bugs',
        name: 'Dead Bugs',
        sets: 3,
        reps: '10 each side',
        rest: '60 seconds',
        primary_muscles: ['Core', 'Hip Flexors'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      },
      {
        id: 'russian-twists',
        name: 'Russian Twists',
        sets: 3,
        reps: '20 each side',
        rest: '60 seconds',
        primary_muscles: ['Obliques', 'Core'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      }
    ]
  },

  // CARDIO WORKOUTS
  {
    id: 'hiit-1',
    title: 'HIIT Fat Burner',
    category: 'Cardio' as const,
    duration: '20-25 minutes',
    difficulty: 'Intermediate' as const,
    description: 'High-intensity interval training for maximum fat burn',
    focus: ['Fat Loss', 'Conditioning', 'Time-Efficient'],
    color: 'bg-gradient-to-br from-red-900/50 to-orange-900/60 border-red-500/50',
    exercises: [
      {
        id: 'burpees',
        name: 'Burpees',
        sets: 4,
        reps: '30 seconds',
        rest: '30 seconds',
        primary_muscles: ['Full Body'],
        equipment: 'Bodyweight',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        sets: 4,
        reps: '30 seconds',
        rest: '30 seconds',
        primary_muscles: ['Core', 'Shoulders'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      },
      {
        id: 'jump-squats',
        name: 'Jump Squats',
        sets: 4,
        reps: '30 seconds',
        rest: '30 seconds',
        primary_muscles: ['Legs', 'Glutes'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'liss-cardio',
    title: 'LISS Cardio Session',
    category: 'Cardio' as const,
    duration: '45-60 minutes',
    difficulty: 'Beginner' as const,
    description: 'Low-intensity steady-state cardio for endurance and recovery',
    focus: ['Endurance', 'Recovery', 'Fat Loss'],
    color: 'bg-gradient-to-br from-green-900/50 to-teal-900/60 border-green-500/50',
    exercises: [
      {
        id: 'incline-walk',
        name: 'Incline Walking',
        sets: 1,
        reps: '45 minutes',
        rest: 'N/A',
        primary_muscles: ['Legs', 'Cardiovascular'],
        equipment: 'Treadmill',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'tabata',
    title: 'Tabata Protocol',
    category: 'Cardio' as const,
    duration: '15-20 minutes',
    difficulty: 'Advanced' as const,
    description: '4-minute Tabata rounds for maximum intensity',
    focus: ['Power', 'Conditioning', 'Time-Efficient'],
    color: 'bg-gradient-to-br from-purple-900/50 to-pink-900/60 border-purple-500/50',
    exercises: [
      {
        id: 'squat-jumps',
        name: 'Squat Jumps',
        sets: 8,
        reps: '20 seconds',
        rest: '10 seconds',
        primary_muscles: ['Legs', 'Glutes'],
        equipment: 'Bodyweight',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'push-ups-tabata',
        name: 'Push-ups',
        sets: 8,
        reps: '20 seconds',
        rest: '10 seconds',
        primary_muscles: ['Chest', 'Triceps'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      }
    ]
  },

  {
    id: 'cardio-circuit',
    title: 'Cardio Circuit Training',
    category: 'Cardio' as const,
    duration: '35-45 minutes',
    difficulty: 'Intermediate' as const,
    description: 'Circuit-style cardio combining strength and conditioning',
    focus: ['Conditioning', 'Strength-Endurance', 'Full Body'],
    color: 'bg-gradient-to-br from-cyan-900/50 to-blue-900/60 border-cyan-500/50',
    exercises: [
      {
        id: 'kettlebell-swings',
        name: 'Kettlebell Swings',
        sets: 5,
        reps: '45 seconds',
        rest: '15 seconds',
        primary_muscles: ['Glutes', 'Hamstrings', 'Core'],
        equipment: 'Kettlebell',
        difficulty_level: 'Intermediate'
      },
      {
        id: 'battle-ropes',
        name: 'Battle Ropes',
        sets: 5,
        reps: '30 seconds',
        rest: '30 seconds',
        primary_muscles: ['Arms', 'Core', 'Shoulders'],
        equipment: 'Battle Ropes',
        difficulty_level: 'Intermediate'
      }
    ]
  },

  {
    id: 'rowing-workout',
    title: 'Rowing Power Session',
    category: 'Cardio' as const,
    duration: '30-40 minutes',
    difficulty: 'Intermediate' as const,
    description: 'Rowing machine workout for full-body conditioning',
    focus: ['Endurance', 'Power', 'Full Body'],
    color: 'bg-gradient-to-br from-slate-900/50 to-gray-900/60 border-slate-500/50',
    exercises: [
      {
        id: 'rowing-intervals',
        name: 'Rowing Intervals',
        sets: 6,
        reps: '250m',
        rest: '90 seconds',
        primary_muscles: ['Back', 'Legs', 'Core'],
        equipment: 'Rowing Machine',
        difficulty_level: 'Intermediate'
      }
    ]
  },

  {
    id: 'bodyweight-cardio',
    title: 'Bodyweight Cardio Blast',
    category: 'Cardio' as const,
    duration: '25-35 minutes',
    difficulty: 'Beginner' as const,
    description: 'No-equipment cardio workout you can do anywhere',
    focus: ['Fat Loss', 'Convenience', 'Bodyweight'],
    color: 'bg-gradient-to-br from-emerald-900/50 to-green-900/60 border-emerald-500/50',
    exercises: [
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        sets: 4,
        reps: '45 seconds',
        rest: '15 seconds',
        primary_muscles: ['Full Body'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      },
      {
        id: 'high-knees',
        name: 'High Knees',
        sets: 4,
        reps: '30 seconds',
        rest: '30 seconds',
        primary_muscles: ['Legs', 'Core'],
        equipment: 'Bodyweight',
        difficulty_level: 'Beginner'
      }
    ]
  }
];
