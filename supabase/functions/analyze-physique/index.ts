// Physique AI Edge Function v2.1.0
// Systematic scan methodology with structured tool-calling and retry logic

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_VERSION = '2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Structured error response helper
function errorResponse(
  status: number,
  error: string,
  errorCode: string,
  retryable: boolean,
  upstreamStatus?: number
) {
  console.log(`[PHYSIQUE-AI] Error response: ${status} ${errorCode} - ${error}`);
  return new Response(JSON.stringify({ 
    error, 
    error_code: errorCode, 
    retryable,
    upstream_status: upstreamStatus,
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Retry helper with exponential backoff + jitter
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2,
  baseDelayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PHYSIQUE-AI] API attempt ${attempt + 1}/${maxRetries + 1}`);
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx) except 429
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      // Retry on 429 (rate limit) or 5xx (server errors)
      if (response.status === 429 || response.status >= 500) {
        const errorText = await response.text();
        console.warn(`[PHYSIQUE-AI] Retryable error ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
          console.log(`[PHYSIQUE-AI] Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return response;
      }
      
      return response;
    } catch (err) {
      console.error(`[PHYSIQUE-AI] Network error on attempt ${attempt + 1}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.log(`[PHYSIQUE-AI] Waiting ${Math.round(delay)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Tool definition for structured physique analysis
const physiqueAnalysisTool = {
  type: "function",
  function: {
    name: "analyze_physique",
    description: "Provide detailed physique analysis with scores and recommendations",
    parameters: {
      type: "object",
      properties: {
        overall_score: {
          type: "number",
          description: "Overall physique score from 0-100"
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence in the analysis based on image quality"
        },
        notes: {
          type: "string",
          description: "Notes about image quality or analysis limitations"
        },
        attributes: {
          type: "object",
          properties: {
            muscle_development: { type: "number", description: "Score 0-100 for overall muscle development" },
            symmetry: { type: "number", description: "Score 0-100 for left-right muscle symmetry" },
            definition: { type: "number", description: "Score 0-100 for muscle separation and striations" },
            mass: { type: "number", description: "Score 0-100 for overall muscle size" },
            conditioning: { type: "number", description: "Score 0-100 for body fat level and vascularity" }
          },
          required: ["muscle_development", "symmetry", "definition", "mass", "conditioning"]
        },
        muscle_groups: {
          type: "object",
          properties: {
            chest: { type: "number", description: "Score 0-100" },
            shoulders: { type: "number", description: "Score 0-100" },
            arms: { type: "number", description: "Score 0-100" },
            back: { type: "number", description: "Score 0-100" },
            core: { type: "number", description: "Score 0-100" },
            legs: { type: "number", description: "Score 0-100" }
          },
          required: ["chest", "shoulders", "arms", "back", "core", "legs"]
        },
        recommendations: {
          type: "array",
          items: { type: "string" },
          description: "3-5 specific, actionable training recommendations"
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "2-3 notable strengths in the physique"
        },
        areas_to_improve: {
          type: "array",
          items: { type: "string" },
          description: "2-3 areas that need the most work"
        }
      },
      required: ["overall_score", "confidence", "attributes", "muscle_groups", "recommendations", "strengths", "areas_to_improve"],
      additionalProperties: false
    }
  }
};

Deno.serve(async (req) => {
  console.log('[PHYSIQUE-AI] start', { method: req.method, version: FUNCTION_VERSION });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body
    let body: Record<string, any> = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, 'Invalid request body', 'INVALID_BODY', false);
    }

    const { action } = body;

    // Health check endpoint (no auth required)
    if (action === 'health') {
      return new Response(JSON.stringify({
        ok: true,
        function: 'analyze-physique',
        version: FUNCTION_VERSION,
        ts: Date.now(),
        hasApiKey: !!LOVABLE_API_KEY,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(401, 'Authentication required', 'AUTH_REQUIRED', false);
    }

    // Validate JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const token = authHeader.slice('Bearer '.length);
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      console.error('[PHYSIQUE-AI] auth failed', claimsError);
      return errorResponse(401, 'Unauthorized', 'AUTH_INVALID', false);
    }

    const userId = claimsData.claims.sub;
    console.log('[PHYSIQUE-AI] authed', { userId });

    if (!LOVABLE_API_KEY) {
      return errorResponse(500, 'AI service not configured', 'AI_NOT_CONFIGURED', false);
    }

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check user role (premium only)
    const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: userId });
    const tier = roleData || 'free';
    console.log(`[PHYSIQUE-AI] User role: ${tier}`);

    if (tier === 'free') {
      return errorResponse(403, 'Upgrade to premium to unlock physique analysis', 'PREMIUM_REQUIRED', false);
    }

    // Check for unlimited_usage role (test users bypass weekly limit)
    const { data: unlimitedRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'unlimited_usage')
      .maybeSingle();
    
    const hasUnlimitedUsage = !!unlimitedRole;
    console.log(`[PHYSIQUE-AI] Unlimited usage: ${hasUnlimitedUsage}`);

    // Check weekly limit (skip for unlimited_usage users)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from('user_usage')
      .select('physique_analyses, last_physique_analysis')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .maybeSingle();

    if (!hasUnlimitedUsage && usage?.last_physique_analysis) {
      const lastAnalysis = new Date(usage.last_physique_analysis);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (lastAnalysis > weekAgo) {
        const daysUntilNext = Math.ceil((7 - (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60 * 24)));
        return errorResponse(429, `You can analyze your physique once per week. Try again in ${daysUntilNext} day(s).`, 'WEEKLY_LIMIT', false);
      }
    }

    // Get image from request
    const { imageUrl, image, height, weight, bodyFat, goals } = body;
    const imageData = image || imageUrl;

    if (!imageData) {
      return errorResponse(400, 'Image is required', 'NO_IMAGE', false);
    }

    // Validate image size if base64
    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      const MAX_BASE64_SIZE = 2.0 * 1024 * 1024; // 2MB for physique photos (need detail)
      if (imageData.length > MAX_BASE64_SIZE) {
        return errorResponse(413, 'Image too large. Please use a smaller image.', 'PAYLOAD_TOO_LARGE', false);
      }
    }

    console.log('[PHYSIQUE-AI] Starting analysis...');

    // Systematic scan methodology with FridgeScan-style structure
    const analyzePrompt = `You are an expert exercise physiologist and bodybuilding judge providing evidence-based physique analysis.

=== SYSTEMATIC SCAN METHOD ===
Analyze the physique in this EXACT order, top to bottom:
1. Start at HEAD: Facial structure, neck thickness, trap insertion
2. Move to SHOULDERS: Cap development, width, front/side/rear deltoid balance
3. Scan ARMS: Bicep peak, tricep horseshoe, forearm development, arm-to-shoulder ratio
4. Examine CHEST: Upper/lower balance, inner chest line, overall mass, pec-delt tie-in
5. Assess CORE: Ab visibility, oblique definition, serratus, overall midsection tightness
6. If visible, check BACK: Lat width, trap thickness, rear delt development, Christmas tree
7. Evaluate LEGS: Quad sweep and separation, hamstring tie-in, calf development
8. Final pass: OVERALL left-to-right symmetry comparison, weak points identification

=== PHASE 1: STRUCTURAL ASSESSMENT ===
Evaluate foundational aspects:
- Overall muscle mass relative to frame size
- Proportionality between upper and lower body
- Left-right symmetry and balance
- Posture and structural alignment
- Frame type tendencies (narrow/wide clavicles, hip structure)

=== PHASE 2: CONDITIONING ASSESSMENT ===
- Body fat estimation based on visible definition markers
- Vascularity level (veins visible in arms, shoulders, abs)
- Muscle separation and striations
- Skin quality, fullness, and water retention

=== USER CONTEXT ===
${height ? `Height: ${height}` : 'Height: Not provided'}
${weight ? `Weight: ${weight}` : 'Weight: Not provided'}
${bodyFat ? `Self-reported Body Fat: ${bodyFat}%` : ''}
${goals ? `Training Goals: ${goals}` : ''}

=== SCORING CALIBRATION ===
Reference points for CONSISTENT scoring:
- 95-100: Top 0.1% - IFBB Pro competitor level, genetic elite
- 85-94: Top 1% - National level competitor, exceptional development
- 75-84: Top 5% - Experienced lifter, 5+ years serious training
- 65-74: Top 15% - Intermediate, 2-4 years consistent training
- 55-64: Average gym-goer, 1-2 years training
- 45-54: Beginner, <1 year training
- Below 45: Detrained, very early stage, or significant limitations

=== CRITICAL RULES ===
- ALWAYS provide scores for ALL muscle groups - NEVER skip or say "not visible"
- When a body part is partially visible, ESTIMATE based on overall development level
- For non-visible areas (e.g., back in front pose), INFER from visible proportions
- Be SPECIFIC in recommendations: Include exercise names, rep ranges, techniques
- NEVER refuse to analyze - provide best assessment with confidence level noted
- Use "high" confidence for clear, well-lit images; "medium" for partially obscured
- Recommendations MUST be prioritized by impact on WEAKEST areas first
- Be HONEST but ENCOURAGING - identify genuine strengths alongside areas to improve
- Base body fat estimates on visible markers: ab visibility, vascularity, separation
- Scores should reflect REALISTIC assessment - avoid clustering everything at 70-75`;

    const requestBody = {
      model: 'google/gemini-2.5-pro',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analyzePrompt },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        }
      ],
      tools: [physiqueAnalysisTool],
      tool_choice: { type: "function", function: { name: "analyze_physique" } },
      max_tokens: 2500,
      temperature: 0.1
    };

    let response: Response;
    try {
      response = await fetchWithRetry(
        'https://ai.gateway.lovable.dev/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    } catch (fetchErr) {
      console.error('[PHYSIQUE-AI] Fetch failed after retries:', fetchErr);
      return errorResponse(503, 'AI gateway unreachable', 'GATEWAY_UNREACHABLE', true);
    }

    console.log('[PHYSIQUE-AI] AI gateway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PHYSIQUE-AI] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return errorResponse(429, 'Rate limit exceeded, please try again later', 'RATE_LIMITED', true, 429);
      }
      if (response.status === 402) {
        return errorResponse(402, 'AI credits exhausted', 'CREDITS_EXHAUSTED', false, 402);
      }
      if (response.status >= 500) {
        return errorResponse(503, 'AI service temporarily unavailable', 'GATEWAY_ERROR', true, response.status);
      }
      return errorResponse(500, 'AI analysis failed', 'AI_FAILED', true, response.status);
    }

    const data = await response.json();
    console.log('[PHYSIQUE-AI] AI response received');

    // Extract from tool call response
    let analysis: any = null;
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
        console.log('[PHYSIQUE-AI] Parsed from tool call successfully');
      } catch (e) {
        console.error('[PHYSIQUE-AI] Tool call parse error:', e);
      }
    }

    // Fallback: try parsing from content if tool call failed
    if (!analysis) {
      const content = data.choices?.[0]?.message?.content || '';
      console.log('[PHYSIQUE-AI] Fallback: parsing from content');
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error('[PHYSIQUE-AI] Content parse error:', e);
        }
      }
    }

    // Default fallback if parsing completely failed
    if (!analysis) {
      console.log('[PHYSIQUE-AI] Using default fallback analysis');
      analysis = {
        overall_score: 50,
        confidence: "low",
        notes: "Unable to fully analyze the image. Please try with a clearer photo.",
        attributes: {
          muscle_development: 50,
          symmetry: 50,
          definition: 50,
          mass: 50,
          conditioning: 50
        },
        muscle_groups: {
          chest: 50,
          shoulders: 50,
          arms: 50,
          back: 50,
          core: 50,
          legs: 50
        },
        recommendations: [
          "Try uploading a clearer photo with better lighting",
          "Ensure your full body is visible in the frame",
          "Use natural lighting for best results"
        ],
        strengths: ["Unable to determine from current image"],
        areas_to_improve: ["Image quality for better analysis"]
      };
    }

    // Validate and clamp scores
    const clampScore = (score: any) => Math.max(0, Math.min(100, Number(score) || 50));
    
    analysis.overall_score = clampScore(analysis.overall_score);
    if (analysis.attributes) {
      analysis.attributes.muscle_development = clampScore(analysis.attributes.muscle_development);
      analysis.attributes.symmetry = clampScore(analysis.attributes.symmetry);
      analysis.attributes.definition = clampScore(analysis.attributes.definition);
      analysis.attributes.mass = clampScore(analysis.attributes.mass);
      analysis.attributes.conditioning = clampScore(analysis.attributes.conditioning);
    }
    if (analysis.muscle_groups) {
      analysis.muscle_groups.chest = clampScore(analysis.muscle_groups.chest);
      analysis.muscle_groups.shoulders = clampScore(analysis.muscle_groups.shoulders);
      analysis.muscle_groups.arms = clampScore(analysis.muscle_groups.arms);
      analysis.muscle_groups.back = clampScore(analysis.muscle_groups.back);
      analysis.muscle_groups.core = clampScore(analysis.muscle_groups.core);
      analysis.muscle_groups.legs = clampScore(analysis.muscle_groups.legs);
    }

    // Update usage
    await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        physique_analyses: (usage?.physique_analyses || 0) + 1,
        last_physique_analysis: new Date().toISOString()
      }, {
        onConflict: 'user_id,month_year'
      });

    console.log('[PHYSIQUE-AI] Analysis completed successfully');

    return new Response(
      JSON.stringify({
        analysis: {
          ...analysis,
          analysis_date: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[PHYSIQUE-AI] Unexpected error:', error instanceof Error ? error.message : error);
    return errorResponse(500, 'Physique analysis failed. Please try again.', 'UNEXPECTED_ERROR', true);
  }
});
