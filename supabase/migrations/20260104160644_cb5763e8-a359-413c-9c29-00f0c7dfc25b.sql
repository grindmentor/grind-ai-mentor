-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for active workout plans (user's followed programs)
CREATE TABLE public.active_workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  template_data JSONB NOT NULL,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_week INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.active_workout_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for active_workout_plans
CREATE POLICY "Users can view their own active plans" 
ON public.active_workout_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own active plans" 
ON public.active_workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active plans" 
ON public.active_workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active plans" 
ON public.active_workout_plans FOR DELETE USING (auth.uid() = user_id);

-- Create table for scheduled workout sessions
CREATE TABLE public.scheduled_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.active_workout_plans(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  workout_data JSONB NOT NULL,
  scheduled_date DATE NOT NULL,
  original_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'rescheduled')),
  completed_session_id UUID REFERENCES public.workout_sessions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_workouts
CREATE POLICY "Users can view their own scheduled workouts" 
ON public.scheduled_workouts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled workouts" 
ON public.scheduled_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled workouts" 
ON public.scheduled_workouts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled workouts" 
ON public.scheduled_workouts FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX idx_scheduled_workouts_user_date ON public.scheduled_workouts(user_id, scheduled_date);
CREATE INDEX idx_scheduled_workouts_plan ON public.scheduled_workouts(plan_id);
CREATE INDEX idx_active_workout_plans_user ON public.active_workout_plans(user_id, is_active);

-- Create triggers
CREATE TRIGGER update_active_workout_plans_updated_at
BEFORE UPDATE ON public.active_workout_plans
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_scheduled_workouts_updated_at
BEFORE UPDATE ON public.scheduled_workouts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();