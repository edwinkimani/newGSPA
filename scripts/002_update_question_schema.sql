-- Update question schema to support dynamic options
-- This allows questions to have variable number of options instead of fixed A,B,C,D

-- Create new question_options table
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_letter TEXT NOT NULL, -- A, B, C, D, etc.
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_correct ON public.question_options(question_id, is_correct);

-- Update test_questions table to remove fixed options and correct_answer
-- We'll keep the old columns for backward compatibility during migration
ALTER TABLE public.test_questions
ADD COLUMN IF NOT EXISTS options_count INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS uses_dynamic_options BOOLEAN DEFAULT FALSE;

-- Enable RLS for question_options
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for question_options (read-only for authenticated users)
CREATE POLICY "question_options_select_authenticated" ON public.question_options FOR SELECT USING (auth.role() = 'authenticated');

-- Migrate existing questions to use dynamic options
-- This will be run as a separate migration script
-- INSERT INTO public.question_options (question_id, option_text, option_letter, is_correct)
-- SELECT
--   id as question_id,
--   option_a as option_text,
--   'A' as option_letter,
--   (correct_answer = 'a') as is_correct
-- FROM public.test_questions
-- WHERE uses_dynamic_options = FALSE
-- UNION ALL
-- SELECT
--   id as question_id,
--   option_b as option_text,
--   'B' as option_letter,
--   (correct_answer = 'b') as is_correct
-- FROM public.test_questions
-- WHERE uses_dynamic_options = FALSE
-- UNION ALL
-- SELECT
--   id as question_id,
--   option_c as option_text,
--   'C' as option_letter,
--   (correct_answer = 'c') as is_correct
-- FROM public.test_questions
-- WHERE uses_dynamic_options = FALSE
-- UNION ALL
-- SELECT
--   id as question_id,
--   option_d as option_text,
--   'D' as option_letter,
--   (correct_answer = 'd') as is_correct
-- FROM public.test_questions
-- WHERE uses_dynamic_options = FALSE;

-- Update migrated questions to use dynamic options
-- UPDATE public.test_questions SET uses_dynamic_options = TRUE WHERE uses_dynamic_options = FALSE;

-- Note: The old columns (option_a, option_b, option_c, option_d, correct_answer)
-- can be dropped in a future migration after confirming everything works
