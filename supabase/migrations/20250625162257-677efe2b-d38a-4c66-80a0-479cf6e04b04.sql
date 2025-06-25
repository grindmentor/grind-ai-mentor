
-- Enable RLS on the table
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "insert_policy" ON public.support_requests;
DROP POLICY IF EXISTS "select_policy" ON public.support_requests;
DROP POLICY IF EXISTS "allow_anonymous_insert" ON public.support_requests;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON public.support_requests;
DROP POLICY IF EXISTS "admin_select_all" ON public.support_requests;
DROP POLICY IF EXISTS "support_requests_insert_policy" ON public.support_requests;
DROP POLICY IF EXISTS "support_requests_select_policy" ON public.support_requests;

-- Create policy to allow anonymous users to insert (maintains existing functionality)
CREATE POLICY "allow_anonymous_insert" ON public.support_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "allow_authenticated_insert" ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow only you (Lucas) to select all support requests
-- First, get your UUID using your email
CREATE POLICY "admin_select_all" ON public.support_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT id FROM auth.users 
    WHERE email = 'lucasblandquist@gmail.com'
  )
);

-- Ensure proper permissions
GRANT INSERT ON public.support_requests TO anon;
GRANT INSERT, SELECT ON public.support_requests TO authenticated;
