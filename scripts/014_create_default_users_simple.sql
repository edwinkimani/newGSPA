-- Simple script to create default users for testing
-- This version creates profiles that will be linked to auth users you create manually

-- Create a practitioner user profile
-- Note: Replace 'practitioner-user-id' with the actual UUID from Supabase Auth
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  email,
  membership_fee_paid,
  payment_status,
  test_completed,
  test_score,
  certificate_issued,
  role_id,
  is_active
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, -- Replace with actual auth user UUID
  'John',
  'Practitioner',
  'practitioner@gspa.com',
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

-- Create a master practitioner user profile
-- Note: Replace 'master-user-id' with the actual UUID from Supabase Auth
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  email,
  membership_fee_paid,
  payment_status,
  test_completed,
  test_score,
  certificate_issued,
  role_id,
  is_active
) VALUES (
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff'::uuid, -- Replace with actual auth user UUID
  'Sarah',
  'Master',
  'master@gspa.com',
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

-- Display current users and their roles
SELECT
  'Current Users:' as info,
  p.first_name || ' ' || p.last_name as name,
  p.email,
  r.display_name as role,
  p.membership_fee_paid,
  p.test_completed,
  p.certificate_issued
FROM public.profiles p
LEFT JOIN public.roles r ON r.id = p.role_id
WHERE p.email IN ('admin@gmail.com', 'practitioner@gspa.com', 'master@gspa.com')
ORDER BY r.name;

-- Instructions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'DEFAULT USERS SETUP COMPLETE';
    RAISE NOTICE '===============================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Create users with these emails:';
    RAISE NOTICE '   - practitioner@gspa.com';
    RAISE NOTICE '   - master@gspa.com';
    RAISE NOTICE '3. Copy the UUIDs from the users table';
    RAISE NOTICE '4. Replace the placeholder UUIDs in this script';
    RAISE NOTICE '5. Run the script again with real UUIDs';
    RAISE NOTICE '';
    RAISE NOTICE 'Test logins:';
    RAISE NOTICE '- Admin: admin@gmail.com';
    RAISE NOTICE '- Master Practitioner: master@gspa.com';
    RAISE NOTICE '- Practitioner: practitioner@gspa.com';
END $$;
