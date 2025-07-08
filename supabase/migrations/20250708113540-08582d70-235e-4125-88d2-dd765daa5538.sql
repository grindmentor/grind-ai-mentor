-- Add age restriction fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;

-- Create function to verify age restriction (18+)
CREATE OR REPLACE FUNCTION public.verify_user_age(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_age INTEGER;
BEGIN
  SELECT EXTRACT(YEAR FROM AGE(date_of_birth)) 
  INTO user_age
  FROM public.profiles 
  WHERE id = p_user_id;
  
  RETURN COALESCE(user_age, 0) >= 18;
END;
$$;

-- Update user_usage table to track photo uploads
ALTER TABLE public.user_usage
ADD COLUMN IF NOT EXISTS photo_uploads INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified ON public.profiles(age_verified);

-- Update get_current_usage function to include photo uploads
CREATE OR REPLACE FUNCTION public.get_current_usage(p_user_id uuid)
RETURNS TABLE(
  coach_gpt_queries integer, 
  meal_plan_generations integer, 
  food_log_analyses integer, 
  tdee_calculations integer, 
  habit_checks integer, 
  training_programs integer, 
  progress_analyses integer, 
  cut_calc_uses integer, 
  workout_timer_sessions integer, 
  food_photo_analyses integer,
  photo_uploads integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  INSERT INTO public.user_usage (user_id, month_year)
  VALUES (p_user_id, current_month)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN QUERY
  SELECT 
    u.coach_gpt_queries,
    u.meal_plan_generations,
    u.food_log_analyses,
    u.tdee_calculations,
    u.habit_checks,
    u.training_programs,
    u.progress_analyses,
    u.cut_calc_uses,
    u.workout_timer_sessions,
    COALESCE(u.food_photo_analyses, 0) as food_photo_analyses,
    COALESCE(u.photo_uploads, 0) as photo_uploads
  FROM public.user_usage u
  WHERE u.user_id = p_user_id AND u.month_year = current_month;
END;
$$;