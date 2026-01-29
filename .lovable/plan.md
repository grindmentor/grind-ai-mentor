

## Smart Food Log: AI Photo Analysis Overhaul

### Problem Summary

The Smart Food Log has several critical issues:
1. **Photo preview is zoomed/cropped** - using `object-cover` instead of `object-contain`
2. **AI returns generic "Unidentified food" fallback** - the AI gateway returns errors but code treats them as success
3. **Duplicate entries** - food is auto-saved before user confirmation
4. **Missing review flow** - no way to see detected ingredients, edit portions, or remove items before saving
5. **Two different implementations** - route uses a simpler page that lacks the better component version's features

### Root Causes

1. **Route mismatch**: `/smart-food-log` uses `src/pages/SmartFoodLog.tsx` which auto-saves foods immediately, while the better `src/components/ai-modules/SmartFoodLog.tsx` (with preview/confirm flow) isn't used
2. **Edge function tool-call failures**: The AI gateway returns HTTP 200 with `finishReason: "error"` and no tool calls, triggering generic fallback
3. **Image CSS**: `object-cover` crops images; should be `object-contain`

---

### Implementation Plan

#### Phase 1: Fix the Page Component (src/pages/SmartFoodLog.tsx)

**1.1 Fix Image Preview (Object-Contain)**
- Change line 560 from `object-cover` to `object-contain`
- Add `max-h-72` constraint and center the image
- Ensure full photo is visible, not cropped

**1.2 Add Preview/Confirm Flow**
- Add new state: `analysisResult`, `pendingAnalysis`
- After AI returns, store results in state instead of auto-saving
- Display detected ingredients with macro breakdown below the photo
- Add "Add to Log" and "Cancel" buttons

**1.3 Add Ingredient Editing**
- Each detected item shows: name, portion/grams, macros
- Allow editing portion size (grams input)
- Allow removing individual items (trash icon)
- Recalculate totals when portions change

**1.4 Add Collapsible Meal Grouping**
- Group all detected items as one "meal" with expandable ingredient list
- Display total macros for the meal
- Dropdown arrow to expand/collapse ingredient breakdown

**1.5 Handle AI Failures Gracefully**
- If `finishReason === "error"` or no foods detected, show clear error message
- Display: "Could not detect foods. Try a clearer photo or add manually."
- Offer buttons: "Try Again" (re-upload) or "Add Manually" (go to manual tab)
- Never auto-save fallback data

---

#### Phase 2: Fix Edge Function (supabase/functions/food-photo-ai/index.ts)

**2.1 Detect and Handle AI Errors**
- Check for `finishReason === "error"` explicitly
- If error, return HTTP 422 with clear error message
- Don't return fallback data as success

**2.2 Improve Tool-Call Reliability**
- Add model fallback: try `gemini-2.5-pro`, if fails try `gemini-2.5-flash`
- Log the full AI response when parsing fails for debugging

---

#### Phase 3: UI Polish

**3.1 Ingredient Preview Card Design**
- Collapsible card showing meal with total macros
- Expand to see each ingredient with individual macros
- Inline edit for portion (e.g., "150g" input field)
- Delete button per ingredient

**3.2 Error State UI**
- Friendly error message with icon
- Clear call-to-action buttons
- No confusing fallback data displayed

---

### Technical Details

#### State Changes (src/pages/SmartFoodLog.tsx)
```text
New state variables:
- analysisResult: DetectedFood[] | null
- pendingAnalysis: { foods: DetectedFood[], confidence: string } | null
- expandedMeal: boolean (for collapse/expand)
```

#### DetectedFood Interface
```text
interface DetectedFood {
  name: string;
  quantity: string;
  grams: number;      // editable
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: string;
}
```

#### analyzeFood() Changes
- Remove auto-save loop
- Store results in `setAnalysisResult()` and `setPendingAnalysis()`
- Show preview UI instead of saving

#### New Functions
- `updateIngredientGrams(index, newGrams)` - recalculates macros proportionally
- `removeIngredient(index)` - removes item from pending list
- `confirmAndSaveAll()` - saves all items to database
- `dismissAnalysis()` - clears pending state

#### Edge Function Changes
- Check `data.choices?.[0]?.finish_reason === 'error'`
- Return `{ error: "AI could not analyze this image", error_code: "ANALYSIS_FAILED", retryable: true }`
- HTTP status 422 (Unprocessable Entity) instead of 200 with fallback

---

### File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/SmartFoodLog.tsx` | Fix `object-cover` → `object-contain`; Add preview state; Add confirm flow; Add ingredient editing; Add collapsible grouping; Handle errors |
| `supabase/functions/food-photo-ai/index.ts` | Detect `finish_reason: error`; Return proper HTTP error; Remove fallback auto-save behavior |

---

### Testing Checklist

After implementation:
1. Upload a clear food photo → should show preview with detected ingredients
2. Edit portion size → macros should recalculate
3. Remove an ingredient → should update totals
4. Click "Add to Log" → all items saved to database
5. Click "Cancel" → returns to upload state, nothing saved
6. Upload blurry/unclear photo → should show error message, not fallback
7. Verify no duplicate entries appear
8. Verify image preview shows full uncropped photo

