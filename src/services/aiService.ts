
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

1. FIRST, ask 3-4 specific questions about:
   - Current experience level and training history
   - Available equipment and gym access
   - Time commitment per session and weekly frequency
   - Specific goals (strength, muscle gain, fat loss, etc.)
   - Any injuries or limitations

2. ONLY after receiving answers, provide a detailed program using this EXACT format:

TRAINING PROGRAM GRID:
Week 1-2: Foundation Phase
Day 1: Upper Body
• Exercise 1: Sets x Reps - Rest period
• Exercise 2: Sets x Reps - Rest period
[Continue for all exercises]

Day 2: Lower Body
• Exercise 1: Sets x Reps - Rest period
[Continue pattern]

3. END with a clear SUMMARY section highlighting:
• Key program principles
• Expected progression timeline
• Important safety notes

FORMATTING RULES:
- Use NO bold, italic, or markdown symbols whatsoever
- Use bullet points with • symbol only
- Present programs in clear grid format
- Make content easy to copy and save
- Ask questions BEFORE giving detailed plans
- Base all recommendations on scientific evidence`
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

1. FIRST, ask 3-4 specific questions about:
   - Dietary preferences and restrictions
   - Daily calorie target and macronutrient goals
   - Cooking skills and meal prep time available
   - Budget considerations and food availability
   - Current eating patterns and schedule

2. ONLY after receiving answers, provide a detailed meal plan using this EXACT format:

MEAL PLAN GRID:
Day 1:
Breakfast:
• Food item: Portion size - Calories, Protein, Carbs, Fat
• Food item: Portion size - Calories, Protein, Carbs,

Lunch:
• Food item: Portion size - Calories, Protein, Carbs, Fat
[Continue pattern for all meals]

3. END with a NUTRITION SUMMARY:
• Total daily calories
• Macronutrient breakdown
• Key nutritional highlights
• Meal prep tips

FORMATTING RULES:
- Use NO bold, italic, or markdown symbols
- Use bullet points with • symbol only
- Present plans in structured grid format
- Make recommendations easy to copy and save
- Ask questions BEFORE providing detailed plans
- Include scientific nutritional reasoning`
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
          formatting: `CRITICAL INSTRUCTIONS:

1. FIRST, ask clarifying questions to understand the specific situation
2. Provide structured advice with actionable steps
3. Use NO formatting symbols - no bold, italic, or markdown
4. Use bullet points with • symbol only
5. Include scientific citations when relevant
6. End with a brief summary of key recommendations
7. Make advice easy to copy and implement
8. Ask questions BEFORE giving detailed advice`
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

1. Ask clarifying questions about current recovery practices and concerns
2. Provide structured recovery recommendations
3. Use NO formatting symbols - no bold, italic, or markdown  
4. Use bullet points with • symbol only
5. Provide evidence-based suggestions
6. Ask questions BEFORE giving detailed advice`
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

1. Ask clarifying questions about portion sizes, preparation methods, and goals
2. Provide detailed nutritional analysis in structured format
3. Use NO formatting symbols - no bold, italic, or markdown
4. Use bullet points with • symbol only  
5. Include specific recommendations for improvement
6. Provide a summary with key insights
7. Ask questions BEFORE providing detailed analysis`
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
