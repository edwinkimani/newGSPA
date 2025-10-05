-- Comprehensive Role-Based Access Control System for GSPA
-- This script implements a complete RBAC system with roles, permissions, and content management

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  resource TEXT NOT NULL, -- e.g., 'users', 'exams', 'content', 'reports'
  action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create modules/schools table (content containers)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL, -- e.g., 'Cybersecurity', 'Network Security', 'Digital Forensics'
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in minutes
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  thumbnail_url TEXT,
  prerequisites TEXT[], -- Array of prerequisite module IDs
  learning_objectives TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create module_content table (lessons, videos, documents)
CREATE TABLE IF NOT EXISTS public.module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'quiz', 'assignment', 'text')),
  content_url TEXT, -- For videos/documents
  content_text TEXT, -- For text content
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  estimated_duration INTEGER, -- in minutes
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_enrollments table
CREATE TABLE IF NOT EXISTS public.user_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Create user_progress table (detailed progress tracking)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES user_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES module_content(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0, -- in seconds
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_analytics table
CREATE TABLE IF NOT EXISTS public.site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- e.g., 'page_view', 'user_registration', 'exam_completed'
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- e.g., 'user_activity', 'financial', 'enrollment', 'performance'
  parameters JSONB, -- Report generation parameters
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_data JSONB, -- The actual report data
  file_url TEXT, -- If report is exported as file
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to include role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;

-- Enable Row Level Security on all new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE),
('admin', 'Administrator', 'Administrative access to manage users, content, and system settings', TRUE),
('master_practitioner', 'Master Practitioner', 'Content creator and exam manager with teaching capabilities', TRUE),
('practitioner', 'Practitioner', 'Standard user with access to courses and certifications', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
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
('enrollments.manage', 'Manage Enrollments', 'Can manage user enrollments and access', 'enrollments', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'users.view', 'users.create', 'users.update', 'users.manage_roles',
  'payments.view', 'payments.manage', 'payments.refund',
  'content.view', 'content.create', 'content.update', 'content.delete', 'content.publish',
  'exams.view', 'exams.create', 'exams.update', 'exams.delete', 'exams.assign',
  'certificates.view', 'certificates.create', 'certificates.update', 'certificates.issue',
  'inquiries.view', 'inquiries.respond',
  'analytics.view', 'reports.view', 'reports.generate',
  'settings.view', 'settings.update',
  'enrollments.view', 'enrollments.manage'
)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Master Practitioner permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'content.view', 'content.create', 'content.update', 'content.publish',
  'exams.view', 'exams.create', 'exams.update', 'exams.assign',
  'certificates.view', 'enrollments.view'
)
WHERE r.name = 'master_practitioner'
ON CONFLICT DO NOTHING;

-- Practitioner permissions (minimal, mostly read-only with enrollment)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'content.view', 'enrollments.view', 'enrollments.manage'
)
WHERE r.name = 'practitioner'
ON CONFLICT DO NOTHING;

-- Update existing admin user to have super_admin role
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE email = 'admin@gmail.com';

-- Create RLS policies for roles and permissions (admin only)
CREATE POLICY "roles_admin_only" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name = 'users.manage_roles'
  )
);

CREATE POLICY "permissions_admin_only" ON public.permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name = 'users.manage_roles'
  )
);

-- Modules policies
CREATE POLICY "modules_read_all_active" ON public.modules FOR SELECT USING (is_active = TRUE);

CREATE POLICY "modules_manage_admin" ON public.modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'content.%'
  )
);

-- Module content policies
CREATE POLICY "module_content_read_enrolled" ON public.module_content FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_enrollments ue
    WHERE ue.user_id = auth.uid()
    AND ue.module_id = module_content.module_id
    AND ue.payment_status = 'completed'
  )
);

CREATE POLICY "module_content_manage_creators" ON public.module_content FOR ALL USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'content.%'
  )
);

-- User enrollments policies
CREATE POLICY "user_enrollments_read_own" ON public.user_enrollments FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_enrollments_manage_own" ON public.user_enrollments FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_enrollments_manage_admin" ON public.user_enrollments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'enrollments.%'
  )
);

-- Contact inquiries policies
CREATE POLICY "contact_inquiries_read_admin" ON public.contact_inquiries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'inquiries.%'
  )
);

CREATE POLICY "contact_inquiries_manage_admin" ON public.contact_inquiries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'inquiries.%'
  )
);

-- Analytics policies (admin only)
CREATE POLICY "site_analytics_admin_only" ON public.site_analytics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'analytics.%'
  )
);

-- Reports policies
CREATE POLICY "reports_read_admin" ON public.reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'reports.%'
  )
);

CREATE POLICY "reports_manage_admin" ON public.reports FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.name LIKE 'reports.%'
  )
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_created_by ON modules(created_by);
CREATE INDEX idx_module_content_module_id ON module_content(module_id);
CREATE INDEX idx_user_enrollments_user_id ON user_enrollments(user_id);
CREATE INDEX idx_user_enrollments_module_id ON user_enrollments(module_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_enrollment_id ON user_progress(enrollment_id);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_site_analytics_event_type ON site_analytics(event_type);
CREATE INDEX idx_site_analytics_created_at ON site_analytics(created_at);
CREATE INDEX idx_reports_type ON reports(report_type);

-- Insert sample modules
INSERT INTO public.modules (
  title, description, short_description, category, difficulty_level,
  estimated_duration, price, is_featured, created_by
) VALUES
(
  'Introduction to Cybersecurity',
  'Comprehensive introduction to cybersecurity fundamentals, covering basic concepts, threats, and best practices for protecting digital assets.',
  'Learn the basics of cybersecurity and digital protection.',
  'Cybersecurity',
  'beginner',
  240, -- 4 hours
  49.99,
  TRUE,
  '00000000-0000-0000-0000-000000000001'::uuid
),
(
  'Network Security Fundamentals',
  'Master the essentials of network security, including firewalls, VPNs, intrusion detection, and secure network architecture.',
  'Build secure network infrastructures and protect against cyber threats.',
  'Network Security',
  'intermediate',
  360, -- 6 hours
  79.99,
  TRUE,
  '00000000-0000-0000-0000-000000000001'::uuid
),
(
  'Digital Forensics and Incident Response',
  'Learn digital forensics techniques, evidence collection, chain of custody, and effective incident response strategies.',
  'Master digital evidence handling and cyber incident management.',
  'Digital Forensics',
  'advanced',
  480, -- 8 hours
  129.99,
  FALSE,
  '00000000-0000-0000-0000-000000000001'::uuid
);

-- Insert sample module content
INSERT INTO public.module_content (
  module_id, title, content_type, content_text, description, order_index, created_by
) VALUES
(
  (SELECT id FROM modules WHERE title = 'Introduction to Cybersecurity'),
  'What is Cybersecurity?',
  'text',
  'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information, extorting money from users, or interrupting normal business processes.',
  'Understanding the fundamental concepts of cybersecurity',
  1,
  '00000000-0000-0000-0000-000000000001'::uuid
),
(
  (SELECT id FROM modules WHERE title = 'Introduction to Cybersecurity'),
  'Common Cyber Threats',
  'text',
  'Learn about malware, phishing, ransomware, DDoS attacks, and other common cyber threats that organizations face today.',
  'Identifying and understanding different types of cyber attacks',
  2,
  '00000000-0000-0000-0000-000000000001'::uuid
);

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = user_id AND perm.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TABLE(id UUID, name TEXT, display_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.display_name
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log analytics events
CREATE OR REPLACE FUNCTION public.log_analytics_event(
  event_type TEXT,
  event_data JSONB DEFAULT NULL,
  user_id UUID DEFAULT NULL,
  session_id TEXT DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.site_analytics (
    event_type, event_data, user_id, session_id,
    ip_address, user_agent, referrer
  ) VALUES (
    event_type, event_data, user_id, session_id,
    ip_address, user_agent, referrer
  )
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to use role-based permissions
-- Drop old admin-only policies and replace with role-based ones
DROP POLICY IF EXISTS "exam_configurations_admin_only" ON public.exam_configurations;
DROP POLICY IF EXISTS "user_exams_admin_all" ON public.user_exams;
DROP POLICY IF EXISTS "certificate_templates_admin_only" ON public.certificate_templates;

-- Recreate with role-based permissions
CREATE POLICY "exam_configurations_role_based" ON public.exam_configurations FOR ALL USING (
  public.has_permission(auth.uid(), 'exams.view') OR
  public.has_permission(auth.uid(), 'exams.create') OR
  public.has_permission(auth.uid(), 'exams.update') OR
  public.has_permission(auth.uid(), 'exams.delete')
);

CREATE POLICY "user_exams_role_based" ON public.user_exams FOR ALL USING (
  user_id = auth.uid() OR
  public.has_permission(auth.uid(), 'exams.assign') OR
  public.has_permission(auth.uid(), 'enrollments.manage')
);

CREATE POLICY "certificate_templates_role_based" ON public.certificate_templates FOR ALL USING (
  public.has_permission(auth.uid(), 'certificates.view') OR
  public.has_permission(auth.uid(), 'certificates.create') OR
  public.has_permission(auth.uid(), 'certificates.update')
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_content_updated_at BEFORE UPDATE ON public.module_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_enrollments_updated_at BEFORE UPDATE ON public.user_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for user permissions
CREATE OR REPLACE VIEW public.user_permissions AS
SELECT
  p.id as user_id,
  r.name as role_name,
  r.display_name as role_display_name,
  perm.name as permission_name,
  perm.display_name as permission_display_name,
  perm.resource,
  perm.action
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
JOIN public.role_permissions rp ON rp.role_id = r.id
JOIN public.permissions perm ON perm.id = rp.permission_id;

-- Grant necessary permissions
GRANT SELECT ON public.user_permissions TO authenticated;

-- Final notification
DO $$
BEGIN
    RAISE NOTICE 'Role-Based Access Control system implemented successfully!';
    RAISE NOTICE 'Available roles: super_admin, admin, master_practitioner, practitioner';
    RAISE NOTICE 'Sample modules and content have been created';
    RAISE NOTICE 'Use has_permission(user_id, permission_name) function to check permissions';
    RAISE NOTICE 'Use log_analytics_event() function to track user activities';
END $$;
