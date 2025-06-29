
-- Create the user_achievements table that's missing
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  points INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT DEFAULT 'trophy',
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for user_goals table if they don't exist
DO $$
BEGIN
  -- Check if RLS is enabled on user_goals, if not enable it
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'user_goals' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies for user_goals if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_goals' 
    AND policyname = 'Users can view their own goals'
  ) THEN
    CREATE POLICY "Users can view their own goals" ON public.user_goals
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_goals' 
    AND policyname = 'Users can insert their own goals'
  ) THEN
    CREATE POLICY "Users can insert their own goals" ON public.user_goals
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_goals' 
    AND policyname = 'Users can update their own goals'
  ) THEN
    CREATE POLICY "Users can update their own goals" ON public.user_goals
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_goals' 
    AND policyname = 'Users can delete their own goals'
  ) THEN
    CREATE POLICY "Users can delete their own goals" ON public.user_goals
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
