
import { supabase } from "@/integrations/supabase/client";

export interface AIServiceResponse {
  response: string;
  error?: string;
}

class AIService {
  private formatResponse(response: string): string {
    // Convert markdown formatting to HTML-like formatting for better display
    let formatted = response
      // Convert bold text **text** to proper formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Convert italic text *text* to proper formatting
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Convert code blocks
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Convert headers # ## ### to proper formatting
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Convert numbered lists to bullet points
      .replace(/^\d+\.\s*/gm, '• ')
      // Clean up extra whitespace
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

1. Create an EXCEL-STYLE TRAINING SPREADSHEET format
2. Use proper formatting with headers, tables, and sections
3. Structure like a professional training program spreadsheet

REQUIRED FORMAT:

# TRAINING PROGRAM OVERVIEW
**Program Name:** [Custom Name Based on Goals]
**Duration:** [X] Weeks
**Frequency:** [X] Days per week
**Difficulty:** Beginner/Intermediate/Advanced

## WEEK-BY-WEEK BREAKDOWN

### Week 1-2: Foundation Phase
| Day | Muscle Group | Exercise | Sets | Reps | Weight | Rest | Notes |
|-----|-------------|----------|------|------|--------|------|--------|
| 1 | Upper Body | Bench Press | 3 | 8-10 | RPE 7 | 2-3 min | Focus on form |
| 1 | Upper Body | Rows | 3 | 8-10 | RPE 7 | 2-3 min | Squeeze shoulder blades |

### Week 3-4: Progression Phase
[Similar table format]

## PROGRESSION TRACKING SHEET
| Exercise | Week 1 | Week 2 | Week 3 | Week 4 | Target Progression |
|----------|--------|--------|--------|--------|--------------------|
| Bench Press | 135lbs | 140lbs | 145lbs | 150lbs | +5lbs per week |

## PROGRAM NOTES
**Key Principles:**
• Progressive overload every week
• Track all metrics in provided spreadsheet format
• Rest days are crucial for adaptation

**Expected Results:**
• Strength increase: 15-25%
• Muscle growth: Visible in 4-6 weeks
• Performance metrics to track weekly`
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

1. Create an EXCEL-STYLE NUTRITION SPREADSHEET format
2. Use tables, calculations, and professional meal planning structure
3. Include macro tracking and meal prep schedules

REQUIRED FORMAT:

# PERSONALIZED NUTRITION PLAN
**Plan Name:** [Custom Based on Goals]
**Duration:** [X] Weeks
**Daily Calories:** [X] kcal
**Macro Split:** [X]C / [X]P / [X]F

## DAILY MEAL SCHEDULE

### Day 1 - Monday
| Meal | Time | Food Item | Portion | Calories | Protein | Carbs | Fat | Notes |
|------|------|-----------|---------|----------|---------|-------|-----|--------|
| Breakfast | 7:00 AM | Oats + Banana | 1 cup + 1 medium | 350 | 12g | 65g | 8g | Pre-workout fuel |
| Snack | 10:00 AM | Greek Yogurt | 200g | 150 | 20g | 12g | 0g | Post-workout |

## WEEKLY MEAL PREP SCHEDULE
| Day | Prep Task | Time Required | Storage Method |
|-----|-----------|---------------|----------------|
| Sunday | Protein batch cook | 2 hours | Refrigerate 4 days |

## MACRO TRACKING SHEET
| Day | Target Calories | Actual Calories | Protein | Carbs | Fat | Notes |
|-----|----------------|-----------------|---------|-------|-----|--------|
| Day 1 | 2000 | ____ | ____ | ____ | ____ | Track here |

## SHOPPING LIST
**Proteins:** Chicken breast (2lbs), Greek yogurt (1kg)
**Carbs:** Oats (1kg), Sweet potatoes (2lbs)
**Fats:** Olive oil, Nuts (200g)

**Weekly Targets:**
• Protein: 1.6-2.2g per kg bodyweight
• Hydration: 3-4L water daily
• Micronutrients: 5+ servings fruits/vegetables`
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
          formatting: `CRITICAL INSTRUCTIONS - Follow these exactly:

1. Create an EXCEL-STYLE CARDIO TRAINING SPREADSHEET
2. Include heart rate zones, progression tracking, and performance metrics
3. Format like a professional cardio program

REQUIRED FORMAT:

# CARDIO TRAINING PROGRAM
**Program Focus:** [Based on user goals]
**Duration:** [X] Weeks  
**Equipment:** [List required equipment]

## HEART RATE ZONES CALCULATION
| Zone | % Max HR | Purpose | Target BPM | Duration |
|------|----------|---------|------------|----------|
| Zone 1 | 50-60% | Recovery | 100-120 | 45-60 min |
| Zone 2 | 60-70% | Base Building | 120-140 | 30-45 min |

## WEEKLY CARDIO SCHEDULE

### Week 1-2: Base Building
| Day | Activity | Duration | Zone | RPE | Calories | Notes |
|-----|----------|----------|------|-----|----------|--------|
| Monday | Brisk Walk | 30 min | Zone 1 | 4-5 | 200 | Recovery pace |
| Wednesday | Bike Ride | 25 min | Zone 2 | 6-7 | 300 | Steady state |

## PROGRESSION TRACKING
| Week | Distance/Time | Average HR | Calories | RPE | Performance Notes |
|------|---------------|------------|----------|-----|-------------------|
| 1 | ____ | ____ | ____ | ____ | Track improvements |

## MONTHLY TARGETS
**Endurance Goal:** Increase duration by 10% weekly
**Intensity Goal:** Maintain target heart rate zones
**Recovery:** 2-3 rest days per week mandatory`
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
