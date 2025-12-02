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
      confidence: 'low'
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
    const { image, height, weight, bodyFat, goals } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // EVIDENCE-BASED Physique AI analysis using 2020-2025 research
    const analysisPrompt = `You are an expert exercise physiologist specializing in evidence-based body composition analysis using the latest research from 2020-2025.

USER CONTEXT:
- Height: ${height || 'Not specified'}
- Weight: ${weight || 'Not specified'}  
- Current Body Fat: ${bodyFat || 'Unknown'}%
- Goals: ${goals || 'General fitness improvement'}

EVIDENCE-BASED ANALYSIS PRINCIPLES:
- Body fat assessment: Use validated visual methods, acknowledge ±3-5% accuracy limitation
- Muscle development: Assess symmetry and proportional development
- Recommendations: ONLY evidence-based advice from peer-reviewed research 2020-2025

MANDATORY - REJECT THESE OUTDATED MYTHS:
❌ "Train light weights for muscle definition" - load progression drives adaptations regardless of body fat
❌ "Do cardio for spot reduction" - localized fat loss is physiologically impossible  
❌ "Eat 6 small meals to boost metabolism" - meal frequency has minimal metabolic impact
❌ "Avoid carbs to get shredded" - caloric deficit drives fat loss, not macronutrient restriction
❌ "High reps for cutting, low reps for bulking" - rep ranges should match training goals

CRITICAL RULES:
1. Return ONLY valid JSON - no additional text
2. Be conservative with estimates
3. Provide specific, actionable advice
4. Include confidence levels for assessments

For the physique analysis, provide:
- bodyFatPercentage: Conservative estimate (number)
- muscleMass: Overall assessment ("low", "average", "above average", "high")
- ffmi: Fat-Free Mass Index estimate (number, 16-25 range)
- frameSize: Body frame assessment ("small", "medium", "large")
- muscleGroups: Object with strengths and weaknesses
- overallRating: Physique rating out of 10 (number)
- improvements: Array of specific suggestions
- confidence: Analysis confidence ("high", "medium", "low")

Example response format:
{
  "bodyFatPercentage": 15,
  "muscleMass": "above average",
  "ffmi": 19.2,
  "frameSize": "medium",
  "muscleGroups": {
    "strengths": ["chest", "shoulders"],
    "weaknesses": ["legs", "back"]
  },
  "overallRating": 7,
  "improvements": [
    "Focus on compound leg exercises",
    "Add more back training volume",
    "Consider slight caloric deficit for fat loss"
  ],
  "confidence": "high"
}

If you cannot clearly assess the physique, return:
{
  "confidence": "low",
  "error": "Unable to clearly assess physique from image"
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
        confidence: 'low'
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
      if (!analysisResult.confidence) {
        throw new Error('Invalid response structure');
      }

      // Ensure we have required fields or set defaults
      const structuredResult = {
        bodyFatPercentage: analysisResult.bodyFatPercentage || null,
        muscleMass: analysisResult.muscleMass || 'average',
        ffmi: analysisResult.ffmi || null,
        frameSize: analysisResult.frameSize || 'medium',
        muscleGroups: analysisResult.muscleGroups || { strengths: [], weaknesses: [] },
        overallRating: analysisResult.overallRating || 5,
        improvements: analysisResult.improvements || [],
        confidence: analysisResult.confidence,
        error: analysisResult.error || null
      };

      console.log('Physique analysis result:', structuredResult);
      
      return new Response(JSON.stringify(structuredResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponse);
      
      return new Response(JSON.stringify({
        confidence: 'low',
        error: 'Unable to analyze physique clearly from image'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed - please try again or ensure image is clear and well-lit',
      confidence: 'low'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
