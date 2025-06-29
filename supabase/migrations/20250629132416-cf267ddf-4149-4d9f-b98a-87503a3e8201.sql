
-- Create available_achievements table for displaying achievements on the front page
CREATE TABLE IF NOT EXISTS public.available_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  points INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT DEFAULT 'target',
  unlock_criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on available_achievements
ALTER TABLE public.available_achievements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read available achievements (public data)
CREATE POLICY "Anyone can view available achievements" 
  ON public.available_achievements 
  FOR SELECT 
  USING (is_active = true);

-- Insert some sample achievements
INSERT INTO public.available_achievements (title, description, category, points, icon_name, unlock_criteria) VALUES
('First Workout', 'Complete your first workout session', 'Training', 10, 'dumbbell', '{"workouts": 1}'),
('Consistency King', 'Log workouts for 7 consecutive days', 'Training', 50, 'calendar-check', '{"consecutive_days": 7}'),
('Food Logger', 'Log your first meal in Smart Food Log', 'Nutrition', 10, 'apple', '{"meals_logged": 1}'),
('Macro Master', 'Track macros for 30 days', 'Nutrition', 100, 'target', '{"days_tracked": 30}'),
('Progress Photographer', 'Upload your first progress photo', 'Progress', 15, 'camera', '{"photos_uploaded": 1}'),
('Goal Setter', 'Set your first fitness goal', 'Goals', 20, 'target', '{"goals_set": 1}');
