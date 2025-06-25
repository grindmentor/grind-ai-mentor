
-- Add missing columns to profiles table for enhanced user data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS injuries text,
ADD COLUMN IF NOT EXISTS dietary_preferences text,
ADD COLUMN IF NOT EXISTS preferred_workout_style text,
ADD COLUMN IF NOT EXISTS body_fat_percentage numeric;
