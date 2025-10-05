-- Create default admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@gmail.com',
  crypt('@Admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create admin profile
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  designation,
  organization_name,
  phone_number,
  nationality,
  gender,
  date_of_birth,
  document_type,
  document_number,
  payment_status,
  test_completed,
  certificate_issued,
  declaration_accepted,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@gmail.com',
  'System',
  'Administrator',
  'Administrator',
  'Global Security Practitioners Alliance',
  '+1234567890',
  'Global',
  'Other',
  '1990-01-01',
  'Admin ID',
  'ADMIN001',
  'completed',
  true,
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = now();
