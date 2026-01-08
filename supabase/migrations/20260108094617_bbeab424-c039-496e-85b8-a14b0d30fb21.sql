-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create dietary_preferences table for saved allergies and preferences
CREATE TABLE public.dietary_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergies TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  preferences TEXT[] DEFAULT '{}',
  diet_type TEXT DEFAULT 'balanced',
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  setup_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own dietary preferences" 
ON public.dietary_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dietary preferences" 
ON public.dietary_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dietary preferences" 
ON public.dietary_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_dietary_preferences_updated_at
BEFORE UPDATE ON public.dietary_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create saved_recipes table
CREATE TABLE public.saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cook_time TEXT,
  protein INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  carbs INTEGER,
  fat INTEGER,
  sodium INTEGER,
  fiber INTEGER,
  sugar INTEGER,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  source TEXT DEFAULT 'fridgescan',
  meal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_recipes
CREATE POLICY "Users can view their own saved recipes" 
ON public.saved_recipes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved recipes" 
ON public.saved_recipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" 
ON public.saved_recipes 
FOR DELETE 
USING (auth.uid() = user_id);