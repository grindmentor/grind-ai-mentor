/**
 * Centralized module accent color system
 * Used for icon backgrounds, indicator chips, and subtle borders
 * Keep the rest of the UI unchanged - this is ONLY for small visuals
 */

export interface ModuleAccent {
  /** Background class for icon pill (e.g., "bg-cyan-500/12") */
  bg: string;
  /** Text/icon color class (e.g., "text-cyan-400") */
  text: string;
  /** Border class (e.g., "border-cyan-500/25") */
  border: string;
  /** Focus ring class (e.g., "ring-cyan-500/30") */
  ring: string;
}

export const DEFAULT_ACCENT: ModuleAccent = {
  bg: 'bg-primary/12',
  text: 'text-primary',
  border: 'border-primary/25',
  ring: 'ring-primary/30',
};

/**
 * Module accent map keyed by module ID
 * Falls back to DEFAULT_ACCENT if module ID is not found
 */
export const MODULE_ACCENTS: Record<string, ModuleAccent> = {
  // AI & Coaching
  'coach-gpt': {
    bg: 'bg-cyan-500/12',
    text: 'text-cyan-400',
    border: 'border-cyan-500/25',
    ring: 'ring-cyan-500/30',
  },
  'blueprint-ai': {
    bg: 'bg-indigo-500/12',
    text: 'text-indigo-400',
    border: 'border-indigo-500/25',
    ring: 'ring-indigo-500/30',
  },
  'physique-ai': {
    bg: 'bg-rose-500/12',
    text: 'text-rose-400',
    border: 'border-rose-500/25',
    ring: 'ring-rose-500/30',
  },
  
  // Workout & Training
  'workout-logger': {
    bg: 'bg-emerald-500/12',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    ring: 'ring-emerald-500/30',
  },
  'workout-timer': {
    bg: 'bg-orange-500/12',
    text: 'text-orange-400',
    border: 'border-orange-500/25',
    ring: 'ring-orange-500/30',
  },
  'smart-training': {
    bg: 'bg-blue-500/12',
    text: 'text-blue-400',
    border: 'border-blue-500/25',
    ring: 'ring-blue-500/30',
  },
  'exercise-database': {
    bg: 'bg-slate-500/12',
    text: 'text-slate-400',
    border: 'border-slate-500/25',
    ring: 'ring-slate-500/30',
  },
  
  // Nutrition & Diet
  'meal-plan-ai': {
    bg: 'bg-green-500/12',
    text: 'text-green-400',
    border: 'border-green-500/25',
    ring: 'ring-green-500/30',
  },
  'smart-food-log': {
    bg: 'bg-amber-500/12',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    ring: 'ring-amber-500/30',
  },
  'food-photo-logger': {
    bg: 'bg-pink-500/12',
    text: 'text-pink-400',
    border: 'border-pink-500/25',
    ring: 'ring-pink-500/30',
  },
  'tdee-calculator': {
    bg: 'bg-purple-500/12',
    text: 'text-purple-400',
    border: 'border-purple-500/25',
    ring: 'ring-purple-500/30',
  },
  'cut-calc-pro': {
    bg: 'bg-red-500/12',
    text: 'text-red-400',
    border: 'border-red-500/25',
    ring: 'ring-red-500/30',
  },
  
  // Recovery & Habits
  'recovery-coach': {
    bg: 'bg-violet-500/12',
    text: 'text-violet-400',
    border: 'border-violet-500/25',
    ring: 'ring-violet-500/30',
  },
  'habit-tracker': {
    bg: 'bg-yellow-500/12',
    text: 'text-yellow-400',
    border: 'border-yellow-500/25',
    ring: 'ring-yellow-500/30',
  },
  
  // Progress & Analytics
  'progress-hub': {
    bg: 'bg-purple-500/12',
    text: 'text-purple-400',
    border: 'border-purple-500/25',
    ring: 'ring-purple-500/30',
  },
  
  // Research
  'research': {
    bg: 'bg-teal-500/12',
    text: 'text-teal-400',
    border: 'border-teal-500/25',
    ring: 'ring-teal-500/30',
  },
};

/**
 * Get accent colors for a module by ID
 * Falls back to DEFAULT_ACCENT if not found
 */
export function getModuleAccent(moduleId: string): ModuleAccent {
  return MODULE_ACCENTS[moduleId] || DEFAULT_ACCENT;
}

/**
 * Get accent colors for a module by title (legacy support)
 * Falls back to DEFAULT_ACCENT if not found
 */
export function getModuleAccentByTitle(title: string): ModuleAccent {
  const titleToIdMap: Record<string, string> = {
    'CoachGPT': 'coach-gpt',
    'Coach GPT': 'coach-gpt',
    'Blueprint AI': 'blueprint-ai',
    'Physique AI': 'physique-ai',
    'Workout Logger AI': 'workout-logger',
    'Workout Logger': 'workout-logger',
    'Workout Timer': 'workout-timer',
    'Smart Training': 'smart-training',
    'Exercise Database': 'exercise-database',
    'Meal Plan Generator': 'meal-plan-ai',
    'Meal Plan AI': 'meal-plan-ai',
    'Smart Food Log': 'smart-food-log',
    'Food Photo Logger': 'food-photo-logger',
    'TDEE Calculator': 'tdee-calculator',
    'CutCalc Pro': 'cut-calc-pro',
    'Recovery Coach': 'recovery-coach',
    'Habit Tracker': 'habit-tracker',
    'Progress Hub': 'progress-hub',
    'Research': 'research',
  };
  
  const moduleId = titleToIdMap[title];
  return moduleId ? getModuleAccent(moduleId) : DEFAULT_ACCENT;
}
