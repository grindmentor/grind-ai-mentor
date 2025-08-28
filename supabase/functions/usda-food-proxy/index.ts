import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDANutrient[];
}

interface USDASearchResponse {
  foods: USDAFoodItem[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, pageSize = 20 } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('USDA_API_KEY');
    if (!apiKey) {
      console.error('USDA_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const searchParams = new URLSearchParams({
      query: query.trim(),
      api_key: apiKey,
      pageSize: pageSize.toString(),
      dataType: 'Survey (FNDDS),Branded,Foundation,SR Legacy',
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });

    console.log(`Making USDA API request for query: ${query}`);
    
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${searchParams}`);
    
    if (!response.ok) {
      console.error(`USDA API error: ${response.status} ${response.statusText}`);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      return new Response(
        JSON.stringify({ error: `USDA API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data: USDASearchResponse = await response.json();
    console.log(`USDA API returned ${data.foods?.length || 0} results`);

    // Filter and prioritize results (same logic as original service)
    const priorityOrder = {
      'Survey (FNDDS)': 1,
      'Foundation': 2,
      'Branded': 3,
      'SR Legacy': 4
    };

    const prioritizedFoods = data.foods
      ?.filter(food => food.foodNutrients && food.foodNutrients.length > 0)
      .sort((a, b) => {
        const aPriority = priorityOrder[a.dataType as keyof typeof priorityOrder] || 5;
        const bPriority = priorityOrder[b.dataType as keyof typeof priorityOrder] || 5;
        return aPriority - bPriority;
      })
      .slice(0, 20) || [];

    const filteredData = { ...data, foods: prioritizedFoods };

    return new Response(
      JSON.stringify(filteredData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in USDA food proxy:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});