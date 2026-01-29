// Food Photo AI Edge Function v2.2.0
// Systematic scan methodology with structured tool-calling, retry logic, and proper error handling

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_VERSION = '2.2.0';

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
              quantity: { type: "string", description: "Portion estimate with units (include grams, e.g., '150g' or '1 cup (240g)')" },
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

    // Systematic scan methodology with FridgeScan-style structure
    const analyzePrompt = `You are an expert nutritionist AI analyzing a food photo. Use SYSTEMATIC SCANNING for complete, accurate identification.

=== SYSTEMATIC SCAN METHOD ===
Analyze the image in this EXACT order:
1. Start at PLATE CENTER: Identify main protein/carb items first
2. Scan CLOCKWISE around plate: sides, vegetables, garnishes
3. Check PLATE EDGES: sauces, dressings, butter, condiments
4. Look for DRINKS: glasses, cups, bottles, cans near the plate
5. Identify SIDES: bread basket, salad bowl, soup in separate containers
6. Check UTENSILS for scale reference (fork ~7 inches, spoon ~6 inches)
7. Read any VISIBLE TEXT: restaurant menus, packaging, receipts, labels
8. Final pass: TALLY all items against what was already detected - ensure nothing missed

=== PHASE 1: FOOD IDENTIFICATION ===
For each item found:

TEXT/LABELS (highest priority):
- Read any visible packaging or restaurant menu items
- Note brand names that identify specific products (e.g., "Chipotle burrito bowl")
- Check nutrition labels if visible

VISUAL IDENTIFICATION:
- Identify SPECIFIC food name: "Grilled Salmon Fillet" not "Fish"
- Note cooking method: grilled, fried, steamed, raw, baked, sautéed
- Note preparation: skinless, bone-in, with sauce, plain

=== CONFIDENCE CALIBRATION ===
- HIGH: Food clearly visible + packaging/label readable OR very distinctive (e.g., pizza slice, sunny-side egg)
- MEDIUM: Food identifiable by appearance but no label/text confirmation
- LOW: Partially obscured, mixed dishes, or sauces where composition is uncertain

=== PORTION SIZE REFERENCES ===
Visual estimation guides:
- 1 fist = ~1 cup cooked grains/pasta (~240g)
- 1 palm (thickness and size) = ~4 oz protein (~113g chicken, fish, steak)
- 1 thumb = ~1 tbsp (butter, oil, nut butter) (~15g)
- 1 cupped hand = ~1 oz nuts/chips (~28g)
- Standard dinner plate = ~10 inches diameter
- Restaurant plate = often 12-14 inches (portions 20-30% larger)
- Salad bowl = typically 2-3 cups

IMPORTANT: Always include grams in the quantity field, e.g., "150g", "1 cup (240g)", "4 oz (113g)"

Common restaurant portion inflation:
- Restaurant steak: Usually 8-12 oz (double home portion)
- Restaurant pasta: Usually 2-3 cups (3× home portion)
- Restaurant rice: Usually 1.5-2 cups
- Dressings/sauces: Often 3-4 tbsp vs standard 2 tbsp

=== NUTRITION REFERENCES ===
Standard per-serving values:
- 1 cup cooked white rice (200g) = 205 cal, 4g P, 45g C, 0g F
- 1 cup cooked pasta (200g) = 220 cal, 8g P, 43g C, 1g F
- 4 oz chicken breast grilled (113g) = 185 cal, 35g P, 0g C, 4g F
- 4 oz salmon grilled (113g) = 233 cal, 25g P, 0g C, 14g F
- 4 oz ribeye steak (113g) = 310 cal, 24g P, 0g C, 23g F
- 1 cup steamed broccoli (150g) = 55 cal, 4g P, 11g C, 0g F
- 1 cup mixed salad greens (50g) = 10 cal, 1g P, 2g C, 0g F
- 2 tbsp ranch dressing (30g) = 145 cal, 0g P, 2g C, 15g F
- 2 tbsp olive oil (28g) = 240 cal, 0g P, 0g C, 28g F
- 1 medium egg (50g) = 72 cal, 6g P, 0g C, 5g F
- 1 slice bread (30g) = 80 cal, 3g P, 15g C, 1g F

=== MEAL CONTEXT ===
${mealType ? `Meal Type: ${mealType}` : ''}
${additionalNotes ? `User Notes: ${additionalNotes}` : ''}

=== CRITICAL RULES ===
- ALWAYS identify foods - NEVER refuse or say "unable to determine"
- Be SPECIFIC: "Grilled Salmon Fillet" not "Fish", "Jasmine Rice" not "Rice"
- Include ALL visible items: main dish + sides + drinks + sauces + garnishes
- QUANTIFY everything with GRAMS: "150g", "1 cup (240g)", never just "some"
- When uncertain, provide CONSERVATIVE calorie estimate with "medium" confidence
- Sauces/dressings: Default to 2 tbsp (30g) unless clearly more/less visible
- Fried foods: Add 50-100 cal for oil absorption vs grilled equivalent
- DO NOT round to convenient numbers - be precise (e.g., 347 cal, not 350)
- Restaurants typically serve 1.5-2× standard portions - adjust accordingly
- ALWAYS provide totalNutrition as sum of all detected items`;

    // Try with primary model first
    const models = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash'];
    let response: Response | null = null;
    let lastModelError: string | null = null;

    for (const model of models) {
      console.log(`[FOOD-PHOTO-AI] Trying model: ${model}`);
      
      const requestBody = {
        model,
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

        if (response.ok) {
          console.log(`[FOOD-PHOTO-AI] Success with model: ${model}`);
          break;
        } else {
          lastModelError = await response.text();
          console.warn(`[FOOD-PHOTO-AI] Model ${model} failed:`, response.status, lastModelError);
          response = null; // Reset to try next model
        }
      } catch (fetchErr) {
        console.error(`[FOOD-PHOTO-AI] Fetch failed for ${model}:`, fetchErr);
        lastModelError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      }
    }

    if (!response) {
      console.error('[FOOD-PHOTO-AI] All models failed:', lastModelError);
      return errorResponse(503, 'AI gateway unreachable. Please try again.', 'GATEWAY_UNREACHABLE', true);
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
    
    // Debug: log response structure
    const finishReason = data.choices?.[0]?.finish_reason;
    console.log('[FOOD-PHOTO-AI] Response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasToolCalls: !!data.choices?.[0]?.message?.tool_calls,
      toolCallsLength: data.choices?.[0]?.message?.tool_calls?.length,
      hasContent: !!data.choices?.[0]?.message?.content,
      contentLength: data.choices?.[0]?.message?.content?.length,
      finishReason
    });

    // CRITICAL: Check for AI error in finish_reason
    if (finishReason === 'error') {
      console.error('[FOOD-PHOTO-AI] AI returned error finish_reason');
      return errorResponse(
        422, 
        'Could not analyze this image. Try a clearer photo or add foods manually.', 
        'ANALYSIS_FAILED', 
        true
      );
    }

    // Extract from tool call response
    let analysis: any = null;
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
        console.log('[FOOD-PHOTO-AI] Parsed from tool call:', analysis.foodsDetected?.length, 'items');
      } catch (e) {
        console.error('[FOOD-PHOTO-AI] Tool call parse error:', e);
        console.error('[FOOD-PHOTO-AI] Tool call raw:', toolCall.function.arguments?.substring(0, 500));
      }
    } else {
      console.log('[FOOD-PHOTO-AI] No tool_calls found in response');
    }

    // Fallback: try parsing from content if tool call failed
    if (!analysis) {
      const content = data.choices?.[0]?.message?.content || '';
      console.log('[FOOD-PHOTO-AI] Fallback: parsing from content, length:', content.length);
      
      // Try multiple JSON extraction patterns
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          analysis = JSON.parse(jsonStr);
          console.log('[FOOD-PHOTO-AI] Parsed from content:', analysis.foodsDetected?.length, 'items');
        } catch (e) {
          console.error('[FOOD-PHOTO-AI] Content parse error:', e);
          console.error('[FOOD-PHOTO-AI] Content raw:', content.substring(0, 500));
        }
      } else {
        console.log('[FOOD-PHOTO-AI] No JSON found in content');
      }
    }

    // CRITICAL: If parsing completely failed, return error instead of fallback
    if (!analysis || !analysis.foodsDetected || analysis.foodsDetected.length === 0) {
      console.error('[FOOD-PHOTO-AI] No foods detected - returning error instead of fallback');
      return errorResponse(
        422, 
        'Could not detect any foods in this photo. Try a clearer image with visible food, or add foods manually.', 
        'ANALYSIS_FAILED', 
        true
      );
    }

    // Ensure required fields exist
    if (!analysis.confidence) analysis.confidence = 'medium';
    
    // Validate and sanitize food items
    analysis.foodsDetected = analysis.foodsDetected.map((food: any) => ({
      name: food.name || 'Unknown food',
      quantity: food.quantity || '100g',
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

    console.log(`[FOOD-PHOTO-AI] Analysis completed. ${analysis.foodsDetected.length} foods detected. Usage: ${currentUsage + 1}/${MONTHLY_LIMIT}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FOOD-PHOTO-AI] Unexpected error:', error instanceof Error ? error.message : error);
    return errorResponse(500, 'Food analysis failed. Please try again.', 'UNEXPECTED_ERROR', true);
  }
});
