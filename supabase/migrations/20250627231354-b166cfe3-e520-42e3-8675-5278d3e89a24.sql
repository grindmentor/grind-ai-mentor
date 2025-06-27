
-- Give premium access to lucasblandquist@gmail.com
UPDATE customer_profiles 
SET subscription_tier = 'premium'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'lucasblandquist@gmail.com'
);

-- If no customer profile exists, create one
INSERT INTO customer_profiles (user_id, subscription_tier, email_verification_attempts, interaction_count, last_active, created_at, updated_at, favorite_features)
SELECT 
  id,
  'premium'::text,
  0,
  0,
  now(),
  now(),
  now(),
  '{}'::text[]
FROM auth.users 
WHERE email = 'lucasblandquist@gmail.com'
AND id NOT IN (SELECT user_id FROM customer_profiles);

-- Add RLS policies for coach_conversations table (missing policies)
CREATE POLICY "Users can view own coach conversations" ON coach_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach conversations" ON coach_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for workout_sessions table (missing policies)
CREATE POLICY "Users can view own workout sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for progressive_overload_entries table (missing policies)
CREATE POLICY "Users can view own progressive overload entries" ON progressive_overload_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progressive overload entries" ON progressive_overload_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progressive overload entries" ON progressive_overload_entries
  FOR UPDATE USING (auth.uid() = user_id);
