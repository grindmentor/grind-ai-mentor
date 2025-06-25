
-- Drop the existing calculate_age function first
DROP FUNCTION IF EXISTS public.calculate_age(date);

-- Update handle_updated_at function with fixed search path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Update get_current_usage function with fixed search path
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
  food_photo_analyses integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Insert record if it doesn't exist
  INSERT INTO public.user_usage (user_id, month_year)
  VALUES (p_user_id, current_month)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  -- Return current usage
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
    COALESCE(u.food_photo_analyses, 0) as food_photo_analyses
  FROM public.user_usage u
  WHERE u.user_id = p_user_id AND u.month_year = current_month;
END;
$$;

-- Update handle_new_user function with fixed search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

-- Create calculate_age function with new parameter name and fixed search path
CREATE OR REPLACE FUNCTION public.calculate_age(birthdate DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birthdate));
END;
$$ LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = '';

-- Update cleanup_expired_password_resets function with fixed search path
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_resets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.password_resets 
  WHERE expires_at < now() OR used = true;
END;
$$;
