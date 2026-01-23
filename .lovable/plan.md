
Goal: Get FridgeScan reliably working (stop the persistent 503 “Network unavailable/offline:true”), and give you a repeatable way to prompt Lovable to debug + fix it with concrete evidence.

What your current evidence suggests
- The browser is successfully POSTing to `https://druwytttcxnfpwgyrvmt.supabase.co/functions/v1/fridge-scan-ai` and getting HTTP 503.
- The edge function logs for `fridge-scan-ai` show only `shutdown` entries and no “start/authed/action” logs, which strongly suggests the request is failing before your handler runs (deployment mismatch, runtime boot failure, or platform-level 503).
- `verify_jwt = false` is already set for `fridge-scan-ai` in `supabase/config.toml`, and `LOVABLE_API_KEY` exists as a secret.

How to prompt Lovable so it actually fixes FridgeScan (copy/paste template)
1) Force it to gather proof first (logs + requests), then fix one root cause at a time.
2) Tell it exactly what to inspect and what “done” looks like.

Use this exact prompt:
- “FridgeScan always fails with 503. Do NOT change prompts/UX yet. First: pull edge function logs for `fridge-scan-ai`, pull browser network request details for the failing call, and verify the deployed function is the latest code. Add an `action: 'health'` path that returns `{ ok: true, version, ts }` without calling the AI gateway. Then call it via `supabase.functions.invoke('fridge-scan-ai', { body: { action: 'health' } })` and confirm it returns 200. Only after health works, fix detect/generate.”

This works because it creates a minimal “is the function alive?” check that separates infra/deploy failures from AI-gateway failures.

Implementation plan (what I will implement when you click “Implement plan”)
A. Make the edge function diagnosable in 1 request (no AI dependency)
1. Update `supabase/functions/fridge-scan-ai/index.ts`
   - Add `action === 'health'` branch that:
     - returns HTTP 200 with JSON `{ ok: true, function: 'fridge-scan-ai', version: <hardcoded string>, ts: Date.now() }`
     - logs a single structured log line: `[FRIDGE-SCAN][HEALTH] ...`
   - Add `action === 'echo'` branch (optional but useful) that:
     - validates incoming payload sizes (image length, ingredients length) and returns them, without calling AI.
   - Ensure all responses include CORS + `Content-Type: application/json`.

Why: If health/echo still returns 503, the problem is not “prompting” or parsing—it’s deployment/runtime. If health works but detect fails, it’s AI gateway / payload size / timeouts.

B. Surface a deterministic “Try again” UX wired to a real retry path
2. Update `src/components/ai-modules/FridgeScan.tsx`
   - Ensure there is a single retry handler used by `FridgeScanErrorState`:
     - If failure happened during `detect`, retry `analyzePhotos()`
     - If during `generate`, retry `generateMeals()`
   - Add “Health check” on entry to the scan step:
     - call `action:'health'` once when entering the photo step
     - if it fails, show error state immediately with “Try again” (prevents users from uploading then hitting a guaranteed 503).

3. Confirm `src/components/ai-modules/FridgeScanErrorState.tsx`
   - Already supports “Try Again” for 503/500/429; ensure it receives `onRetry` and `isRetrying` from FridgeScan and that clicking it actually re-invokes the failed action.

C. Fix the actual 503 root cause once the “health” fork tells us where it is
4. If `health` still 503:
   - Redeploy `fridge-scan-ai`.
   - Reduce risk of runtime boot failures by:
     - keeping imports minimal (stay on `https://esm.sh/@supabase/supabase-js@2.50.0`)
     - avoiding any top-level code that can throw
     - ensuring no unsupported Deno APIs are used
   - Add an ultra-minimal fallback handler (returning 200) temporarily to confirm the platform can run the function at all.
   - Use Supabase dashboard logs link to verify the function is booting and receiving requests.

5. If `health` works but `detect/generate` fails:
   - Treat as transient upstream (AI gateway) vs payload constraints:
     - Return 503 with `{ retryable: true, error_code: 'GATEWAY_UNAVAILABLE' }` on network/fetch failures
     - Return 413-like response (or 400 with a clear message) when payload is too large, instructing client to re-compress
   - Keep the existing retry-with-jitter for gateway fetch, but make sure retry triggers only for true transient failures (429/5xx/fetch exceptions).

D. Reliability improvements (after the service is stable)
6. Ingredient extraction: keep structured tool-calling (already present) but harden parsing:
   - Validate tool args schema; if invalid, return a clear 502/500 with `retryable: true` instead of silently returning empty ingredients.
   - Add a “minimum useful output” guard: if 0 ingredients, return `{ ingredients: [], warning: 'NO_INGREDIENTS_DETECTED' }` so the UI can prompt the user to retake photo with better lighting/angle.

7. Two-photo support confirmation
- Your UI already supports `photoPreview` + `pantryPreview` and calls the function twice (once per photo). After we restore baseline function availability, we can add a small UI hint (“Add pantry photo (optional)”) and confirm both previews can be set in both web + Capacitor (file input differences can make this feel broken).

Definition of done
- `action:'health'` returns 200 consistently in web + native.
- A scan produces ingredients at least some of the time; when it fails, the UI always gives a “Try again” button that actually retries.
- No more “offline:true” errors while the device is online; 503 errors include clear retryable messaging and logs show the request reaching the function.

Key files involved
- `supabase/functions/fridge-scan-ai/index.ts`
- `src/components/ai-modules/FridgeScan.tsx`
- `src/components/ai-modules/FridgeScanErrorState.tsx`
- `supabase/config.toml` (already has verify_jwt=false for fridge-scan-ai)

Relevant dashboard links (for you to quickly inspect after implementation)
- Edge Functions: https://supabase.com/dashboard/project/druwytttcxnfpwgyrvmt/functions
- FridgeScan logs: https://supabase.com/dashboard/project/druwytttcxnfpwgyrvmt/functions/fridge-scan-ai/logs
- Function secrets: https://supabase.com/dashboard/project/druwytttcxnfpwgyrvmt/settings/functions

