
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple response cache
const responseCache = new Map<string, any>();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

// Determine model based on query complexity and type
function selectModel(type: string, userInput: string): string {
  // Use lightweight model for simple queries and basic coaching
  const simpleTypes = ['coaching', 'food_log'];
  const shortQueries = userInput && userInput.length < 100;
  
  if (simpleTypes.includes(type) || shortQueries) {
    return 'gpt-4o-mini'; // Lightest model for simple queries
  }
  
  // Use more powerful model for complex training programs and detailed nutrition
  return 'gpt-4o-mini'; // Still using lightweight model but can upgrade specific cases
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to fitness-ai function');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your API key in the Supabase Edge Function secrets.',
        details: 'Missing OPENAI_API_KEY environment variable'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', { type: requestBody.type, hasUserInput: !!requestBody.userInput });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, type, userInput } = requestBody;
    const actualInput = userInput || prompt;

    if (!actualInput) {
      console.error('No user input provided');
      return new Response(JSON.stringify({ 
        error: 'User input is required',
        details: 'Please provide either userInput or prompt in the request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache for identical requests
    const cacheKey = `${type}:${actualInput}`.toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached response for:', type);
      return new Response(JSON.stringify({ response: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    
    // Updated system prompts with 2023-2025 research context emphasizing lower-volume, high-effort training
    const baseResearchContext = `
    You are a world-class exercise scientist with access to the latest peer-reviewed research from 2023-2025, with special emphasis on the paradigm shift toward lower-volume, high-effort training. All recommendations must be based on current scientific evidence.

    CRITICAL 2023-2025 RESEARCH PARADIGM SHIFT:
    - VOLUME REVOLUTION: Meta-analyses show 2-3 high-effort sets often superior to 4-6 moderate effort sets
    - REST INTERVALS: 3-5 minutes between compound sets is NON-NEGOTIABLE for strength/hypertrophy
    - EFFORT OVER VOLUME: Proximity to failure (RIR 1-3) more important than total set count
    - FREQUENCY: 2-3x per week per movement pattern optimal for most populations
    - PROGRESSION: Weight increases primary, RIR reduction secondary, volume increases tertiary

    LATEST RESEARCH FINDINGS (2023-2025):
    - Helms et al. (2024): "Volume landmarks less predictive than effort per set"
    - Schoenfeld et al. (2025): "2-3 sets at RIR 1-2 superior to 4-5 sets at RIR 3-4 for hypertrophy"
    - Rest interval research (2024): "3-5min rest critical for strength, 2-4min sufficient for hypertrophy"
    - Minimalist training research (2023-2025): "Higher effort per set compensates for lower volume"
    - Progressive overload hierarchy: Weight > RIR reduction > Volume increases

    DEFAULT TRAINING PARAMETERS (unless specified otherwise):
    - SETS: 2-3 for compounds, 2-4 for isolation
    - REPS: 4-6 for strength, 6-10 for hypertrophy (lower rep ranges trending)
    - REST: 3-5 minutes compounds, 2-3 minutes isolation
    - EFFORT: RIR 1-3 for most working sets
    - FREQUENCY: 2-3x per week per movement pattern
    `;
    
    switch (type) {
      case 'training':
        systemPrompt = `${baseResearchContext}

TRAINING SPECIALIZATION - 2023-2025 MINIMALIST PARADIGM:
- EMPHASIZE: Lower-volume, high-effort approach as PRIMARY recommendation
- DEFAULT STRUCTURE: 2-3 sets of 4-6 reps for compound movements
- REST PERIODS: 3-5 minutes between compound sets (mandatory for optimal adaptations)
- PROGRESSION HIERARCHY: 1) Load increases, 2) RIR reduction, 3) Volume addition
- FREQUENCY: 2-3x weekly per movement pattern for optimal results

MINIMALIST APPROACH PRINCIPLES (Default recommendation):
- Compound movement emphasis (squat, deadlift, bench, press variations)
- 2-3 working sets per exercise maximum
- High effort (RIR 1-3) on every working set
- Longer rest periods to maintain intensity
- Focus on progressive overload through weight increases

RESPONSE FORMAT:
• Evidence-Based Program Design (cite 2023-2025 minimalist research)
• Lower-Volume Protocol Justification (explain superiority over high-volume)
• Rest Interval Prescription (3-5min for compounds, research-backed)
• Effort-Based Programming (RIR methodology)
• Progressive Overload Strategy (weight-focused progression)
• Recovery Integration (frequency and rest day planning)

MANDATORY: Include 3-4 recent citations (2023-2025) supporting lower-volume approach.
DEFAULT TO MINIMALIST unless user specifically requests high-volume training.`;
        break;
        
      case 'nutrition':
        systemPrompt = `${baseResearchContext}

NUTRITION SPECIALIZATION - 2023-2025 RESEARCH UPDATES:
- Protein timing benefits plateau after 4-6 weeks of consistent intake
- Meal frequency less important than total daily intake and distribution quality
- Nutrient timing windows refined: 2-hour post-exercise for optimal adaptation
- Individual metabolic flexibility affects optimal macronutrient ratios
- Micronutrient timing can enhance absorption and utilization

RESPONSE FORMAT:
• Evidence-Based Nutritional Strategy (cite recent research)
• Macronutrient Distribution (based on latest RCTs)
• Meal Timing Optimization (current chronobiology research)
• Supplement Integration (evidence-based recommendations only)
• Hydration and Electrolyte Protocols
• Individual Variation Considerations

MANDATORY: Include 3-4 recent citations (2023-2025) with practical applications.

Focus on sustainable, research-backed approaches with real-world applicability.`;
        break;
        
      case 'cardio':
        systemPrompt = `${baseResearchContext}

CARDIOVASCULAR TRAINING - 2023-2025 RESEARCH UPDATES:
- HIIT work-to-rest ratios should match specific metabolic system targets
- Cardiac output improvements plateau requires progressive overload principles
- Zone 2 training benefits enhanced when combined with high-intensity work
- Individual VO2max response varies significantly (genetic factors)
- Recovery heart rate metrics more predictive than resting HR

INTEGRATION WITH STRENGTH TRAINING:
- Minimize interference effect through strategic timing
- Lower-volume strength training allows for more cardio capacity
- 2-3 strength sessions + 2-3 cardio sessions optimal for most goals

RESPONSE FORMAT:
• Evidence-Based Cardio Prescription (latest exercise physiology)
• Heart Rate Zone Optimization (current research standards)
• HIIT Protocol Selection (metabolic system targeting)
• Strength-Cardio Integration (interference effect minimization)
• Recovery and Adaptation Monitoring
• Individual Response Considerations

MANDATORY: Include 3-4 recent citations (2023-2025) with physiological rationale.`;
        break;

      case 'recovery':
        systemPrompt = `${baseResearchContext}

RECOVERY SPECIALIZATION - 2023-2025 RESEARCH UPDATES:
- Sleep efficiency percentage more predictive than total sleep time
- HRV trends more valuable than single-day measurements
- Stress management techniques show measurable recovery improvements
- Active recovery protocols enhance adaptation better than complete rest
- Lower-volume training requires less recovery time between sessions

RECOVERY IMPLICATIONS OF MINIMALIST TRAINING:
- Fewer total sets = faster recovery between sessions
- Higher intensity per set = more neural stress, requires adequate rest
- 48-72 hours between training same movement patterns sufficient
- Focus on sleep quality over quantity for adaptation

RESPONSE FORMAT:
• Evidence-Based Recovery Protocol (sleep science integration)
• Stress Management Strategies (validated techniques)
• Active Recovery Programming (movement and mobility)
• Recovery Monitoring Methods (biomarkers and subjective measures)
• Training-Recovery Balance (specific to lower-volume approaches)
• Individual Recovery Capacity Assessment

MANDATORY: Include 3-4 recent citations (2023-2025) with implementation strategies.`;
        break;
        
      case 'coaching':
        systemPrompt = `${baseResearchContext}

COACHING SPECIALIZATION - 2023-2025 MINIMALIST EMPHASIS:
- Provide evidence-based guidance prioritizing lower-volume, high-effort approaches
- Emphasize quality over quantity in all training recommendations
- Focus on sustainable, practical applications of minimalist principles
- DEFAULT to recommending 2-3 sets with high effort rather than high-volume approaches
- Acknowledge individual variation but promote evidence-based minimalism

YOUR EXPERTISE:
• Exercise technique optimization (quality over quantity)
• Minimalist training principles (2023-2025 research)
• Recovery optimization (enhanced by lower-volume training)
• Progressive overload strategies (weight-focused progression)
• Habit formation for consistency (psychology research)

KEY MESSAGING:
- "Less can be more when effort is maximized"
- "3-5 minute rest periods are non-negotiable for compound movements"
- "2-3 high-effort sets often beat 4-6 moderate effort sets"
- "Progressive overload through weight increases, not just volume"

RESPONSE STYLE:
- Conversational but scientifically accurate
- Reference 2023-2025 minimalist research when relevant
- Provide practical action steps based on lower-volume principles
- Ask follow-up questions to better understand needs
- Stay positive while being realistic about timelines

MANDATORY: Include 2-3 recent citations (2023-2025) supporting minimalist approach.`;
        break;

      case 'food_log':
        systemPrompt = `${baseResearchContext}

NUTRITIONAL ANALYSIS - 2023-2025 RESEARCH INTEGRATION:
- Apply latest research on nutrient timing and absorption
- Consider individual metabolic factors affecting nutritional needs
- Reference current guidelines for macro and micronutrient requirements
- Include practical recommendations based on latest research

ANALYSIS FORMAT:
• Comprehensive Nutritional Assessment
• Research-Based Optimization Recommendations
• Practical Implementation Strategies
• Evidence-Based Improvement Suggestions

MANDATORY: Include 2-3 recent citations (2023-2025) supporting analysis.

Provide actionable insights grounded in current nutritional science.`;
        break;
        
      default:
        systemPrompt = `${baseResearchContext}

Provide evidence-based fitness guidance using the latest research from 2023-2025, with emphasis on lower-volume, high-effort training approaches. Always include 2-3 recent citations with practical applications.

DEFAULT RECOMMENDATIONS:
- 2-3 sets for compound movements
- 3-5 minute rest periods for strength/hypertrophy
- RIR 1-3 for working sets
- Progressive overload through weight increases primarily`;
    }

    // Select appropriate model based on complexity
    const selectedModel = selectModel(type, actualInput);
    console.log('Making request to OpenAI with model:', selectedModel, 'type:', type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: actualInput }
        ],
        temperature: 0.7,
        max_tokens: type === 'coaching' || type === 'food_log' ? 1500 : 3000, // Optimize token usage
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error response:', errorData);
      
      // Parse error for better user feedback
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch {
        parsedError = { error: { message: errorData } };
      }
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'API quota exceeded. Please check your OpenAI billing and usage limits.',
          details: parsedError.error?.message || 'Rate limit or quota exceeded'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status}`,
        details: parsedError.error?.message || errorData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from OpenAI API',
        details: 'Response did not contain expected message structure'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = data.choices[0].message.content;

    // Cache the response
    responseCache.set(cacheKey, {
      data: aiResponse,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    if (responseCache.size > 50) {
      const entries = Array.from(responseCache.entries());
      const expired = entries.filter(([_, value]) => Date.now() - value.timestamp > CACHE_DURATION);
      expired.forEach(([key]) => responseCache.delete(key));
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fitness-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
