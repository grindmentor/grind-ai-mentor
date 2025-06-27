
-- Create exercises table with comprehensive fields
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  primary_muscles TEXT[] NOT NULL DEFAULT '{}',
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  force_type TEXT CHECK (force_type IN ('Push', 'Pull', 'Static')) DEFAULT 'Push',
  mechanics TEXT CHECK (mechanics IN ('Compound', 'Isolation')) DEFAULT 'Compound',
  gif_url TEXT,
  image_url TEXT,
  form_cues TEXT,
  muscle_bias TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  external_id TEXT, -- For tracking original source ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_exercises_name ON public.exercises USING gin(to_tsvector('english', name));
CREATE INDEX idx_exercises_primary_muscles ON public.exercises USING gin(primary_muscles);
CREATE INDEX idx_exercises_equipment ON public.exercises (equipment);
CREATE INDEX idx_exercises_category ON public.exercises (category);
CREATE INDEX idx_exercises_difficulty ON public.exercises (difficulty_level);

-- Create a search function for exercises
CREATE OR REPLACE FUNCTION search_exercises(search_query TEXT, muscle_filter TEXT[] DEFAULT NULL, equipment_filter TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 20)
RETURNS SETOF exercises
LANGUAGE plpgsql
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
$$;

-- Insert some comprehensive gym-based strength training exercises
INSERT INTO public.exercises (name, description, instructions, primary_muscles, secondary_muscles, equipment, category, difficulty_level, force_type, mechanics, form_cues) VALUES

-- Chest Exercises
('Barbell Bench Press', 'The king of chest exercises targeting the entire pectoral region', 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up explosively', '{"Chest"}', '{"Triceps", "Front Deltoids"}', 'Barbell', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep shoulder blades retracted, maintain slight arch, control the negative'),
('Dumbbell Bench Press', 'Allows for greater range of motion and unilateral training', 'Lie on bench with dumbbells, start with arms extended, lower with control, press up', '{"Chest"}', '{"Triceps", "Front Deltoids"}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Compound', 'Full range of motion, squeeze chest at top, control the weight'),
('Incline Barbell Press', 'Targets upper chest fibers specifically', 'Set bench to 30-45 degrees, grip bar, lower to upper chest, press up', '{"Upper Chest"}', '{"Front Deltoids", "Triceps"}', 'Barbell', 'Strength', 'Intermediate', 'Push', 'Compound', 'Maintain natural arch, touch bar to upper chest, drive through heels'),
('Incline Dumbbell Press', 'Upper chest development with full range of motion', 'Incline bench, dumbbells start wide, bring together at top', '{"Upper Chest"}', '{"Front Deltoids", "Triceps"}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Compound', 'Deep stretch at bottom, squeeze at top, maintain shoulder stability'),
('Chest Flyes', 'Isolation movement for chest development', 'Lie flat, arms wide with slight bend, bring dumbbells together over chest', '{"Chest"}', '{}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Isolation', 'Maintain slight elbow bend, focus on chest squeeze, control the stretch'),
('Cable Flyes', 'Constant tension chest isolation', 'Stand between cables, arms wide, bring handles together in front of chest', '{"Chest"}', '{}', 'Cable Machine', 'Strength', 'Beginner', 'Push', 'Isolation', 'Lean slightly forward, maintain tension throughout, squeeze chest hard'),
('Dips', 'Bodyweight compound movement for lower chest', 'Support body on bars, lower until stretch, press up to start', '{"Lower Chest", "Triceps"}', '{"Front Deltoids"}', 'Dip Station', 'Strength', 'Intermediate', 'Push', 'Compound', 'Lean forward for chest emphasis, full range of motion, control descent'),

-- Back Exercises
('Deadlift', 'The ultimate posterior chain exercise', 'Stand over bar, grip with hands outside legs, drive through heels and extend hips', '{"Erector Spinae", "Lats"}', '{"Glutes", "Hamstrings", "Traps", "Rhomboids"}', 'Barbell', 'Strength', 'Advanced', 'Pull', 'Compound', 'Keep bar close to body, neutral spine, drive hips forward at top'),
('Pull-ups', 'Bodyweight back width builder', 'Hang from bar, pull body up until chin over bar, lower with control', '{"Lats"}', '{"Rhomboids", "Biceps", "Rear Delts"}', 'Pull-up Bar', 'Strength', 'Intermediate', 'Pull', 'Compound', 'Full dead hang, engage lats first, avoid swinging'),
('Chin-ups', 'Bicep-emphasized pulling movement', 'Underhand grip, pull up until chin clears bar', '{"Lats", "Biceps"}', '{"Rhomboids", "Rear Delts"}', 'Pull-up Bar', 'Strength', 'Intermediate', 'Pull', 'Compound', 'Underhand grip, squeeze biceps at top, control negative'),
('Barbell Rows', 'Horizontal pulling for back thickness', 'Bend over with bar, row to lower chest/upper abdomen', '{"Lats", "Rhomboids"}', '{"Rear Delts", "Biceps"}', 'Barbell', 'Strength', 'Intermediate', 'Pull', 'Compound', 'Keep torso parallel to floor, row to body, squeeze shoulder blades'),
('Dumbbell Rows', 'Unilateral back development', 'One knee on bench, row dumbbell to hip', '{"Lats", "Rhomboids"}', '{"Rear Delts", "Biceps"}', 'Dumbbells', 'Strength', 'Beginner', 'Pull', 'Compound', 'Keep back straight, row to hip, squeeze lat at top'),
('Lat Pulldowns', 'Vertical pulling alternative to pull-ups', 'Sit at machine, pull bar to upper chest', '{"Lats"}', '{"Rhomboids", "Biceps"}', 'Cable Machine', 'Strength', 'Beginner', 'Pull', 'Compound', 'Lean back slightly, pull to chest, control the weight'),
('Cable Rows', 'Horizontal pulling with constant tension', 'Sit at cable machine, pull handle to abdomen', '{"Lats", "Rhomboids"}', '{"Rear Delts", "Biceps"}', 'Cable Machine', 'Strength', 'Beginner', 'Pull', 'Compound', 'Keep chest up, pull to abdomen, squeeze shoulder blades together'),
('T-Bar Rows', 'Thick bar rowing for back mass', 'Straddle T-bar, bend over, row weight to chest', '{"Lats", "Rhomboids"}', '{"Rear Delts", "Biceps"}', 'T-Bar', 'Strength', 'Intermediate', 'Pull', 'Compound', 'Keep chest up, row to sternum, squeeze back muscles'),

-- Leg Exercises
('Back Squat', 'The king of leg exercises', 'Bar on traps, squat down until thighs parallel, drive up through heels', '{"Quadriceps", "Glutes"}', '{"Hamstrings", "Calves"}', 'Barbell', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep chest up, knees track over toes, drive through heels'),
('Front Squat', 'Quad-dominant squat variation', 'Bar racked on front deltoids, squat down keeping torso upright', '{"Quadriceps"}', '{"Glutes", "Core"}', 'Barbell', 'Strength', 'Advanced', 'Push', 'Compound', 'Keep elbows high, stay upright, drive knees out'),
('Romanian Deadlift', 'Hip hinge movement for hamstrings', 'Bar starts at hips, push hips back, lower bar along legs', '{"Hamstrings", "Glutes"}', '{"Erector Spinae"}', 'Barbell', 'Strength', 'Intermediate', 'Pull', 'Compound', 'Keep bar close, push hips back, feel stretch in hamstrings'),
('Bulgarian Split Squats', 'Unilateral leg strength builder', 'Rear foot elevated, lunge down on front leg', '{"Quadriceps", "Glutes"}', '{"Hamstrings"}', 'Dumbbells', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep torso upright, drive through front heel, full range of motion'),
('Leg Press', 'Machine-based quad development', 'Sit in machine, press weight up with legs', '{"Quadriceps", "Glutes"}', '{"Hamstrings"}', 'Leg Press Machine', 'Strength', 'Beginner', 'Push', 'Compound', 'Full range of motion, control the negative, drive through heels'),
('Leg Curls', 'Hamstring isolation', 'Lie prone, curl heels toward glutes', '{"Hamstrings"}', '{}', 'Leg Curl Machine', 'Strength', 'Beginner', 'Pull', 'Isolation', 'Control both directions, squeeze hamstrings at top, full range'),
('Leg Extensions', 'Quadriceps isolation', 'Sit in machine, extend legs straight', '{"Quadriceps"}', '{}', 'Leg Extension Machine', 'Strength', 'Beginner', 'Push', 'Isolation', 'Control the weight, squeeze quads at top, avoid locking knees hard'),
('Walking Lunges', 'Functional leg movement', 'Step forward into lunge, alternate legs walking forward', '{"Quadriceps", "Glutes"}', '{"Hamstrings", "Calves"}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Compound', 'Keep torso upright, step far enough forward, drive through front heel'),

-- Shoulder Exercises
('Overhead Press', 'Primary shoulder mass builder', 'Bar at shoulder level, press straight up overhead', '{"Shoulders"}', '{"Triceps", "Core"}', 'Barbell', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep core tight, press straight up, lock out overhead'),
('Dumbbell Shoulder Press', 'Unilateral shoulder development', 'Dumbbells at shoulder level, press up and slightly back', '{"Shoulders"}', '{"Triceps"}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Compound', 'Keep core engaged, full range of motion, control descent'),
('Lateral Raises', 'Side deltoid isolation', 'Arms at sides, raise dumbbells out to sides to shoulder height', '{"Side Deltoids"}', '{}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Isolation', 'Slight forward lean, control the weight, pause at top'),
('Rear Delt Flyes', 'Posterior deltoid isolation', 'Bend over, arms wide, raise weights out to sides', '{"Rear Deltoids"}', '{"Rhomboids"}', 'Dumbbells', 'Strength', 'Beginner', 'Pull', 'Isolation', 'Keep chest up, squeeze shoulder blades, control movement'),
('Face Pulls', 'Rear delt and upper back', 'Pull cable to face with high elbows', '{"Rear Deltoids", "Rhomboids"}', '{}', 'Cable Machine', 'Strength', 'Beginner', 'Pull', 'Isolation', 'High elbows, pull to face, squeeze rear delts'),

-- Arm Exercises
('Barbell Curls', 'Primary bicep mass builder', 'Stand with bar, curl up using biceps', '{"Biceps"}', '{}', 'Barbell', 'Strength', 'Beginner', 'Pull', 'Isolation', 'Keep elbows stable, control negative, squeeze at top'),
('Dumbbell Curls', 'Unilateral bicep development', 'Curl dumbbells up alternating or together', '{"Biceps"}', '{}', 'Dumbbells', 'Strength', 'Beginner', 'Pull', 'Isolation', 'Keep elbows stable, full range of motion, control weight'),
('Hammer Curls', 'Bicep and forearm builder', 'Neutral grip, curl dumbbells up', '{"Biceps", "Forearms"}', '{}', 'Dumbbells', 'Strength', 'Beginner', 'Pull', 'Isolation', 'Neutral grip throughout, control movement, squeeze biceps'),
('Close-Grip Bench Press', 'Compound tricep movement', 'Narrow grip bench press, elbows close to body', '{"Triceps"}', '{"Chest", "Front Deltoids"}', 'Barbell', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep elbows tucked, control descent, full range of motion'),
('Tricep Dips', 'Bodyweight tricep builder', 'Support on bars, lower body, press back up', '{"Triceps"}', '{"Front Deltoids"}', 'Dip Station', 'Strength', 'Intermediate', 'Push', 'Compound', 'Keep torso upright, full range, control descent'),
('Tricep Pushdowns', 'Cable tricep isolation', 'Push cable attachment down using triceps', '{"Triceps"}', '{}', 'Cable Machine', 'Strength', 'Beginner', 'Push', 'Isolation', 'Keep elbows stable, full extension, control negative'),
('Overhead Tricep Extension', 'Tricep stretch and strengthening', 'Hold weight overhead, lower behind head, extend back up', '{"Triceps"}', '{}', 'Dumbbells', 'Strength', 'Beginner', 'Push', 'Isolation', 'Keep elbows stable, full stretch, control movement');

-- Enable Row Level Security (though this table will be publicly readable)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read exercises (public data)
CREATE POLICY "Everyone can view exercises" 
  ON public.exercises 
  FOR SELECT 
  TO public
  USING (is_active = true);

-- Create policy for authenticated users to suggest exercises (for future use)
CREATE POLICY "Authenticated users can suggest exercises" 
  ON public.exercises 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exercises_updated_at_trigger
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_exercises_updated_at();
