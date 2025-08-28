import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
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

function prioritize(foods: USDAFoodItem[] = []): USDAFoodItem[] {
  const priorityOrder = {
    'Survey (FNDDS)': 1,
    'Foundation': 2,
    'Branded': 3,
    'SR Legacy': 4
  } as const;

  return foods
    .filter((food) => food.foodNutrients && food.foodNutrients.length > 0)
    .sort((a, b) => {
      const aPriority = (priorityOrder as any)[a.dataType] ?? 5;
      const bPriority = (priorityOrder as any)[b.dataType] ?? 5;
      return aPriority - bPriority;
    })
    .slice(0, 20);
}

async function getParams(req: Request): Promise<{ query: string; pageSize: number } | { error: string }> {
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const query = (url.searchParams.get('query') || '').trim();
      const pageSize = Number(url.searchParams.get('pageSize') || 20);
      if (!query) return { error: 'Query parameter is required' };
      return { query, pageSize: isNaN(pageSize) ? 20 : Math.max(1, Math.min(pageSize, 50)) };
    }

    // POST body (JSON)
    const text = await req.text();
    if (!text) return { error: 'Empty request body' };
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: 'Invalid JSON body' };
    }

    const query = (parsed?.query || '').trim();
    const pageSize = Number(parsed?.pageSize ?? 20);
    if (!query) return { error: 'Query parameter is required' };
    return { query, pageSize: isNaN(pageSize) ? 20 : Math.max(1, Math.min(pageSize, 50)) };
  } catch (e) {
    console.error('Failed to parse request params', e);
    return { error: 'Failed to parse request parameters' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const params = await getParams(req);
  if ('error' in params) {
    return new Response(JSON.stringify({ error: params.error }), { status: 400, headers: corsHeaders });
  }

  const { query, pageSize } = params;

  try {
    const apiKey = Deno.env.get('USDA_API_KEY');
    if (!apiKey) {
      console.error('USDA_API_KEY is missing');
      return new Response(JSON.stringify({ error: 'API not configured' }), { status: 500, headers: corsHeaders });
    }

    const searchParams = new URLSearchParams({
      query,
      api_key: apiKey,
      pageSize: String(pageSize),
      dataType: 'Survey (FNDDS),Branded,Foundation,SR Legacy',
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });

    console.log('USDA request', { query, pageSize });
    const upstream = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${searchParams}`);

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('USDA upstream error', upstream.status, text);
      const status = upstream.status === 429 ? 429 : 502;
      const msg = upstream.status === 429 ? 'Rate limit exceeded' : 'Upstream API error';
      return new Response(JSON.stringify({ error: msg, status: upstream.status }), { status, headers: corsHeaders });
    }

    const raw: USDASearchResponse = await upstream.json();
    const filtered = { ...raw, foods: prioritize(raw.foods) };

    return new Response(JSON.stringify(filtered), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('Proxy failure', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});