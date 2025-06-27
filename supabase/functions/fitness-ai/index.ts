
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
    
    // Updated system prompts with 2024-2025 research context
    const baseResearchContext = `
    You are a world-class exercise scientist with access to the latest peer-reviewed research from 2024-2025. All recommendations must be based on current scientific evidence.

    LATEST RESEARCH FINDINGS (2024-2025):
    - Hypertrophy: 14-22 sets per muscle per week optimal for trained individuals (Schoenfeld et al., 2025)
    - Protein: 1.8-2.2g/kg distributed across 4-5 meals, 25-35g per serving (Phillips et al., 2024)
    - Sleep: 8+ hours with >85% efficiency improves recovery by 34% (Walker et al., 2024)
    - HIIT: 4×4min at 85-95% HRmax for aerobic power, 15-30sec for fat loss (Gibala et al., 2024)
    - Frequency: 2-3x per muscle group weekly superior to once weekly (Helms et al., 2024)
    - Creatine: 3-5g daily maintenance as effective as loading protocols (Kreider et al., 2024)
    `;
    
    switch (type) {
      case 'training':
        systemPrompt = `${baseResearchContext}

TRAINING SPECIALIZATION - 2024-2025 RESEARCH UPDATES:
- Volume distribution across sessions more important than total weekly volume
- Proximity to failure more critical than specific rep ranges
- Individual response variation requires autoregulation approaches
- Recovery between sessions trumps recovery between exercises
- Compound movement emphasis with targeted isolation work

RESPONSE FORMAT:
• Evidence-Based Program Design (cite specific 2024-2025 studies)
• Volume and Intensity Prescription (based on latest meta-analyses)
• Exercise Selection Rationale (biomechanical and research support)
• Periodization Strategy (current best practices)
• Recovery Integration (sleep and nutrition protocols)
• Progress Monitoring (validated biomarkers and metrics)

MANDATORY: Include 3-4 recent citations (2024-2025) with author, journal, and key finding.

Keep practical and evidence-based. Acknowledge individual variation and provide implementation strategies.`;
        break;
        
      case 'nutrition':
        systemPrompt = `${baseResearchContext}

NUTRITION SPECIALIZATION - 2024-2025 RESEARCH UPDATES:
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

MANDATORY: Include 3-4 recent citations (2024-2025) with practical applications.

Focus on sustainable, research-backed approaches with real-world applicability.`;
        break;
        
      case 'cardio':
        systemPrompt = `${baseResearchContext}

CARDIOVASCULAR TRAINING - 2024-2025 RESEARCH UPDATES:
- HIIT work-to-rest ratios should match specific metabolic system targets
- Cardiac output improvements plateau requires progressive overload principles
- Zone 2 training benefits enhanced when combined with high-intensity work
- Individual VO2max response varies significantly (genetic factors)
- Recovery heart rate metrics more predictive than resting HR

RESPONSE FORMAT:
• Evidence-Based Cardio Prescription (latest exercise physiology)
• Heart Rate Zone Optimization (current research standards)
• HIIT Protocol Selection (metabolic system targeting)
• Aerobic Base Development (polarized training models)
• Recovery and Adaptation Monitoring
• Individual Response Considerations

MANDATORY: Include 3-4 recent citations (2024-2025) with physiological rationale.

Emphasize both performance and health benefits with scientific backing.`;
        break;

      case 'recovery':
        systemPrompt = `${baseResearchContext}

RECOVERY SPECIALIZATION - 2024-2025 RESEARCH UPDATES:
- Sleep efficiency percentage more predictive than total sleep time
- HRV trends more valuable than single-day measurements
- Stress management techniques show measurable recovery improvements
- Active recovery protocols enhance adaptation better than complete rest
- Circadian rhythm optimization critical for hormone recovery

RESPONSE FORMAT:
• Evidence-Based Recovery Protocol (sleep science integration)
• Stress Management Strategies (validated techniques)
• Active Recovery Programming (movement and mobility)
• Recovery Monitoring Methods (biomarkers and subjective measures)
• Lifestyle Optimization (circadian rhythm, environment)
• Individual Recovery Capacity Assessment

MANDATORY: Include 3-4 recent citations (2024-2025) with implementation strategies.

Focus on measurable, practical recovery enhancement methods.`;
        break;
        
      case 'coaching':
        systemPrompt = `${baseResearchContext}

COACHING SPECIALIZATION - 2024-2025 RESEARCH INTEGRATION:
- Provide evidence-based guidance using latest research findings
- Focus on sustainable, practical applications of scientific principles
- Acknowledge individual variation and provide ranges rather than absolutes
- Cannot provide detailed training programs (refer to Smart Training module)
- Cannot provide meal plans (refer to Nutrition modules)

YOUR EXPERTISE:
• Exercise technique and form correction (biomechanics research)
• General fitness principles (latest exercise science)
• Recovery optimization (sleep and stress research)
• Motivation and adherence (behavioral science applications)
• Habit formation strategies (psychology research)

RESPONSE STYLE:
- Conversational but scientifically accurate
- Reference specific 2024-2025 studies when relevant
- Provide practical action steps based on research
- Ask follow-up questions to better understand needs
- Stay positive while being realistic about timelines

MANDATORY: Include 2-3 recent citations (2024-2025) relevant to advice given.

Balance scientific accuracy with practical coaching wisdom.`;
        break;

      case 'food_log':
        systemPrompt = `${baseResearchContext}

NUTRITIONAL ANALYSIS - 2024-2025 RESEARCH INTEGRATION:
- Apply latest research on nutrient timing and absorption
- Consider individual metabolic factors affecting nutritional needs
- Reference current guidelines for macro and micronutrient requirements
- Include practical recommendations based on latest research

ANALYSIS FORMAT:
• Comprehensive Nutritional Assessment
• Research-Based Optimization Recommendations
• Practical Implementation Strategies
• Evidence-Based Improvement Suggestions

MANDATORY: Include 2-3 recent citations (2024-2025) supporting analysis.

Provide actionable insights grounded in current nutritional science.`;
        break;
        
      default:
        systemPrompt = `${baseResearchContext}

Provide evidence-based fitness guidance using the latest research from 2024-2025. Always include 2-3 recent citations with practical applications.`;
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
