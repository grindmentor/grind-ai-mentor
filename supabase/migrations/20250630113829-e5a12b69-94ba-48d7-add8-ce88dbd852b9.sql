
-- Check if user_goals table has the right structure and add missing columns
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS goal_type text DEFAULT 'target',
ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'once',
ADD COLUMN IF NOT EXISTS tracking_unit text DEFAULT 'number';

-- Update RLS policies to ensure they work properly
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

CREATE POLICY "Users can view their own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create a table for goal progress logs
CREATE TABLE IF NOT EXISTS public.goal_progress_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goal_progress_logs
ALTER TABLE public.goal_progress_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_progress_logs
CREATE POLICY "Users can view their own goal logs" ON public.goal_progress_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal logs" ON public.goal_progress_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal logs" ON public.goal_progress_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal logs" ON public.goal_progress_logs
  FOR DELETE USING (auth.uid() = user_id);
