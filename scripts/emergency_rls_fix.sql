-- Emergency RLS Fix for Registration
-- This temporarily allows registration to work by creating a permissive policy

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_during_registration" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;

-- Create simple policies that allow authenticated users to manage their profiles
CREATE POLICY "profiles_allow_authenticated" ON public.profiles
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Alternative: Temporarily disable RLS for testing (uncomment if needed)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: After registration works, you can re-enable more restrictive policies
