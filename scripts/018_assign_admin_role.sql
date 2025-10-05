-- Assign Admin role to admin@gmail.com user
-- This script updates the profile table to set the role_id for the admin user

DO $$
DECLARE
    admin_role_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get the admin role ID
    SELECT id INTO admin_role_id
    FROM public.roles
    WHERE name = 'admin';

    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found in roles table';
    END IF;

    -- Get the admin user ID
    SELECT id INTO admin_user_id
    FROM public.profiles
    WHERE email = 'admin@gmail.com';

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user (admin@gmail.com) not found in profiles table';
    END IF;

    -- Update the profile with the admin role
    UPDATE public.profiles
    SET role_id = admin_role_id,
        updated_at = NOW()
    WHERE id = admin_user_id;

    -- Log the successful update
    RAISE NOTICE 'Successfully assigned admin role (ID: %) to user admin@gmail.com (ID: %)', admin_role_id, admin_user_id;

END $$;
