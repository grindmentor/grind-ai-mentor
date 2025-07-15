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
    const { image, height, weight, bodyFat, goals } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Enhanced Physique AI analysis prompt
    const analysisPrompt = `You are an expert fitness coach and body composition analyzer. Analyze this physique photo with scientific precision.

USER CONTEXT:
- Height: ${height || 'Not specified'}
- Weight: ${weight || 'Not specified'}  
- Current Body Fat: ${bodyFat || 'Unknown'}%
- Goals: ${goals || 'General fitness improvement'}

ANALYSIS REQUIREMENTS:
1. **Body Composition Assessment**:
   - Estimate current body fat percentage (be conservative)
   - Assess muscle mass distribution
   - Identify strong and weak muscle groups
   - Note posture and structural balance

2. **Scientific Recommendations**:
   - Specific training focus areas
   - Recommended rep ranges and training styles
   - Nutrition guidance based on goals
   - Recovery and mobility suggestions

3. **Progress Tracking**:
   - Key metrics to track
   - Expected timeline for visible changes
   - Photo comparison guidelines

4. **Personalized Action Plan**:
   - 4-week immediate focus
   - 12-week transformation goals
   - Specific exercises to prioritize

FORMAT YOUR RESPONSE WITH:
- Use ### for main sections
- Use **bold** for key points
- Use bullet points for lists
- Be encouraging but realistic
- Include specific, actionable advice

Keep the analysis comprehensive but concise (400-600 words).`;

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
        max_tokens: 1200,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'AI analysis service temporarily unavailable. Please try again later.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Physique analysis completed successfully');
    
    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed. Please ensure image is clear and well-lit, then try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});