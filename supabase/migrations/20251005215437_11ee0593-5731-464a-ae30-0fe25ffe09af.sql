-- Fix password_resets table RLS policies
-- This table appears to be unused (app uses Supabase's built-in password reset)
-- but we'll secure it properly in case it's needed in the future

-- Drop the contradictory "Deny anonymous access" policy
DROP POLICY IF EXISTS "Deny anonymous access to password_resets" ON public.password_resets;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own password resets" ON public.password_resets;
DROP POLICY IF EXISTS "Users can create password resets" ON public.password_resets;

-- Policy 1: Users can only view their own UNUSED and NON-EXPIRED tokens
-- This prevents token enumeration and limits exposure
CREATE POLICY "Users can view own unused valid tokens"
  ON public.password_resets
  FOR SELECT
  USING (
    auth.uid() = user_id 
    AND used = false 
    AND expires_at > now()
  );

-- Policy 2: Users can create password reset requests for themselves
CREATE POLICY "Users can create own password resets"
  ON public.password_resets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can mark their own tokens as used
-- This allows the token to be invalidated after use
CREATE POLICY "Users can update own tokens to used"
  ON public.password_resets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND used = true  -- Can only update to set used=true
  );

-- Policy 4: Cleanup function needs to delete expired/used tokens
-- Only the function (SECURITY DEFINER) can delete
-- No user-facing DELETE policy needed

-- Add a comment to document this table's status
COMMENT ON TABLE public.password_resets IS 'Password reset token tracking table. Note: App currently uses Supabase built-in password reset (supabase.auth.resetPasswordForEmail). This table may be unused but is secured for potential future use.';

-- Ensure the cleanup function runs periodically (manual note for admin)
-- The cleanup_expired_password_resets() function should be scheduled via pg_cron or called periodically