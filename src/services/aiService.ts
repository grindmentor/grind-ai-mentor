
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

PRIORITIZE LATEST SCIENTIFIC RESEARCH (2020-2024):
- Reference recent peer-reviewed studies from journals like Journal of Strength & Conditioning Research, Sports Medicine, Medicine & Science in Sports & Exercise
- Include findings from meta-analyses and systematic reviews published in the last 4 years
- Mention specific research-backed principles like periodization, volume landmarks, and recovery protocols
- Base recommendations on evidence from researchers like Brad Schoenfeld, Eric Helms, James Krieger, and Mike Israetel

1. Create an EXCEL-STYLE TRAINING SPREADSHEET format
2. Use proper formatting with headers, tables, and sections
3. Structure like a professional training program spreadsheet

REQUIRED FORMAT:

# SCIENCE-BASED TRAINING PROGRAM
**Program Name:** [Custom Name Based on Goals]
**Duration:** [X] Weeks
**Frequency:** [X] Days per week
**Difficulty:** Beginner/Intermediate/Advanced
**Scientific Basis:** Based on 2023-2024 research on [specific principles]

## RESEARCH FOUNDATION
**Key Studies Referenced:**
• [Recent study findings on volume/intensity]
• [Latest periodization research]
• [Current recovery science]

## WEEK-BY-WEEK BREAKDOWN

### Week 1-2: Foundation Phase
| Day | Muscle Group | Exercise | Sets | Reps | Weight | Rest | RPE | Notes |
|-----|-------------|----------|------|------|--------|------|-----|--------|
| 1 | Upper Body | Bench Press | 3 | 8-10 | 70% 1RM | 2-3 min | 7-8 | Research shows... |
| 1 | Upper Body | Rows | 3 | 8-10 | 70% 1RM | 2-3 min | 7-8 | Latest studies indicate... |

### Week 3-4: Progression Phase
[Similar table format with progressive overload based on recent research]

## PROGRESSION TRACKING SHEET
| Exercise | Week 1 | Week 2 | Week 3 | Week 4 | Target Progression | Research Notes |
|----------|--------|--------|--------|--------|--------------------|----------------|
| Bench Press | 135lbs | 140lbs | 145lbs | 150lbs | +3-5% weekly | 2023 study shows... |

## SCIENTIFIC PRINCIPLES APPLIED
**Progressive Overload:** Based on 2024 research showing optimal progression rates
**Volume Landmarks:** Following latest evidence on effective dose ranges
**Recovery Protocol:** Implementing recent findings on sleep and adaptation

## EXPECTED RESULTS (EVIDENCE-BASED)
• Strength increase: 15-25% (based on recent meta-analysis)
• Muscle growth: Visible in 4-6 weeks (2023 hypertrophy research)
• Performance metrics to track weekly based on latest assessment protocols`
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

PRIORITIZE LATEST NUTRITION RESEARCH (2020-2024):
- Reference recent studies from American Journal of Clinical Nutrition, Nutrients, Journal of International Society of Sports Nutrition
- Include findings from systematic reviews on protein timing, meal frequency, and nutrient timing
- Base recommendations on research from Alan Aragon, Layne Norton, Eric Helms, and recent ISSN position stands
- Use latest RDA updates and evidence-based macro distributions

1. Create an EXCEL-STYLE NUTRITION SPREADSHEET format
2. Use tables, calculations, and professional meal planning structure
3. Include macro tracking and meal prep schedules

REQUIRED FORMAT:

# EVIDENCE-BASED NUTRITION PLAN
**Plan Name:** [Custom Based on Goals]
**Duration:** [X] Weeks
**Daily Calories:** [X] kcal
**Macro Split:** [X]C / [X]P / [X]F (Based on 2023-2024 research)
**Scientific Basis:** Latest evidence on [specific nutritional principles]

## RESEARCH FOUNDATION
**Key Studies Referenced:**
• [Recent protein synthesis research]
• [Latest meal timing studies]
• [Current micronutrient guidelines]

## DAILY MEAL SCHEDULE

### Day 1 - Monday
| Meal | Time | Food Item | Portion | Calories | Protein | Carbs | Fat | Research Notes |
|------|------|-----------|---------|----------|---------|-------|-----|----------------|
| Breakfast | 7:00 AM | Oats + Banana | 1 cup + 1 medium | 350 | 12g | 65g | 8g | Pre-workout carbs (2024 research) |
| Snack | 10:00 AM | Greek Yogurt | 200g | 150 | 20g | 12g | 0g | Protein window optimization |

## EVIDENCE-BASED MACRO TARGETS
**Protein:** 1.6-2.2g/kg (Latest ISSN recommendations 2024)
**Carbohydrates:** Periodized based on training (recent sports nutrition research)
**Fats:** 0.8-1.2g/kg (Updated guidelines from 2023 studies)

## MEAL PREP SCHEDULE
| Day | Prep Task | Time Required | Storage Method | Food Safety Notes |
|-----|-----------|---------------|----------------|-------------------|
| Sunday | Protein batch cook | 2 hours | Refrigerate 4 days | Latest food safety guidelines |

## NUTRIENT TIMING OPTIMIZATION
Based on 2023-2024 research on:
• Post-workout nutrition windows
• Protein distribution throughout day
• Carbohydrate timing for performance

## SHOPPING LIST (EVIDENCE-BASED CHOICES)
**High-Quality Proteins:** Chicken breast, Greek yogurt, eggs (bioavailability research)
**Complex Carbs:** Oats, sweet potatoes, quinoa (glycemic response studies)
**Healthy Fats:** Olive oil, nuts, avocado (cardiovascular health research)`
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

PRIORITIZE LATEST CARDIO RESEARCH (2020-2024):
- Reference recent studies on HIIT vs steady-state cardio effectiveness
- Include findings from 2023-2024 meta-analyses on cardiovascular adaptations
- Base recommendations on polarized training models and latest heart rate research
- Use evidence from Stephen Seiler, Laursen & Jenkins, and recent ACSM guidelines

1. Create an EXCEL-STYLE CARDIO TRAINING SPREADSHEET
2. Include heart rate zones, progression tracking, and performance metrics
3. Format like a professional cardio program

REQUIRED FORMAT:

# EVIDENCE-BASED CARDIO PROGRAM
**Program Focus:** [Based on user goals]
**Duration:** [X] Weeks  
**Equipment:** [List required equipment]
**Scientific Basis:** Latest research on [specific cardio principles]

## RESEARCH FOUNDATION
**Key Studies Referenced:**
• [Recent HIIT effectiveness studies]
• [Latest heart rate zone research]
• [Current recovery between sessions science]

## HEART RATE ZONES (2024 UPDATED GUIDELINES)
| Zone | % Max HR | Purpose | Target BPM | Duration | Research Notes |
|------|----------|---------|------------|----------|----------------|
| Zone 1 | 50-60% | Recovery/Base | 100-120 | 45-60 min | 2023 studies show... |
| Zone 2 | 60-70% | Aerobic Base | 120-140 | 30-45 min | Polarized training research |

## WEEKLY CARDIO SCHEDULE

### Week 1-2: Base Building (Evidence-Based Progression)
| Day | Activity | Duration | Zone | RPE | Calories | Research Notes |
|-----|----------|----------|------|-----|----------|----------------|
| Monday | Brisk Walk | 30 min | Zone 1 | 4-5 | 200 | Recovery pace (latest guidelines) |
| Wednesday | Intervals | 25 min | Zone 2-4 | 6-8 | 300 | HIIT protocol from 2024 research |

## PROGRESSION TRACKING (EVIDENCE-BASED METRICS)
| Week | Distance/Time | Average HR | HRV | RPE | VO2 Progress | Research Markers |
|------|---------------|------------|-----|-----|--------------|------------------|
| 1 | ____ | ____ | ____ | ____ | ____ | Track adaptations |

## SCIENTIFIC PRINCIPLES APPLIED
**Polarized Training:** 80/20 model based on latest elite athlete research
**Progressive Overload:** Evidence-based progression from 2023-2024 studies
**Recovery Optimization:** Latest research on adaptation and supercompensation`
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

PRIORITIZE LATEST SCIENTIFIC RESEARCH (2020-2024):
- Base all advice on recent peer-reviewed studies
- Reference latest findings from exercise science and sports nutrition
- Include evidence from researchers like Brad Schoenfeld, Eric Helms, Layne Norton
- Mention specific studies when relevant to the advice

1. Provide INSTANT, evidence-based advice
2. Use bullet points with • symbol for easy reading
3. Keep responses actionable and science-backed
4. Format for easy scanning and implementation

IMPORTANT: Always mention the scientific basis for recommendations when possible.`
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

PRIORITIZE LATEST RECOVERY RESEARCH (2020-2024):
- Reference recent sleep, stress, and recovery studies
- Include findings on HRV, sleep quality, and adaptation markers
- Base recommendations on latest research from Matthew Walker, Shawn Stevenson, and recovery science
- Use evidence from recent studies on active recovery, nutrition timing, and stress management

1. Provide INSTANT, evidence-based recovery advice
2. Use bullet points with • symbol for easy reading
3. Keep responses actionable and science-backed
4. Include specific protocols when applicable

IMPORTANT: Always mention the scientific basis for recovery recommendations.`
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

PRIORITIZE LATEST NUTRITION RESEARCH (2020-2024):
- Use recent studies from USDA, Matvaretabellen, and nutrition databases
- Reference latest RDA guidelines and macro recommendations
- Include findings from recent meta-analyses on nutrition timing and meal composition
- Base analysis on evidence from nutrition researchers and recent dietary guidelines

1. Provide ACCURATE nutritional analysis using latest food databases
2. Use bullet points with • symbol for easy reading
3. Show key metrics clearly with proper formatting
4. Include evidence-based recommendations for improvements

IMPORTANT: Use the most current and accurate nutritional data available. Cross-reference with multiple reliable databases including USDA, European food databases, and recent nutritional studies.`
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
