-- Fix for missing roles table error
-- This script ensures the roles table exists and is properly populated

-- Create roles table if it doesn't exist
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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Insert the required roles if they don't exist
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Super user with full system access and management capabilities', TRUE),
('master_practitioner', 'Master Practitioner', 'Content creator and exam manager with teaching capabilities', TRUE),
('practitioner', 'Practitioner', 'Standard user with access to courses and certifications', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create role_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Insert basic permissions if they don't exist
INSERT INTO public.permissions (name, display_name, description, resource, action) VALUES
('content.view', 'View Content', 'Can view modules and content', 'content', 'read'),
('content.create', 'Create Content', 'Can create new modules and content', 'content', 'create'),
('content.update', 'Update Content', 'Can modify existing content', 'content', 'update'),
('content.delete', 'Delete Content', 'Can delete content', 'content', 'delete'),
('content.publish', 'Publish Content', 'Can publish/unpublish content', 'content', 'publish'),
('exams.view', 'View Exams', 'Can view exam configurations', 'exams', 'read'),
('exams.create', 'Create Exams', 'Can create exam configurations', 'exams', 'create'),
('exams.update', 'Update Exams', 'Can modify exam settings', 'exams', 'update'),
('exams.delete', 'Delete Exams', 'Can delete exam configurations', 'exams', 'delete'),
('exams.assign', 'Assign Exams', 'Can assign exams to users', 'exams', 'assign'),
('certificates.view', 'View Certificates', 'Can view certificate templates', 'certificates', 'read'),
('certificates.create', 'Create Certificates', 'Can create certificate templates', 'certificates', 'create'),
('certificates.update', 'Update Certificates', 'Can modify certificate templates', 'certificates', 'update'),
('certificates.issue', 'Issue Certificates', 'Can issue certificates to users', 'certificates', 'issue'),
('users.view', 'View Users', 'Can view user profiles and information', 'users', 'read'),
('users.create', 'Create Users', 'Can create new user accounts', 'users', 'create'),
('users.update', 'Update Users', 'Can modify user information', 'users', 'update'),
('users.manage_roles', 'Manage User Roles', 'Can assign and change user roles', 'users', 'manage'),
('enrollments.view', 'View Enrollments', 'Can view user enrollments', 'enrollments', 'read'),
('enrollments.manage', 'Manage Enrollments', 'Can manage user enrollments and access', 'enrollments', 'manage'),
('analytics.view', 'View Analytics', 'Can access site analytics and metrics', 'analytics', 'read'),
('reports.view', 'View Reports', 'Can view generated reports', 'reports', 'read'),
('reports.generate', 'Generate Reports', 'Can generate new reports', 'reports', 'create'),
('settings.view', 'View Settings', 'Can view system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Can modify system settings', 'settings', 'update'),
('inquiries.view', 'View Inquiries', 'Can view contact form submissions', 'inquiries', 'read'),
('inquiries.respond', 'Respond to Inquiries', 'Can respond to and manage inquiries', 'inquiries', 'manage'),
('payments.view', 'View Payments', 'Can view payment records and reports', 'payments', 'read'),
('payments.manage', 'Manage Payments', 'Can process and manage payment transactions', 'payments', 'manage'),
('payments.refund', 'Process Refunds', 'Can process payment refunds', 'payments', 'refund')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Master Practitioner permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'content.view', 'content.create', 'content.update', 'content.delete', 'content.publish',
  'exams.view', 'exams.create', 'exams.update', 'exams.delete', 'exams.assign',
  'certificates.view', 'enrollments.view',
  'users.view', 'analytics.view', 'reports.view'
)
WHERE r.name = 'master_practitioner'
ON CONFLICT DO NOTHING;

-- Practitioner permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'content.view', 'enrollments.view', 'enrollments.manage'
)
WHERE r.name = 'practitioner'
ON CONFLICT DO NOTHING;

-- Create RLS policies
DROP POLICY IF EXISTS "roles_admin_access" ON public.roles;
CREATE POLICY "roles_admin_access" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role_id IN (SELECT id FROM public.roles WHERE name = 'admin')
  )
);

DROP POLICY IF EXISTS "permissions_admin_access" ON public.permissions;
CREATE POLICY "permissions_admin_access" ON public.permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role_id IN (SELECT id FROM public.roles WHERE name = 'admin')
  )
);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = user_id;

  RETURN COALESCE(role_name, 'practitioner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = user_id AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.role_permissions rp ON rp.role_id = p.role_id
    LEFT JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = user_id AND perm.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the roles exist
DO $$
DECLARE
  role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO role_count FROM public.roles WHERE name IN ('admin', 'master_practitioner', 'practitioner');

  IF role_count = 3 THEN
    RAISE NOTICE 'All required roles exist: admin, master_practitioner, practitioner';
  ELSE
    RAISE EXCEPTION 'Missing roles. Expected 3, found %', role_count;
  END IF;
END $$;

-- Display current roles
SELECT
  name,
  display_name,
  description
FROM public.roles
ORDER BY name;
