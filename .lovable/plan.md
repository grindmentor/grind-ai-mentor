
Context observed (from console + Supabase analytics)
- The UI still shows “Service Temporarily Unavailable” when trying to detect ingredients.
- Browser console shows `FunctionsHttpError: Edge Function returned a non-2xx status code` but the logged `context` is `{}` so we can’t see the HTTP status/body in the client logs.
- Supabase analytics shows recent calls to `.../functions/v1/fridge-scan-ai` returning 200 (some taking 18–49s) and some 401s. I don’t see 503s in the last window we queried, which suggests either:
  - the UI is mapping an unknown/non-2xx to the 503 card, or
  - the user’s failing requests aren’t being captured in analytics (timing/window), or
  - the request is failing before reaching the function (platform 503) in a way that the current client logging can’t reveal.

Root problem with our current diagnostics
- We still can’t see the actual HTTP status code + response body for the failing request from the web app because `supabase.functions.invoke()` throws a generic `FunctionsHttpError` and the logged error object doesn’t expose the status in enumerable fields.
- The newly added `performHealthCheck()` exists but is not actually called by `analyzePhotos()` or `generateMeals()`, so it isn’t preventing expensive/failing attempts or giving earlier clarity.
- The edge function’s `health` endpoint currently requires auth, which makes it less useful for distinguishing “function won’t boot / platform issue” from “auth/session issue”.

What I will implement next (to make the failure obvious and fixable)
1) Make health truly diagnostic (no auth required)
   - Update `supabase/functions/fridge-scan-ai/index.ts` so that:
     - `OPTIONS` stays first (CORS preflight).
     - `action === 'health'` is handled BEFORE checking the Authorization header.
       - Returns 200 JSON: `{ ok: true, function, version, ts }`
       - No userId included (since it’s unauthenticated).
     - (Optional) Keep `echo` also pre-auth but cap it:
       - Return only size metadata (image length, etc.), and reject very large payloads with a 413/400 so this endpoint can’t be abused.
   - Why: if `health` fails, the problem is deployment/runtime/platform — not the AI gateway, not parsing, not session.

2) Actually use the health check in the UI (block + guide)
   - Update `src/components/ai-modules/FridgeScan.tsx`:
     - Call `await performHealthCheck()` at the start of `analyzePhotos()` and `generateMeals()`.
     - If health fails:
       - set a dedicated error state like `{ code: 503, context: 'detect' }` (or ‘unknown’ if we prefer) and display a message like “Service unavailable (health check failed)”.
       - do not proceed to upload/AI calls.
     - Ensure the “Try Again” button:
       - re-runs `performHealthCheck()` first, then retries the last action only if health passes.

3) Capture the real HTTP status/body when `invoke()` fails (so we stop guessing)
   - Add a small “diagnostic fetch fallback” used only when `supabase.functions.invoke()` returns an error:
     - Get `session.access_token`
     - `fetch('https://druwytttcxnfpwgyrvmt.supabase.co/functions/v1/fridge-scan-ai', { method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) })`
     - Read `status` + response text (consume body), then log:
       - `status`, `responseText` (truncated), and a derived error code.
   - This will definitively tell us whether the failing response is:
     - 401 (auth header not being sent / session mismatch)
     - 413/400 (payload or image formatting)
     - 503 (AI gateway down or platform issue)
     - 5xx with a specific error string
   - This will also let us render a more accurate error card (“Session expired” vs “Service down”).

4) Align error UI with reality (no more misleading “503” when unknown)
   - Update error mapping so “Service Temporarily Unavailable” is only shown when we actually know it’s 503.
   - If the status is unknown, show the “Something went wrong” card and (in small text) “Tap to retry; if it persists, open diagnostics”.
   - Add a tiny “Details” disclosure in the error card (only in preview/dev builds) showing:
     - lastStatus, lastErrorSnippet, lastAction (“detect”/“generate”)
   - Goal: you can report exactly what’s happening without needing browser DevTools.

5) Edge-function logging improvements (so server-side tells the same story)
   - Add structured logs with a consistent prefix and key fields:
     - action, authed true/false, request sizes, upstream status, retry attempts.
   - Ensure all failure responses include a consistent JSON shape:
     - `{ error, error_code, retryable, upstream_status? }`
   - This makes client-side and server-side debugging much faster.

6) Verification steps (after changes land)
   - In preview:
     - Open `/fridge-scan`
     - Run health check automatically (should pass quickly)
     - Upload a small image and run detect
   - Confirm:
     - If it fails, the UI shows the real status and the fallback diagnostic fetch logs show the real response body.
     - Supabase analytics shows the request with the matching status code.
     - Edge function logs show `[FRIDGE-SCAN] start` and the action.

Why this will resolve the “it still doesn’t work” loop
- Right now we’re blind: we’re treating “non-2xx” as “service unavailable” without proof.
- After these changes, we’ll know in one attempt whether the issue is:
  - auth token not being attached,
  - function not reachable,
  - payload/image format rejection,
  - AI gateway transient failure,
  - or platform/runtime instability.
- Once we see the real status + body, the fix becomes straightforward (and we can implement the specific fix immediately after).

Notes / constraints
- No fabricated training/nutrition data is involved here; this is strictly infrastructure/UX reliability for the fridge scanning feature.
- We will keep security intact: detect/generate still require auth; only health (and a tightly limited echo) will be public.

Deliverables (files to change)
- `supabase/functions/fridge-scan-ai/index.ts`
- `src/components/ai-modules/FridgeScan.tsx`
- (Optional) `src/components/ai-modules/FridgeScanErrorState.tsx` for “Details” disclosure and/or more accurate wording.

Links for you (post-change verification)
- Edge Functions: https://supabase.com/dashboard/project/druwytttcxnfpwgyrvmt/functions
- FridgeScan logs: https://supabase.com/dashboard/project/druwytttcxnfpwgyrvmt/functions/fridge-scan-ai/logs
