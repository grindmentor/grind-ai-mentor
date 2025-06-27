
CREATE OR REPLACE FUNCTION public.search_exercises(search_query text, muscle_filter text[] DEFAULT NULL, equipment_filter text DEFAULT NULL, limit_count integer DEFAULT 20)
RETURNS SETOF exercises
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM exercises e
  WHERE 
    e.is_active = true
    AND (
      search_query IS NULL 
      OR search_query = '' 
      OR to_tsvector('english', e.name || ' ' || COALESCE(e.description, '')) @@ plainto_tsquery('english', search_query)
      OR e.name ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(e.primary_muscles) AS muscle 
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
  ORDER BY 
    CASE 
      WHEN e.name ILIKE search_query || '%' THEN 1
      WHEN e.name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    e.name
  LIMIT limit_count;
END;
$$
