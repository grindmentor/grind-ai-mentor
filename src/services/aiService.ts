
import { supabase } from "@/integrations/supabase/client";

export interface AIServiceResponse {
  response: string;
  error?: string;
}

class AIService {
  private formatResponse(response: string): string {
    // Clean up AI formatting symbols completely
    let formatted = response
      // Remove ALL markdown formatting symbols
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1') 
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      // Convert numbered lists to bullet points
      .replace(/^\d+\.\s*/gm, '• ')
      // Clean up extra whitespace and formatting
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return formatted;
  }

  async generateTrainingProgram(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'training',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS - Follow these exactly:

1. NEVER use bold text or any formatting symbols
2. ONLY use bullet points with • symbol
3. Provide INSTANT, easy-to-read information

First, ask 2-3 quick questions about:
• Equipment available
• Time per session 
• Current experience level

Then provide a simple program format:

WEEK 1-2:
Day 1: Upper Body
• Exercise 1: 3 sets x 8-10 reps
• Exercise 2: 3 sets x 8-10 reps

Day 2: Lower Body  
• Exercise 1: 3 sets x 8-10 reps
• Exercise 2: 3 sets x 8-10 reps

End with KEY POINTS:
• Program focus
• Expected results
• Safety notes`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error generating training program:', error);
      throw new Error('Failed to generate training program. Please try again.');
    }
  }

  async generateMealPlan(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'nutrition',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS - Follow these exactly:

1. NEVER use bold text or any formatting symbols
2. ONLY use bullet points with • symbol  
3. Provide INSTANT, easy-to-read information

First, ask 2-3 quick questions about:
• Daily calorie target
• Dietary restrictions
• Meal prep time available

Then provide simple meal format:

DAY 1:
Breakfast:
• Food: Portion - Calories, Protein
• Food: Portion - Calories, Protein

Lunch:
• Food: Portion - Calories, Protein
• Food: Portion - Calories, Protein

End with DAILY TOTALS:
• Total calories
• Total protein
• Key nutrients`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }

  async generateCardioProgram(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'cardio',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS:
1. NEVER use bold text or formatting symbols
2. ONLY use bullet points with • symbol
3. Provide INSTANT, easy-to-read information
4. Ask 2-3 quick questions then give simple program format`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error generating cardio program:', error);
      throw new Error('Failed to generate cardio program. Please try again.');
    }
  }

  async getCoachingAdvice(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'coaching',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS:
1. NEVER use bold text or formatting symbols
2. ONLY use bullet points with • symbol
3. Provide INSTANT, easy-to-read advice
4. Keep responses short and actionable`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error getting coaching advice:', error);
      throw new Error('Failed to get coaching advice. Please try again.');
    }
  }

  async getRecoveryAdvice(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'recovery',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS:
1. NEVER use bold text or formatting symbols
2. ONLY use bullet points with • symbol
3. Provide INSTANT, easy-to-read advice
4. Keep responses short and actionable`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error getting recovery advice:', error);
      throw new Error('Failed to get recovery advice. Please try again.');
    }
  }

  async analyzeFoodLog(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'food_log',
          userInput: userInput,
          formatting: `CRITICAL INSTRUCTIONS:
1. NEVER use bold text or formatting symbols
2. ONLY use bullet points with • symbol
3. Provide INSTANT nutritional analysis
4. Show key metrics clearly`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return this.formatResponse(data.response);
    } catch (error) {
      console.error('Error analyzing food log:', error);
      throw new Error('Failed to analyze food log. Please try again.');
    }
  }

  async analyzeProgressPhoto(imageData: string, weight?: number, height?: number): Promise<{
    bodyFat: number;
    muscleMass: number;
    analysis: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: { 
          image: imageData,
          weight: weight,
          height: height
        }
      });

      if (error) {
        console.error('Photo analysis error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No response received from photo analysis');
      }
      
      return data;
    } catch (error) {
      console.error('Error analyzing photo:', error);
      throw new Error('Failed to analyze photo. Please try again.');
    }
  }
}

export const aiService = new AIService();
