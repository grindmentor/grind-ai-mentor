import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Use POST with JSON body' }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const term = (body.query || body.q || '').toString().trim();
    const pageSize = Math.min(Math.max(Number(body.pageSize) || 20, 1), 50);

    if (!term) {
      return new Response(JSON.stringify({ error: 'query is required' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('USDA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: corsHeaders });
    }

    const params = new URLSearchParams({
      query: term,
      api_key: apiKey,
      pageSize: String(pageSize)
    });

    const upstream = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${params}`);
    if (!upstream.ok) {
      const status = upstream.status;
      const text = await upstream.text();
      return new Response(JSON.stringify({ error: 'upstream error', status, details: text }), { status, headers: corsHeaders });
    }

    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500, headers: corsHeaders });
  }
});