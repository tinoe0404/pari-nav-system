-- ==============================================
-- DIAGNOSTIC SCRIPT: Check Realtime & RLS Setup
-- ==============================================
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if RLS is enabled on tables
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('patients', 'treatment_plans', 'treatment_reviews', 'profiles')
ORDER BY tablename;

-- 1b. Check Replica Identity (Crucial for UPDATE events)
SELECT 
    relname as tablename,
    relreplident as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('patients', 'treatment_plans', 'treatment_reviews');
-- d = default (pk), n = nothing, f = full, i = index

-- 2. Check realtime publication
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check RLS policies on patients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'patients'
ORDER BY policyname;

-- 4. Check your current user's role
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- SELECT 
--     id,
--     role
-- FROM profiles 
-- WHERE id = 'YOUR_USER_ID';

-- 5. Test if you can query patients table
SELECT 
    COUNT(*) as patient_count,
    'If you see a count, SELECT works' as status
FROM patients;

-- 6. Check if profiles table has proper RLS
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
