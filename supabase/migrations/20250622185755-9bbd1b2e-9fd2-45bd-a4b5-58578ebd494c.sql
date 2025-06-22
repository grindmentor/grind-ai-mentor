
-- Create usage tracking table
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  coach_gpt_queries INTEGER DEFAULT 0,
  meal_plan_generations INTEGER DEFAULT 0,
  food_log_analyses INTEGER DEFAULT 0,
  tdee_calculations INTEGER DEFAULT 0,
  habit_checks INTEGER DEFAULT 0,
  training_programs INTEGER DEFAULT 0,
  progress_analyses INTEGER DEFAULT 0,
  cut_calc_uses INTEGER DEFAULT 0,
  workout_timer_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own usage (for incrementing counters)
CREATE POLICY "Users can update own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own usage records
CREATE POLICY "Users can insert own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to get or create current month usage
CREATE OR REPLACE FUNCTION public.get_current_usage(p_user_id UUID)
RETURNS TABLE(
  coach_gpt_queries INTEGER,
  meal_plan_generations INTEGER,
  food_log_analyses INTEGER,
  tdee_calculations INTEGER,
  habit_checks INTEGER,
  training_programs INTEGER,
  progress_analyses INTEGER,
  cut_calc_uses INTEGER,
  workout_timer_sessions INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
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
    u.workout_timer_sessions
  FROM public.user_usage u
  WHERE u.user_id = p_user_id AND u.month_year = current_month;
END;
$$;
