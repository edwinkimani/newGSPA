-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  passport_photo_url TEXT,
  nationality TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license')),
  document_number TEXT NOT NULL,
  signature_data TEXT,
  declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_reference TEXT,
  test_completed BOOLEAN NOT NULL DEFAULT FALSE,
  test_score INTEGER,
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security test questions table
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test attempts table
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions_data JSONB NOT NULL,
  answers_data JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for test_questions (read-only for authenticated users)
CREATE POLICY "test_questions_select_authenticated" ON public.test_questions FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Create RLS policies for test_attempts
CREATE POLICY "test_attempts_select_own" ON public.test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "test_attempts_insert_own" ON public.test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample test questions
INSERT INTO public.test_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('What is the primary purpose of a firewall in network security?', 'To encrypt data', 'To filter network traffic', 'To store passwords', 'To backup data', 'b', 'Network Security', 'easy'),
('Which of the following is considered a strong password?', 'password123', 'P@ssw0rd!2024', '12345678', 'admin', 'b', 'Authentication', 'easy'),
('What does CIA stand for in information security?', 'Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Computer Information Access', 'Cyber Intelligence Analysis', 'b', 'Fundamentals', 'medium'),
('Which protocol is used for secure web browsing?', 'HTTP', 'FTP', 'HTTPS', 'SMTP', 'c', 'Network Security', 'easy'),
('What is social engineering in cybersecurity?', 'Building secure networks', 'Manipulating people to divulge information', 'Writing security software', 'Monitoring network traffic', 'b', 'Social Engineering', 'medium');
