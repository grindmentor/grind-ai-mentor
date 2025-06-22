
-- Create progressive_overload_entries table
CREATE TABLE public.progressive_overload_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  rpe INTEGER,
  notes TEXT,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.progressive_overload_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for progressive_overload_entries
CREATE POLICY "Users can view their own progressive overload entries" 
  ON public.progressive_overload_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progressive overload entries" 
  ON public.progressive_overload_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progressive overload entries" 
  ON public.progressive_overload_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progressive overload entries" 
  ON public.progressive_overload_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_progressive_overload_entries_user_id ON public.progressive_overload_entries(user_id);
CREATE INDEX idx_progressive_overload_entries_exercise ON public.progressive_overload_entries(exercise_name);
CREATE INDEX idx_progressive_overload_entries_date ON public.progressive_overload_entries(workout_date DESC);
