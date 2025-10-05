-- Fix RLS policies for registration to allow authenticated users to insert profiles
-- This script ensures that users can complete their registration process

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create comprehensive policies for profiles table

-- Allow users to insert their own profile during registration
CREATE POLICY "profiles_insert_during_registration" ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
  AND auth.role() = 'authenticated'
);

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "profiles_service_role_all" ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Also check if we need to update the roles table policies
-- Enable RLS on roles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    -- Enable RLS on roles table
    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

    -- Allow authenticated users to read roles
    DROP POLICY IF EXISTS "roles_select_all" ON public.roles;
    CREATE POLICY "roles_select_all" ON public.roles
    FOR SELECT
    USING (auth.role() = 'authenticated');

    -- Allow service role full access to roles
    DROP POLICY IF EXISTS "roles_service_role_all" ON public.roles;
    CREATE POLICY "roles_service_role_all" ON public.roles
    FOR ALL
    USING (auth.role() = 'service_role');
  END IF;
END $$;
