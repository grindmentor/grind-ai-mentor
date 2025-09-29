// AI Response Types
export interface AIResponse {
  response: string;
  error?: string;
}

export interface PhysiqueAnalysis {
  overall_score: number;
  attributes: {
    muscle_development: number;
    symmetry: number;
    definition: number;
    mass: number;
    conditioning: number;
  };
  muscle_groups: {
    chest: number;
    shoulders: number;
    arms: number;
    back: number;
    core: number;
    legs: number;
  };
  recommendations: string[];
  strengths?: string[];
  areas_to_improve?: string[];
  analysis_date?: string;
}

export interface FoodAnalysis {
  foods: Array<{
    name: string;
    portion_size: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    confidence: number;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface ExerciseSearchResult {
  id: string;
  name: string;
  description: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  category: string;
  force_type?: string;
  mechanics?: string;
  form_cues?: string;
  relevance_score: number;
}

export interface AIServiceOptions {
  maxTokens?: number;
  temperature?: number;
  useCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
  type?: 'coaching' | 'nutrition' | 'training' | 'recovery' | 'food_log';
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}
