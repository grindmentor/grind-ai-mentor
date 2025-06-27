
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced in-memory cache for exercise searches
const exerciseCache = new Map<string, any>();
const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes - longer cache for better cost efficiency

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Enhanced cache check with normalization
    const cacheKey = query.toLowerCase().trim().replace(/\s+/g, ' ');
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
        model: 'gpt-4o-mini', // Cost-optimized model
        messages: [
          {
            role: 'system',
            content: `You are a strength training expert specializing in gym-based exercises with progressive overload focus. When given a search query, return 4-5 relevant GYM STRENGTH EXERCISES ONLY in JSON format.

STRICT FILTERING REQUIREMENTS:
- ONLY strength training exercises performed in a gym with weights/machines
- EXCLUDE ALL: cardio (running, cycling, swimming), stretching, yoga, mobility work
- EXCLUDE: bodyweight-only exercises unless they use gym equipment (pull-ups, dips on equipment)
- Equipment must be: barbell, dumbbell, cable machine, weight machine, bench, rack, or gym-based bodyweight apparatus
- Focus on compound and isolation movements for muscle building and strength
- Category must be "Strength" or "Full Workout" (NEVER "Cardio")

ENHANCED RESPONSE REQUIREMENTS:
- Include detailed form tips for proper execution
- Specify primary muscle focus and secondary muscles worked  
- Emphasize progressive overload potential
- Provide equipment-specific guidance

Popular strength exercises: bench press, squat, deadlift, overhead press, rows, pull-ups, lateral raises, tricep pushdowns, bicep curls, Romanian deadlifts, leg press, lat pulldowns, etc.`
          },
          {
            role: 'user',
            content: `Search query: "${query}". Return gym strength exercises with enhanced details in this JSON format: 
            {
              "exercises": [
                {
                  "name": "Exercise Name",
                  "category": "Strength",
                  "muscle_groups": ["Primary", "Secondary"],
                  "equipment": "Specific equipment needed",
                  "difficulty": "Beginner/Intermediate/Advanced",
                  "description": "Brief exercise description with progressive overload emphasis",
                  "estimated_duration": "X minutes per set",
                  "form_tips": "Specific form cues and technique points for safety and effectiveness",
                  "muscle_focus": "Detailed explanation of primary and secondary muscle activation"
                }
              ]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200, // Increased for enhanced details
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Enhanced JSON parsing with robust fallback
    let exerciseData;
    try {
      exerciseData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('JSON parsing failed, using enhanced fallback exercises');
      // Enhanced fallback with form tips and muscle focus
      exerciseData = {
        exercises: [
          {
            name: "Barbell Bench Press",
            category: "Strength",
            muscle_groups: ["Chest", "Triceps", "Front Deltoids"],
            equipment: "Barbell, Bench, Rack",
            difficulty: "Intermediate",
            description: "Classic compound movement for upper body strength and muscle building. Excellent for progressive overload tracking.",
            estimated_duration: "3-4 minutes per set",
            form_tips: "Retract shoulder blades, maintain arch in lower back, controlled descent to chest, drive through feet, full lockout at top",
            muscle_focus: "Primary: Pectoralis major (chest). Secondary: Triceps brachii, anterior deltoids. Stabilizers: Core, lats, rear delts"
          },
          {
            name: "Romanian Deadlift",
            category: "Strength", 
            muscle_groups: ["Hamstrings", "Glutes", "Lower Back"],
            equipment: "Barbell or Dumbbells",
            difficulty: "Intermediate",
            description: "Hip-hinge movement targeting posterior chain. Perfect for progressive overload in hamstring and glute development.",
            estimated_duration: "3-4 minutes per set",
            form_tips: "Start with bar at hip level, push hips back, keep knees slightly bent, lower bar close to legs, feel stretch in hamstrings",
            muscle_focus: "Primary: Hamstrings (biceps femoris, semitendinosus, semimembranosus), glutes. Secondary: Erector spinae, traps"
          },
          {
            name: "Barbell Back Squat",
            category: "Strength",
            muscle_groups: ["Quadriceps", "Glutes", "Core"],
            equipment: "Barbell, Squat Rack", 
            difficulty: "Intermediate",
            description: "King of compound exercises for lower body strength and mass. Essential for progressive overload in leg development.",
            estimated_duration: "4-5 minutes per set",
            form_tips: "High bar or low bar position, brace core, sit back and down, knees track over toes, drive through heels to stand",
            muscle_focus: "Primary: Quadriceps (vastus lateralis, medialis, intermedius, rectus femoris), glutes. Secondary: Hamstrings, calves, core"
          }
        ]
      };
    }

    // Strict filtering for gym-only strength exercises
    const filteredExercises = (exerciseData.exercises || []).filter((exercise: any) => {
      const isStrengthExercise = exercise.category === 'Strength' || exercise.category === 'Full Workout';
      const hasGymEquipment = exercise.equipment && 
        (exercise.equipment.toLowerCase().includes('barbell') ||
         exercise.equipment.toLowerCase().includes('dumbbell') ||
         exercise.equipment.toLowerCase().includes('cable') ||
         exercise.equipment.toLowerCase().includes('machine') ||
         exercise.equipment.toLowerCase().includes('bench') ||
         exercise.equipment.toLowerCase().includes('rack') ||
         (exercise.equipment.toLowerCase() === 'bodyweight' && 
          (exercise.name.toLowerCase().includes('pull-up') || 
           exercise.name.toLowerCase().includes('dip'))));
      
      // Exclude cardio and stretching
      const exerciseName = exercise.name.toLowerCase();
      const excludedTerms = ['running', 'cycling', 'treadmill', 'elliptical', 'rowing machine', 
                           'jump', 'stretch', 'yoga', 'mobility', 'cardio', 'hiit'];
      const isExcluded = excludedTerms.some(term => exerciseName.includes(term)) || 
                        exercise.category === 'Cardio';
      
      return isStrengthExercise && hasGymEquipment && !isExcluded;
    });

    const finalData = { exercises: filteredExercises };

    // Enhanced caching with better cleanup
    exerciseCache.set(cacheKey, {
      data: finalData,
      timestamp: Date.now()
    });

    // Improved cache cleanup - remove expired entries
    if (exerciseCache.size > 150) {
      const now = Date.now();
      const keysToDelete = [];
      for (const [key, value] of exerciseCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => exerciseCache.delete(key));
      console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
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
