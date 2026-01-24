// Food Photo AI Edge Function v2.0.0
// Two-phase analysis with structured tool-calling and retry logic

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_VERSION = '2.0.0';

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
  console.log(`[FOOD-PHOTO-AI] Error response: ${status} ${errorCode} - ${error}`);
  return new Response(JSON.stringify({ 
    error, 
    error_code: errorCode, 
    retryable,
    upstream_status: upstreamStatus,
    confidence: 'low',
    foodsDetected: []
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
      console.log(`[FOOD-PHOTO-AI] API attempt ${attempt + 1}/${maxRetries + 1}`);
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx) except 429
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      // Retry on 429 (rate limit) or 5xx (server errors)
      if (response.status === 429 || response.status >= 500) {
        const errorText = await response.text();
        console.warn(`[FOOD-PHOTO-AI] Retryable error ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
          console.log(`[FOOD-PHOTO-AI] Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return response;
      }
      
      return response;
    } catch (err) {
      console.error(`[FOOD-PHOTO-AI] Network error on attempt ${attempt + 1}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.log(`[FOOD-PHOTO-AI] Waiting ${Math.round(delay)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Tool definition for structured food analysis
const foodAnalysisTool = {
  type: "function",
  function: {
    name: "analyze_food",
    description: "Analyze food items in a photo and provide nutritional estimates",
    parameters: {
      type: "object",
      properties: {
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Overall confidence in the analysis"
        },
        notes: {
          type: "string",
          description: "Notes about image quality or analysis limitations"
        },
        foodsDetected: {
          type: "array",
          description: "List of detected food items with nutritional info",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Clear, specific food name" },
              quantity: { type: "string", description: "Portion estimate with units" },
              calories: { type: "number", description: "Estimated calories" },
              protein: { type: "number", description: "Grams of protein" },
              carbs: { type: "number", description: "Grams of carbohydrates" },
              fat: { type: "number", description: "Grams of fat" },
              fiber: { type: "number", description: "Grams of fiber" },
              confidence: { 
                type: "string", 
                enum: ["high", "medium", "low"],
                description: "Confidence for this specific item"
              }
            },
            required: ["name", "quantity", "calories", "protein", "carbs", "fat", "confidence"],
            additionalProperties: false
          }
        },
        totalNutrition: {
          type: "object",
          properties: {
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            fiber: { type: "number" }
          },
          required: ["calories", "protein", "carbs", "fat"],
          description: "Total nutritional values for all detected foods"
        },
        recommendations: {
          type: "string",
          description: "Brief nutrition insight or suggestion"
        }
      },
      required: ["confidence", "foodsDetected", "totalNutrition"],
      additionalProperties: false
    }
  }
};

Deno.serve(async (req) => {
  console.log('[FOOD-PHOTO-AI] start', { method: req.method, version: FUNCTION_VERSION });

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
        function: 'food-photo-ai',
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
      console.error('[FOOD-PHOTO-AI] auth failed', claimsError);
      return errorResponse(401, 'Unauthorized', 'AUTH_INVALID', false);
    }

    const userId = claimsData.claims.sub;
    console.log('[FOOD-PHOTO-AI] authed', { userId });

    if (!LOVABLE_API_KEY) {
      return errorResponse(500, 'AI service not configured', 'AI_NOT_CONFIGURED', false);
    }

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check user role (premium only)
    const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: userId });
    const tier = roleData || 'free';
    console.log(`[FOOD-PHOTO-AI] User role: ${tier}`);

    if (tier === 'free') {
      return errorResponse(403, 'Photo analysis is a Premium feature. Upgrade to unlock.', 'PREMIUM_REQUIRED', false);
    }

    // Check monthly limit
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from('user_usage')
      .select('food_photo_analyses')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .maybeSingle();

    const currentUsage = usage?.food_photo_analyses || 0;
    const MONTHLY_LIMIT = 30;

    if (currentUsage >= MONTHLY_LIMIT) {
      return errorResponse(429, `You've reached your monthly limit of ${MONTHLY_LIMIT} photo analyses.`, 'MONTHLY_LIMIT', false);
    }

    // Get image from request
    const { image, mealType, additionalNotes } = body;

    if (!image) {
      return errorResponse(400, 'No image provided', 'NO_IMAGE', false);
    }

    // Validate image format
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return errorResponse(400, 'Invalid image format (must be base64 data:image/*)', 'INVALID_IMAGE_FORMAT', false);
    }

    // Size limit
    const MAX_BASE64_SIZE = 1.8 * 1024 * 1024;
    if (image.length > MAX_BASE64_SIZE) {
      return errorResponse(413, 'Image too large. Please compress or use a smaller image.', 'PAYLOAD_TOO_LARGE', false);
    }

    console.log('[FOOD-PHOTO-AI] Starting analysis...', { imageSizeKB: Math.round(image.length / 1024) });

    // Two-phase food analysis prompt
    const analyzePrompt = `You are an expert nutritionist AI analyzing a food photo. Use a TWO-PHASE approach for accurate identification and nutrition estimation.

=== PHASE 1: FOOD IDENTIFICATION ===
Systematically identify ALL food items visible:

TEXT/LABELS:
- Read any visible packaging, restaurant menus, or labels
- Note brand names that help identify specific products
- Check for nutrition labels if visible

VISUAL IDENTIFICATION:
- Identify each distinct food item on the plate/in the image
- Note cooking method (grilled, fried, steamed, raw)
- Estimate portion sizes using visual cues (plate size, utensils for scale)

=== PHASE 2: NUTRITIONAL ANALYSIS ===
For each identified food:

PORTION ESTIMATION:
- Use standard serving sizes as reference
- Consider plate size (typical dinner plate ~10 inches)
- Use any visible utensils for scale comparison
- When uncertain, use CONSERVATIVE estimates

NUTRITION CALCULATION:
- Use USDA database values as baseline
- Adjust for cooking method (fried adds fat, grilled is leaner)
- Account for visible sauces, dressings, oils
- Round to reasonable precision (whole numbers for calories, 1 decimal for macros)

=== MEAL CONTEXT ===
${mealType ? `Meal Type: ${mealType}` : ''}
${additionalNotes ? `User Notes: ${additionalNotes}` : ''}

=== ESTIMATION GUIDELINES ===
Standard reference portions:
- 1 cup cooked rice = 200 cal, 4g protein, 45g carbs
- 1 cup cooked pasta = 220 cal, 8g protein, 43g carbs
- 4 oz chicken breast = 185 cal, 35g protein, 0g carbs, 4g fat
- 4 oz steak = 250 cal, 26g protein, 0g carbs, 16g fat
- 1 cup vegetables = 25-50 cal
- 1 tbsp oil/butter = 120 cal, 14g fat
- 1 medium egg = 70 cal, 6g protein, 5g fat

=== CRITICAL RULES ===
- ALWAYS identify foods - never refuse to analyze
- Be SPECIFIC: "Grilled Chicken Breast" not "Chicken"
- Include ALL visible items including sauces, drinks, sides
- When uncertain, provide best estimate with "medium" or "low" confidence
- Total all items to provide combined nutrition
- Use "high" confidence only when food is clearly identifiable`;

    const requestBody = {
      model: 'google/gemini-2.5-pro',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analyzePrompt },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      tools: [foodAnalysisTool],
      tool_choice: { type: "function", function: { name: "analyze_food" } },
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
      console.error('[FOOD-PHOTO-AI] Fetch failed after retries:', fetchErr);
      return errorResponse(503, 'AI gateway unreachable', 'GATEWAY_UNREACHABLE', true);
    }

    console.log('[FOOD-PHOTO-AI] AI gateway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FOOD-PHOTO-AI] AI gateway error:', response.status, errorText);
      
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
    console.log('[FOOD-PHOTO-AI] AI response received');

    // Extract from tool call response
    let analysis: any = null;
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
        console.log('[FOOD-PHOTO-AI] Parsed from tool call:', analysis.foodsDetected?.length, 'items');
      } catch (e) {
        console.error('[FOOD-PHOTO-AI] Tool call parse error:', e);
      }
    }

    // Fallback: try parsing from content if tool call failed
    if (!analysis) {
      const content = data.choices?.[0]?.message?.content || '';
      console.log('[FOOD-PHOTO-AI] Fallback: parsing from content');
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error('[FOOD-PHOTO-AI] Content parse error:', e);
        }
      }
    }

    // Default fallback if parsing completely failed
    if (!analysis) {
      console.log('[FOOD-PHOTO-AI] Using default fallback analysis');
      analysis = {
        confidence: 'low',
        notes: 'Unable to fully analyze the image. Please try with a clearer photo.',
        foodsDetected: [{
          name: 'Unidentified food',
          quantity: '1 serving',
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 10,
          fiber: 2,
          confidence: 'low'
        }],
        totalNutrition: {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 10,
          fiber: 2
        }
      };
    }

    // Ensure required fields exist
    if (!analysis.confidence) analysis.confidence = 'medium';
    if (!Array.isArray(analysis.foodsDetected)) analysis.foodsDetected = [];
    
    // Validate and sanitize food items
    analysis.foodsDetected = analysis.foodsDetected.map((food: any) => ({
      name: food.name || 'Unknown food',
      quantity: food.quantity || '1 serving',
      calories: Math.round(Number(food.calories) || 100),
      protein: Math.round((Number(food.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(food.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(food.fat) || 0) * 10) / 10,
      fiber: Math.round((Number(food.fiber) || 0) * 10) / 10,
      confidence: food.confidence || 'medium'
    }));

    // Calculate totals if not provided
    if (!analysis.totalNutrition || typeof analysis.totalNutrition.calories !== 'number') {
      analysis.totalNutrition = {
        calories: analysis.foodsDetected.reduce((sum: number, f: any) => sum + (f.calories || 0), 0),
        protein: analysis.foodsDetected.reduce((sum: number, f: any) => sum + (f.protein || 0), 0),
        carbs: analysis.foodsDetected.reduce((sum: number, f: any) => sum + (f.carbs || 0), 0),
        fat: analysis.foodsDetected.reduce((sum: number, f: any) => sum + (f.fat || 0), 0),
        fiber: analysis.foodsDetected.reduce((sum: number, f: any) => sum + (f.fiber || 0), 0)
      };
    }

    // Update usage
    await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        food_photo_analyses: currentUsage + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month_year'
      });

    console.log(`[FOOD-PHOTO-AI] Analysis completed. Usage: ${currentUsage + 1}/${MONTHLY_LIMIT}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FOOD-PHOTO-AI] Unexpected error:', error instanceof Error ? error.message : error);
    return errorResponse(500, 'Food analysis failed. Please try again.', 'UNEXPECTED_ERROR', true);
  }
});
