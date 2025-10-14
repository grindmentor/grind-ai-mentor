-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'premium', 'free');

-- Create user_roles table for proper RBAC
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert/update/delete roles
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'premium') THEN 'premium'
    ELSE 'free'
  END
$$;

-- Fix payments table RLS policies - remove overly permissive deny policy
DROP POLICY IF EXISTS "Deny anonymous access to payments" ON public.payments;

-- Add proper payments policies
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments"
ON public.payments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix subscribers table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Deny anonymous access to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can delete subscriptions" ON public.subscribers;

-- Add proper subscribers policies
CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix support_requests admin policy to use roles instead of email
DROP POLICY IF EXISTS "admin_select_all" ON public.support_requests;

CREATE POLICY "Admins can view all support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing premium users to user_roles (the three hardcoded emails)
-- This will be executed when migration runs
DO $$
DECLARE
    admin_user_id uuid;
    premium_user_id_1 uuid;
    premium_user_id_2 uuid;
BEGIN
    -- Get user IDs for the premium users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'lucasblandquist@gmail.com';
    SELECT id INTO premium_user_id_1 FROM auth.users WHERE email = 'emilbelq@gmail.com';
    SELECT id INTO premium_user_id_2 FROM auth.users WHERE email = 'sindre@limaway.no';
    
    -- Insert roles if users exist
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'), (admin_user_id, 'premium')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    IF premium_user_id_1 IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (premium_user_id_1, 'premium')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    IF premium_user_id_2 IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (premium_user_id_2, 'premium')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;