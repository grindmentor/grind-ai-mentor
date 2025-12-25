-- Fix SECURITY DEFINER function to verify auth.uid() matches parameter
CREATE OR REPLACE FUNCTION public.get_current_usage(p_user_id uuid)
 RETURNS TABLE(coach_gpt_queries integer, meal_plan_generations integer, food_log_analyses integer, tdee_calculations integer, habit_checks integer, training_programs integer, progress_analyses integer, cut_calc_uses integer, workout_timer_sessions integer, food_photo_analyses integer, photo_uploads integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_month TEXT;
BEGIN
  -- Security check: Verify the user can only access their own data
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;
  
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
$function$;