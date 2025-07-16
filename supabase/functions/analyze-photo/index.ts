import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Enhanced Physique AI analysis prompt for structured data
    const analysisPrompt = `You are an expert fitness coach and body composition analyzer. Analyze this physique photo with scientific precision.

USER CONTEXT:
- Height: ${height || 'Not specified'}
- Weight: ${weight || 'Not specified'}  
- Current Body Fat: ${bodyFat || 'Unknown'}%
- Goals: ${goals || 'General fitness improvement'}

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
        max_tokens: 1000,
        temperature: 0.1 // Low temperature for consistent results
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