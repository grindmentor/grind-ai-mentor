-- Add premium role for previewtest user (analyzed71@gmail.com)
-- User ID: 2fbc4cf5-7a9e-47a7-bd4f-dda3e76e2588

-- First, delete any existing role for this user (to prevent duplicates)
DELETE FROM user_roles WHERE user_id = '2fbc4cf5-7a9e-47a7-bd4f-dda3e76e2588';

-- Insert premium role
INSERT INTO user_roles (user_id, role)
VALUES ('2fbc4cf5-7a9e-47a7-bd4f-dda3e76e2588', 'premium');

-- Update the subscribers table to reflect premium status  
UPDATE subscribers
SET 
  subscription_tier = 'premium',
  subscribed = true,
  updated_at = now()
WHERE user_id = '2fbc4cf5-7a9e-47a7-bd4f-dda3e76e2588';