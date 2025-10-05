-- Update RLS policy for profiles to allow inserts during registration
-- This allows authenticated users to insert their own profiles

-- Drop the existing insert policy
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Create a new insert policy that allows authenticated users to insert
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');

-- Also allow service role to bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
