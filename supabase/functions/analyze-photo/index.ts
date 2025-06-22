
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

  try {
    const { image, weight, height } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a fitness assessment AI. Analyze progress photos and provide body composition estimates. 
            
            CRITICAL: Return ONLY a JSON object with this exact format:
            {
              "bodyFat": number,
              "muscleMass": number,
              "analysis": "detailed analysis text with bullet points using • symbol only"
            }
            
            For bodyFat: estimate body fat percentage (5-35 range)
            For muscleMass: calculate estimated muscle mass in kg based on visible muscle definition and provided stats
            For analysis: provide detailed assessment using ONLY bullet points with • symbol, no bold text or other formatting`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this progress photo. Weight: ${weight || 'not provided'} lbs, Height: ${height || 'not provided'} inches. Provide body fat percentage estimate, muscle mass estimate, and detailed analysis.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return new Response(JSON.stringify({
        bodyFat: 15,
        muscleMass: weight ? Math.round((weight * 0.453592) * 0.4) : 60,
        analysis: content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      bodyFat: 15,
      muscleMass: 60,
      analysis: "• Analysis unavailable due to technical error\n• Please try again later"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
