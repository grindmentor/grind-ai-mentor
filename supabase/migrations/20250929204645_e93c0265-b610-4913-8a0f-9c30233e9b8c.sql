-- Add physique analysis tracking columns to user_usage table
ALTER TABLE public.user_usage 
ADD COLUMN IF NOT EXISTS physique_analyses integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_physique_analysis timestamp with time zone;