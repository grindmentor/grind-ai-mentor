-- Add premium role for martine.k.molmen@gmail.com
-- First delete any existing role, then insert new one
DELETE FROM public.user_roles WHERE user_id = 'ebe2be6a-56a6-4ee3-908b-69b0249f9f10';
INSERT INTO public.user_roles (user_id, role)
VALUES ('ebe2be6a-56a6-4ee3-908b-69b0249f9f10', 'premium');