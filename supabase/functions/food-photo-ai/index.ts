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
  console.log('🍽️ FOOD-PHOTO-AI: OpenAI key configured:', !!openAIApiKey);
  
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
    
    if (!image) {
      console.error('🍽️ FOOD-PHOTO-AI: No image data provided');
      throw new Error('Image data is required');
    }

    console.log('🍽️ FOOD-PHOTO-AI: Analyzing food image with GPT-4.1-2025-04-14');

    // Enhanced food analysis prompt
    const analysisPrompt = `You are a professional nutritionist with access to current USDA Food Data Central and comprehensive nutritional databases.

ANALYZE THIS FOOD IMAGE AND RETURN ONLY A JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "foodsDetected": [
    {
      "name": "food name",
      "quantity": "estimated portion",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    }
  ],
  "totalNutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  },
  "confidence": "high|medium|low",
  "analysis": "Brief analysis of what you see and how you calculated portions",
  "recommendations": "Brief nutritional insights"
}

Context: ${mealType ? `Meal type: ${mealType}` : 'General food analysis'}
${additionalNotes ? `Additional context: ${additionalNotes}` : ''}

If you cannot clearly identify foods, return confidence: "low" and explain why in analysis.`;

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
            content: analysisPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide detailed nutritional breakdown in the requested JSON format.'
              },
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
        temperature: 0.3
      }),
    });

    console.log('🍽️ FOOD-PHOTO-AI: OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🍽️ FOOD-PHOTO-AI: OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('🍽️ FOOD-PHOTO-AI: Raw AI response length:', content.length);

    let analysisResult;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
      
      // Validate required fields
      if (!analysisResult.totalNutrition || !analysisResult.foodsDetected) {
        throw new Error('Invalid analysis structure');
      }
      
      console.log('🍽️ FOOD-PHOTO-AI: Successfully parsed analysis result');
      
    } catch (parseError) {
      console.error('🍽️ FOOD-PHOTO-AI: Failed to parse AI response:', parseError);
      
      // Fallback response
      analysisResult = {
        foodsDetected: [
          {
            name: "Mixed Food Items",
            quantity: "1 serving",
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 12,
            fiber: 5
          }
        ],
        totalNutrition: {
          calories: 350,
          protein: 15,
          carbs: 45,
          fat: 12,
          fiber: 5
        },
        confidence: "low",
        analysis: "Unable to clearly identify specific foods. Using estimated values.",
        recommendations: "For accurate tracking, try a clearer photo or manually enter foods."
      };
    }

    console.log('🍽️ FOOD-PHOTO-AI: Analysis complete, confidence:', analysisResult.confidence);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🍽️ FOOD-PHOTO-AI: Function error:', error);
    
    // Return structured error response
    const errorResponse = {
      foodsDetected: [
        {
          name: "Analysis Error",
          quantity: "unknown",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }
      ],
      totalNutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      confidence: "low",
      analysis: `Analysis failed: ${error.message}`,
      recommendations: "Try again with a clearer image or enter food manually."
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});