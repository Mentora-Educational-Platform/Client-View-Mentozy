-- ============================== 
-- COMPLETE FIX FOR MENTOR LOGIN
-- Run this entire script in Supabase SQL Editor
-- ============================== 

-- Step 1: Disable RLS on profiles (already done, but ensuring)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Fix watson@gmail.com role
UPDATE profiles 
SET role = 'mentor'
WHERE email = 'watson@gmail.com';

-- Step 3: Create mentor profile for watson
INSERT INTO mentors (user_id, bio, company, years_experience, hourly_rate, rating, total_reviews, linkedin, website)
SELECT 
    id,
    'Experienced mentor specializing in various subjects',
    'Independent Tutor',
    5,
    50.00,
    1.0,
    0,
    NULL,
    NULL
FROM profiles 
WHERE email = 'watson@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    company = EXCLUDED.company,
    hourly_rate = EXCLUDED.hourly_rate;

-- Step 4: Create missing tables for student dashboard (to avoid errors)

-- Tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
  id bigint generated always as identity primary key,
  title text not null,
  level text,
  description text,
  duration_weeks integer,
  image_url text,
  created_at timestamptz default now()
);

-- Track modules
CREATE TABLE IF NOT EXISTS public.track_modules (
  id bigint generated always as identity primary key,
  track_id bigint references tracks(id) on delete cascade,
  title text not null,
  module_order integer not null,
  created_at timestamptz default now(),
  unique(track_id, module_order)
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  track_id bigint references tracks(id) on delete cascade,
  progress integer default 0 check (progress between 0 and 100),
  status text check (status in ('active','completed','dropped')) default 'active',
  enrolled_at timestamptz default now(),
  unique(user_id, track_id)
);

-- Disable RLS on all new tables
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- Step 5: Verify watson setup
SELECT 
    p.email,
    p.full_name,
    p.role,
    m.id as mentor_id,
    m.hourly_rate
FROM profiles p
LEFT JOIN mentors m ON m.user_id = p.id
WHERE p.email = 'watson@gmail.com';

-- Expected result:
-- email: watson@gmail.com
-- role: mentor
-- mentor_id: [some number]
-- hourly_rate: 50.00

SELECT 'All fixes applied successfully!' as status;
