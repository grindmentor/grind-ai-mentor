
-- Fix the search_exercises_optimized function by adding a proper search_path
CREATE OR REPLACE FUNCTION public.search_exercises_optimized(
  search_query text DEFAULT '',
  muscle_filter text[] DEFAULT NULL,
  equipment_filter text DEFAULT NULL,
  limit_count integer DEFAULT 20,
  search_user_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  primary_muscles text[],
  secondary_muscles text[],
  equipment text,
  difficulty_level text,
  category text,
  force_type text,
  mechanics text,
  movement_type text,
  is_bodyweight boolean,
  is_weighted boolean,
  technique_notes text,
  form_cues text,
  is_custom boolean,
  relevance_score double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$
