-- Database Setup Verification Script
-- Run this after executing the migration scripts to verify everything is set up correctly

-- Check if all required tables exist
DO $$
DECLARE
    tables_exist BOOLEAN := TRUE;
    table_list TEXT[] := ARRAY[
        'profiles',
        'roles',
        'permissions',
        'role_permissions',
        'test_questions',
        'exam_configurations',
        'user_exams',
        'certificate_templates',
        'contact_messages'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    current_table TEXT;
BEGIN
    FOREACH current_table IN ARRAY table_list
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = current_table
        ) THEN
            missing_tables := array_append(missing_tables, current_table);
            tables_exist := FALSE;
        END IF;
    END LOOP;

    IF tables_exist THEN
        RAISE NOTICE '✓ All required tables exist';
    ELSE
        RAISE NOTICE '✗ Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- Check if profiles table has role_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'role_id'
    ) THEN
        RAISE NOTICE '✓ profiles table has role_id column';
    ELSE
        RAISE NOTICE '✗ profiles table missing role_id column';
    END IF;
END $$;

-- Check roles data
SELECT
    'Roles count: ' || COUNT(*)::TEXT as roles_check
FROM public.roles;

-- Check permissions data
SELECT
    'Permissions count: ' || COUNT(*)::TEXT as permissions_check
FROM public.permissions;

-- Check role_permissions data
SELECT
    'Role-Permission assignments: ' || COUNT(*)::TEXT as assignments_check
FROM public.role_permissions;

-- Display roles
SELECT
    name,
    display_name,
    description
FROM public.roles
ORDER BY name;

-- Display sample profiles with roles
SELECT
    p.email,
    COALESCE(r.display_name, 'No Role Assigned') as role,
    p.membership_fee_paid,
    p.test_completed,
    p.certificate_issued
FROM public.profiles p
LEFT JOIN public.roles r ON r.id = p.role_id
ORDER BY p.email;

-- Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Final summary
DO $$
DECLARE
    profile_count INTEGER;
    role_count INTEGER;
    user_with_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO role_count FROM public.roles;
    SELECT COUNT(*) INTO user_with_roles FROM public.profiles WHERE role_id IS NOT NULL;

    RAISE NOTICE '';
    RAISE NOTICE '=== DATABASE SETUP SUMMARY ===';
    RAISE NOTICE 'Total profiles: %', profile_count;
    RAISE NOTICE 'Total roles: %', role_count;
    RAISE NOTICE 'Users with roles assigned: %', user_with_roles;

    IF profile_count > 0 AND role_count >= 3 AND user_with_roles >= 0 THEN
        RAISE NOTICE '✓ Database setup appears complete';
    ELSE
        RAISE NOTICE '⚠ Database setup may be incomplete - check the results above';
    END IF;
END $$;
