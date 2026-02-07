-- ============================== 
-- Create missing student/track tables
-- Safe to run multiple times
-- ============================== 

-- TRACKS TABLE
CREATE TABLE IF NOT EXISTS public.tracks (
  id bigint generated always as identity primary key,
  title text not null,
  level text,
  description text,
  duration_weeks integer,
  image_url text,
  created_at timestamptz default now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tracks public read" ON public.tracks;
CREATE POLICY "Tracks public read" ON public.tracks FOR SELECT USING (true);

-- TRACK MODULES TABLE
CREATE TABLE IF NOT EXISTS public.track_modules (
  id bigint generated always as identity primary key,
  track_id bigint references tracks(id) on delete cascade,
  title text not null,
  module_order integer not null,
  created_at timestamptz default now(),
  unique(track_id, module_order)
);

ALTER TABLE public.track_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules public read" ON public.track_modules;
CREATE POLICY "Modules public read" ON public.track_modules FOR SELECT USING (true);

-- ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  track_id bigint references tracks(id) on delete cascade,
  progress integer default 0 check (progress between 0 and 100),
  status text check (status in ('active','completed','dropped')) default 'active',
  enrolled_at timestamptz default now(),
  unique(user_id, track_id)
);

-- Disable RLS for development
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Student/track tables created successfully!' as status;
