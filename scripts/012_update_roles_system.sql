-- Update Role-Based Access Control System to match user requirements
-- Consolidate super_admin and admin into single 'admin' role
-- Keep master_practitioner and practitioner roles

-- Remove the super_admin and admin roles, replace with single admin role
DELETE FROM public.role_permissions WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('super_admin', 'admin')
);

DELETE FROM public.profiles WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('super_admin', 'admin')
);

DELETE FROM public.roles WHERE name IN ('super_admin', 'admin');

-- Insert the three required roles
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Super user with full system access and management capabilities', TRUE),
('master_practitioner', 'Master Practitioner', 'Content creator and exam manager with teaching capabilities', TRUE),
('practitioner', 'Practitioner', 'Standard user with access to courses and certifications', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive permissions
INSERT INTO public.permissions (name, display_name, description, resource, action) VALUES
-- User management
('users.view', 'View Users', 'Can view user profiles and information', 'users', 'read'),
('users.create', 'Create Users', 'Can create new user accounts', 'users', 'create'),
('users.update', 'Update Users', 'Can modify user information', 'users', 'update'),
('users.delete', 'Delete Users', 'Can delete user accounts', 'users', 'delete'),
('users.manage_roles', 'Manage User Roles', 'Can assign and change user roles', 'users', 'manage'),

-- Payment management
('payments.view', 'View Payments', 'Can view payment records and reports', 'payments', 'read'),
('payments.manage', 'Manage Payments', 'Can process and manage payment transactions', 'payments', 'manage'),
('payments.refund', 'Process Refunds', 'Can process payment refunds', 'payments', 'refund'),

-- Content management
('content.view', 'View Content', 'Can view modules and content', 'content', 'read'),
('content.create', 'Create Content', 'Can create new modules and content', 'content', 'create'),
('content.update', 'Update Content', 'Can modify existing content', 'content', 'update'),
('content.delete', 'Delete Content', 'Can delete content', 'content', 'delete'),
('content.publish', 'Publish Content', 'Can publish/unpublish content', 'content', 'publish'),

-- Exam management
('exams.view', 'View Exams', 'Can view exam configurations', 'exams', 'read'),
('exams.create', 'Create Exams', 'Can create exam configurations', 'exams', 'create'),
('exams.update', 'Update Exams', 'Can modify exam settings', 'exams', 'update'),
('exams.delete', 'Delete Exams', 'Can delete exam configurations', 'exams', 'delete'),
('exams.assign', 'Assign Exams', 'Can assign exams to users', 'exams', 'assign'),

-- Certificate management
('certificates.view', 'View Certificates', 'Can view certificate templates', 'certificates', 'read'),
('certificates.create', 'Create Certificates', 'Can create certificate templates', 'certificates', 'create'),
('certificates.update', 'Update Certificates', 'Can modify certificate templates', 'certificates', 'update'),
('certificates.issue', 'Issue Certificates', 'Can issue certificates to users', 'certificates', 'issue'),

-- Contact/Inquiry management
('inquiries.view', 'View Inquiries', 'Can view contact form submissions', 'inquiries', 'read'),
('inquiries.respond', 'Respond to Inquiries', 'Can respond to and manage inquiries', 'inquiries', 'manage'),

-- Analytics and reporting
('analytics.view', 'View Analytics', 'Can access site analytics and metrics', 'analytics', 'read'),
('reports.view', 'View Reports', 'Can view generated reports', 'reports', 'read'),
('reports.generate', 'Generate Reports', 'Can generate new reports', 'reports', 'create'),

-- System settings
('settings.view', 'View Settings', 'Can view system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Can modify system settings', 'settings', 'update'),

-- Enrollment management
('enrollments.view', 'View Enrollments', 'Can view user enrollments', 'enrollments', 'read'),
('enrollments.manage', 'Manage Enrollments', 'Can manage user enrollments and access', 'enrollments', 'manage'),

-- Test taking (for practitioners)
('tests.take', 'Take Tests', 'Can access and take certification tests', 'tests', 'take'),
('certificates.view_own', 'View Own Certificates', 'Can view their own certificates', 'certificates', 'read_own')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Master Practitioner permissions (content creation and exam management)
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

-- Practitioner permissions (basic access for taking tests)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'content.view', 'enrollments.view', 'enrollments.manage',
  'tests.take', 'certificates.view_own'
)
WHERE r.name = 'practitioner'
ON CONFLICT DO NOTHING;

-- Update existing admin user to have admin role
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE email = 'admin@gmail.com';

-- Set default role for existing users without roles to practitioner
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'practitioner')
WHERE role_id IS NULL;

-- Create function to safely get user role
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = user_id;

  -- Return practitioner as default if no role found
  RETURN COALESCE(role_name, 'practitioner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has specific permission
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

-- Create function to check if user has role
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

-- Update RLS policies to use the new role system
-- Drop old policies that reference non-existent roles
DROP POLICY IF EXISTS "roles_admin_only" ON public.roles;
DROP POLICY IF EXISTS "permissions_admin_only" ON public.permissions;

-- Create new policies
CREATE POLICY "roles_admin_access" ON public.roles FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "permissions_admin_access" ON public.permissions FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin')
);

-- Update module policies
DROP POLICY IF EXISTS "modules_manage_admin" ON public.modules;
CREATE POLICY "modules_manage_role_based" ON public.modules FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner') OR
  created_by = auth.uid()
);

-- Update module content policies
DROP POLICY IF EXISTS "module_content_manage_creators" ON public.module_content;
CREATE POLICY "module_content_manage_role_based" ON public.module_content FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner') OR
  created_by = auth.uid()
);

-- Update enrollment policies
DROP POLICY IF EXISTS "user_enrollments_manage_admin" ON public.user_enrollments;
CREATE POLICY "user_enrollments_manage_role_based" ON public.user_enrollments FOR ALL USING (
  user_id = auth.uid() OR
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

-- Update contact inquiry policies
DROP POLICY IF EXISTS "contact_inquiries_manage_admin" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_manage_role_based" ON public.contact_inquiries FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin')
);

-- Update analytics policies
DROP POLICY IF EXISTS "site_analytics_admin_only" ON public.site_analytics;
CREATE POLICY "site_analytics_role_based" ON public.site_analytics FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

-- Update reports policies
DROP POLICY IF EXISTS "reports_manage_admin" ON public.reports;
CREATE POLICY "reports_manage_role_based" ON public.reports FOR ALL USING (
  generated_by = auth.uid() OR
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

-- Update exam policies
DROP POLICY IF EXISTS "exam_configurations_role_based" ON public.exam_configurations;
CREATE POLICY "exam_configurations_role_based" ON public.exam_configurations FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

DROP POLICY IF EXISTS "user_exams_role_based" ON public.user_exams;
CREATE POLICY "user_exams_role_based" ON public.user_exams FOR ALL USING (
  user_id = auth.uid() OR
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

-- Update certificate policies
DROP POLICY IF EXISTS "certificate_templates_role_based" ON public.certificate_templates;
CREATE POLICY "certificate_templates_role_based" ON public.certificate_templates FOR ALL USING (
  public.user_has_role(auth.uid(), 'admin') OR
  public.user_has_role(auth.uid(), 'master_practitioner')
);

-- Final notification
DO $$
BEGIN
    RAISE NOTICE 'Role-Based Access Control system updated successfully!';
    RAISE NOTICE 'Available roles: admin, master_practitioner, practitioner';
    RAISE NOTICE 'Admin: Full system access';
    RAISE NOTICE 'Master Practitioner: Content creation and exam management';
    RAISE NOTICE 'Practitioner: Test taking and basic access';
    RAISE NOTICE 'Use user_has_role(user_id, role_name) and user_has_permission(user_id, permission_name) functions';
END $$;
