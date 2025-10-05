-- Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER NOT NULL,
  price_kes INTEGER NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  max_students INTEGER,
  prerequisites TEXT,
  learning_objectives TEXT[],
  syllabus TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_image_url TEXT,
  cover_image_url TEXT,
  video_preview_url TEXT,
  start_date DATE,
  end_date DATE,
  enrollment_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create module_enrollments table
CREATE TABLE IF NOT EXISTS public.module_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_reference TEXT,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_url TEXT,
  exam_date DATE,
  exam_completed BOOLEAN NOT NULL DEFAULT FALSE,
  exam_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Create module_content table for lessons/materials
CREATE TABLE IF NOT EXISTS public.module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'quiz', 'assignment', 'live_session', 'notes', 'study_guide')),
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table for tracking individual content progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.module_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.module_content(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules (public read for active modules)
CREATE POLICY "modules_select_active" ON public.modules FOR SELECT USING (is_active = TRUE);
CREATE POLICY "modules_admin_all" ON public.modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE name = 'admin'
    )
  )
);

-- RLS Policies for module_enrollments
CREATE POLICY "module_enrollments_select_own" ON public.module_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "module_enrollments_admin_all" ON public.module_enrollments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE name = 'admin'
    )
  )
);

-- RLS Policies for module_content
CREATE POLICY "module_content_select_enrolled" ON public.module_content FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.module_enrollments
    WHERE module_enrollments.module_id = module_content.module_id
    AND module_enrollments.user_id = auth.uid()
    AND module_enrollments.payment_status = 'completed'
  )
);
CREATE POLICY "module_content_admin_all" ON public.module_content FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE name = 'admin'
    )
  )
);

-- RLS Policies for user_progress
CREATE POLICY "user_progress_select_own" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_progress_admin_all" ON public.user_progress FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE name = 'admin'
    )
  )
);

-- Insert sample modules
INSERT INTO public.modules (
  title,
  description,
  short_description,
  category,
  difficulty,
  duration_hours,
  price_kes,
  price_usd,
  max_students,
  prerequisites,
  learning_objectives,
  syllabus,
  instructor_name,
  instructor_bio
) VALUES
(
  'Cybersecurity Fundamentals',
  'Master the essential concepts of cybersecurity including threat identification, risk assessment, and basic security protocols. This comprehensive course covers everything from basic network security to advanced threat detection techniques.',
  'Learn the fundamentals of cybersecurity and protect digital assets',
  'Cybersecurity',
  'beginner',
  40,
  25000,
  200.00,
  50,
  'Basic computer knowledge',
  ARRAY[
    'Understand cybersecurity principles and concepts',
    'Identify common security threats and vulnerabilities',
    'Implement basic security measures',
    'Conduct risk assessments',
    'Use security tools and technologies'
  ],
  'Week 1-2: Introduction to Cybersecurity\nWeek 3-4: Network Security\nWeek 5-6: Cryptography Basics\nWeek 7-8: Risk Management\nWeek 9-10: Security Tools and Technologies',
  'Dr. Sarah Johnson',
  'Dr. Sarah Johnson is a leading cybersecurity expert with over 15 years of experience in the field. She has worked with Fortune 500 companies and government agencies, specializing in cybersecurity education and training.'
),
(
  'Advanced Network Security',
  'Dive deep into advanced network security concepts including firewall configuration, intrusion detection systems, VPNs, and secure network architecture design.',
  'Advanced network security techniques and implementation',
  'Network Security',
  'advanced',
  60,
  45000,
  360.00,
  30,
  'Cybersecurity Fundamentals or equivalent experience',
  ARRAY[
    'Design secure network architectures',
    'Configure advanced firewalls and IDS/IPS',
    'Implement VPN and secure remote access',
    'Conduct network penetration testing',
    'Manage security incidents and responses'
  ],
  'Week 1-3: Advanced Firewall Configuration\nWeek 4-6: Intrusion Detection and Prevention\nWeek 7-9: VPN and Remote Access Security\nWeek 10-12: Network Penetration Testing\nWeek 13-15: Incident Response and Management',
  'Prof. Michael Chen',
  'Prof. Michael Chen is a renowned network security specialist and professor at MIT. He has authored several books on network security and has consulted for major telecommunications companies worldwide.'
),
(
  'Digital Forensics and Incident Response',
  'Learn the art and science of digital forensics, evidence collection, analysis, and incident response planning. Master the tools and techniques used by forensic investigators.',
  'Digital evidence collection, analysis, and incident response',
  'Digital Forensics',
  'intermediate',
  50,
  35000,
  280.00,
  40,
  'Basic cybersecurity knowledge recommended',
  ARRAY[
    'Collect and preserve digital evidence',
    'Conduct forensic analysis of digital devices',
    'Use forensic tools and software',
    'Create incident response plans',
    'Present findings in legal proceedings'
  ],
  'Week 1-2: Introduction to Digital Forensics\nWeek 3-4: Evidence Collection and Preservation\nWeek 5-7: Forensic Analysis Techniques\nWeek 8-10: Incident Response Planning\nWeek 11-12: Legal and Ethical Considerations\nWeek 13-14: Case Studies and Practical Applications',
  'Dr. Emily Rodriguez',
  'Dr. Emily Rodriguez is a certified forensic investigator and former FBI digital forensics specialist. She has testified in numerous high-profile cybercrime cases and is a leading expert in digital evidence analysis.'
),
(
  'Ethical Hacking and Penetration Testing',
  'Become an ethical hacker by learning penetration testing methodologies, vulnerability assessment, and responsible disclosure practices.',
  'Learn ethical hacking techniques and penetration testing',
  'Ethical Hacking',
  'intermediate',
  55,
  40000,
  320.00,
  35,
  'Basic cybersecurity knowledge',
  ARRAY[
    'Understand ethical hacking principles',
    'Conduct vulnerability assessments',
    'Perform penetration testing',
    'Use hacking tools and techniques',
    'Write security reports and recommendations'
  ],
  'Week 1-3: Ethical Hacking Fundamentals\nWeek 4-6: Reconnaissance and Scanning\nWeek 7-9: Vulnerability Assessment\nWeek 10-12: Exploitation Techniques\nWeek 13-15: Post-Exploitation and Reporting\nWeek 16-17: Legal and Ethical Considerations',
  'Marcus Thompson',
  'Marcus Thompson is a certified ethical hacker (CEH) and OSCP holder with extensive experience in penetration testing. He has worked with major corporations to identify and fix security vulnerabilities.'
),
(
  'Cloud Security and Compliance',
  'Master cloud security principles, compliance frameworks, and secure cloud architecture design for AWS, Azure, and GCP platforms.',
  'Secure cloud infrastructure and ensure compliance',
  'Cloud Security',
  'intermediate',
  45,
  30000,
  240.00,
  45,
  'Basic cloud computing knowledge',
  ARRAY[
    'Design secure cloud architectures',
    'Implement cloud security controls',
    'Ensure compliance with regulations',
    'Manage cloud security incidents',
    'Use cloud security tools and services'
  ],
  'Week 1-2: Cloud Security Fundamentals\nWeek 3-4: AWS Security Best Practices\nWeek 5-6: Azure Security Implementation\nWeek 7-8: GCP Security Configuration\nWeek 9-10: Compliance Frameworks\nWeek 11-12: Cloud Incident Response\nWeek 13-14: Advanced Cloud Security Topics',
  'Dr. Lisa Park',
  'Dr. Lisa Park is a cloud security architect and AWS certified solutions architect. She specializes in helping organizations secure their cloud infrastructure and achieve compliance with industry standards.'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_category ON public.modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_difficulty ON public.modules(difficulty);
CREATE INDEX IF NOT EXISTS idx_modules_active ON public.modules(is_active);
CREATE INDEX IF NOT EXISTS idx_module_enrollments_user ON public.module_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_module_enrollments_module ON public.module_enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_module_content_module ON public.module_content(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_enrollment ON public.user_progress(enrollment_id);
