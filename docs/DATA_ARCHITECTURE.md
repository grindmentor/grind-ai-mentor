# Data Architecture: Single Source of Truth

This document describes the canonical data sources for user information in Myotopia.

## Canonical Sources

### 1. `PreferencesContext` (`src/contexts/PreferencesContext.tsx`)
**Purpose**: Unit preferences and app settings

**Data**:
- `weight_unit`: 'kg' | 'lbs'
- `height_unit`: 'cm' | 'ft-in' | 'in'
- `notifications`: boolean
- `email_updates`: boolean
- `dark_mode`: boolean

**Database Table**: `user_preferences`

**Storage Format**: User's chosen units (no conversion)

### 2. `UserDataContext` (`src/contexts/UserDataContext.tsx`)
**Purpose**: Profile metrics and fitness data

**Data**:
- `weight`: number (stored in kg, converted to display units)
- `height`: number (stored in cm, converted to display units)
- `age`: calculated from `birthday`
- `birthday`: string (YYYY-MM-DD)
- `experience`, `activity`, `goal`: fitness profile
- `tdee`, `bodyFatPercentage`: calculated values

**Database Table**: `profiles`

**Storage Format**: Always kg/cm in database. Display conversion happens in the context.

## Deprecated Hooks (Wrappers)

These hooks are maintained for backward compatibility but delegate to canonical sources:

- `useUserUnits` → delegates to `usePreferences`
- `useUnitsPreference` → delegates to `usePreferences`  
- `useDataPersistence` → delegates to `useUserData`
- `useSmartUserData` → aggregates from contexts, no independent fetching
- `useEnhancedCustomerMemory` → aggregates from contexts + additional tables

## Unit Conversion Rules

### Database Storage
- **Weight**: Always stored in **kg** (integer)
- **Height**: Always stored in **cm** (integer)
- **Birthday**: Always stored as **date** (YYYY-MM-DD)

### Display Conversion
- When user preference is `lbs`: multiply kg × 2.20462
- When user preference is `ft-in` or `in`: divide cm ÷ 2.54 to get inches

### Input Conversion
- When user inputs `lbs`: divide by 2.20462 before storing
- When user inputs inches: multiply by 2.54 before storing

## Key Rules for Developers

1. **Never fetch user profile/preferences independently** - always use the contexts
2. **Never hardcode unit strings** ('lbs', 'kg') - always read from `preferences`
3. **Always convert before display** if the value came from database storage
4. **Always convert before storage** if the value came from user input

## Components Following This Pattern

- `ProfileMetrics.tsx` - Full storage/display conversion pattern
- `TDEECalculator.tsx` - Uses `useUnitsPreference` (delegated to PreferencesContext)
- `CutCalcPro.tsx` - Uses `useUnitsPreference`
- `ProgressHub.tsx` - Converts weight from DB using preferences
- `PersonalizedSummary.tsx` - Converts weight from DB using preferences
- `useCoachMemory.ts` - Formats context with correct units
