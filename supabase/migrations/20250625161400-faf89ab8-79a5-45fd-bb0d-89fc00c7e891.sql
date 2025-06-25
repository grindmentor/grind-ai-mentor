
-- First, completely reset the support_requests table policies and permissions
-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow public support request submissions" ON public.support_requests;
DROP POLICY IF EXISTS "Allow support request submissions" ON public.support_requests;
DROP POLICY IF EXISTS "Block read access to support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Block all access to support requests" ON public.support_requests;
DROP POLICY IF EXISTS "support_requests_insert_policy" ON public.support_requests;
DROP POLICY IF EXISTS "support_requests_select_policy" ON public.support_requests;

-- Ensure RLS is disabled (this allows all operations)
ALTER TABLE public.support_requests DISABLE ROW LEVEL SECURITY;

-- Grant explicit permissions to anonymous users
GRANT INSERT ON public.support_requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Also grant to authenticated users for good measure
GRANT INSERT ON public.support_requests TO authenticated;

-- Verify the table structure and permissions
-- Make user_id nullable since we want to allow anonymous submissions
ALTER TABLE public.support_requests 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment to document this decision
COMMENT ON TABLE public.support_requests IS 'Public support form - RLS disabled to allow anonymous submissions';
