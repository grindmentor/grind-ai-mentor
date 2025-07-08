-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_food_log_entries_user_date ON food_log_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_progressive_overload_user_exercise ON progressive_overload_entries(user_id, exercise_name, workout_date);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status ON user_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, completed_date);

-- Add function for better user data retrieval
CREATE OR REPLACE FUNCTION get_user_profile_data(p_user_id UUID)
RETURNS TABLE(
  height INTEGER,
  weight INTEGER,
  age INTEGER,
  experience TEXT,
  activity TEXT,
  goal TEXT,
  display_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.height,
    p.weight,
    CASE 
      WHEN p.birthday IS NOT NULL THEN EXTRACT(YEAR FROM AGE(p.birthday))::INTEGER
      ELSE NULL
    END as age,
    p.experience,
    p.activity,
    p.goal,
    p.display_name
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;