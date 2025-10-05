-- Add exam management tables for admin functionality

-- Create exam_configurations table
CREATE TABLE IF NOT EXISTS public.exam_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of question IDs
  total_questions INTEGER NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70, -- Percentage
  time_limit INTEGER NOT NULL DEFAULT 3600, -- Seconds
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_exams table to assign exams to users
CREATE TABLE IF NOT EXISTS public.user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_configuration_id UUID NOT NULL REFERENCES exam_configurations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_configuration_id) -- One assignment per user per exam
);

-- Enable Row Level Security
ALTER TABLE public.exam_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;

-- RLS policies for exam_configurations (admin only)
CREATE POLICY "exam_configurations_admin_only" ON public.exam_configurations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'admin@gmail.com'
  )
);

-- RLS policies for user_exams
CREATE POLICY "user_exams_admin_all" ON public.user_exams FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'admin@gmail.com'
  )
);

CREATE POLICY "user_exams_user_read_own" ON public.user_exams FOR SELECT USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_user_exams_user_id ON user_exams(user_id);
CREATE INDEX idx_user_exams_exam_config_id ON user_exams(exam_configuration_id);
CREATE INDEX idx_exam_configurations_active ON exam_configurations(is_active);

-- Insert sample exam configuration
INSERT INTO public.exam_configurations (name, description, questions, total_questions, passing_score, time_limit) VALUES
('Security Aptitude Test - Standard', 'Standard security aptitude assessment with 30 questions', '[]'::jsonb, 30, 70, 3600);

-- Create certificate_templates table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_name TEXT NOT NULL DEFAULT 'Global Security Institute',
  certificate_title TEXT NOT NULL DEFAULT 'Certificate of Excellence',
  certification_type TEXT NOT NULL DEFAULT 'Security Professional Certification',
  achievement_description TEXT NOT NULL DEFAULT 'has demonstrated exceptional mastery and professional excellence in the field of Cybersecurity and Risk Management, successfully completing the comprehensive Security Aptitude Assessment with distinction.',
  director_name TEXT NOT NULL DEFAULT 'Dr. Alexandra Sterling',
  director_title TEXT NOT NULL DEFAULT 'Director of Professional Certification',
  institution_address TEXT,
  logo_url TEXT,
  signature_url TEXT,
  background_color TEXT DEFAULT '#fefefe',
  primary_color TEXT DEFAULT '#1a2332',
  secondary_color TEXT DEFAULT '#c9aa68',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for certificate_templates (admin only)
CREATE POLICY "certificate_templates_admin_only" ON public.certificate_templates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'admin@gmail.com'
  )
);

-- Insert default certificate template
INSERT INTO public.certificate_templates (
  name,
  institution_name,
  certificate_title,
  certification_type,
  achievement_description,
  director_name,
  director_title
) VALUES (
  'Default Security Certificate',
  'Global Security Institute',
  'Certificate of Excellence',
  'Security Professional Certification',
  'has demonstrated exceptional mastery and professional excellence in the field of Cybersecurity and Risk Management, successfully completing the comprehensive Security Aptitude Assessment with distinction. This achievement represents a commitment to the highest standards of professional competency in security protocols, threat analysis, compliance frameworks, and emergency response procedures.',
  'Dr. Alexandra Sterling',
  'Director of Professional Certification'
);
