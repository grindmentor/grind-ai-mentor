-- Create storage buckets for physique photos and progress tracking
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('physique-photos', 'physique-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('progress-photos', 'progress-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('food-photos', 'food-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]);

-- Create RLS policies for physique photos bucket
CREATE POLICY "Users can upload their own physique photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'physique-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own physique photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'physique-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own physique photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'physique-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own physique photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'physique-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for progress photos bucket
CREATE POLICY "Users can upload their own progress photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own progress photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own progress photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for food photos bucket
CREATE POLICY "Users can upload their own food photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own food photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own food photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);