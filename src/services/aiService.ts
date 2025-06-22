
interface AIResponse {
  content: string;
  isQuestion?: boolean;
}

class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateTrainingProgram(prompt: string): Promise<AIResponse> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const normalizedPrompt = this.normalizeInput(prompt);
    
    // Check if it's a question or needs clarification
    if (this.isQuestion(normalizedPrompt)) {
      return {
        content: this.generateClarificationResponse(normalizedPrompt),
        isQuestion: true
      };
    }
    
    return {
      content: this.generateProgramResponse(normalizedPrompt),
      isQuestion: false
    };
  }

  async generateCardioProgram(prompt: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const normalizedPrompt = this.normalizeInput(prompt);
    
    if (this.isQuestion(normalizedPrompt)) {
      return {
        content: this.generateCardioQuestion(normalizedPrompt),
        isQuestion: true
      };
    }
    
    return {
      content: this.generateCardioResponse(normalizedPrompt),
      isQuestion: false
    };
  }

  async generateMealPlan(prompt: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const normalizedPrompt = this.normalizeInput(prompt);
    
    if (this.isQuestion(normalizedPrompt)) {
      return {
        content: this.generateNutritionQuestion(normalizedPrompt),
        isQuestion: true
      };
    }
    
    return {
      content: this.generateMealPlanResponse(normalizedPrompt),
      isQuestion: false
    };
  }

  private normalizeInput(text: string): string {
    const corrections: { [key: string]: string } = {
      'beginer': 'beginner',
      'mussel': 'muscle',
      'strenght': 'strength',
      'waight': 'weight',
      'excersize': 'exercise',
      'workut': 'workout',
      'protien': 'protein',
      'squats': 'squat',
      'benchpress': 'bench press',
      'deadlifts': 'deadlift',
      'cardio': 'cardiovascular',
      'loosing': 'losing',
      'wieght': 'weight'
    };

    let normalized = text.toLowerCase();
    Object.entries(corrections).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
    });
    
    return normalized;
  }

  private isQuestion(prompt: string): boolean {
    const questionKeywords = ['how', 'what', 'when', 'where', 'why', 'which', 'should i', 'can i', 'do i need'];
    return questionKeywords.some(keyword => prompt.includes(keyword));
  }

  private generateClarificationResponse(prompt: string): string {
    if (prompt.includes('how many') || prompt.includes('how often')) {
      return `To provide you with the most effective training program, I need to understand your current fitness level and goals better. 

Based on current exercise science research, training frequency depends on several factors:

• Experience level (beginner, intermediate, advanced)
• Recovery capacity 
• Training goals (strength, muscle gain, endurance)
• Available time per week

Could you tell me more about:
1. Your current experience with resistance training?
2. How many days per week can you commit to training?
3. What's your primary goal - building muscle, increasing strength, or improving general fitness?

This will help me create a scientifically-backed program tailored to your needs.`;
    }

    return `I'd be happy to help you create an evidence-based training program. To give you the most effective recommendations, could you provide more details about:

• Your training experience and current fitness level
• Your primary goals (muscle gain, strength, fat loss, etc.)
• Available equipment and training days per week
• Any physical limitations or preferences

The more specific information you provide, the better I can tailor the program to your individual needs using current exercise science principles.`;
  }

  private generateCardioQuestion(prompt: string): string {
    return `To design the most effective cardiovascular training program for you, I need to understand your specific situation better.

Research shows that cardio effectiveness varies greatly based on individual factors:

Could you share:
1. Your current cardiovascular fitness level?
2. Primary goal (fat loss, endurance improvement, heart health)?
3. Preferred activities (running, cycling, swimming, etc.)?
4. How much time can you dedicate to cardio per week?
5. Any joint issues or physical limitations?

This information will help me create a science-based cardio plan that's both effective and sustainable for your lifestyle.`;
  }

  private generateNutritionQuestion(prompt: string): string {
    return `To create an optimal nutrition plan based on current dietary science, I need to understand your individual needs better.

Nutrition requirements are highly individual and depend on multiple factors:

Could you provide:
1. Your primary goal (muscle gain, fat loss, maintenance)?
2. Current activity level and training frequency?
3. Any dietary restrictions or food preferences?
4. Approximate current daily calorie intake?
5. Height, weight, and age (for accurate calculations)?

With this information, I can provide evidence-based nutritional recommendations tailored to your specific needs and goals.`;
  }

  private generateProgramResponse(prompt: string): string {
    const isBeginnerProgram = prompt.includes('beginner') || prompt.includes('new') || prompt.includes('start');
    const isAdvancedProgram = prompt.includes('advanced') || prompt.includes('experienced');
    const isStrengthFocused = prompt.includes('strength') || prompt.includes('powerlifting');
    
    let programType = 'Progressive Training';
    if (isBeginnerProgram) programType = 'Foundation Building';
    if (isAdvancedProgram) programType = 'Advanced Development';
    if (isStrengthFocused) programType = 'Strength Specialization';

    return `EVIDENCE-BASED ${programType.toUpperCase()} PROGRAM

PROGRAM OVERVIEW
This program is designed based on current exercise science research to optimize your training results while minimizing injury risk.

TRAINING STRUCTURE
Phase 1 (Weeks 1-4): Adaptation and Form Development
• Focus on movement quality and progressive overload
• 3-4 training sessions per week
• 65-75% of estimated 1RM for compound movements

Phase 2 (Weeks 5-8): Volume and Intensity Progression  
• Increased training volume and load
• Advanced exercise variations introduced
• 75-85% intensity range for strength development

EXERCISE SELECTION
Primary Compound Movements:
• Squat variations (back squat, front squat, goblet squat)
• Deadlift patterns (conventional, sumo, Romanian)
• Pressing movements (bench press, overhead press, push-ups)
• Pulling exercises (rows, pull-ups, lat pulldowns)

Accessory Work:
• Unilateral exercises for balance and stability
• Core strengthening and stability work
• Mobility and movement preparation

SCIENTIFIC PRINCIPLES APPLIED

Progressive Overload: Systematic increase in training stimulus through load, volume, or intensity progression. Research demonstrates this as the primary driver of strength and hypertrophy adaptations.

Periodization: Structured variation in training variables to prevent plateaus and optimize recovery. Meta-analyses show periodized programs produce superior strength gains compared to non-periodized approaches.

Recovery Optimization: 48-72 hours between training the same muscle groups allows for protein synthesis and strength adaptations to occur.

PROGRAM PROGRESSION
Week 1-2: 3 sets x 8-10 reps (70-75% intensity)
Week 3-4: 4 sets x 6-8 reps (75-80% intensity)  
Week 5-6: 4-5 sets x 4-6 reps (80-85% intensity)
Week 7: Deload week (60-65% intensity)
Week 8: Test week or program reassessment

SAFETY AND FORM CONSIDERATIONS
• Always prioritize proper form over load progression
• Stop immediately if experiencing pain (not muscle fatigue)
• Warm-up thoroughly before each session
• Consider working with a qualified trainer for form assessment

RESEARCH CITATIONS

1. Schoenfeld, B.J., et al. (2017). "Dose-response relationship between weekly resistance training volume and increases in muscle mass." Journal of Sports Medicine, 47(6), 1207-1220.

2. Rhea, M.R., et al. (2003). "A comparison of linear and daily undulating periodized programs with equated volume and intensity." Journal of Strength and Conditioning Research, 17(1), 82-87.

3. Helms, E.R., et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation." Journal of Sports Medicine, 44(3), 967-982.

4. American College of Sports Medicine (2021). "ACSM's Guidelines for Exercise Testing and Prescription." 11th Edition.`;
  }

  private generateCardioResponse(prompt: string): string {
    return `EVIDENCE-BASED CARDIOVASCULAR TRAINING PROGRAM

PROGRAM FOUNDATION
This cardiovascular program is designed using current exercise physiology research to optimize fat oxidation, improve cardiovascular health, and enhance endurance capacity.

TRAINING ZONES AND INTENSITIES
Zone 1 - Recovery (60-70% HRmax): Active recovery and aerobic base building
Zone 2 - Aerobic Base (70-80% HRmax): Fat oxidation and aerobic capacity  
Zone 3 - Tempo (80-90% HRmax): Lactate threshold improvement
Zone 4 - VO2max (90-95% HRmax): Maximum aerobic power development
Zone 5 - Neuromuscular (95-100% HRmax): Anaerobic power and speed

WEEKLY STRUCTURE
Monday: Zone 2 steady-state (30-45 minutes)
Tuesday: Zone 4 intervals (4-6 x 4 minutes at 90% HRmax, 2-3 min recovery)
Wednesday: Zone 1 active recovery (20-30 minutes easy pace)
Thursday: Zone 3 tempo work (20-30 minutes at threshold pace)
Friday: Rest or Zone 1 recovery
Saturday: Zone 2 long session (45-60 minutes)
Sunday: Rest

EXERCISE MODALITIES
Primary: Running, cycling, rowing, swimming
Supplementary: Elliptical, stair climbing, walking inclines
Cross-training: Mix modalities to prevent overuse injuries

PROGRESSION PROTOCOL
Weeks 1-2: Establish aerobic base (80% Zone 1-2, 20% Zone 3-4)
Weeks 3-4: Increase intensity distribution (70% Zone 1-2, 30% Zone 3-4)
Weeks 5-6: Peak intensity phase (60% Zone 1-2, 40% Zone 3-5)
Week 7: Recovery week (90% Zone 1-2, 10% Zone 3)

PHYSIOLOGICAL ADAPTATIONS
• Increased cardiac output and stroke volume
• Enhanced mitochondrial density and enzyme activity
• Improved oxygen utilization and delivery
• Greater fat oxidation capacity
• Reduced resting heart rate and blood pressure

MONITORING AND SAFETY
• Use heart rate monitor for accurate zone training
• Track perceived exertion (RPE scale 1-10)
• Monitor recovery between sessions
• Stay hydrated and fuel appropriately for longer sessions

RESEARCH SUPPORT

1. Laursen, P.B., & Jenkins, D.G. (2002). "The scientific basis for high-intensity interval training." Sports Medicine, 32(1), 53-73.

2. Seiler, S. (2010). "What is best practice for training intensity and duration distribution in endurance athletes?" International Journal of Sports Physiology and Performance, 5(3), 276-291.

3. Brooks, G.A., et al. (2020). "The science and translation of lactate shuttle theory." Cell Metabolism, 27(4), 757-785.`;
  }

  private generateMealPlanResponse(prompt: string): string {
    return `EVIDENCE-BASED NUTRITION PROGRAM

NUTRITIONAL FRAMEWORK
This meal plan is designed using current nutritional science to support your training goals while promoting optimal health and body composition.

MACRONUTRIENT TARGETS
Protein: 1.6-2.2g per kg body weight daily
• Essential for muscle protein synthesis and recovery
• Distribute evenly across meals (20-30g per meal)
• Quality sources: lean meats, fish, dairy, legumes, eggs

Carbohydrates: 3-7g per kg body weight (activity dependent)
• Primary fuel source for high-intensity training
• Time around workouts for optimal performance
• Focus on whole grains, fruits, vegetables

Fats: 0.8-1.2g per kg body weight
• Essential for hormone production and vitamin absorption
• Sources: nuts, seeds, avocados, olive oil, fatty fish

MEAL TIMING STRATEGIES
Pre-workout (1-2 hours before): Carbs + moderate protein
Post-workout (within 2 hours): Protein + carbs for recovery
Daily: 3 main meals + 1-2 snacks for consistent fuel

SAMPLE DAILY MEAL PLAN
Breakfast: Oatmeal with berries, Greek yogurt, nuts (450 cal)
Mid-morning: Apple with almond butter (200 cal)
Lunch: Grilled chicken salad with quinoa, vegetables (550 cal)
Pre-workout: Banana with small protein shake (250 cal)
Post-workout: Protein shake with milk and berries (300 cal)
Dinner: Salmon, sweet potato, steamed broccoli (600 cal)
Evening: Greek yogurt with honey (150 cal)

HYDRATION PROTOCOL
• 35-40ml per kg body weight daily
• Additional 500-750ml per hour of training
• Monitor urine color for hydration status
• Electrolyte replacement for sessions >60 minutes

SUPPLEMENTATION CONSIDERATIONS
Evidence-based supplements with research support:
• Creatine monohydrate: 3-5g daily for strength/power
• Vitamin D3: If deficient (blood test recommended)
• Omega-3 fatty acids: 1-2g daily for inflammation reduction
• Whey protein: Convenient post-workout option

NUTRITIONAL PERIODIZATION
Training Days: Higher carbohydrate intake (5-7g/kg)
Rest Days: Moderate carbohydrates (3-4g/kg)
Competition/Peak: Optimize glycogen stores
Recovery Phases: Focus on anti-inflammatory foods

RESEARCH CITATIONS

1. Phillips, S.M., & Van Loon, L.J. (2011). "Dietary protein for athletes: from requirements to optimum adaptation." Journal of Sports Sciences, 29(S1), S29-S38.

2. Burke, L.M., et al. (2011). "Carbohydrates for training and competition." Journal of Sports Sciences, 29(S1), S17-S27.

3. Helms, E.R., et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation." Journal of Sports Medicine, 44(3), 967-982.

4. Kerksick, C.M., et al. (2018). "ISSN exercise & sports nutrition review update." Journal of the International Society of Sports Nutrition, 15(1), 38.`;
  }
}

export const aiService = AIService.getInstance();
export type { AIResponse };
