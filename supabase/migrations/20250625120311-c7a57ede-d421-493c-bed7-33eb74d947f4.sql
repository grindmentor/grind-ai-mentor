
-- Create support_requests table
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) to ensure only admins can access data
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that blocks all access for regular users (admin access only via dashboard)
CREATE POLICY "Block all access to support requests" 
  ON public.support_requests 
  FOR ALL 
  TO authenticated
  USING (false);

-- Create storage bucket for support request files
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-files', 'support-files', false);

-- Create storage policy for file uploads (allow authenticated users to upload)
CREATE POLICY "Allow authenticated users to upload support files"
  ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'support-files');

-- Create storage policy for file access (only allow access to own files during upload process)
CREATE POLICY "Allow users to access their own support files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'support-files');
