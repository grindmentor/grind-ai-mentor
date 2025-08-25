-- Security Fix: Ensure RLS policies properly restrict access to sensitive data

-- First, ensure RLS is enabled on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies that might exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;

-- Ensure profiles table has strict RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Ensure payments table is secure (only service role and user can access)
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Ensure password_resets table is secure
DROP POLICY IF EXISTS "Users can view their own password resets" ON public.password_resets;
CREATE POLICY "Users can view their own password resets" 
ON public.password_resets 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create password resets" ON public.password_resets;
CREATE POLICY "Users can create password resets" 
ON public.password_resets 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Ensure subscribers table is secure
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
CREATE POLICY "Users can view own subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.email() = email);

-- Add explicit deny policy for anonymous users on sensitive tables
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to payments" 
ON public.payments 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to password_resets" 
ON public.password_resets 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to subscribers" 
ON public.subscribers 
FOR ALL 
TO anon 
USING (false);