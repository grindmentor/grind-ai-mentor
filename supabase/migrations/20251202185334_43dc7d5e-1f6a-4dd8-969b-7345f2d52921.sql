-- Fix profiles table: Remove the conflicting ALL deny policy
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Fix password_resets: Remove user SELECT access (tokens should be validated server-side only)
DROP POLICY IF EXISTS "Users can view own unused valid tokens" ON public.password_resets;

-- Remove duplicate payment policies (keep only one)
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

-- Remove duplicate subscriber policies (keep only one)  
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;

-- Add proper support_requests SELECT policy for users to see their own requests
CREATE POLICY "Users can view own support requests"
ON public.support_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure password_resets can only be verified via server-side function
-- Create a function for secure token validation
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(p_token text, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM password_resets
    WHERE token = p_token
    AND email = p_email
    AND used = false
    AND expires_at > now()
  ) INTO v_valid;
  
  RETURN v_valid;
END;
$$;