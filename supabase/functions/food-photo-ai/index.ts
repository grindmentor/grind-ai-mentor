import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
      error: 'AI analysis service not configured. Please contact support.',
      confidence: 'low',
      foodsDetected: []
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
      error: 'Authentication required',
      confidence: 'low',
      foodsDetected: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Unauthorized user:', userError);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Check subscription status using the database function (checks user_roles table)
    const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
    const tier = roleData || 'free';
    
    console.log(`[FOOD-PHOTO-AI] User ${user.id} has role: ${tier}`);

    // Free users cannot use this feature
    if (tier === 'free') {
      console.log(`Free user ${user.id} attempted to use food-photo-ai`);
      return new Response(JSON.stringify({ 
        error: 'Photo analysis is a Premium feature. Upgrade to unlock food photo analysis.',
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Check monthly usage limits for premium users (30/month)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from('user_usage')
      .select('food_photo_analyses')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .maybeSingle();

    const currentUsage = usage?.food_photo_analyses || 0;
    const MONTHLY_LIMIT = 30;

    if (currentUsage >= MONTHLY_LIMIT) {
      console.log(`User ${user.id} exceeded food photo limit: ${currentUsage}/${MONTHLY_LIMIT}`);
      return new Response(JSON.stringify({ 
        error: `You've reached your monthly limit of ${MONTHLY_LIMIT} photo analyses. Your limit resets next month.`,
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    const { image, mealType } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ 
        error: 'No image provided',
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Analyzing food photo with OpenAI Vision...');

    // Enhanced food detection prompt - ALWAYS attempt analysis
    const analysisPrompt = `You are a precise nutrition analysis AI. Analyze this food photo and provide your BEST estimates.

CRITICAL RULES:
1. ALWAYS attempt to identify foods - never refuse to analyze
2. If image is unclear, blurry, or dark, still provide your best guess with low confidence
3. Estimate portions conservatively (people tend to overestimate)
4. Use common serving sizes (1 cup, 1 slice, 1 piece, etc.)
5. Include a confidence level for each item AND overall
6. Return ONLY valid JSON - no additional text

For each food item detected, provide:
- name: Clear, simple food name (your best guess)
- quantity: Conservative portion estimate with units
- calories: Conservative calorie estimate
- protein: Grams of protein
- carbs: Grams of carbohydrates  
- fat: Grams of fat
- fiber: Grams of fiber
- confidence: "high", "medium", or "low"

REQUIRED response format:
{
  "confidence": "<high/medium/low - overall confidence>",
  "notes": "<any notes about image quality or what was unclear>",
  "foodsDetected": [
    {
      "name": "Food name",
      "quantity": "portion estimate",
      "calories": 100,
      "protein": 10,
      "carbs": 10,
      "fat": 5,
      "fiber": 2,
      "confidence": "medium"
    }
  ]
}

IMPORTANT:
- If you can see ANY food, provide estimates for it
- If image is very unclear, set confidence to "low" and explain in notes, but STILL try to identify what you can see
- Never return an empty foodsDetected array unless there is truly NO food visible at all
- When uncertain, err on the side of providing MORE information, not less`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
        max_tokens: 1500,
        temperature: 0.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'AI analysis service temporarily unavailable. Please try again.',
        confidence: 'low',
        foodsDetected: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Raw AI response:', aiResponse);

    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      
      // Parse and validate the JSON response
      const analysisResult = JSON.parse(jsonStr);
      
      // Ensure required fields exist
      if (!analysisResult.confidence) {
        analysisResult.confidence = 'medium';
      }
      if (!Array.isArray(analysisResult.foodsDetected)) {
        analysisResult.foodsDetected = [];
      }

      // Validate and clean food items
      analysisResult.foodsDetected = analysisResult.foodsDetected.map((food: any) => ({
        name: food.name || 'Unknown food',
        quantity: food.quantity || '1 serving',
        calories: typeof food.calories === 'number' ? food.calories : 100,
        protein: typeof food.protein === 'number' ? food.protein : 0,
        carbs: typeof food.carbs === 'number' ? food.carbs : 0,
        fat: typeof food.fat === 'number' ? food.fat : 0,
        fiber: typeof food.fiber === 'number' ? food.fiber : 0,
        confidence: food.confidence || 'low'
      }));

      // Update usage tracking after successful analysis
      await supabase
        .from('user_usage')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          food_photo_analyses: currentUsage + 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year'
        });

      console.log(`Food analysis completed for user ${user.id}. Usage: ${currentUsage + 1}/${MONTHLY_LIMIT}`);
      
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponse);
      
      // Provide a helpful fallback instead of failing
      return new Response(JSON.stringify({
        confidence: 'low',
        notes: 'The AI had trouble analyzing this image. Please try with a clearer photo or add foods manually.',
        foodsDetected: [{
          name: 'Unable to identify (please edit)',
          quantity: '1 serving',
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 10,
          fiber: 2,
          confidence: 'low'
        }]
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
