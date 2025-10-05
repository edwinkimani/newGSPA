-- Create ongoing tests table for persistent test sessions
CREATE TABLE IF NOT EXISTS public.ongoing_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions_data JSONB NOT NULL,
  answers_data JSONB NOT NULL DEFAULT '{}',
  current_question INTEGER NOT NULL DEFAULT 0,
  time_left INTEGER NOT NULL DEFAULT 3600, -- 60 minutes in seconds
  test_started BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Only one ongoing test per user
);

-- Enable Row Level Security
ALTER TABLE public.ongoing_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ongoing_tests
CREATE POLICY "ongoing_tests_select_own" ON public.ongoing_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ongoing_tests_insert_own" ON public.ongoing_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ongoing_tests_update_own" ON public.ongoing_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ongoing_tests_delete_own" ON public.ongoing_tests FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ongoing_tests_user_id ON public.ongoing_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_ongoing_tests_updated_at ON public.ongoing_tests(updated_at);
