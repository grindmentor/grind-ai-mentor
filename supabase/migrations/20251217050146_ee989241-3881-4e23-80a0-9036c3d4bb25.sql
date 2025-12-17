-- Fix support_requests table: Enable RLS with proper policies for anonymous insert + restricted read

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
DROP POLICY IF EXISTS "allow_anonymous_insert" ON public.support_requests;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON public.support_requests;
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.support_requests;

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to INSERT support requests
CREATE POLICY "Anyone can submit support requests" 
  ON public.support_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can view their own requests
CREATE POLICY "Users can view own support requests" 
  ON public.support_requests 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Admins can view all requests using the existing has_role function
CREATE POLICY "Admins can view all support requests" 
  ON public.support_requests 
  FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Update comment to reflect new security model
COMMENT ON TABLE public.support_requests IS 'Support requests with RLS enabled: anonymous insert allowed, read restricted to owner or admin';