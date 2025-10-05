-- Ensure admin user exists in auth.users table
-- This script sets up the default admin account with proper authentication

-- First, check if admin user exists and create if not
DO $$
BEGIN
    -- Insert admin user into auth.users if not exists
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        aud,
        role,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        last_sign_in_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'admin@gmail.com',
        crypt('@Admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated',
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "System", "last_name": "Administrator"}',
        false,
        now(),
        null,
        null,
        '',
        '',
        0,
        null,
        '',
        null
    ) ON CONFLICT (id) DO UPDATE SET
        encrypted_password = crypt('@Admin123', gen_salt('bf')),
        updated_at = now(),
        email_confirmed_at = now();

    -- Ensure admin profile exists
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
        test_score,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@gmail.com',
        'System',
        'Administrator',
        'System Administrator',
        'Global Security Practitioners Alliance',
        '+1234567890',
        'Global',
        'other',
        '1990-01-01',
        'passport',
        'ADMIN001',
        'completed',
        true,
        true,
        true,
        100,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        designation = EXCLUDED.designation,
        organization_name = EXCLUDED.organization_name,
        updated_at = now();

    RAISE NOTICE 'Admin account setup completed successfully';
    RAISE NOTICE 'Admin login: admin@gmail.com';
    RAISE NOTICE 'Admin password: @Admin123';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting up admin account: %', SQLERRM;
END $$;
