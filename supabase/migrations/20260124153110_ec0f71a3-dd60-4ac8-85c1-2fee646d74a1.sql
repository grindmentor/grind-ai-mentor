-- Grant premium role to operator.qa@myotopia.app
INSERT INTO public.user_roles (user_id, role)
VALUES ('adf931cb-948a-4eb5-acec-35696ff9307e', 'premium')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add/update subscribers entry
INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed)
VALUES (
  'adf931cb-948a-4eb5-acec-35696ff9307e',
  'operator.qa@myotopia.app',
  'premium',
  true
)
ON CONFLICT (email)
DO UPDATE SET
  subscription_tier = 'premium',
  subscribed = true,
  user_id = 'adf931cb-948a-4eb5-acec-35696ff9307e';