-- =====================================================
-- SECURITY FIX 1: Restrict support-files storage bucket access
-- =====================================================

-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Allow support file access during upload" ON storage.objects;

-- Create admin-only access policy for viewing support files
CREATE POLICY "Admins can view support files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'support-files' AND public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SECURITY FIX 2: Update search_exercises_optimized to sanitize ILIKE patterns
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_exercises_optimized(
  search_query text DEFAULT ''::text,
  muscle_filter text[] DEFAULT NULL::text[],
  equipment_filter text DEFAULT NULL::text,
  limit_count integer DEFAULT 20,
  search_user_id uuid DEFAULT NULL::uuid
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
SET search_path = 'public'
AS $function$
DECLARE
  v_safe_query text;
  v_safe_equipment text;
BEGIN
  -- Input validation: limit search query length to prevent DoS
  IF length(search_query) > 100 THEN
    RAISE EXCEPTION 'Search query too long (max 100 characters)';
  END IF;
  
  IF length(equipment_filter) > 100 THEN
    RAISE EXCEPTION 'Equipment filter too long (max 100 characters)';
  END IF;

  -- Sanitize ILIKE special characters to prevent pattern injection
  v_safe_query := replace(replace(COALESCE(search_query, ''), '%', '\%'), '_', '\_');
  v_safe_equipment := replace(replace(COALESCE(equipment_filter, ''), '%', '\%'), '_', '\_');

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
        WHEN v_safe_query = '' THEN 1.0
        WHEN e.name ILIKE '%' || v_safe_query || '%' ESCAPE '\' THEN 
          CASE WHEN e.name ILIKE v_safe_query || '%' ESCAPE '\' THEN 3.0 ELSE 2.0 END
        WHEN EXISTS (
          SELECT 1 FROM unnest(e.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        ) THEN 2.5
        WHEN e.equipment ILIKE '%' || v_safe_query || '%' ESCAPE '\' THEN 1.5
        ELSE 1.0
      END as relevance_score
    FROM public.exercises e
    WHERE 
      e.is_active = true
      AND (
        v_safe_query = '' 
        OR e.name ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        OR e.equipment ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        OR EXISTS (
          SELECT 1 FROM unnest(e.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        )
        OR EXISTS (
          SELECT 1 FROM unnest(e.secondary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        )
      )
      AND (
        muscle_filter IS NULL 
        OR e.primary_muscles && muscle_filter 
        OR e.secondary_muscles && muscle_filter
      )
      AND (
        equipment_filter IS NULL 
        OR e.equipment ILIKE '%' || v_safe_equipment || '%' ESCAPE '\'
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
        WHEN v_safe_query = '' THEN 1.0
        WHEN uce.name ILIKE '%' || v_safe_query || '%' ESCAPE '\' THEN
          CASE WHEN uce.name ILIKE v_safe_query || '%' ESCAPE '\' THEN 3.0 ELSE 2.0 END
        WHEN EXISTS (
          SELECT 1 FROM unnest(uce.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        ) THEN 2.5
        WHEN uce.equipment ILIKE '%' || v_safe_query || '%' ESCAPE '\' THEN 1.5
        ELSE 1.0
      END as relevance_score
    FROM public.user_custom_exercises uce
    WHERE 
      search_user_id IS NOT NULL
      AND uce.user_id = search_user_id
      AND (
        v_safe_query = '' 
        OR uce.name ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        OR uce.equipment ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        OR EXISTS (
          SELECT 1 FROM unnest(uce.primary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        )
        OR EXISTS (
          SELECT 1 FROM unnest(uce.secondary_muscles) AS muscle 
          WHERE muscle ILIKE '%' || v_safe_query || '%' ESCAPE '\'
        )
      )
      AND (
        muscle_filter IS NULL 
        OR uce.primary_muscles && muscle_filter 
        OR uce.secondary_muscles && muscle_filter
      )
      AND (
        equipment_filter IS NULL 
        OR uce.equipment ILIKE '%' || v_safe_equipment || '%' ESCAPE '\'
      )
  )
  SELECT * FROM (
    SELECT * FROM custom_exercises
    UNION ALL
    SELECT * FROM global_exercises
  ) combined
  ORDER BY 
    relevance_score DESC,
    is_custom DESC,
    combined.name ASC
  LIMIT limit_count;
END;
$function$;