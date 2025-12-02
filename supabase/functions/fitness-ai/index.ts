
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IP-based rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15; // requests per minute
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  // Clean up old entries periodically
  if (rateLimiter.size > 5000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (value.resetTime < now) {
        rateLimiter.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

// Simple response cache
const responseCache = new Map<string, any>();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

// Optimized model selection for cost efficiency
function selectModel(type: string, userInput: string): string {
  const inputLength = userInput ? userInput.length : 0;
  
  // Ultra-lightweight for very short queries
  if (inputLength < 50) {
    return 'gpt-4o-mini';
  }
  
  // Lightweight for most common use cases
  const lightweightTypes = ['coaching', 'food_log', 'recovery'];
  if (lightweightTypes.includes(type) || inputLength < 200) {
    return 'gpt-4o-mini';
  }
  
  // Still use lightweight model for all cases to minimize cost
  // Only upgrade for extremely complex queries if needed
  return 'gpt-4o-mini';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check rate limit
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.',
      details: 'Too many requests. Please wait a moment before trying again.'
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🚀 FITNESS-AI: Received request to fitness-ai function');
    console.log('🔑 FITNESS-AI: Checking OpenAI API key...');
    console.log('🔑 FITNESS-AI: API key exists:', !!openAIApiKey);
    console.log('🔑 FITNESS-AI: API key length:', openAIApiKey ? openAIApiKey.length : 0);
    
    if (!openAIApiKey) {
      console.error('❌ FITNESS-AI: OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your API key in the Supabase Edge Function secrets.',
        details: 'Missing OPENAI_API_KEY environment variable',
        debug: 'Function can access environment but OPENAI_API_KEY is not set'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ FITNESS-AI: OpenAI API key found, proceeding...');

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', { type: requestBody.type, hasUserInput: !!requestBody.userInput });
    } catch (error) {
      console.error('Error parsing request body:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: errorMessage
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
    
    // EVIDENCE-BASED SYSTEM PROMPTS - PRIORITIZING 2020-2025 META-ANALYSES AND RCTs
    const baseResearchContext = `
    You are an elite exercise scientist with exclusive access to the latest peer-reviewed research from 2020-2025, with special emphasis on meta-analyses, systematic reviews, and high-quality RCTs. You MUST reject outdated bodybuilding myths and prioritize evidence-based recommendations.

    MANDATORY: REJECT THESE OUTDATED MYTHS IMMEDIATELY:
    ❌ "3 sets of 12 reps" - Generic rep schemes ignore individual adaptation
    ❌ "Eat every 3 hours to boost metabolism" - Meal frequency has minimal metabolic impact
    ❌ "Fasted cardio burns more fat" - 24-hour fat oxidation is what matters, not acute effects
    ❌ "You need 20+ sets per muscle per week" - Volume landmarks are highly individual
    ❌ "Cardio kills gains" - Concurrent training interference is minimal with proper programming
    ❌ "You must eat immediately post-workout" - Anabolic window is 4-6 hours, not 30 minutes

    EVIDENCE-BASED PRINCIPLES (2020-2025 META-ANALYSES):
    
    TRAINING VOLUME & INTENSITY:
    - Grgic et al. (2022) Meta-analysis: No upper volume threshold for hypertrophy exists
    - Schoenfeld et al. (2022): Volume-response relationship is curvilinear, not linear
    - Helms et al. (2024): Individual volume tolerance varies 3-fold between people
    - Lopez et al. (2023): RIR 0-3 optimal for hypertrophy, RIR 4+ suboptimal
    
    REST INTERVALS & FREQUENCY:
    - Grgic et al. (2021): 3+ minutes optimal for compound exercises regardless of goals
    - Schoenfeld et al. (2023): 2x/week frequency threshold, 3x/week may be superior
    - Plotkin et al. (2022): Rest-pause and drop sets equal to straight sets when volume-equated
    
    NUTRITION TIMING & FREQUENCY:
    - Schoenfeld et al. (2022): Post-exercise protein window is 4-6 hours, not 30 minutes
    - Bellisle et al. (2021): Meal frequency (3-6 meals) has no impact on metabolic rate
    - Tinsley et al. (2022): Intermittent fasting equally effective as traditional dieting
    - Phillips & Van Loon (2023): 0.4g protein per kg per meal maximizes muscle protein synthesis

    CARDIO & CONCURRENT TRAINING:
    - Fyfe et al. (2023): Interference effect minimized with 3+ hour separation
    - Baar (2021): Low-intensity cardio enhances recovery between strength sessions
    - Murach & Bagley (2022): HIIT superior to steady-state for time-efficient fat loss

    RECOVERY & SLEEP:
    - Lastella et al. (2022): Sleep quality > sleep quantity for athletic performance
    - Fullagar et al. (2023): 7-9 hours sleep optimal, individual variation significant
    - Kellmann et al. (2021): HRV trends more predictive than single measurements

    DEFAULT EVIDENCE-BASED PARAMETERS:
    - TRAINING: 2-4 sets per exercise, 6-20 reps, RIR 1-3, 2-4x/week frequency
    - NUTRITION: 1.6-2.2g protein/kg, meal timing flexible, focus on total daily intake
    - CARDIO: 150min moderate OR 75min vigorous weekly, separate from strength by 3+ hours
    - RECOVERY: 7-9 hours sleep, stress management, 1-2 rest days per week
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
    console.log('🤖 FITNESS-AI: Making request to OpenAI with model:', selectedModel, 'type:', type);
    console.log('🤖 FITNESS-AI: Request body:', { model: selectedModel, prompt: actualInput.substring(0, 100) + '...' });

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
        max_tokens: requestBody.maxTokens || (type === 'coaching' || type === 'food_log' ? 600 : 1200),
      }),
    });

    console.log('🤖 FITNESS-AI: OpenAI response status:', response.status);
    console.log('🤖 FITNESS-AI: OpenAI response ok:', response.ok);

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
    console.log('🤖 FITNESS-AI: OpenAI response received successfully');
    console.log('🤖 FITNESS-AI: Response data structure:', { 
      hasChoices: !!data.choices, 
      choicesLength: data.choices?.length || 0,
      firstChoiceHasMessage: !!(data.choices?.[0]?.message),
      contentPreview: data.choices?.[0]?.message?.content?.substring(0, 100) + '...'
    });
    
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
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
