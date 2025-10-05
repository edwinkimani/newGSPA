-- Seed default users for Practitioner and Master Practitioner roles
-- This script creates sample users for testing the role-based access control system

-- First, ensure the basic tables exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  passport_photo_url TEXT,
  nationality TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license')),
  document_number TEXT NOT NULL,
  signature_data TEXT,
  declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_reference TEXT,
  test_completed BOOLEAN NOT NULL DEFAULT FALSE,
  test_score INTEGER,
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the roles table exists and has the required roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role_id column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Insert required roles if they don't exist
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Super user with full system access and management capabilities', TRUE),
('master_practitioner', 'Master Practitioner', 'Content creator and exam manager with teaching capabilities', TRUE),
('practitioner', 'Practitioner', 'Standard user with access to courses and certifications', TRUE)
ON CONFLICT (name) DO NOTHING;

-- First, let's create the auth users (this would normally be done through the Supabase Auth API)
-- For this script, we'll assume the users are already created in auth.users
-- In a real scenario, you'd use the Supabase Auth API to create these users

-- Insert default practitioner user profile
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  nationality,
  gender,
  date_of_birth,
  phone_number,
  email,
  designation,
  organization_name,
  document_type,
  document_number,
  membership_fee_paid,
  payment_status,
  test_completed,
  test_score,
  certificate_issued,
  role_id,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid, -- This should match an auth.users id
  'John',
  'Practitioner',
  'American',
  'male',
  '1990-05-15'::date,
  '+15551234567',
  'practitioner@gspa.com',
  'Security Analyst',
  'Tech Solutions Inc',
  'passport',
  'P123456789',
  true,
  'completed',
  true,
  85,
  true,
  (SELECT id FROM public.roles WHERE name = 'practitioner'),
  true
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  role_id = EXCLUDED.role_id;

-- Insert default master practitioner user profile
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  nationality,
  gender,
  date_of_birth,
  phone_number,
  email,
  designation,
  organization_name,
  document_type,
  document_number,
  membership_fee_paid,
  payment_status,
  test_completed,
  test_score,
  certificate_issued,
  role_id,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid, -- This should match an auth.users id
  'Sarah',
  'Master',
  'Canadian',
  'female',
  '1980-03-20'::date,
  '+14165551234',
  'master@gspa.com',
  'Senior Security Consultant',
  'Global Security Alliance',
  'passport',
  'MP987654321',
  true,
  'completed',
  true,
  95,
  true,
  (SELECT id FROM public.roles WHERE name = 'master_practitioner'),
  true
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  role_id = EXCLUDED.role_id;

-- Note: In a production environment, you would need to:
-- 1. Create these users in Supabase Auth first to get their UUIDs
-- 2. Then insert their profiles with the correct auth user IDs
-- 3. Set up proper passwords through the Auth API

-- For development/testing purposes, you can manually create these users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create users with emails: practitioner@gspa.com and master@gspa.com
-- 3. Get their UUIDs from the users table
-- 4. Replace the UUIDs in this script with the actual ones
-- 5. Run this script

-- Alternative approach: Create a function to handle user creation
CREATE OR REPLACE FUNCTION create_default_users()
RETURNS TEXT AS $$
DECLARE
  practitioner_role_id UUID;
  master_role_id UUID;
  practitioner_user_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
  master_user_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO practitioner_role_id FROM public.roles WHERE name = 'practitioner';
  SELECT id INTO master_role_id FROM public.roles WHERE name = 'master_practitioner';

  -- Create practitioner profile
  INSERT INTO public.profiles (
    id, first_name, last_name, nationality, gender, date_of_birth, phone_number,
    email, designation, organization_name, document_type, document_number,
    membership_fee_paid, payment_status, test_completed, test_score, certificate_issued, role_id, is_active
  ) VALUES (
    practitioner_user_id, 'John', 'Practitioner', 'American', 'male', '1990-05-15'::date, '+15551234567',
    'practitioner@gspa.com', 'Security Analyst', 'Tech Solutions Inc', 'passport', 'P123456789',
    true, 'completed', true, 85, true, practitioner_role_id, true
  ) ON CONFLICT (id) DO UPDATE SET
    role_id = practitioner_role_id,
    first_name = 'John',
    last_name = 'Practitioner',
    email = 'practitioner@gspa.com';

  -- Create master practitioner profile
  INSERT INTO public.profiles (
    id, first_name, last_name, nationality, gender, date_of_birth, phone_number,
    email, designation, organization_name, document_type, document_number,
    membership_fee_paid, payment_status, test_completed, test_score, certificate_issued, role_id, is_active
  ) VALUES (
    master_user_id, 'Sarah', 'Master', 'Canadian', 'female', '1980-03-20'::date, '+14165551234',
    'master@gspa.com', 'Senior Security Consultant', 'Global Security Alliance', 'passport', 'MP987654321',
    true, 'completed', true, 95, true, master_role_id, true
  ) ON CONFLICT (id) DO UPDATE SET
    role_id = master_role_id,
    first_name = 'Sarah',
    last_name = 'Master',
    email = 'master@gspa.com';

  RETURN 'Default users created successfully. Remember to create corresponding auth users with matching UUIDs.';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_default_users();

-- Display created users
SELECT
  p.first_name,
  p.last_name,
  p.email,
  r.display_name as role,
  p.membership_fee_paid,
  p.test_completed,
  p.test_score,
  p.certificate_issued
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
WHERE p.email IN ('practitioner@gspa.com', 'master@gspa.com', 'admin@gmail.com')
ORDER BY r.name;

-- Final notification
DO $$
BEGIN
    RAISE NOTICE 'Default users created:';
    RAISE NOTICE '- Practitioner: practitioner@gspa.com (password: you need to set this in Supabase Auth)';
    RAISE NOTICE '- Master Practitioner: master@gspa.com (password: you need to set this in Supabase Auth)';
    RAISE NOTICE '- Admin: admin@gmail.com (already exists)';
    RAISE NOTICE '';
    RAISE NOTICE 'To complete setup:';
    RAISE NOTICE '1. Create these users in Supabase Authentication';
    RAISE NOTICE '2. Update the UUIDs in this script to match the auth user IDs';
    RAISE NOTICE '3. Set passwords for the users';
    RAISE NOTICE '4. Test login with different roles';
END $$;
