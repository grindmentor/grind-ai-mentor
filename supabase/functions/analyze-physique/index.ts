import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check subscription status
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    const tier = subscriber?.subscription_tier || 'free';

    // Free users cannot use this feature
    if (tier === 'free') {
      return new Response(
        JSON.stringify({ 
          error: 'This feature is locked for free users. Upgrade to premium to unlock physique analysis.' 
        }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check usage limits for premium users (1x per week)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from('user_usage')
      .select('physique_analyses, last_physique_analysis')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .maybeSingle();

    if (usage?.last_physique_analysis) {
      const lastAnalysis = new Date(usage.last_physique_analysis);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (lastAnalysis > weekAgo) {
        const daysUntilNext = Math.ceil((7 - (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60 * 24)));
        return new Response(
          JSON.stringify({ 
            error: `You can only analyze your physique once per week. Try again in ${daysUntilNext} day(s).` 
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const { imageUrl, height, weight, bodyFat, goals } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log('Analyzing physique with OpenAI Vision...');

    // Construct detailed prompt
    const prompt = `You are an expert fitness coach analyzing a physique photo. Provide a detailed, evidence-based analysis.

USER CONTEXT:
${height ? `Height: ${height}` : ''}
${weight ? `Weight: ${weight}` : ''}
${bodyFat ? `Estimated Body Fat: ${bodyFat}%` : ''}
${goals ? `Goals: ${goals}` : ''}

Analyze this physique photo and return a JSON object with the following structure:
{
  "overall_score": <number 0-100>,
  "attributes": {
    "muscle_development": <number 0-100>,
    "symmetry": <number 0-100>,
    "definition": <number 0-100>,
    "mass": <number 0-100>,
    "conditioning": <number 0-100>
  },
  "muscle_groups": {
    "chest": <number 0-100>,
    "shoulders": <number 0-100>,
    "arms": <number 0-100>,
    "back": <number 0-100>,
    "core": <number 0-100>,
    "legs": <number 0-100>
  },
  "recommendations": [
    "Priority 1: <specific actionable advice>",
    "Priority 2: <specific actionable advice>",
    "Priority 3: <specific actionable advice>"
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"]
}

Be honest, specific, and constructive. Focus on what's visible in the photo.`;

    // Call OpenAI Vision API
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
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI analysis');
    }

    // Update usage tracking
    await supabase
      .from('user_usage')
      .upsert({
        user_id: user.id,
        month_year: currentMonth,
        physique_analyses: (usage?.physique_analyses || 0) + 1,
        last_physique_analysis: new Date().toISOString()
      }, {
        onConflict: 'user_id,month_year'
      });

    console.log('Physique analysis completed successfully');

    return new Response(
      JSON.stringify({
        analysis: {
          ...analysis,
          analysis_date: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-physique:', error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});