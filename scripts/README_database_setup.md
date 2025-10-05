# Database Setup and Migration Guide

## PostgreSQL Errors and Fixes

### Error 1: "relation 'public.roles' does not exist"
If you encounter this error when running user seeding scripts, it means the database schema is incomplete.

### Error 2: "column p.role_id does not exist"
This error occurs when the `profiles` table is missing the `role_id` column that references the `roles` table.

### Error 3: "null value in column 'nationality' violates not-null constraint"
This error occurs when trying to insert into the `profiles` table without providing values for all required NOT NULL columns. The profiles table requires values for nationality, gender, date_of_birth, phone_number, designation, organization_name, document_type, and document_number.

Both errors indicate incomplete database schema setup. Follow this guide to properly set up your database.

## Root Cause
The error occurs because SQL scripts are trying to query the `roles` table before it has been created. The database migration scripts must be run in the correct order.

## Solution Steps

### 1. Run the Core Schema Scripts First
Execute these scripts in Supabase SQL Editor in this exact order:

#### A. Basic Database Schema
\`\`\`sql
-- Run: scripts/001_create_database_schema.sql
-- Creates: test_questions, profiles, contact_messages tables
\`\`\`

#### B. Role-Based Access Control (RBAC) System
\`\`\`sql
-- Run: scripts/010_add_role_based_access_control.sql
-- Creates: roles, permissions, role_permissions tables
-- Inserts: Default roles (admin, master_practitioner, practitioner)
-- Inserts: Comprehensive permissions
-- Sets up: RLS policies and helper functions
\`\`\`

#### C. Modules System
\`\`\`sql
-- Run: scripts/011_add_modules_system.sql
-- Creates: modules, module_enrollments, module_content, user_progress tables
-- Inserts: Sample modules and content
\`\`\`

#### D. Exam Management
\`\`\`sql
-- Run: scripts/008_add_exam_management.sql
-- Creates: exam_configurations, user_exams, certificate_templates tables
\`\`\`

### 2. Run the Update Scripts
\`\`\`sql
-- Run: scripts/012_update_roles_system.sql
-- Updates: Role permissions and RLS policies
-- Consolidates: admin roles and permissions
\`\`\`

### 3. Create Auth Users (Required Before Seeding)
Before running seeding scripts, you must create the corresponding auth users:

#### Option A: Node.js Script (Recommended)
\`\`\`bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js

# Run the script
node scripts/create-mprac-user.js
\`\`\`

#### Option B: Supabase Dashboard
\`\`\`sql
-- See: scripts/017_create_auth_user_mprac.sql
-- Instructions for creating Mprac@gmail.com in Supabase Auth
-- Use Supabase Dashboard to manually create the user
-- Note: Cannot insert directly into auth.users via SQL
\`\`\`

#### Option C: Supabase CLI
\`\`\`bash
supabase auth users create \
  --email Mprac@gmail.com \
  --password Mprac123 \
  --auto-confirm
\`\`\`

### 4. Run the Seeding Scripts
Now you can safely run the user seeding scripts:

\`\`\`sql
-- Run: scripts/013_seed_default_users.sql
-- Creates: Default practitioner and master practitioner profiles
\`\`\`

\`\`\`sql
-- Run: scripts/014_create_master_practitioner_account.sql
-- Creates: Mprac@gmail.com account with Master Practitioner role
-- IMPORTANT: Update the UUID placeholder with actual auth user ID
\`\`\`

## Quick Fix Script

If you just need to fix all database schema and constraint issues quickly, run this standalone script:

\`\`\`sql
-- Run: scripts/015_fix_roles_table.sql
-- This script creates:
-- - roles table with proper schema
-- - permissions and role_permissions tables
-- - Adds role_id column to profiles table
-- - Inserts default roles and permissions
-- - Sets up RLS policies and helper functions
-- Can be run independently of other scripts
-- Handles all three common PostgreSQL errors:
-- 1. "relation 'public.roles' does not exist"
-- 2. "column p.role_id does not exist"
-- 3. "null value in column violates not-null constraint"
\`\`\`

## Verification

After running the scripts, verify the setup is complete:

### Option 1: Run the comprehensive verification script
\`\`\`sql
-- Run: scripts/016_verify_database_setup.sql
-- This script checks:
-- - All required tables exist
-- - Profiles table has role_id column
-- - Roles and permissions are populated
-- - RLS policies are in place
-- - User role assignments
\`\`\`

### Option 2: Manual verification queries
\`\`\`sql
-- Check roles exist
SELECT name, display_name FROM public.roles ORDER BY name;

-- Check user role assignments
SELECT
  p.email,
  r.display_name as role
FROM public.profiles p
LEFT JOIN public.roles r ON r.id = p.role_id;

-- Check table existence
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
\`\`\`

## Expected Results

After proper setup, you should see:
- 3 roles: admin, master_practitioner, practitioner
- Users properly assigned to their roles
- No more "relation does not exist" errors

## Troubleshooting

### Still getting errors?
1. Check Supabase SQL Editor for any failed statements
2. Ensure you're running scripts in the correct order
3. Verify table creation with: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`

### Permission issues?
- Make sure you're running scripts as a database admin
- Check RLS policies aren't blocking your operations

### Auth user creation?
Remember that profile creation requires corresponding auth.users entries. Create users in Supabase Auth first, then run the seeding scripts with the correct UUIDs.

## Script Dependencies

\`\`\`
001_create_database_schema.sql
├── 010_add_role_based_access_control.sql
├── 011_add_modules_system.sql
├── 008_add_exam_management.sql
└── 012_update_roles_system.sql
    ├── create-mprac-user.js (Node.js Auth User Creation)
    ├── 017_create_auth_user_mprac.sql (Alternative Auth Instructions)
    ├── 013_seed_default_users.sql
    └── 014_create_master_practitioner_account.sql
\`\`\`

Run from top to bottom, left to right.
**Note**: Use `create-mprac-user.js` or follow `017_create_auth_user_mprac.sql` instructions to create the auth user before running the seeding scripts.
