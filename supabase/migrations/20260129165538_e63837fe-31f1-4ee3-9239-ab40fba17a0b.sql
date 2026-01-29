-- Fix profiles table: Add explicit denial for unauthenticated users
-- The current policies check auth.uid() = id, but we need to ensure
-- anonymous users cannot query the table at all

-- Drop existing policies to recreate with explicit auth checks
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate policies with explicit authentication requirement
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Fix customer_profiles table: Add explicit denial for unauthenticated users
DROP POLICY IF EXISTS "Users can view their own customer profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can update their own customer profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can create their own customer profile" ON public.customer_profiles;

-- Recreate policies with explicit authentication requirement
CREATE POLICY "Users can view their own customer profile" 
ON public.customer_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer profile" 
ON public.customer_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer profile" 
ON public.customer_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);