
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for exercise searches
const exerciseCache = new Map<string, any>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = exerciseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached result for:', query);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making API call for exercise search:', query);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using lightest available model
        messages: [
          {
            role: 'system',
            content: `You are a fitness expert specializing in gym-based strength training. When given a search query, return 4-5 relevant GYM EXERCISES ONLY in JSON format. 

STRICT REQUIREMENTS:
- Only include strength training exercises performed in a gym
- NO cardio exercises (no running, cycling, swimming, etc.)
- Focus on compound and isolation movements
- Equipment must be: barbell, dumbbell, cable machine, weight machine, bench, rack, or bodyweight
- Popular exercises: bench press, squat, deadlift, overhead press, rows, pull-ups, lateral raises, tricep pushdowns, bicep curls, Romanian deadlifts, etc.
- Category must be either "Strength" or "Full Workout" (never "Cardio")

Each exercise must have: name, category (Strength/Full Workout), muscle_groups (array), equipment, difficulty (Beginner/Intermediate/Advanced), description (2-3 sentences about form and benefits), and estimated_duration.`
          },
          {
            role: 'user',
            content: `Search query: "${query}". Return gym strength exercises in this exact JSON format: {"exercises": [{"name": "Exercise Name", "category": "Strength", "muscle_groups": ["Primary", "Secondary"], "equipment": "Equipment needed", "difficulty": "Beginner/Intermediate/Advanced", "description": "Brief description about form and benefits", "estimated_duration": "X minutes per set"}]}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800, // Reduced token limit for cost optimization
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    let exerciseData;
    try {
      exerciseData = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      exerciseData = {
        exercises: [
          {
            name: "Bench Press",
            category: "Strength",
            muscle_groups: ["Chest", "Triceps", "Shoulders"],
            equipment: "Barbell, Bench",
            difficulty: "Intermediate",
            description: "Classic compound movement for upper body strength. Focus on controlled movement and proper form.",
            estimated_duration: "3-4 minutes per set"
          },
          {
            name: "Romanian Deadlift",
            category: "Strength",
            muscle_groups: ["Hamstrings", "Glutes", "Lower Back"],
            equipment: "Barbell or Dumbbells",
            difficulty: "Intermediate",
            description: "Hip-hinge movement targeting posterior chain. Keep weight close to body.",
            estimated_duration: "3-4 minutes per set"
          }
        ]
      };
    }

    // Cache the result
    exerciseCache.set(cacheKey, {
      data: exerciseData,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (exerciseCache.size > 100) {
      const entries = Array.from(exerciseCache.entries());
      const expired = entries.filter(([_, value]) => Date.now() - value.timestamp > CACHE_DURATION);
      expired.forEach(([key]) => exerciseCache.delete(key));
    }

    return new Response(JSON.stringify(exerciseData), {
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
