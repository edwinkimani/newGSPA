-- Add certificate_available_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certificate_available_at TIMESTAMP WITH TIME ZONE;
