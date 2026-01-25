# Myotopia QA Operator Test Prompt

## Test Account
- **Email:** operator.qa@myotopia.app
- **Password:** [Use the configured test password]
- **Role:** Premium (permanent)

## Test URL
- **Preview:** https://id-preview--81218661-24ca-47f1-bdc1-0449f8b1af91.lovable.app
- **Production:** https://myotopia.lovable.app

---

## Pre-Test Setup
1. Navigate to the app URL
2. Verify the landing page loads without errors
3. Check browser console for any critical errors

---

## Test Suite 1: Authentication Flow

### 1.1 Sign In
1. Click "Sign In" or navigate to `/signin`
2. Enter test credentials
3. Click "Sign In" button
4. **Expected:** Redirect to `/app` dashboard within 3 seconds
5. **Verify:** User avatar/name appears in header

### 1.2 Session Persistence
1. After successful login, refresh the page (F5)
2. **Expected:** User remains logged in, no redirect to signin
3. Navigate to different modules and return to dashboard
4. **Expected:** Session maintained throughout

### 1.3 Protected Routes
1. While logged out, navigate directly to `/app`
2. **Expected:** Redirect to `/signin`
3. Navigate to `/settings`
4. **Expected:** Redirect to `/signin`

### 1.4 Sign Out
1. While logged in, click profile/settings
2. Click "Sign Out" button
3. **Expected:** Redirect to `/` (landing page)
4. **Verify:** Attempting to access `/app` redirects to signin

---

## Test Suite 2: Core Module Access (Premium Features)

### 2.1 Dashboard Access
1. Login and navigate to `/app`
2. **Expected:** Dashboard loads with module grid
3. **Verify:** All module cards are visible and clickable

### 2.2 CoachGPT (AI Module)
1. Click on "CoachGPT" module
2. **Expected:** Chat interface loads
3. Type a test message: "What's a good warmup routine?"
4. **Expected:** AI response within 30 seconds
5. **Verify:** No authentication errors in response

### 2.3 Workout Logger
1. Navigate to Workout Logger module
2. Click "Start Workout" or equivalent
3. Add an exercise (search for "Bench Press")
4. **Expected:** Exercise appears in workout
5. Add sets with weight/reps
6. **Expected:** Data saves without errors

### 2.4 Food Photo AI (Premium)
1. Navigate to Smart Food Log or Food Photo module
2. **Expected:** Photo upload interface available
3. **Verify:** Premium user sees no usage limit warnings

### 2.5 TDEE Calculator
1. Navigate to TDEE Calculator
2. Enter test values: Age 30, Weight 180lbs, Height 5'10", Activity: Moderate
3. Click Calculate
4. **Expected:** Results display BMR and TDEE values
5. **Verify:** Results are numeric and reasonable (BMR ~1800, TDEE ~2500)

### 2.6 Blueprint AI (Training Plans)
1. Navigate to Blueprint AI
2. View available templates
3. Select any template
4. **Expected:** Template details load
5. **Verify:** "Follow Plan" button is accessible

---

## Test Suite 3: Profile & Settings

### 3.1 Profile Data
1. Navigate to `/settings`
2. **Expected:** Settings page loads with user data
3. **Verify:** Display name, email shown correctly

### 3.2 Unit Preferences
1. In Settings, find unit preferences
2. Toggle weight unit (lbs ↔ kg)
3. **Expected:** Unit changes persist after page refresh
4. Toggle height unit (ft-in ↔ cm)
5. **Expected:** Height displays in selected unit

### 3.3 Profile Metrics Update
1. Edit weight value
2. Save changes
3. **Expected:** Success toast appears
4. Refresh page
5. **Verify:** Updated value persists

---

## Test Suite 4: Goals & Progress

### 4.1 Create Goal
1. Navigate to Goals section (from Dashboard or Settings)
2. Click "Create Goal" or "+"
3. Enter: Title "Test Goal", Category "Strength", Target 100, Unit "lbs"
4. Save goal
5. **Expected:** Goal appears in goals list immediately
6. **Verify:** No page refresh required

### 4.2 Log Progress
1. Select the created test goal
2. Click "Log Progress"
3. Enter value: 25
4. Save
5. **Expected:** Progress bar updates to 25%
6. **Verify:** Progress persists after refresh

### 4.3 Delete Goal
1. Find the test goal
2. Delete it
3. **Expected:** Goal removed from list
4. **Verify:** Deletion persists after refresh

---

## Test Suite 5: Navigation & UX

### 5.1 Bottom Navigation (Mobile)
1. Resize browser to mobile width (<768px)
2. **Expected:** Bottom tab bar appears
3. Tap each tab (Home, Modules, Progress, Settings)
4. **Expected:** Each navigates to correct section

### 5.2 Back Navigation
1. From Dashboard, open any module
2. Click back button
3. **Expected:** Return to Dashboard
4. **Verify:** No broken navigation loops

### 5.3 Module Library
1. Navigate to Module Library
2. **Verify:** All modules display with icons
3. Click any module card
4. **Expected:** Module opens correctly
5. Use back button
6. **Expected:** Return to library

---

## Test Suite 6: Data Security Verification

### 6.1 Cross-User Data Isolation
1. Create a workout session with unique name "QA-Test-Session-[timestamp]"
2. Log out
3. Log in with different account (if available)
4. Navigate to workout history
5. **Expected:** QA test session NOT visible to other users

### 6.2 RLS Policy Verification
1. Open browser DevTools → Network tab
2. Perform any data fetch (load goals, workouts, etc.)
3. **Expected:** Only user's own data returned
4. **Verify:** No other user IDs visible in responses

### 6.3 API Authentication
1. Open DevTools → Network tab
2. Trigger an AI request (CoachGPT message)
3. Inspect request headers
4. **Expected:** Authorization header present with Bearer token
5. **Verify:** No API keys exposed in client requests

---

## Test Suite 7: Error Handling

### 7.1 Network Error Recovery
1. Open DevTools → Network tab
2. Throttle to "Offline"
3. Attempt to load data
4. **Expected:** Graceful error message, no crashes
5. Restore network
6. **Expected:** App recovers without refresh

### 7.2 Invalid Input Handling
1. In TDEE Calculator, enter negative weight
2. **Expected:** Validation error shown
3. In goal creation, submit with empty title
4. **Expected:** Validation error, form not submitted

---

## Test Suite 8: Performance

### 8.1 Initial Load
1. Clear cache and reload app
2. **Expected:** Landing page loads < 3 seconds
3. Login and navigate to dashboard
4. **Expected:** Dashboard renders < 2 seconds

### 8.2 Module Loading
1. Open any AI module
2. **Expected:** Module interface loads < 1.5 seconds
3. **Verify:** Loading skeleton shown during fetch

---

## Post-Test Cleanup

1. Delete any test goals created during testing
2. Delete any test workout sessions
3. Sign out of test account

---

## Pass/Fail Criteria

- **PASS:** All expected behaviors occur, no console errors, no crashes
- **FAIL:** Any authentication bypass, data leakage, or critical error

---

## Security-Specific Checks (Post-Update)

### Updated Dependencies Verification
1. No vulnerabilities in react-router-dom navigation
2. DOMPurify sanitization working (no XSS in rendered content)
3. Capacitor CLI updates don't break mobile builds

### RLS Verification Points
- profiles table: Only own profile accessible
- customer_profiles: Only own data accessible  
- password_resets: Tokens never exposed to client
- user_roles: Premium status correctly enforced

### Manual Dashboard Check Required
- [ ] Supabase Dashboard → Authentication → Policies → "Leaked Password Protection" ENABLED
