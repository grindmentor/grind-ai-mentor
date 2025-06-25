
-- Let's check the current state and completely disable RLS for this table
-- This is a support form that should be publicly accessible
ALTER TABLE public.support_requests DISABLE ROW LEVEL SECURITY;

-- Also ensure the anon role has the necessary permissions
GRANT INSERT ON public.support_requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Verify table permissions
GRANT INSERT ON public.support_requests TO public;
