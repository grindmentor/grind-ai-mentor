import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log('TEST FUNCTION: Starting up...');

serve(async (req) => {
  console.log('TEST FUNCTION: Request received');
  
  return new Response(JSON.stringify({
    status: 'working',
    timestamp: new Date().toISOString(),
    method: req.method
  }), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
});