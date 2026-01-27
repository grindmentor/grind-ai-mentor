
-- Add 'unlimited_usage' to the app_role enum for test users
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'unlimited_usage';
