import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log('🍽️ FOOD-PHOTO-AI: Function starting up...');

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
console.log('🍽️ FOOD-PHOTO-AI: OpenAI key present:', !!openAIApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🍽️ FOOD-PHOTO-AI: Function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🍽️ FOOD-PHOTO-AI: Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  // Simple health check endpoint
  if (req.method === 'GET') {
    console.log('🍽️ FOOD-PHOTO-AI: Health check requested');
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      openai_configured: !!openAIApiKey,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('🍽️ FOOD-PHOTO-AI: Starting food photo analysis');
    
    if (!openAIApiKey) {
      console.error('🍽️ FOOD-PHOTO-AI: OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const { image, mealType, additionalNotes } = await req.json();
    console.log('🍽️ FOOD-PHOTO-AI: Received data:', { 
      hasImage: !!image, 
      mealType, 
      additionalNotes: !!additionalNotes 
    });
    
    if (!image) {
      console.error('🍽️ FOOD-PHOTO-AI: No image data provided');
      throw new Error('Image data is required');
    }

    console.log('🍽️ FOOD-PHOTO-AI: Calling OpenAI API...');

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
            role: 'system',
            content: `You are a professional nutritionist. Analyze this food image and return ONLY a JSON object with this structure:
{
  "foodsDetected": [{"name": "food name", "quantity": "portion", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}],
  "totalNutrition": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0},
  "confidence": "high|medium|low",
  "analysis": "brief analysis",
  "recommendations": "brief tips"
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this food photo. Meal type: ${mealType || 'unknown'}. ${additionalNotes || ''}` },
              { type: 'image_url', image_url: { url: image, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    console.log('🍽️ FOOD-PHOTO-AI: OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🍽️ FOOD-PHOTO-AI: OpenAI error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('🍽️ FOOD-PHOTO-AI: Raw response:', content.substring(0, 200) + '...');

    // Parse JSON response
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (!analysisResult?.totalNutrition) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('🍽️ FOOD-PHOTO-AI: Parse error:', parseError);
      
      // Fallback response
      analysisResult = {
        foodsDetected: [{
          name: "Mixed Food Items",
          quantity: "1 serving",
          calories: 350,
          protein: 15,
          carbs: 45,
          fat: 12,
          fiber: 5
        }],
        totalNutrition: { calories: 350, protein: 15, carbs: 45, fat: 12, fiber: 5 },
        confidence: "low",
        analysis: "Could not parse AI response properly",
        recommendations: "Try a clearer photo"
      };
    }

    console.log('🍽️ FOOD-PHOTO-AI: Analysis complete');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🍽️ FOOD-PHOTO-AI: Function error:', error);
    
    const errorResponse = {
      foodsDetected: [{
        name: "Analysis Error",
        quantity: "unknown",
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
      }],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      confidence: "low",
      analysis: `Error: ${error.message}`,
      recommendations: "Try again or add food manually"
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});