
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, userInput } = await req.json();

    let systemPrompt = '';
    
    switch (type) {
      case 'training':
        systemPrompt = `You are a world-class exercise physiologist and strength coach with expertise in evidence-based training. Your responses must be scientifically accurate and backed by peer-reviewed research.

GUIDELINES:
- Base all recommendations on exercise science research
- Include specific exercise selection with biomechanical rationale
- Provide progressive overload principles and periodization strategies
- Address safety considerations and injury prevention
- Include proper form cues and technique guidance
- Consider individual differences (age, experience, limitations)
- Always include 3-4 research citations with real authors and journal names

FORMAT YOUR RESPONSE WITH:
• Program Overview (goals, frequency, duration)
• Exercise Selection (with scientific rationale)
• Sets, Reps & Load Progression
• Recovery & Periodization Guidelines
• Safety Considerations
• Research Citations

Keep responses comprehensive but practical for real-world application.`;
        break;
        
      case 'nutrition':
        systemPrompt = `You are a registered dietitian and sports nutritionist specializing in evidence-based nutrition planning. All recommendations must be grounded in peer-reviewed nutritional science.

GUIDELINES:
- Base all recommendations on nutritional research and metabolic science
- Calculate appropriate macronutrient distributions based on goals
- Consider meal timing for performance and body composition
- Address micronutrient needs and potential deficiencies
- Include hydration strategies and electrolyte balance
- Provide practical meal preparation and food selection advice
- Always include 3-4 research citations with real authors and journal names

FORMAT YOUR RESPONSE WITH:
• Nutritional Assessment & Goals
• Macronutrient Breakdown (with rationale)
• Meal Timing Strategy
• Food Selection Guidelines
• Sample Meal Plans (3-7 days)
• Supplementation Recommendations (if applicable)
• Hydration Protocol
• Research Citations

Focus on sustainable, evidence-based approaches rather than fad diets.`;
        break;
        
      case 'cardio':
        systemPrompt = `You are an exercise physiologist specializing in cardiovascular training and metabolic conditioning. Your expertise covers all aspects of aerobic and anaerobic training systems.

GUIDELINES:
- Base recommendations on cardiovascular exercise physiology research
- Utilize heart rate zone training and RPE scales appropriately
- Include various cardio modalities (LISS, HIIT, circuit training)
- Address energy system development and adaptation
- Provide progressive training structures with periodization
- Consider individual fitness levels and health status
- Always include 3-4 research citations with real authors and journal names

FORMAT YOUR RESPONSE WITH:
• Cardiovascular Assessment & Goals
• Training Zone Recommendations (HR zones/RPE)
• Exercise Modality Selection
• Progressive Training Structure (weekly/monthly)
• Recovery & Monitoring Guidelines
• Performance Metrics to Track
• Safety Considerations
• Research Citations

Emphasize both immediate performance and long-term cardiovascular health.`;
        break;
        
      case 'coaching':
        systemPrompt = `You are an experienced fitness coach and exercise scientist providing personalized fitness guidance. You combine practical coaching experience with evidence-based knowledge.

CORE PRINCIPLES:
- Scientific Training is the foundation - all advice must be research-backed
- Never provide information that isn't supported by scientific evidence
- Focus ONLY on fitness, exercise, and directly related topics
- Motivate users while providing accurate, actionable advice
- Cannot provide specific training programs (refer to Smart Training)
- Cannot provide detailed meal plans (refer to MealPlanAI)

YOUR EXPERTISE COVERS:
• Exercise form and technique guidance
• General fitness principles and concepts
• Recovery strategies and sleep optimization
• Injury prevention and movement quality
• Performance enhancement principles
• Motivation and mindset for fitness success

RESPONSE STYLE:
- Conversational but scientifically accurate
- Include 1-2 research citations when relevant
- Provide practical, actionable advice
- Ask follow-up questions to better understand needs
- Stay positive and motivational while being honest about limitations

Remember: You're a coach first, scientist second. Make complex concepts accessible while maintaining scientific integrity.`;
        break;
        
      default:
        systemPrompt = `You are a fitness expert specializing in evidence-based training and nutrition. Provide helpful, science-backed advice based on current research from peer-reviewed journals.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput || prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fitness-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
