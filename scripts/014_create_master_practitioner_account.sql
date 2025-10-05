-- Create Master Practitioner account with email Mprac@gmail.com
-- This script creates a default Master Practitioner user for testing purposes

-- Note: This script assumes you have already created the user in Supabase Auth
-- with email Mprac@gmail.com and password Mprac123
-- You need to get the actual UUID from auth.users and replace the placeholder below

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

-- Insert the master_practitioner role if it doesn't exist
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('master_practitioner', 'Master Practitioner', 'Content creator and exam manager with teaching capabilities', TRUE)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    master_practitioner_role_id UUID;
    mprac_user_id UUID := 'e72fd829-c6a3-4458-b9da-53918ef041a4'::uuid; -- Mprac@gmail.com auth user UUID
BEGIN
    -- Get the master practitioner role ID
    SELECT id INTO master_practitioner_role_id
    FROM public.roles
    WHERE name = 'master_practitioner';

    IF master_practitioner_role_id IS NULL THEN
        RAISE EXCEPTION 'Master Practitioner role not found. Please check the roles table setup.';
    END IF;

    -- Insert the Master Practitioner profile with all required fields
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
        is_active,
        created_at,
        updated_at
    ) VALUES (
        mprac_user_id,
        'Master',
        'Practitioner',
        'Kenyan',  -- nationality
        'male',    -- gender
        '1985-01-01'::date,  -- date_of_birth
        '+254700000000',     -- phone_number
        'Mprac@gmail.com',
        'Security Consultant',  -- designation
        'Global Security Institute',  -- organization_name
        'passport',  -- document_type
        'MP123456789',  -- document_number
        true,  -- membership_fee_paid
        'completed',  -- payment_status
        true,  -- test_completed
        92,   -- test_score
        true, -- certificate_issued
        master_practitioner_role_id,
        true, -- is_active
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        role_id = EXCLUDED.role_id,
        membership_fee_paid = EXCLUDED.membership_fee_paid,
        payment_status = EXCLUDED.payment_status,
        test_completed = EXCLUDED.test_completed,
        test_score = EXCLUDED.test_score,
        certificate_issued = EXCLUDED.certificate_issued,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

    RAISE NOTICE 'Master Practitioner account created/updated successfully!';
    RAISE NOTICE 'Email: Mprac@gmail.com';
    RAISE NOTICE 'Role: Master Practitioner';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: You must create this user in Supabase Authentication first:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Create user with email: Mprac@gmail.com';
    RAISE NOTICE '3. Set password: Mprac123';
    RAISE NOTICE '4. Copy the user UUID from auth.users table';
    RAISE NOTICE '5. Replace the UUID placeholder in this script with the actual UUID';
    RAISE NOTICE '6. Run this script again';

END $$;

-- Display the created user
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    r.display_name as role,
    p.membership_fee_paid,
    p.test_completed,
    p.test_score,
    p.certificate_issued,
    p.created_at
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
WHERE p.email = 'Mprac@gmail.com';
