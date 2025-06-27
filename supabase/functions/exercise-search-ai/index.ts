
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
    const { query } = await req.json();

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
            content: `You are a strength training expert. Focus ONLY on specific weight lifting exercises and movements. When given a search query, return 4-5 relevant strength training exercises in JSON format. Focus on isolation exercises, compound movements, and specific lifting techniques like lateral raises, tricep pushdowns, RDL, bench press, squats, etc. Each exercise should have: name, category (always "Strength"), muscle_groups (array), equipment, difficulty (Beginner/Intermediate/Advanced), description (2-3 sentences about form and technique), and estimated_duration. Do NOT include cardio or full workout routines - only specific lifting movements.`
          },
          {
            role: 'user',
            content: `Search query: "${query}". Return strength training exercises in this exact JSON format: {"exercises": [{"name": "Exercise Name", "category": "Strength", "muscle_groups": ["Primary", "Secondary"], "equipment": "Equipment needed", "difficulty": "Beginner/Intermediate/Advanced", "description": "Brief description focusing on form and technique", "estimated_duration": "X sets"}]}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
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
            name: "Custom Exercise",
            category: "Strength",
            muscle_groups: ["Target Muscle"],
            equipment: "Various",
            difficulty: "Intermediate",
            description: "AI-generated exercise based on your search.",
            estimated_duration: "3-4 sets"
          }
        ]
      };
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
