import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IP-based rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute (stricter for image analysis)
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
      confidence: 'low',
      foodsDetected: []
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check for OpenAI API key first
  if (!openAIApiKey) {
    console.error('OPENAI_API_KEY environment variable is not set');
    return new Response(JSON.stringify({ 
      error: 'AI analysis service not configured. Please contact support.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // Get the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('Missing Authorization header');
    return new Response(JSON.stringify({ 
      error: 'Authentication required' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const { image, mealType } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Enhanced CalAI-style food detection prompt
    const analysisPrompt = `You are a precise nutrition analysis AI. Analyze this food photo and provide CONSERVATIVE estimates.

CRITICAL RULES:
1. Only identify foods you can clearly see
2. Estimate portions SMALLER rather than larger (people tend to overestimate)
3. Use common serving sizes (1 cup, 1 slice, 1 piece, etc.)
4. If uncertain about a food, mark confidence as "low"
5. Return ONLY valid JSON - no additional text

For each food item, provide:
- name: Clear, simple food name
- quantity: Conservative portion estimate with units
- calories: Conservative calorie estimate
- protein: Grams of protein
- carbs: Grams of carbohydrates  
- fat: Grams of fat
- fiber: Grams of fiber
- confidence: "high", "medium", or "low"

Example response format:
{
  "confidence": "high",
  "foodsDetected": [
    {
      "name": "Chicken breast",
      "quantity": "4 oz",
      "calories": 140,
      "protein": 26,
      "carbs": 0,
      "fat": 3,
      "fiber": 0,
      "confidence": "high"
    }
  ]
}

If you cannot clearly identify foods or the image is unclear, return:
{
  "confidence": "low",
  "foodsDetected": [],
  "error": "Unable to clearly identify foods in image"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: image,
                  detail: 'high'
                } 
              }
            ]
          }
        ],
        max_completion_tokens: 1000
        // Note: temperature parameter is NOT supported for GPT-4.1+ models
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'AI analysis service temporarily unavailable',
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      // Parse and validate the JSON response
      const analysisResult = JSON.parse(aiResponse);
      
      // Validate response structure
      if (!analysisResult.confidence || !Array.isArray(analysisResult.foodsDetected)) {
        throw new Error('Invalid response structure');
      }

      // Additional validation for food items
      analysisResult.foodsDetected = analysisResult.foodsDetected.filter((food: any) =>
        food.name && 
        food.quantity && 
        typeof food.calories === 'number' &&
        food.calories > 0
      );

      console.log('Food analysis result:', analysisResult);
      
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponse);
      
      return new Response(JSON.stringify({
        confidence: 'low',
        foodsDetected: [],
        error: 'Unable to analyze image clearly'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in food-photo-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed - please try again or add foods manually',
      confidence: 'low',
      foodsDetected: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
