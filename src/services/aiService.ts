
import { supabase } from "@/integrations/supabase/client";

export interface AIServiceResponse {
  response: string;
  error?: string;
}

class AIService {
  private formatResponse(response: string): string {
    // Clean up AI formatting symbols
    let formatted = response
      // Remove markdown bold/italic symbols
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Convert numbered lists to bullet points
      .replace(/^\d+\.\s*/gm, '• ')
      // Ensure proper spacing
      .replace(/\n\n•/g, '\n\n• ')
      .replace(/\n•/g, '\n• ')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return formatted;
  }

  async generateTrainingProgram(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'training',
          userInput: userInput,
          formatting: `Please follow these guidelines:
          1. Ask 3-4 clarifying questions about experience level, available equipment, time commitment, and specific goals before providing a detailed plan
          2. Present workout plans in a clear grid format with exercises, sets, reps, and rest periods
          3. Provide a brief summary at the end highlighting key points
          4. Use plain text only - no bold, italic, or markdown formatting
          5. Use bullet points with • symbol for lists
          6. Focus on scientific, evidence-based recommendations`
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
          formatting: `Please follow these guidelines:
          1. Ask 3-4 clarifying questions about dietary preferences, restrictions, budget, and goals before providing a detailed plan
          2. Present meal plans in a structured grid format with meals, portions, and nutritional highlights
          3. Provide a brief summary with key nutritional points
          4. Use plain text only - no bold, italic, or markdown formatting
          5. Use bullet points with • symbol for lists
          6. Make recommendations easy to copy and save`
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
          formatting: `Please follow these guidelines:
          1. Ask clarifying questions about current fitness level, preferred activities, and time availability
          2. Present cardio programs in a structured format with duration, intensity, and progression
          3. Use plain text only - no formatting symbols
          4. Use bullet points with • symbol
          5. Provide a summary with key benefits`
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
          formatting: `Please follow these guidelines:
          1. Ask clarifying questions to better understand the user's specific situation
          2. Provide structured advice with actionable steps
          3. Use plain text only - no formatting symbols
          4. Use bullet points with • symbol
          5. Include scientific citations when relevant
          6. End with a brief summary of key recommendations`
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
          formatting: `Please follow these guidelines:
          1. Ask clarifying questions about current recovery practices and concerns
          2. Provide structured recovery recommendations
          3. Use plain text only - no formatting symbols
          4. Use bullet points with • symbol
          5. Provide evidence-based suggestions`
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
          formatting: `Please follow these guidelines:
          1. Ask clarifying questions about portion sizes, preparation methods, and goals
          2. Provide detailed nutritional analysis in a structured format
          3. Use plain text only - no formatting symbols
          4. Use bullet points with • symbol
          5. Include specific recommendations for improvement
          6. Provide a summary with key insights`
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
}

export const aiService = new AIService();
