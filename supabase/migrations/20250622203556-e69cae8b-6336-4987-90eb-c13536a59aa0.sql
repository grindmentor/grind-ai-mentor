
-- Add display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT;

-- Update the handle_new_user function to include display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Give premium subscription to lucasblandquist@gmail.com
INSERT INTO public.payments (
  user_id, 
  payment_method, 
  amount, 
  status, 
  subscription_tier,
  created_at
) 
SELECT 
  u.id,
  'admin_grant',
  1500, -- $15 in cents
  'completed',
  'Premium',
  NOW()
FROM auth.users u 
WHERE u.email = 'lucasblandquist@gmail.com'
ON CONFLICT DO NOTHING;
