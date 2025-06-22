
import { supabase } from "@/integrations/supabase/client";

export interface AIServiceResponse {
  response: string;
  error?: string;
}

class AIService {
  private formatResponse(response: string): string {
    // Add markdown formatting for better readability
    let formatted = response
      // Bold important terms
      .replace(/\b(sets?|reps?|pounds?|kilograms?|calories?|protein|carbs|fat|fiber)\b/gi, '**$1**')
      // Format numbers with units
      .replace(/(\d+)\s*(g|grams?|lbs?|kg|calories?|kcal)\b/gi, '**$1 $2**')
      // Convert lists to bullet points
      .replace(/^\d+\.\s*/gm, '• ')
      .replace(/^-\s*/gm, '• ')
      // Ensure proper spacing around bullet points
      .replace(/\n\n•/g, '\n\n• ')
      .replace(/\n•/g, '\n• ');

    return formatted;
  }

  async generateTrainingProgram(userInput: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'training',
          userInput: userInput,
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. No motivational content unless requested.'
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
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. No motivational content unless requested.'
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
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. No motivational content unless requested.'
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
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. Provide scientific citations when relevant. No motivational content unless requested.'
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
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. No motivational content unless requested.'
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
          formatting: 'Use bullet points, bold key terms with **, keep responses concise and factual. No motivational content unless requested.'
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
