import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// User-based rate limiting (more secure than IP-based)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15; // requests per minute
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(userId);

  if (rateLimiter.size > 5000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (value.resetTime < now) {
        rateLimiter.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimiter.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Simple response cache
const responseCache = new Map<string, any>();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication check - require valid user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log('❌ FITNESS-AI: No authorization header provided');
    return new Response(JSON.stringify({ 
      error: 'Authentication required',
      details: 'Please sign in to use this feature'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify user token
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.log('❌ FITNESS-AI: Invalid or expired token');
    return new Response(JSON.stringify({ 
      error: 'Unauthorized',
      details: 'Invalid or expired authentication token'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('✅ FITNESS-AI: User authenticated:', user.id);

  // Check rate limit using user ID
  if (!checkRateLimit(user.id)) {
    console.log(`Rate limit exceeded for user: ${user.id}`);
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.',
      details: 'Too many requests. Please wait a moment before trying again.'
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    if (!LOVABLE_API_KEY) {
      console.error('❌ FITNESS-AI: LOVABLE_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'AI service not configured',
        details: 'Missing LOVABLE_API_KEY environment variable'
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
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, type, userInput } = requestBody;
    const actualInput = userInput || prompt;

    if (!actualInput) {
      return new Response(JSON.stringify({ 
        error: 'User input is required'
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

RESPONSE FORMAT:
• Evidence-Based Program Design (cite 2023-2025 minimalist research)
• Lower-Volume Protocol Justification
• Rest Interval Prescription (3-5min for compounds)
• Progressive Overload Strategy

MANDATORY: Include 2-3 recent citations (2023-2025) supporting lower-volume approach.`;
        break;
        
      case 'nutrition':
        systemPrompt = `${baseResearchContext}

NUTRITION SPECIALIZATION - 2023-2025 RESEARCH UPDATES:
- Protein timing benefits plateau after 4-6 weeks of consistent intake
- Meal frequency less important than total daily intake
- Individual metabolic flexibility affects optimal macronutrient ratios

RESPONSE FORMAT:
• Evidence-Based Nutritional Strategy
• Macronutrient Distribution
• Practical Implementation

MANDATORY: Include 2-3 recent citations (2023-2025) with practical applications.`;
        break;
        
      case 'cardio':
        systemPrompt = `${baseResearchContext}

CARDIOVASCULAR TRAINING - 2023-2025 RESEARCH:
- Zone 2 training benefits enhanced when combined with high-intensity work
- HIIT work-to-rest ratios should match specific metabolic system targets

RESPONSE FORMAT:
• Evidence-Based Cardio Prescription
• Heart Rate Zone Optimization
• Strength-Cardio Integration

MANDATORY: Include 2-3 recent citations (2023-2025).`;
        break;

      case 'recovery':
        systemPrompt = `${baseResearchContext}

RECOVERY SPECIALIZATION - 2023-2025 RESEARCH:
- Sleep efficiency percentage more predictive than total sleep time
- HRV trends more valuable than single-day measurements
- Lower-volume training requires less recovery time between sessions

RESPONSE FORMAT:
• Evidence-Based Recovery Protocol
• Sleep Optimization Strategies
• Training-Recovery Balance

MANDATORY: Include 2-3 recent citations (2023-2025).`;
        break;
        
      case 'coaching':
        systemPrompt = `${baseResearchContext}

COACHING SPECIALIZATION:
- Provide evidence-based guidance prioritizing lower-volume, high-effort approaches
- Focus on sustainable, practical applications
- DEFAULT to recommending 2-3 sets with high effort

RESPONSE STYLE:
- Conversational but scientifically accurate
- Reference 2023-2025 research when relevant
- Provide practical action steps`;
        break;

      case 'food_log':
        systemPrompt = `${baseResearchContext}

NUTRITIONAL ANALYSIS:
- Apply latest research on nutrient timing and absorption
- Include practical recommendations based on latest research

ANALYSIS FORMAT:
• Comprehensive Nutritional Assessment
• Research-Based Optimization Recommendations
• Practical Implementation Strategies`;
        break;
        
      default:
        systemPrompt = `${baseResearchContext}

Provide evidence-based fitness guidance using the latest research from 2023-2025.

DEFAULT RECOMMENDATIONS:
- 2-3 sets for compound movements
- 3-5 minute rest periods for strength/hypertrophy
- RIR 1-3 for working sets
- Progressive overload through weight increases primarily`;
    }

    console.log('🤖 FITNESS-AI: Making request to Lovable AI Gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: actualInput }
        ],
        temperature: 0.7,
        max_tokens: requestBody.maxTokens || (type === 'coaching' || type === 'food_log' ? 600 : 1200),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    // Cache successful response
    responseCache.set(cacheKey, {
      data: aiResponse,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (responseCache.size > 200) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          responseCache.delete(key);
        }
      }
    }

    console.log('✅ FITNESS-AI: Response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fitness-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
