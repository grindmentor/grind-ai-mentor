
-- Fix the RLS policy for support_requests to allow insertions
DROP POLICY IF EXISTS "Block all access to support requests" ON public.support_requests;

-- Create a policy that allows anyone to insert support requests (since this is a contact form)
-- but still blocks read access for security
CREATE POLICY "Allow support request submissions" 
  ON public.support_requests 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Ensure the storage policies allow file uploads for support requests
DROP POLICY IF EXISTS "Allow authenticated users to upload support files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to access their own support files" ON storage.objects;

-- Create more permissive storage policies for support file uploads
CREATE POLICY "Allow support file uploads"
  ON storage.objects
  FOR INSERT 
  TO public
  WITH CHECK (bucket_id = 'support-files');

CREATE POLICY "Allow support file access during upload"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'support-files');
