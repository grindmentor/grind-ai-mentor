import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IP-based rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.'
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY environment variable is not set');
    return new Response(JSON.stringify({ 
      error: 'AI analysis service not configured.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
    const tier = roleData || 'free';
    
    console.log(`[ANALYZE-PHYSIQUE] User ${user.id} has role: ${tier}`);

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

    console.log('Analyzing physique with Lovable AI Vision...');

    const prompt = `You are an expert fitness coach analyzing a physique photo. Provide a detailed, evidence-based analysis.

IMPORTANT: ALWAYS attempt to provide analysis, even if the image quality is not ideal.

USER CONTEXT:
${height ? `Height: ${height}` : ''}
${weight ? `Weight: ${weight}` : ''}
${bodyFat ? `Estimated Body Fat: ${bodyFat}%` : ''}
${goals ? `Goals: ${goals}` : ''}

Analyze this physique photo and return a JSON object with the following structure:
{
  "overall_score": <number 0-100>,
  "confidence": "<high/medium/low>",
  "notes": "<any notes about image quality>",
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
    "Priority 1: <specific advice>",
    "Priority 2: <specific advice>",
    "Priority 3: <specific advice>"
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"]
}

RULES:
- NEVER refuse to analyze. Always provide your best estimate.
- If certain muscle groups are not visible, estimate based on what IS visible.
- Return ONLY valid JSON, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(
        JSON.stringify({ error: 'Physique analysis service is temporarily unavailable.' }), 
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Raw AI response:', content);

    let analysis;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      analysis = {
        overall_score: 50,
        confidence: "low",
        notes: "Unable to fully analyze the image. Please try with a clearer photo.",
        attributes: {
          muscle_development: 50,
          symmetry: 50,
          definition: 50,
          mass: 50,
          conditioning: 50
        },
        muscle_groups: {
          chest: 50,
          shoulders: 50,
          arms: 50,
          back: 50,
          core: 50,
          legs: 50
        },
        recommendations: [
          "Try uploading a clearer photo with better lighting",
          "Ensure your full body is visible in the frame",
          "Use natural lighting for best results"
        ],
        strengths: ["Unable to determine from current image"],
        areas_to_improve: ["Image quality for better analysis"]
      };
    }

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
    console.error('Error in analyze-physique:', error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: 'Physique analysis failed. Please try again.' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
