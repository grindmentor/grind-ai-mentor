import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'detect') {
      // Ingredient detection from photo
      const { image } = body;
      if (!image) {
        return new Response(JSON.stringify({ error: 'No image provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const detectPrompt = `You are a precise ingredient detection AI. Analyze this photo of a fridge, pantry, or freezer and identify all visible food ingredients.

RULES:
1. Only identify actual food ingredients (not containers, bottles with unclear labels, etc.)
2. Be specific (e.g., "chicken breast" not just "chicken")
3. Include quantity estimates when visible
4. Rate confidence: high (clearly visible), medium (partially visible), low (guessing)
5. Focus on ingredients useful for cooking meals

Return ONLY valid JSON in this format:
{
  "ingredients": [
    {"name": "chicken breast", "confidence": "high"},
    {"name": "eggs", "confidence": "high"},
    {"name": "spinach", "confidence": "medium"},
    {"name": "greek yogurt", "confidence": "high"}
  ]
}`;

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
                { type: 'text', text: detectPrompt },
                { type: 'image_url', image_url: { url: image, detail: 'high' } }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        console.error('OpenAI error:', await response.text());
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const result = JSON.parse(jsonStr);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'generate') {
      // Meal generation
      const { ingredients, mealIntent, quickMeals, remainingMacros, proteinMinimum, userGoal } = body;

      if (!ingredients || ingredients.length === 0) {
        return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build intent-specific instructions
      const intentInstructions: Record<string, string> = {
        'protein-focused': `
- PRIORITIZE protein content above all else
- Target 40-50g protein per meal minimum
- Moderate carbs (20-40g) and fats (10-20g)
- Use lean proteins as the base of each meal`,
        'post-workout': `
- HIGH carbs (50-80g) + sufficient protein (30-40g)
- LOW fat priority (under 15g)
- Prefer fast-digesting carbs when available (rice, potatoes, fruit)
- Quick glycogen replenishment focus`,
        'balanced': `
- Even macro distribution: ~30% protein, ~40% carbs, ~30% fat
- Aim for 35-40g protein, 40-50g carbs, 15-25g fat
- Include variety of food groups`,
        'low-cal': `
- HIGHEST protein priority (40-50g minimum)
- LOWEST feasible calories (under 400 if possible)
- Volume-friendly foods (vegetables, lean proteins)
- Minimal added fats, simple preparations`
      };

      const generatePrompt = `You are a science-based meal planning AI. Generate 1-3 practical meals using ONLY these available ingredients: ${ingredients.join(', ')}

USER CONTEXT:
- Goal: ${userGoal || 'general fitness'}
- Remaining daily macros: ${remainingMacros.calories} cal, ${remainingMacros.protein}g protein, ${remainingMacros.carbs}g carbs, ${remainingMacros.fat}g fat
- Protein minimum per meal: ${proteinMinimum}g
- Time constraint: ${quickMeals ? 'Under 10 minutes only' : 'No time limit'}

MEAL INTENT: ${mealIntent}
${intentInstructions[mealIntent] || ''}

CRITICAL RULES:
1. Generate 1-3 meals MAXIMUM. Never more than 3.
2. Each meal MUST aim for the protein minimum (${proteinMinimum}g). If ingredients can't reach this, set proteinMet to false.
3. Auto-adjust portions to best fit remaining macros - NO fixed portion sizes.
4. If a meal slightly exceeds a macro, include an honest macroWarning (e.g., "Exceeds carbs by 12g, protein target still met").
5. Use ONLY the provided ingredients. You may suggest ONE protein add-on if protein target can't be met.
6. Keep instructions simple and practical.
${quickMeals ? '7. ALL meals must be under 10 minutes prep+cook time.' : ''}

Return ONLY valid JSON:
{
  "meals": [
    {
      "id": "meal-1",
      "name": "Meal name",
      "description": "Brief 1-line description",
      "cookTime": "8 min",
      "protein": 42,
      "calories": 380,
      "carbs": 25,
      "fat": 14,
      "sodium": 450,
      "fiber": 4,
      "sugar": 3,
      "proteinMet": true,
      "macroWarning": null,
      "ingredients": ["200g chicken breast", "1 cup spinach", "2 eggs"],
      "instructions": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "proteinAddOnNeeded": false,
  "suggestedAddOn": null
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: generatePrompt }],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        console.error('OpenAI error:', await response.text());
        throw new Error('Meal generation failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const result = JSON.parse(jsonStr);

      // Ensure max 3 meals
      if (result.meals && result.meals.length > 3) {
        result.meals = result.meals.slice(0, 3);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('FridgeScan error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
