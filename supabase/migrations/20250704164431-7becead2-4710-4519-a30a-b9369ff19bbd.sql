-- Add favorite_modules column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN favorite_modules TEXT[] DEFAULT '{}';

-- Update the column to have a proper default
UPDATE public.user_preferences 
SET favorite_modules = '{}' 
WHERE favorite_modules IS NULL;