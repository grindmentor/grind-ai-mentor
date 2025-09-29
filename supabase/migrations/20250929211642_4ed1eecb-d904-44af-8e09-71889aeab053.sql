-- Drop the existing insecure policy that allows email-based access
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;

-- Create a new stricter policy that only allows user_id-based access
CREATE POLICY "Users can view own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add a comment explaining the security reasoning
COMMENT ON POLICY "Users can view own subscription" ON public.subscribers IS 
'Only allows authenticated users to view their own subscription data via user_id match. Email-based matching was removed to prevent potential exposure of billing information if email addresses are compromised.';