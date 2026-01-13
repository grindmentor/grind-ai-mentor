import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
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

  if (!LOVABLE_API_KEY) {
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

      const detectPrompt = `You are an expert ingredient detection AI with computer vision capabilities. Carefully analyze this photo and identify ONLY the specific food items you can actually see.

CRITICAL RULES - READ CAREFULLY:
1. ONLY list ingredients you can CLEARLY IDENTIFY in the image. If you cannot see something clearly, DO NOT include it.
2. NEVER use vague terms like "various vegetables", "assorted items", "some produce", or "mixed ingredients". Each item must be specifically named.
3. Be as specific as possible: "romaine lettuce" not "lettuce", "cherry tomatoes" not "tomatoes", "boneless skinless chicken breast" not "chicken"
4. If you can read labels or packaging, include the product name (e.g., "Chobani Greek yogurt", "Heinz ketchup")
5. Include quantity when visible: "4 eggs", "1 gallon milk", "half block of cheddar cheese"
6. Confidence ratings:
   - "high": Clearly visible and identifiable
   - "medium": Partially visible but reasonably certain
   - "low": Only use if shape/color strongly suggests the item - but if too uncertain, OMIT entirely
7. Examine EVERY visible shelf, drawer, door compartment
8. Common pantry items to look for: pasta types (spaghetti, penne, etc.), rice varieties, canned goods (read labels!), sauces, oils, spices, cereals, bread
9. If the photo is blurry or items are not identifiable, return FEWER ingredients rather than guessing
10. NEVER fabricate or assume ingredients that are not visible

Return ONLY valid JSON:
{
  "ingredients": [
    {"name": "boneless chicken breast (2 pieces)", "confidence": "high"},
    {"name": "large brown eggs (about 6)", "confidence": "high"},
    {"name": "baby spinach bag", "confidence": "high"},
    {"name": "Barilla spaghetti box", "confidence": "medium"},
    {"name": "yellow onion", "confidence": "high"}
  ]
}`;

      console.log('Analyzing image for ingredients...');
      
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
                { type: 'text', text: detectPrompt },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      console.log('AI response:', content);

      // Parse JSON from response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      
      try {
        const result = JSON.parse(jsonStr);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', jsonStr);
        return new Response(JSON.stringify({ 
          ingredients: [],
          error: 'Failed to parse AI response'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else if (action === 'generate') {
      // Meal generation
      const { ingredients, mealIntent, quickMeals, remainingMacros, proteinMinimum, userGoal, allergies, dislikes } = body;

      if (!ingredients || ingredients.length === 0) {
        return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build allergy/dislike instructions
      const allergyInstructions = allergies?.length > 0 
        ? `\nCRITICAL - NEVER include these allergens: ${allergies.join(', ')}` 
        : '';
      const dislikeInstructions = dislikes?.length > 0 
        ? `\nAvoid these disliked foods: ${dislikes.join(', ')}` 
        : '';

      // Build intent-specific instructions
      const intentInstructions: Record<string, string> = {
        'protein-focused': `
- PRIORITIZE protein content above all else
- Target 35-55g protein per meal (varies based on ingredients available)
- Moderate carbs (20-40g) and fats (10-20g)
- Use lean proteins as the base of each meal`,
        'post-workout': `
- HIGH carbs (50-80g) + sufficient protein (25-40g)
- LOW fat priority (under 15g)
- Prefer fast-digesting carbs when available (rice, potatoes, fruit)
- Quick glycogen replenishment focus`,
        'balanced': `
- Even macro distribution: ~30% protein, ~40% carbs, ~30% fat
- Aim for 25-45g protein, 40-60g carbs, 15-25g fat
- Include variety of food groups
- Natural portion sizes based on meal type`,
        'low-cal': `
STRICT LOW-CALORIE CUTTING MEAL REQUIREMENTS:
- MAXIMUM 350 calories per meal - this is a HARD LIMIT
- Protein: 30-50g (prioritize lean sources: chicken breast, white fish, egg whites, turkey)
- Fat: MAXIMUM 8g - use cooking spray, NO oil, no butter, no high-fat ingredients
- Carbs: 15-30g max, prefer fibrous vegetables
- Volume: Use HIGH-VOLUME, LOW-CALORIE foods to maximize satiety:
  * Leafy greens, zucchini, cucumber, bell peppers, mushrooms, tomatoes
  * Cauliflower rice instead of regular rice
  * Shirataki noodles if noodles needed
- Cooking: Grill, steam, air-fry, or poach. NO frying or sautéing in oil.
- NO sauces with hidden calories (use mustard, hot sauce, lemon, herbs, spices)
- If the user's ingredients include high-fat items, MINIMIZE or EXCLUDE them`
      };

      const generatePrompt = `You are a science-based meal planning AI. Generate 1-3 practical meals using ONLY these available ingredients: ${ingredients.join(', ')}

USER CONTEXT:
- Goal: ${userGoal || 'general fitness'}
- Remaining daily macros: ${remainingMacros.calories} cal, ${remainingMacros.protein}g protein, ${remainingMacros.carbs}g carbs, ${remainingMacros.fat}g fat
- Protein target per meal: around ${proteinMinimum}g (can vary +/- 15g based on ingredients)
- Time constraint: ${quickMeals ? 'Under 10 minutes only' : 'No time limit'}
${allergyInstructions}${dislikeInstructions}

MEAL INTENT: ${mealIntent}
${intentInstructions[mealIntent] || ''}

CRITICAL RULES:
1. Generate 1-3 DIFFERENT meals with VARIED protein amounts (not all the same).
2. Be REALISTIC about portions and macros - calculate based on actual ingredient weights.
3. Use NATURAL portion sizes - not every meal needs exactly the same macros.
4. Auto-adjust portions to best fit remaining macros.
5. If a meal can't hit protein target with available ingredients, that's okay - note it in macroWarning.
6. Use ONLY the provided ingredients. You may suggest ONE protein add-on if needed.
7. Keep instructions simple and practical.
${quickMeals ? '8. ALL meals must be under 10 minutes prep+cook time.' : ''}
9. NEVER use any ingredients from the allergy list.
10. Each meal should have DIFFERENT macro profiles based on what makes sense for that dish.

Return ONLY valid JSON:
{
  "meals": [
    {
      "id": "meal-1",
      "name": "Meal name",
      "description": "Brief 1-line description",
      "cookTime": "8 min",
      "protein": 38,
      "calories": 420,
      "carbs": 25,
      "fat": 16,
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

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: generatePrompt }],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error('Meal generation failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Parse JSON from response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      
      try {
        const result = JSON.parse(jsonStr);
        
        // Ensure max 3 meals
        if (result.meals && result.meals.length > 3) {
          result.meals = result.meals.slice(0, 3);
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', jsonStr);
        return new Response(JSON.stringify({ 
          meals: [],
          error: 'Failed to parse AI response'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
