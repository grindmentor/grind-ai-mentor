
-- Update the select policy for support_requests to allow authenticated users to view their own requests
DROP POLICY IF EXISTS "support_requests_select_policy" ON public.support_requests;

-- Create a new policy that allows authenticated users to view their own support requests
-- We need to add a user_id column first if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'support_requests' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.support_requests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create the new select policy
CREATE POLICY "support_requests_select_policy" 
  ON public.support_requests 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Update the insert policy to set user_id for authenticated users
DROP POLICY IF EXISTS "support_requests_insert_policy" ON public.support_requests;

CREATE POLICY "support_requests_insert_policy" 
  ON public.support_requests 
  FOR INSERT 
  WITH CHECK (
    -- Allow anonymous users (user_id can be null)
    (auth.uid() IS NULL AND user_id IS NULL) OR 
    -- Allow authenticated users (user_id must match authenticated user)
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );
