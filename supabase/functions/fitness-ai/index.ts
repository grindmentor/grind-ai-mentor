
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
    const { prompt, type, userInput } = await req.json();

    let systemPrompt = '';
    
    switch (type) {
      case 'training':
        systemPrompt = `You are a world-class exercise physiologist and strength coach. Create evidence-based training programs based on peer-reviewed research. Always include:
        - Specific exercise selection with scientific rationale
        - Progressive overload principles
        - Recovery and periodization
        - Safety considerations
        - 3-4 research citations with real authors and journals
        Format your response with clear headings and structure.`;
        break;
        
      case 'nutrition':
        systemPrompt = `You are a registered dietitian and sports nutritionist. Create evidence-based meal plans and nutrition advice based on peer-reviewed research. Always include:
        - Macronutrient distribution with scientific rationale
        - Meal timing strategies
        - Micronutrient considerations
        - Hydration guidelines
        - 3-4 research citations with real authors and journals
        Format your response with clear headings and structure.`;
        break;
        
      case 'cardio':
        systemPrompt = `You are an exercise physiologist specializing in cardiovascular training. Create evidence-based cardio programs based on peer-reviewed research. Always include:
        - Heart rate zone training
        - Different cardio modalities
        - Progressive training structure
        - Recovery protocols
        - 3-4 research citations with real authors and journals
        Format your response with clear headings and structure.`;
        break;
        
      case 'coaching':
        systemPrompt = `You are an experienced fitness coach and exercise scientist. Provide helpful, science-backed fitness advice. Always include:
        - Evidence-based recommendations
        - Practical application tips
        - Safety considerations
        - When relevant, include 1-2 research citations
        Keep responses conversational but scientifically accurate. Focus on the specific question asked.`;
        break;
        
      default:
        systemPrompt = `You are a fitness expert. Provide helpful, science-backed advice based on current research.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput || prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fitness-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
