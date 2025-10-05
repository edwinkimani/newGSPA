-- Script to Create Mprac@gmail.com Auth User
-- IMPORTANT: You CANNOT directly insert into auth.users table via SQL
-- Supabase auth.users is a system table managed by Supabase Auth

-- This script provides instructions and a helper function for creating the auth user
-- You must use one of the methods below to create the user

/*
===============================================================================
CREATING THE Mprac@gmail.com AUTH USER
===============================================================================

Since you cannot insert directly into auth.users via SQL, use one of these methods:

METHOD 1: Supabase Dashboard (Recommended)
--------------------------------------------
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Authentication > Users
4. Click "Add user"
5. Fill in:
   - Email: Mprac@gmail.com
   - Password: Mprac123
   - Enable "Auto confirm user" (for development)
6. Click "Add user"
7. Copy the User ID (UUID) that appears
8. Use this UUID in scripts/014_create_master_practitioner_account.sql

METHOD 2: Supabase CLI
----------------------
If you have Supabase CLI installed:

supabase auth users create \
  --email Mprac@gmail.com \
  --password Mprac123 \
  --auto-confirm

METHOD 3: Using Supabase Client (in your app)
---------------------------------------------
You can create a temporary script to create the user programmatically:

// In your Next.js app, create a temporary API route or component:
import { createClient } from '@/lib/supabase/server'

export async function createMpracUser() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'Mprac@gmail.com',
    password: 'Mprac123',
    email_confirm: true, // Auto-confirm for development
    user_metadata: {
      first_name: 'Master',
      last_name: 'Practitioner'
    }
  })

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  console.log('User created with ID:', data.user.id)
  return data.user.id
}

===============================================================================
VERIFICATION
===============================================================================

After creating the auth user, verify it exists:

SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'Mprac@gmail.com';

===============================================================================
NEXT STEPS
===============================================================================

1. Create the auth user using one of the methods above
2. Get the User ID (UUID)
3. Update scripts/014_create_master_practitioner_account.sql:
   - Replace '33333333-3333-3333-3333-333333333333'::uuid
   - With the actual UUID from step 2
4. Run the updated script in Supabase SQL Editor
5. Verify the complete setup with scripts/016_verify_database_setup.sql

===============================================================================
*/

-- Helper function to check if auth user exists (run after creating)
CREATE OR REPLACE FUNCTION check_mprac_auth_user()
RETURNS TABLE(user_id UUID, email TEXT, confirmed BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id as user_id,
    au.email,
    (au.email_confirmed_at IS NOT NULL) as confirmed
  FROM auth.users au
  WHERE au.email = 'Mprac@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage: SELECT * FROM check_mprac_auth_user();

-- Clean up function (optional - for development only)
-- DROP FUNCTION IF EXISTS check_mprac_auth_user();
