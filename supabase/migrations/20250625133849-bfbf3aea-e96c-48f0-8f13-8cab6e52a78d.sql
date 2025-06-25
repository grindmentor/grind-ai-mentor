
-- First, let's completely reset the RLS policies for support_requests
-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow public support request submissions" ON public.support_requests;
DROP POLICY IF EXISTS "Allow support request submissions" ON public.support_requests;
DROP POLICY IF EXISTS "Block read access to support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Block all access to support requests" ON public.support_requests;

-- Disable RLS temporarily to test if that's the issue
ALTER TABLE public.support_requests DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with the correct policies
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create a simple, permissive INSERT policy for anonymous users
CREATE POLICY "support_requests_insert_policy" 
  ON public.support_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Block all SELECT operations to keep data private
CREATE POLICY "support_requests_select_policy" 
  ON public.support_requests 
  FOR SELECT 
  USING (false);

-- Grant necessary permissions to anonymous role
GRANT INSERT ON public.support_requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;
