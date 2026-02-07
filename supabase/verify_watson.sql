-- Quick verification script
-- Run this to check the current state of watson@gmail.com

-- 1. Check if watson exists and their role
SELECT 
    'Profile Check' as check_type,
    email,
    full_name,
    role,
    CASE 
        WHEN role = 'mentor' THEN '✅ CORRECT'
        ELSE '❌ WRONG - Should be mentor'
    END as status
FROM profiles 
WHERE email = 'watson@gmail.com';

-- 2. Check if watson has a mentor record
SELECT 
    'Mentor Record Check' as check_type,
    m.id as mentor_id,
    m.bio,
    m.hourly_rate,
    CASE 
        WHEN m.id IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status  
FROM profiles p
LEFT JOIN mentors m ON m.user_id = p.id
WHERE p.email = 'watson@gmail.com';

-- 3. Check RLS status on profiles table
SELECT 
    'RLS Check' as check_type,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN '✅ DISABLED (Good)'
        ELSE '❌ ENABLED (Bad - will cause 406 error)'
    END as status
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 4. Check if required tables exist
SELECT 
    'Table Check' as check_type,
    table_name,
    '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tracks', 'enrollments', 'track_modules', 'mentors', 'mentor_expertise')
ORDER BY table_name;
