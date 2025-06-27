
-- Update subscription tiers to make Basic a middle tier between Free and Premium
-- Update the user lucasblandquist@gmail.com to premium tier
UPDATE customer_profiles 
SET subscription_tier = 'premium' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'lucasblandquist@gmail.com'
);

-- If the user doesn't exist in customer_profiles, we'll handle it in the code
