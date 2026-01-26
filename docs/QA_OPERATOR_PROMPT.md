# Myotopia QA Operator Prompt - Critical & Buggy Areas Focus

**Test Account:** `operator.qa@myotopia.app` (premium access)
**App URL:** https://myotopia.lovable.app

---

## Priority 1: Known Buggy Areas (Test These First)

### 1. Blueprint AI Activation
- Navigate to **Blueprint AI** from dashboard
- Select any template (e.g., "Push Pull Legs – Beginner")
- Select training days and press **"Start Plan"**
- **Verify:** A toast confirmation appears saying the plan was activated
- **Verify:** Modal closes AFTER the toast is visible

### 2. Goal Creation Flow
- Navigate to **Goals** → **Create New Goal**
- Test the **date picker** - click it and verify the calendar opens and allows date selection
- Create a goal WITHOUT a deadline (deadline should be optional)
- Create a goal WITH a deadline using the date picker
- **Verify:** Both submissions succeed and goals appear on dashboard

### 3. Settings - Unit Conversion
- Go to **Settings** → **Units & Profile**
- Note the current weight/height values
- Change weight unit (kg ↔ lbs) and height unit (cm ↔ ft/in)
- **Verify:** Body metrics update with CORRECT converted values
  - Example: 92 kg should show ~203 lbs (NOT 397 lbs)
  - Example: 180 cm should show ~5'11" (NOT 28 inches)
- Change units back and verify values restore correctly

### 4. Display Name Update & AI Memory Reset Feedback
- Go to **Settings** → **Profile**
- Update display name and click save
- **Verify:** Success toast appears confirming the update
- Go to **Settings** → **Help** → **Reset AI Memory**
- Confirm the reset
- **Verify:** Success toast or clear confirmation appears

---

## Priority 2: Incomplete/Non-Functional Features

### 5. Progress Hub Metrics
- Log a workout via **Workout Logger** (add exercises, sets, complete workout)
- Log a meal via **Smart Food Log**
- Navigate to **Progress Hub**
- **Verify:** Metrics update to show logged workouts/meals (should NOT be stuck at 0)

### 6. Habit Tracker
- Navigate to **Habit Tracker**
- Attempt to add a new habit (e.g., "Drink Water", category: Health)
- **Verify:** Habit is created and appears in the list
- Toggle habit completion for today
- **Verify:** Completion persists after navigating away and back

### 7. Calculators (TDEE, CutCalc Pro, Smart Training)
- **TDEE Calculator:** 
  - Enter: Age 30, Weight 180 lbs, Height 5'10", Activity: Moderate, Goal: Maintain
  - Click Calculate
  - **Verify:** Results appear with BMR (~1800) and TDEE (~2500) values
  
- **CutCalc Pro:** 
  - Enter current weight, target weight, timeframe
  - Click Calculate
  - **Verify:** Cutting plan with calorie recommendations displays
  
- **Smart Training:** 
  - Enter preferences and click Generate
  - Wait up to 30 seconds
  - **Verify:** Training program generates (may take time, should NOT hang indefinitely)

### 8. AI Photo Analysis
- **Smart Food Log (Photo):**
  - Upload a food photo
  - **Verify:** Analysis completes with macro breakdown (not stuck on "Analyzing...")
  
- **Physique AI:**
  - Upload a body silhouette image
  - **Verify:** Analysis completes with body composition results

---

## Priority 3: Security & Data Verification

### 9. Authentication & Session
- Sign in with test account
- Refresh the page (F5)
- **Verify:** Session persists, no redirect to login
- Navigate to `/app`, `/settings`, `/progress-hub`
- **Verify:** All protected routes accessible
- Sign out
- **Verify:** Accessing `/app` redirects to login

### 10. RLS Policy Verification
- After logging in, access these pages and verify no errors:
  - Profile data in Settings
  - Goals list
  - Workout history
  - Food log entries
- **Verify:** Only YOUR data is visible

---

## Priority 4: Navigation & UX

### 11. Bottom Navigation
- On mobile view, tap each bottom nav item:
  - Home → Dashboard loads
  - Modules → Module library loads
  - Progress → Progress Hub loads
  - Settings → Settings page loads

### 12. Back Navigation
- From dashboard, enter any module (e.g., CoachGPT)
- Use back button/gesture
- **Verify:** Returns to dashboard correctly

### 13. Privacy & Terms Links
- Navigate to **Settings** → **Help**
- Click **Privacy Policy** link
- **Verify:** Privacy page renders with content
- Click **Terms of Service** link
- **Verify:** Terms page renders with content

---

## Test Report Format

For each test area, report:

| Test | Status | Notes |
|------|--------|-------|
| Blueprint AI Activation | ✅/❌/⚠️ | Description of result |
| Goal Creation (no deadline) | ✅/❌/⚠️ | |
| Goal Creation (with deadline) | ✅/❌/⚠️ | |
| Date Picker Opens | ✅/❌/⚠️ | |
| Unit Conversion Accuracy | ✅/❌/⚠️ | Actual values shown |
| Display Name Feedback | ✅/❌/⚠️ | |
| AI Memory Reset Feedback | ✅/❌/⚠️ | |
| Progress Hub Updates | ✅/❌/⚠️ | |
| Habit Creation | ✅/❌/⚠️ | |
| TDEE Calculator Results | ✅/❌/⚠️ | |
| CutCalc Pro Results | ✅/❌/⚠️ | |
| Smart Training Generation | ✅/❌/⚠️ | |
| Food Photo Analysis | ✅/❌/⚠️ | |
| Physique AI Analysis | ✅/❌/⚠️ | |

---

## Expected Test Duration
15-25 minutes for complete flow

## Critical Issues to Flag
- Any feature that hangs indefinitely
- Incorrect data conversions
- Missing success/error feedback
- Data not persisting after actions
- Features that produce no output
