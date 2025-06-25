
-- Update the RLS policy to allow anyone to submit support requests
-- This is safe because it's a contact form that should be publicly accessible
DROP POLICY IF EXISTS "Allow support request submissions" ON public.support_requests;

-- Create a more permissive policy for support request submissions
CREATE POLICY "Allow public support request submissions" 
  ON public.support_requests 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Ensure the table is accessible for insertions by anonymous users
-- Keep read access restricted for privacy
CREATE POLICY "Block read access to support requests" 
  ON public.support_requests 
  FOR SELECT 
  TO public
  USING (false);
