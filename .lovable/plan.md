

## Fix Button Alignment: Progress Hub & Module Library

### Problem
The "Module Library" button appears visually shifted to the right compared to "Progress Hub" on the dashboard. This is caused by the asymmetric `shadow-lg` class which creates shadows that extend below and to the right of the button.

### Root Cause
The Module Library button has `shadow-lg shadow-violet-500/20` which applies:
- An asymmetric box-shadow extending downward and rightward
- A visible violet tint making the offset perception more pronounced

The Progress Hub button has no shadow, creating visual inconsistency.

### Solution

**Option A (Recommended): Remove the shadow from Module Library**
This creates visual parity between both buttons and eliminates the perceived offset.

**Option B: Add matching shadow to Progress Hub**
Both buttons would have shadows, but this adds visual weight to the section.

**Option C: Use a symmetric/centered shadow**
Replace `shadow-lg` with a custom centered shadow that doesn't shift visually.

### Implementation (Option A - Cleanest)

**File: `src/components/Dashboard.tsx`**

Remove `shadow-lg shadow-violet-500/20` from the Module Library button.

Before:
```tsx
className="w-full h-14 min-h-[56px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 touch-manipulation shadow-lg shadow-violet-500/20"
```

After:
```tsx
className="w-full h-14 min-h-[56px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 touch-manipulation"
```

This is a single-line change that ensures both buttons have identical box model behavior and visual alignment.

---

### Technical Details

| Property | Progress Hub | Module Library (Before) | Module Library (After) |
|----------|-------------|------------------------|------------------------|
| Width | `w-full` | `w-full` | `w-full` |
| Height | `h-14 min-h-[56px]` | `h-14 min-h-[56px]` | `h-14 min-h-[56px]` |
| Shadow | None | `shadow-lg shadow-violet-500/20` | None |
| Background | `bg-primary` | Gradient | Gradient |

---

### Verification Steps
1. View dashboard on mobile (390x844 viewport)
2. Confirm both buttons have identical left-edge alignment
3. Confirm no visual offset between buttons
4. Test button tap areas remain properly sized

