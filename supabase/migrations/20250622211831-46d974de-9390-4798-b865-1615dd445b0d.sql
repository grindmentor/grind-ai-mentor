
-- Create customer_profiles table for enhanced customer memory
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  fitness_goals TEXT,
  experience_level TEXT,
  preferred_workout_style TEXT,
  dietary_preferences TEXT,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  favorite_features TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interaction_logs table for tracking user interactions
CREATE TABLE public.interaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feature_used TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_profiles
CREATE POLICY "Users can view their own customer profile" 
  ON public.customer_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer profile" 
  ON public.customer_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer profile" 
  ON public.customer_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for interaction_logs
CREATE POLICY "Users can view their own interaction logs" 
  ON public.interaction_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interaction logs" 
  ON public.interaction_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_interaction_logs_user_id ON public.interaction_logs(user_id);
CREATE INDEX idx_interaction_logs_timestamp ON public.interaction_logs(timestamp DESC);
