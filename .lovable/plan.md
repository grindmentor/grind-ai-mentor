
# Fix FridgeScan Prompt Structure & Compression Artifacts

## Problem Analysis

### 1. Prompt Structure Issues
- Current prompt is a single block of instructions without clear phase separation
- Temperature of 0.2 is reasonable but could be 0.1 for more deterministic OCR
- No explicit two-pass strategy (OCR first, then visual)
- Missing instructions for handling partial/cut-off items

### 2. Compression Artifacts
- **Resolution too low**: 1280×1280 max → text on small labels becomes unreadable
- **Quality too aggressive**: starts at 0.75, drops to 0.45 → heavy JPEG blocking artifacts
- **JPEG output**: causes color bleeding around text edges, hurting OCR accuracy
- Target size of 800KB may be too restrictive for detailed analysis

---

## Solution

### Part 1: Enhanced Compression (Higher Quality, Better Resolution)

**File:** `src/utils/imageCompression.ts`

Update defaults and add high-quality preset:
- Increase default `maxWidth`/`maxHeight` to 2048
- Start quality at 0.92, minimum 0.80
- Keep WebP as default (better compression ratio than JPEG at same quality)
- Add explicit `highQuality` preset for FridgeScan use

**File:** `src/components/ai-modules/FridgeScan.tsx`

Adjust compression strategy:
- Increase `MAX_RAW_SIZE_KB` from 800KB to 1200KB (yields ~1.6MB base64, within 1.8MB safe limit)
- Start compression at quality 0.92 instead of 0.75
- Reduce quality in smaller steps (0.08 per attempt instead of 0.15)
- Increase max dimensions to 2048×2048 for better OCR of small text
- Use minimum 4 compression attempts instead of 3

### Part 2: Improved Prompt Structure (Two-Pass Strategy)

**File:** `supabase/functions/fridge-scan-ai/index.ts`

Rewrite the `detectPrompt` with explicit two-pass methodology:

```text
PHASE 1 - TEXT & LABELS (Primary Pass):
Scan the ENTIRE image for readable text:
- Product names on boxes, bottles, jars, bags
- Brand names and logos with text
- Nutritional labels if visible
- Expiration dates that indicate product type
- Store/deli labels on wrapped items

PHASE 2 - VISUAL IDENTIFICATION (Secondary Pass):
After text detection, identify items by visual appearance:
- Fresh produce (fruits, vegetables, herbs)
- Unpackaged proteins (raw meat, fish, eggs)
- Dairy products without visible labels
- Prepared foods in containers
- Condiments in unlabeled containers

SYSTEMATIC SCAN METHOD:
1. Start at TOP-LEFT corner, scan right across each shelf
2. Move DOWN to next shelf, repeat left-to-right scan
3. Check DOOR SHELVES separately (typically condiments, beverages)
4. Review CENTER of image for any missed items
```

Additional prompt improvements:
- Lower temperature to 0.1 for more consistent results
- Add explicit instruction: "Include ALL items, even if partially visible"
- Add instruction: "When uncertain, provide your best specific guess rather than skipping"
- Remove ambiguous confidence levels - use only "high" for text-based, "medium" for visual

### Part 3: Edge Function Updates

**File:** `supabase/functions/fridge-scan-ai/index.ts`

- Increase `MAX_BASE64_SIZE` from 1.5MB to 1.8MB to accommodate higher quality images
- Bump `FUNCTION_VERSION` to indicate prompt changes
- Increase `max_tokens` from 2000 to 2500 for longer ingredient lists

---

## Technical Details

### Compression Math
- 2048×2048 image at 0.90 quality WebP ≈ 600-900KB
- Base64 encoding adds ~33% overhead → 800KB-1.2MB
- Well within 1.8MB limit while preserving OCR-critical detail

### Prompt Temperature
- 0.1 (down from 0.2) reduces creative interpretation
- More deterministic = more consistent ingredient detection
- Lower variance in repeated scans of same image

---

## Files to Modify

1. **`src/utils/imageCompression.ts`**
   - Add `HIGH_QUALITY_OPTIONS` preset with 2048 max dimensions and 0.92 quality
   - Export for FridgeScan to use directly

2. **`src/components/ai-modules/FridgeScan.tsx`**
   - Import and use high-quality compression options
   - Increase `MAX_RAW_SIZE_KB` to 1200
   - Adjust compression loop: start at 0.92, step by 0.08, min quality 0.80

3. **`supabase/functions/fridge-scan-ai/index.ts`**
   - Rewrite `detectPrompt` with two-phase methodology
   - Lower temperature to 0.1
   - Increase `MAX_BASE64_SIZE` to 1.8MB
   - Increase `max_tokens` to 2500
   - Bump version to 2.3.0

---

## Expected Outcome

- **Better text recognition**: Higher resolution preserves small label text
- **Fewer artifacts**: Higher quality reduces JPEG blocking that confuses OCR
- **More consistent results**: Lower temperature + structured prompt = predictable output
- **More complete detection**: Two-phase approach catches both labeled and unlabeled items
