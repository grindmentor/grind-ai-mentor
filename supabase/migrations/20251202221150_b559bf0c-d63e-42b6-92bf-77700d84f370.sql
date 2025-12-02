-- CRITICAL SECURITY FIX: Restrict password_resets table access
-- Password reset tokens should NEVER be readable by users, only by service role

-- First, drop any existing SELECT policies on password_resets
DROP POLICY IF EXISTS "Users can view own password resets" ON public.password_resets;

-- Create a policy that prevents ALL user SELECT access (only service role can read)
-- This is critical because password reset tokens should be validated server-side only
CREATE POLICY "No public select on password_resets"
ON public.password_resets
FOR SELECT
TO authenticated, anon
USING (false);

-- Also ensure service role can still manage the table for validation functions
-- Service role bypasses RLS by default, so this is just for documentation