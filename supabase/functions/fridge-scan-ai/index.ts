// FridgeScan AI Edge Function
// Uses retry/backoff for transient errors and structured tool-calling for reliable output.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
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
  console.log(`[FRIDGE-SCAN] Error response: ${status} ${errorCode} - ${error}`);
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
      console.log(`[FRIDGE-SCAN] API attempt ${attempt + 1}/${maxRetries + 1}`);
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx) except 429
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      // Retry on 429 (rate limit) or 5xx (server errors)
      if (response.status === 429 || response.status >= 500) {
        const errorText = await response.text();
        console.warn(`[FRIDGE-SCAN] Retryable error ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter: base * 2^attempt + random(0-500ms)
          const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
          console.log(`[FRIDGE-SCAN] Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Return the response on final attempt so caller can handle status
        return response;
      }
      
      return response;
    } catch (err) {
      console.error(`[FRIDGE-SCAN] Network error on attempt ${attempt + 1}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.log(`[FRIDGE-SCAN] Waiting ${Math.round(delay)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Tool definition for structured ingredient extraction
const ingredientExtractionTool = {
  type: "function",
  function: {
    name: "extract_ingredients",
    description: "Extract detected food ingredients from the image with confidence levels",
    parameters: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          description: "List of detected food items",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Specific name of the food item including brand if visible, quantity if countable"
              },
              confidence: {
                type: "string",
                enum: ["high", "medium"],
                description: "high = readable text/label, medium = recognizable shape/packaging"
              }
            },
            required: ["name", "confidence"],
            additionalProperties: false
          }
        }
      },
      required: ["ingredients"],
      additionalProperties: false
    }
  }
};

// Tool definition for structured meal generation
const mealGenerationTool = {
  type: "function",
  function: {
    name: "generate_meals",
    description: "Generate meal suggestions from available ingredients",
    parameters: {
      type: "object",
      properties: {
        meals: {
          type: "array",
          description: "List of meal suggestions (1-3 meals)",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              cookTime: { type: "string" },
              protein: { type: "number" },
              calories: { type: "number" },
              carbs: { type: "number" },
              fat: { type: "number" },
              sodium: { type: "number" },
              fiber: { type: "number" },
              sugar: { type: "number" },
              proteinMet: { type: "boolean" },
              macroWarning: { type: "string", nullable: true },
              ingredients: { type: "array", items: { type: "string" } },
              instructions: { type: "array", items: { type: "string" } }
            },
            required: ["id", "name", "description", "cookTime", "protein", "calories", "carbs", "fat", "proteinMet", "ingredients", "instructions"],
            additionalProperties: false
          }
        },
        proteinAddOnNeeded: { type: "boolean" },
        suggestedAddOn: { type: "string", nullable: true }
      },
      required: ["meals", "proteinAddOnNeeded"],
      additionalProperties: false
    }
  }
};

Deno.serve(async (req) => {
  console.log('[FRIDGE-SCAN] start', { method: req.method });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body early for action routing
    let body: Record<string, any> = {};
    try {
      body = await req.json();
    } catch {
      // Empty or invalid JSON - will be caught by action check
    }
    
    const { action } = body;
    console.log('[FRIDGE-SCAN] action:', action);

    // ==========================================
    // PRE-AUTH ENDPOINTS (health, echo)
    // These do NOT require authentication
    // ==========================================
    
    if (action === 'health') {
      console.log('[FRIDGE-SCAN][HEALTH] Health check - no auth required');
      return new Response(JSON.stringify({ 
        ok: true, 
        function: 'fridge-scan-ai', 
        version: FUNCTION_VERSION, 
        ts: Date.now(),
        hasApiKey: !!LOVABLE_API_KEY,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'echo') {
      console.log('[FRIDGE-SCAN][ECHO] Echo check - no auth required');
      const { image, ingredients } = body;
      const imageSize = image?.length || 0;
      const ingredientsCount = Array.isArray(ingredients) ? ingredients.length : 0;
      
      // Reject very large payloads to prevent abuse
      const MAX_ECHO_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
      if (imageSize > MAX_ECHO_IMAGE_SIZE) {
        return errorResponse(413, 'Image too large for echo', 'PAYLOAD_TOO_LARGE', false);
      }
      
      return new Response(JSON.stringify({ 
        ok: true,
        function: 'fridge-scan-ai',
        version: FUNCTION_VERSION,
        echo: {
          hasImage: !!image,
          imageSizeBytes: imageSize,
          imageSizeMB: (imageSize / 1024 / 1024).toFixed(2),
          ingredientsCount,
          ingredientsPreview: Array.isArray(ingredients) ? ingredients.slice(0, 5) : [],
        },
        ts: Date.now()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // AUTHENTICATED ENDPOINTS (detect, generate)
    // These require valid JWT
    // ==========================================
    
    // Check auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[FRIDGE-SCAN] No auth header');
      return errorResponse(401, 'Authentication required', 'AUTH_REQUIRED', false);
    }

    // Signing-keys compatible validation
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const token = authHeader.slice('Bearer '.length);
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      console.error('[FRIDGE-SCAN] auth failed', claimsError);
      return errorResponse(401, 'Unauthorized', 'AUTH_INVALID', false);
    }

    const userId = claimsData.claims.sub;
    console.log('[FRIDGE-SCAN] authed', { userId, action });

    if (!LOVABLE_API_KEY) {
      return errorResponse(500, 'AI service not configured', 'AI_NOT_CONFIGURED', false);
    }

    if (action === 'detect') {
      // Ingredient detection from photo using structured tool calling
      const { image } = body;
      
      const imageInfo = {
        hasImage: !!image,
        imageType: typeof image,
        imageLength: image?.length || 0,
        imageSizeMB: image ? (image.length / 1024 / 1024).toFixed(2) : 0,
        startsWithData: image?.startsWith?.('data:') || false,
        mimeType: image?.substring?.(0, 30) || 'N/A',
      };
      console.log('[FRIDGE-SCAN] Image info:', JSON.stringify(imageInfo));

      if (!image) {
        return errorResponse(400, 'No image provided', 'NO_IMAGE', false);
      }

      if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return errorResponse(400, 'Invalid image format', 'INVALID_IMAGE_FORMAT', false);
      }

      const detectPrompt = `Analyze this fridge/pantry photo to identify food products and ingredients.

PRIORITY ORDER:
1. TEXT/LABELS FIRST: Read ALL visible brand names, product labels, text on packaging
   - Examples: "Chobani Greek Yogurt", "Heinz Ketchup", "Tropicana Orange Juice"
2. RECOGNIZABLE PACKAGING: Identify by distinctive shapes, colors, logos
   - Milk cartons, egg cartons, condiment bottles, yogurt cups
3. FRESH PRODUCE: Fruits, vegetables, meats (specify variety/color)

RULES:
- Be SPECIFIC: Include brand names, quantities when visible
- NO vague terms: "various items", "some vegetables"
- Skip unclear/unidentifiable items
- Maximum 40 ingredients
- Only "high" (readable text) or "medium" (recognizable shape) confidence`;

      console.log('[FRIDGE-SCAN] Calling AI gateway with tool calling...');
      
      const requestBody = {
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: detectPrompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        tools: [ingredientExtractionTool],
        tool_choice: { type: "function", function: { name: "extract_ingredients" } },
        max_tokens: 2000,
        temperature: 0.2
      };

      console.log('[FRIDGE-SCAN] Request payload size:', JSON.stringify(requestBody).length, 'bytes');

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
        console.error('[FRIDGE-SCAN] Fetch failed after retries:', fetchErr);
        return errorResponse(503, 'AI gateway unreachable', 'GATEWAY_UNREACHABLE', true);
      }

      console.log('[FRIDGE-SCAN] AI gateway response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRIDGE-SCAN] AI gateway error:', response.status, errorText);
        
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
      console.log('[FRIDGE-SCAN] AI response received');

      // Extract from tool call response
      let result: { ingredients: Array<{ name: string; confidence: string }> } = { ingredients: [] };
      
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          result = JSON.parse(toolCall.function.arguments);
          console.log('[FRIDGE-SCAN] Parsed from tool call:', result.ingredients?.length, 'ingredients');
        } catch (e) {
          console.error('[FRIDGE-SCAN] Tool call parse error:', e);
        }
      }
      
      // Fallback: try parsing from content if tool call failed
      if (result.ingredients.length === 0) {
        const content = data.choices?.[0]?.message?.content || '';
        console.log('[FRIDGE-SCAN] Fallback: parsing from content');
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            result = parsed;
          } catch (e) {
            console.error('[FRIDGE-SCAN] Content parse error:', e);
          }
        }
      }

      // Post-process to remove vague/non-food items
      if (Array.isArray(result.ingredients)) {
        const bannedTokens = [
          'various', 'assorted', 'some ', 'misc', 'multiple',
          'container', 'containers', 'bowl', 'bowls', 'cup', 'cups',
          'plastic', 'unidentifiable', 'possibly', 'unclear',
        ];

        const looksLikeSpecificFood = (name: string) => {
          const n = name.toLowerCase();
          if (!n.trim()) return false;
          if (bannedTokens.some(t => n.includes(t))) return false;
          if (/(plate|lid|jar\s*with\s*unclear|glass\s*bowl|red\s*plastic|white\s*bowls)/i.test(name)) return false;
          return true;
        };

        result.ingredients = result.ingredients
          .map((i: any) => ({
            name: (i?.name ?? i)?.toString?.()?.trim?.() ?? '',
            confidence: (i?.confidence ?? 'medium') as 'high' | 'medium',
          }))
          .filter((i: any) => i.name && looksLikeSpecificFood(i.name))
          .filter((i: any, idx: number, arr: any[]) =>
            arr.findIndex(x => x.name.toLowerCase() === i.name.toLowerCase()) === idx
          )
          .slice(0, 40);
      }

      // Warn if no ingredients detected
      if (result.ingredients.length === 0) {
        console.log('[FRIDGE-SCAN] No ingredients detected');
        return new Response(JSON.stringify({ 
          ingredients: [], 
          warning: 'NO_INGREDIENTS_DETECTED',
          hint: 'Try a clearer photo with better lighting'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'generate') {
      // Meal generation using structured tool calling
      const { ingredients, mealIntent, quickMeals, remainingMacros, proteinMinimum, userGoal, allergies, dislikes } = body;

      if (!ingredients || ingredients.length === 0) {
        return errorResponse(400, 'No ingredients provided', 'NO_INGREDIENTS', false);
      }

      const allergyInstructions = allergies?.length > 0 
        ? `\nCRITICAL - NEVER include these allergens: ${allergies.join(', ')}` 
        : '';
      const dislikeInstructions = dislikes?.length > 0 
        ? `\nAvoid these disliked foods: ${dislikes.join(', ')}` 
        : '';

      const intentInstructions: Record<string, string> = {
        'protein-focused': 'PRIORITIZE protein (35-55g). Moderate carbs (20-40g), low fat (10-20g).',
        'post-workout': 'HIGH carbs (50-80g), good protein (25-40g), LOW fat (<15g). Fast glycogen replenishment.',
        'balanced': 'Even macros: ~30% protein, ~40% carbs, ~30% fat. Aim 25-45g protein.',
        'low-cal': 'STRICT <350 cal. Protein 30-50g, fat <8g, carbs 15-30g. High-volume low-cal foods.'
      };

      const generatePrompt = `Generate 1-3 practical meals using ONLY these ingredients: ${ingredients.join(', ')}

USER CONTEXT:
- Goal: ${userGoal || 'general fitness'}
- Remaining macros: ${remainingMacros.calories} cal, ${remainingMacros.protein}g P, ${remainingMacros.carbs}g C, ${remainingMacros.fat}g F
- Protein target/meal: ~${proteinMinimum}g (+/- 15g)
- Time: ${quickMeals ? 'Under 10 min only' : 'No limit'}
${allergyInstructions}${dislikeInstructions}

INTENT: ${mealIntent}
${intentInstructions[mealIntent] || ''}

RULES:
1. Generate 1-3 DIFFERENT meals with varied macro profiles
2. Realistic portions and calculated macros
3. Use ONLY provided ingredients
4. Simple, practical instructions
${quickMeals ? '5. ALL meals under 10 min prep+cook' : ''}
6. NEVER use allergen ingredients`;

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
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: generatePrompt }],
              tools: [mealGenerationTool],
              tool_choice: { type: "function", function: { name: "generate_meals" } },
              max_tokens: 2000,
              temperature: 0.7
            }),
          }
        );
      } catch (fetchErr) {
        console.error('[FRIDGE-SCAN] Generate fetch failed:', fetchErr);
        return errorResponse(503, 'AI gateway unreachable', 'GATEWAY_UNREACHABLE', true);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRIDGE-SCAN] AI gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return errorResponse(429, 'Rate limit exceeded', 'RATE_LIMITED', true, 429);
        }
        if (response.status === 402) {
          return errorResponse(402, 'AI credits exhausted', 'CREDITS_EXHAUSTED', false, 402);
        }
        if (response.status >= 500) {
          return errorResponse(503, 'AI service temporarily unavailable', 'GATEWAY_ERROR', true, response.status);
        }
        return errorResponse(500, 'Meal generation failed', 'GENERATE_FAILED', true, response.status);
      }

      const data = await response.json();
      
      // Extract from tool call
      let result: { meals: any[]; proteinAddOnNeeded: boolean; suggestedAddOn?: string } = { 
        meals: [], 
        proteinAddOnNeeded: false 
      };
      
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          result = JSON.parse(toolCall.function.arguments);
          console.log('[FRIDGE-SCAN] Parsed meals from tool call:', result.meals?.length);
        } catch (e) {
          console.error('[FRIDGE-SCAN] Tool call parse error:', e);
        }
      }
      
      // Fallback to content parsing
      if (result.meals.length === 0) {
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e) {
            console.error('[FRIDGE-SCAN] Content parse error:', e);
          }
        }
      }
      
      // Limit to 3 meals
      if (result.meals && result.meals.length > 3) {
        result.meals = result.meals.slice(0, 3);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return errorResponse(400, 'Invalid action', 'INVALID_ACTION', false);

  } catch (error) {
    console.error('[FRIDGE-SCAN] Unhandled error:', error);
    return errorResponse(
      500, 
      error instanceof Error ? error.message : 'An error occurred',
      'INTERNAL_ERROR',
      true
    );
  }
});
