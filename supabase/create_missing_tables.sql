-- ============================== 
-- Create ONLY missing tables (idempotent)
-- Safe to run multiple times
-- ============================== 

-- MENTORS TABLE (with linkedin and website already included)
CREATE TABLE IF NOT EXISTS public.mentors (
  id bigint generated always as identity primary key,
  user_id uuid unique references profiles(id) on delete cascade,
  bio text,
  company text,
  years_experience integer,
  hourly_rate numeric,
  rating numeric default 5 check (rating between 0 and 5),
  total_reviews integer default 0,
  linkedin text,
  website text,
  created_at timestamptz default now()
);

-- Enable RLS (safe to run if already enabled)
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (ensures they're correct)
DROP POLICY IF EXISTS "Mentors public read" ON public.mentors;
CREATE POLICY "Mentors public read" ON public.mentors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentor manages own profile" ON public.mentors;
CREATE POLICY "Mentor manages own profile" ON public.mentors FOR ALL USING (auth.uid() = user_id);

-- MENTOR EXPERTISE TABLE
CREATE TABLE IF NOT EXISTS public.mentor_expertise (
  mentor_id bigint references mentors(id) on delete cascade,
  skill text,
  primary key (mentor_id, skill)
);

ALTER TABLE public.mentor_expertise ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Expertise public read" ON public.mentor_expertise;
CREATE POLICY "Expertise public read" ON public.mentor_expertise FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentor manages expertise" ON public.mentor_expertise;
CREATE POLICY "Mentor manages expertise" ON public.mentor_expertise FOR ALL USING (
  EXISTS (
    SELECT 1 FROM mentors 
    WHERE id = mentor_expertise.mentor_id AND user_id = auth.uid()
  )
);

-- MENTOR AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id uuid default gen_random_uuid() primary key,
  mentor_id bigint references mentors(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean default false,
  check (end_time > start_time)
);

ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Availability public read" ON public.mentor_availability;
CREATE POLICY "Availability public read" ON public.mentor_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentor manages availability" ON public.mentor_availability;
CREATE POLICY "Mentor manages availability" ON public.mentor_availability FOR ALL USING (
  EXISTS (
    SELECT 1 FROM mentors 
    WHERE id = mentor_availability.mentor_id AND user_id = auth.uid()
  )
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  mentor_id bigint references mentors(id) on delete cascade,
  availability_id uuid unique references mentor_availability(id),
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  meeting_link text,
  created_at timestamptz default now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Student views bookings" ON public.bookings;
CREATE POLICY "Student views bookings" ON public.bookings FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Mentor views bookings" ON public.bookings;
CREATE POLICY "Mentor views bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM mentors WHERE id = bookings.mentor_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Student creates booking" ON public.bookings;
CREATE POLICY "Student creates booking" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Booking updates" ON public.bookings;
CREATE POLICY "Booking updates" ON public.bookings FOR UPDATE USING (
  auth.uid() = student_id OR 
  EXISTS (SELECT 1 FROM mentors WHERE id = bookings.mentor_id AND user_id = auth.uid())
);

-- MENTOR REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid unique references bookings(id) on delete cascade,
  mentor_id bigint references mentors(id),
  student_id uuid references profiles(id),
  rating integer check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews public read" ON public.mentor_reviews;
CREATE POLICY "Reviews public read" ON public.mentor_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Student submits review" ON public.mentor_reviews;
CREATE POLICY "Student submits review" ON public.mentor_reviews FOR INSERT WITH CHECK (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = mentor_reviews.booking_id 
      AND student_id = auth.uid() 
      AND status = 'completed'
  )
);

-- Success message
SELECT 'All mentor-related tables created successfully!' as status;
