
-- Add unlimited_usage role for test users (previewtest and operator.qa)
-- This grants them infinite AI prompt requests for testing purposes

-- Insert unlimited_usage role for previewtest (analyzed71@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('2fbc4cf5-7a9e-47a7-bd4f-dda3e76e2588', 'unlimited_usage')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert unlimited_usage role for operator.qa@myotopia.app
INSERT INTO public.user_roles (user_id, role)
VALUES ('adf931cb-948a-4eb5-acec-35696ff9307e', 'unlimited_usage')
ON CONFLICT (user_id, role) DO NOTHING;
