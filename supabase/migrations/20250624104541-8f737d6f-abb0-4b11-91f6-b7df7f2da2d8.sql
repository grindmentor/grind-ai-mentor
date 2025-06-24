
-- Add password reset tracking table
CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create policies for password resets
CREATE POLICY "Users can view their own password resets" 
  ON public.password_resets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create password resets" 
  ON public.password_resets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add email verification status tracking to customer_profiles
ALTER TABLE public.customer_profiles 
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verification_attempts INTEGER DEFAULT 0;

-- Add function to clean up expired password reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_resets 
  WHERE expires_at < now() OR used = true;
END;
$$;
