-- Add levels and level_tests tables to Supabase
-- Run this in Supabase SQL Editor

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    estimated_duration INTEGER,
    learning_objectives JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create level_tests table
CREATE TABLE IF NOT EXISTS level_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL UNIQUE REFERENCES levels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB,
    total_questions INTEGER NOT NULL,
    passing_score INTEGER DEFAULT 70,
    time_limit INTEGER DEFAULT 1800,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add level_id column to module_contents table
ALTER TABLE module_contents
ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES levels(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_levels_module_id ON levels(module_id);
CREATE INDEX IF NOT EXISTS idx_levels_order_index ON levels(order_index);
CREATE INDEX IF NOT EXISTS idx_level_tests_level_id ON level_tests(level_id);
CREATE INDEX IF NOT EXISTS idx_module_contents_level_id ON module_contents(level_id);

-- Enable Row Level Security (RLS)
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your existing policies)
-- These are basic policies - you may need to adjust them based on your authentication setup

-- Allow authenticated users to read levels
CREATE POLICY "Allow authenticated users to read levels" ON levels
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to read level tests
CREATE POLICY "Allow authenticated users to read level tests" ON level_tests
    FOR SELECT USING (auth.role() = 'authenticated');

-- For master practitioners (assuming you have role-based access)
-- You may need to adjust these policies based on your role system
CREATE POLICY "Allow master practitioners to manage levels" ON levels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role_id IN (
                SELECT id FROM roles WHERE name = 'master_practitioner'
            )
        )
    );

CREATE POLICY "Allow master practitioners to manage level tests" ON level_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role_id IN (
                SELECT id FROM roles WHERE name = 'master_practitioner'
            )
        )
    );
