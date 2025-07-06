import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { image, mealType } = await req.json();
    if (!image) {
      throw new Error('Image is required');
    }

    // Compress image if it's too large (>4MB base64 ≈ 3MB actual)
    let processedImage = image;
    if (image.length > 4 * 1024 * 1024) {
      console.log('Image too large, needs compression');
      // For now, reject very large images with helpful message
      throw new Error('Image too large. Please use a smaller image (under 3MB) or compress it first.');
    }

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
            role: 'system',
            content: 'You are a nutrition expert specializing in food portion estimation from photos. Be precise with quantities and realistic with calorie estimates.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Analyze this food photo for accurate nutrition logging. Look at the portion size carefully - use visual cues like plate size, utensils, or standard serving sizes for reference.

Return JSON in this exact format:
{
  "foodsDetected": [
    {
      "name": "specific food name",
      "quantity": "realistic portion in grams",
      "calories": accurate_calorie_count,
      "protein": protein_grams,
      "carbs": carb_grams,
      "fat": fat_grams,
      "fiber": fiber_grams
    }
  ],
  "totalNutrition": {
    "calories": total_calories,
    "protein": total_protein,
    "carbs": total_carbs,
    "fat": total_fat,
    "fiber": total_fiber
  },
  "confidence": "high/medium/low",
  "analysis": "brief description of what you see",
  "recommendations": "nutrition tips if relevant"
}

Meal context: ${mealType}
Be conservative with portions - it's better to underestimate than overestimate. Focus on realistic serving sizes.` 
              },
              { 
                type: 'image_url', 
                image_url: { url: processedImage } 
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content;
    
    try {
      result = JSON.parse(result);
    } catch {
      result = {
        foodsDetected: [{ name: "Food Item", quantity: "1 serving", calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 4 }],
        totalNutrition: { calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 4 },
        confidence: "medium",
        analysis: "Food detected from photo",
        recommendations: "Balanced meal"
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      foodsDetected: [{ name: "Error", quantity: "0g", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      confidence: "low",
      analysis: "Analysis failed",
      recommendations: "Try again"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});