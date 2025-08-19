-- Fix security vulnerability: Remove overly permissive RLS policy on subscribers table
-- This policy was allowing unrestricted access to all customer data

-- Drop the problematic policy that allows ALL operations with no restrictions
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscribers;

-- Create specific policies for edge functions (using service role key)
-- These will only work when using the service role key, not for regular users

CREATE POLICY "Service role can insert subscriptions" ON public.subscribers
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions" ON public.subscribers
FOR UPDATE  
TO service_role
USING (true);

CREATE POLICY "Service role can delete subscriptions" ON public.subscribers
FOR DELETE
TO service_role
USING (true);

-- The existing "Users can view own subscription" policy is already properly restrictive
-- It only allows users to see their own subscription data