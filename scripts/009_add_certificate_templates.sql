-- Add certificate template management table

-- Create certificate_templates table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL DEFAULT 'Default Certificate',
  organization_name TEXT NOT NULL DEFAULT 'Global Security Practitioners Alliance',
  organization_logo_url TEXT,
  certificate_title TEXT NOT NULL DEFAULT 'Certificate of Excellence',
  certificate_subtitle TEXT DEFAULT 'Professional Security Certification',
  main_title TEXT NOT NULL DEFAULT 'Certificate of Excellence',
  recipient_title TEXT NOT NULL DEFAULT 'This certifies that',
  achievement_description TEXT NOT NULL DEFAULT 'has demonstrated exceptional mastery and professional excellence in the field of Cybersecurity and Risk Management, successfully completing the comprehensive Security Aptitude Assessment with distinction. This achievement represents a commitment to the highest standards of professional competency in security protocols, threat analysis, compliance frameworks, and emergency response procedures.',
  date_label TEXT NOT NULL DEFAULT 'Date of Achievement',
  score_label TEXT NOT NULL DEFAULT 'Excellence Score',
  certificate_id_label TEXT NOT NULL DEFAULT 'Certification ID',
  signature_name TEXT NOT NULL DEFAULT 'Dr. Alexandra Sterling',
  signature_title TEXT NOT NULL DEFAULT 'Director of Professional Certification',
  signature_organization TEXT NOT NULL DEFAULT 'Global Security Institute',
  background_color TEXT NOT NULL DEFAULT '#fefefe',
  primary_color TEXT NOT NULL DEFAULT '#1a2332',
  accent_color TEXT NOT NULL DEFAULT '#c9aa68',
  font_family TEXT NOT NULL DEFAULT 'Cormorant Garamond, Times New Roman, serif',
  watermark_text TEXT DEFAULT 'CERTIFIED',
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
  template_name,
  organization_name,
  certificate_title,
  certificate_subtitle,
  main_title,
  recipient_title,
  achievement_description,
  date_label,
  score_label,
  certificate_id_label,
  signature_name,
  signature_title,
  signature_organization,
  background_color,
  primary_color,
  accent_color,
  font_family,
  watermark_text
) VALUES (
  'Default Certificate',
  'Global Security Practitioners Alliance',
  'Certificate of Excellence',
  'Professional Security Certification',
  'Certificate of Excellence',
  'This certifies that',
  'has demonstrated exceptional mastery and professional excellence in the field of Cybersecurity and Risk Management, successfully completing the comprehensive Security Aptitude Assessment with distinction. This achievement represents a commitment to the highest standards of professional competency in security protocols, threat analysis, compliance frameworks, and emergency response procedures.',
  'Date of Achievement',
  'Excellence Score',
  'Certification ID',
  'Dr. Alexandra Sterling',
  'Director of Professional Certification',
  'Global Security Institute',
  '#fefefe',
  '#1a2332',
  '#c9aa68',
  'Cormorant Garamond, Times New Roman, serif',
  'CERTIFIED'
);
