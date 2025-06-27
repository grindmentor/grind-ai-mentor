
-- First, let's add the missing columns to the existing exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS movement_type TEXT,
ADD COLUMN IF NOT EXISTS is_bodyweight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_weighted BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS technique_notes TEXT;

-- Update existing exercises to have proper values
UPDATE public.exercises SET 
  is_bodyweight = CASE 
    WHEN equipment = 'None' OR equipment = 'Body Only' THEN true 
    ELSE false 
  END,
  is_weighted = CASE 
    WHEN equipment = 'None' OR equipment = 'Body Only' THEN false 
    ELSE true 
  END
WHERE is_bodyweight IS NULL OR is_weighted IS NULL;

-- Create user custom exercises table
CREATE TABLE IF NOT EXISTS public.user_custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  primary_muscles TEXT[] NOT NULL DEFAULT '{}',
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'Beginner',
  category TEXT NOT NULL DEFAULT 'Strength',
  force_type TEXT,
  mechanics TEXT,
  movement_type TEXT,
  is_bodyweight BOOLEAN DEFAULT false,
  is_weighted BOOLEAN DEFAULT true,
  technique_notes TEXT,
  form_cues TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user custom exercises
ALTER TABLE public.user_custom_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own custom exercises" ON public.user_custom_exercises;
DROP POLICY IF EXISTS "Users can create their own custom exercises" ON public.user_custom_exercises;
DROP POLICY IF EXISTS "Users can update their own custom exercises" ON public.user_custom_exercises;
DROP POLICY IF EXISTS "Users can delete their own custom exercises" ON public.user_custom_exercises;

CREATE POLICY "Users can view their own custom exercises" 
  ON public.user_custom_exercises 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom exercises" 
  ON public.user_custom_exercises 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom exercises" 
  ON public.user_custom_exercises 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom exercises" 
  ON public.user_custom_exercises 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS user_custom_exercises_search_idx ON public.user_custom_exercises USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS user_custom_exercises_user_idx ON public.user_custom_exercises (user_id);

-- Create optimized search function for exercises
CREATE OR REPLACE FUNCTION public.search_exercises_optimized(
  search_query TEXT DEFAULT '',
  muscle_filter TEXT[] DEFAULT NULL,
  equipment_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  search_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  primary_muscles TEXT[],
  secondary_muscles TEXT[],
  equipment TEXT,
  difficulty_level TEXT,
  category TEXT,
  force_type TEXT,
  mechanics TEXT,
  movement_type TEXT,
  is_bodyweight BOOLEAN,
  is_weighted BOOLEAN,
  technique_notes TEXT,
  form_cues TEXT,
  is_custom BOOLEAN,
  relevance_score FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH global_exercises AS (
    SELECT 
      e.id,
      e.name,
      e.description,
      e.primary_muscles,
      e.secondary_muscles,
      e.equipment,
      e.difficulty_level,
      e.category,
      e.force_type,
      e.mechanics,
      e.movement_type,
      e.is_bodyweight,
      e.is_weighted,
      e.technique_notes,
      e.form_cues,
      false as is_custom,
      CASE 
        WHEN search_query = '' THEN 1.0
        WHEN e.name ILIKE search_query || '%' THEN 3.0
        WHEN e.name ILIKE '%' || search_query || '%' THEN 2.0
        WHEN EXISTS (
          SELECT 1 FROM unnest(e.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        ) THEN 2.5
        WHEN e.equipment ILIKE '%' || search_query || '%' THEN 1.5
        ELSE 1.0
      END as relevance_score
    FROM public.exercises e
    WHERE 
      e.is_active = true
      AND (
        search_query = '' 
        OR e.name ILIKE '%' || search_query || '%'
        OR e.equipment ILIKE '%' || search_query || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(e.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        )
        OR EXISTS (
          SELECT 1 FROM unnest(e.secondary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        )
      )
      AND (
        muscle_filter IS NULL 
        OR e.primary_muscles && muscle_filter 
        OR e.secondary_muscles && muscle_filter
      )
      AND (
        equipment_filter IS NULL 
        OR e.equipment ILIKE '%' || equipment_filter || '%'
      )
  ),
  custom_exercises AS (
    SELECT 
      uce.id,
      uce.name,
      uce.description,
      uce.primary_muscles,
      uce.secondary_muscles,
      uce.equipment,
      uce.difficulty_level,
      uce.category,
      uce.force_type,
      uce.mechanics,
      uce.movement_type,
      uce.is_bodyweight,
      uce.is_weighted,
      uce.technique_notes,
      uce.form_cues,
      true as is_custom,
      CASE 
        WHEN search_query = '' THEN 1.0
        WHEN uce.name ILIKE search_query || '%' THEN 3.0
        WHEN uce.name ILIKE '%' || search_query || '%' THEN 2.0
        WHEN EXISTS (
          SELECT 1 FROM unnest(uce.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        ) THEN 2.5
        WHEN uce.equipment ILIKE '%' || search_query || '%' THEN 1.5
        ELSE 1.0
      END as relevance_score
    FROM public.user_custom_exercises uce
    WHERE 
      search_user_id IS NOT NULL
      AND uce.user_id = search_user_id
      AND (
        search_query = '' 
        OR uce.name ILIKE '%' || search_query || '%'
        OR uce.equipment ILIKE '%' || search_query || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uce.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        )
        OR EXISTS (
          SELECT 1 FROM unnest(uce.secondary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || search_query || '%'
        )
      )
      AND (
        muscle_filter IS NULL 
        OR uce.primary_muscles && muscle_filter 
        OR uce.secondary_muscles && muscle_filter
      )
      AND (
        equipment_filter IS NULL 
        OR uce.equipment ILIKE '%' || equipment_filter || '%'
      )
  )
  SELECT * FROM (
    SELECT * FROM custom_exercises
    UNION ALL
    SELECT * FROM global_exercises
  ) combined
  ORDER BY 
    relevance_score DESC,
    is_custom DESC, -- Custom exercises first
    name ASC
  LIMIT limit_count;
END;
$$;
