import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST with JSON body' }, 405);

  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const term = String((body as any).query ?? (body as any).q ?? '').trim();
    const pageSize = Math.min(Math.max(Number((body as any).pageSize) || 20, 1), 50);

    if (!term) return json({ error: 'query is required' }, 400);

    const apiKey = Deno.env.get('USDA_API_KEY');
    if (!apiKey) return json({ error: 'Server not configured: missing USDA_API_KEY' }, 500);

    const params = new URLSearchParams({
      query: term,
      api_key: apiKey,
      pageSize: String(pageSize),
    });

    try {
      const upstream = await fetchWithTimeout(
        `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            // Helpful UA for troubleshooting with USDA if needed
            'User-Agent': 'Myotopia-USDA-Proxy/1.0 (+https://myotopia.app)'
          },
        },
        8000
      );

      if (!upstream.ok) {
        const status = upstream.status;
        const text = await upstream.text().catch(() => '');
        console.error('USDA upstream non-OK', { status, text });
        return json({ error: 'upstream error', status, details: text }, status);
      }

      const data = await upstream.json();
      return json(data, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isAbort = err && typeof err === 'object' && (err as any).name === 'AbortError';
      console.error('USDA upstream fetch failed', { message });
      if (isAbort) return json({ error: 'Upstream timeout' }, 504);
      // Network-level failure – surface as 503 so client can retry
      return json({ error: 'Network unavailable', offline: true }, 503);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('usda-food-proxy internal error', { message });
    return json({ error: 'internal error' }, 500);
  }
});