import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// User-based rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(userId);

  if (rateLimiter.size > 5000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (value.resetTime < now) {
        rateLimiter.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimiter.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Enhanced in-memory cache
const exerciseCache = new Map<string, any>();
const CACHE_DURATION = 45 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(JSON.stringify({
        error: 'Authentication required',
        exercises: []
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.log('Invalid token or user not found:', userError?.message);
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        exercises: []
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!checkRateLimit(user.id)) {
      console.log(`Rate limit exceeded for user: ${user.id}`);
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        exercises: []
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY environment variable is not set');
      return new Response(JSON.stringify({
        error: 'AI service not configured',
        exercises: []
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { query } = await req.json();
    
    // Enhanced cache check
    const cacheKey = query.toLowerCase().trim().replace(/\s+/g, ' ');
    const cached = exerciseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached result for:', query);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making API call for exercise search:', query);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a strength training expert specializing in gym-based exercises with progressive overload focus. When given a search query, return 4-5 relevant GYM STRENGTH EXERCISES ONLY in JSON format.

STRICT FILTERING REQUIREMENTS:
- ONLY strength training exercises performed in a gym with weights/machines
- EXCLUDE ALL: cardio, stretching, yoga, mobility work
- Equipment must be: barbell, dumbbell, cable machine, weight machine, bench, rack
- Focus on compound and isolation movements for muscle building

Return ONLY valid JSON with this structure:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "category": "Strength",
      "muscle_groups": ["Primary", "Secondary"],
      "equipment": "Specific equipment needed",
      "difficulty": "Beginner/Intermediate/Advanced",
      "description": "Brief exercise description",
      "estimated_duration": "X minutes per set",
      "form_tips": "Form cues for safety",
      "muscle_focus": "Primary and secondary muscle activation"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Search query: "${query}". Return gym strength exercises.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          exercises: []
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          error: 'AI credits exhausted.',
          exercises: []
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error('AI service error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    let exerciseData;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      exerciseData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback exercises');
      exerciseData = {
        exercises: [
          {
            name: "Barbell Bench Press",
            category: "Strength",
            muscle_groups: ["Chest", "Triceps", "Front Deltoids"],
            equipment: "Barbell, Bench, Rack",
            difficulty: "Intermediate",
            description: "Classic compound movement for upper body strength.",
            estimated_duration: "3-4 minutes per set",
            form_tips: "Retract shoulder blades, controlled descent to chest",
            muscle_focus: "Primary: Chest. Secondary: Triceps, anterior deltoids"
          },
          {
            name: "Barbell Back Squat",
            category: "Strength",
            muscle_groups: ["Quadriceps", "Glutes", "Core"],
            equipment: "Barbell, Squat Rack", 
            difficulty: "Intermediate",
            description: "King of compound exercises for lower body.",
            estimated_duration: "4-5 minutes per set",
            form_tips: "Brace core, sit back and down, knees track over toes",
            muscle_focus: "Primary: Quadriceps, glutes. Secondary: Hamstrings, core"
          }
        ]
      };
    }

    // Filter for gym-only strength exercises
    const filteredExercises = (exerciseData.exercises || []).filter((exercise: any) => {
      const isStrengthExercise = exercise.category === 'Strength' || exercise.category === 'Full Workout';
      const hasGymEquipment = exercise.equipment && 
        (exercise.equipment.toLowerCase().includes('barbell') ||
         exercise.equipment.toLowerCase().includes('dumbbell') ||
         exercise.equipment.toLowerCase().includes('cable') ||
         exercise.equipment.toLowerCase().includes('machine') ||
         exercise.equipment.toLowerCase().includes('bench') ||
         exercise.equipment.toLowerCase().includes('rack'));
      
      const exerciseName = exercise.name.toLowerCase();
      const excludedTerms = ['running', 'cycling', 'treadmill', 'stretch', 'yoga', 'cardio'];
      const isExcluded = excludedTerms.some(term => exerciseName.includes(term));
      
      return isStrengthExercise && hasGymEquipment && !isExcluded;
    });

    const finalData = { exercises: filteredExercises };

    // Cache the result
    exerciseCache.set(cacheKey, {
      data: finalData,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (exerciseCache.size > 150) {
      const now = Date.now();
      for (const [key, value] of exerciseCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          exerciseCache.delete(key);
        }
      }
    }

    return new Response(JSON.stringify(finalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in exercise-search-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate exercise recommendations',
      exercises: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
