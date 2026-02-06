-- ==============================
-- PROFILES
-- ==============================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('student','mentor','admin')) default 'student',
  grade text,
  school text,
  phone text,
  interests text[],
  streak integer default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles read"
on profiles for select using (true);

create policy "User creates own profile"
on profiles for insert with check (auth.uid() = id);

create policy "User updates own profile"
on profiles for update using (auth.uid() = id);

-- ==============================
-- TRACKS
-- ==============================
create table public.tracks (
  id bigint generated always as identity primary key,
  title text not null,
  level text,
  description text,
  duration_weeks integer,
  image_url text,
  created_at timestamptz default now()
);

alter table tracks enable row level security;

create policy "Tracks public read"
on tracks for select using (true);

create policy "Admins manage tracks"
on tracks for all
using (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

-- ==============================
-- TRACK MODULES
-- ==============================
create table public.track_modules (
  id bigint generated always as identity primary key,
  track_id bigint references tracks(id) on delete cascade,
  title text not null,
  module_order integer not null,
  created_at timestamptz default now(),
  unique(track_id, module_order)
);

alter table track_modules enable row level security;

create policy "Modules public read"
on track_modules for select using (true);

create policy "Admins manage modules"
on track_modules for all
using (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

-- ==============================
-- LESSONS
-- ==============================
create table public.module_lessons (
  id bigint generated always as identity primary key,
  module_id bigint references track_modules(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  lesson_order integer not null,
  created_at timestamptz default now(),
  unique(module_id, lesson_order)
);

alter table module_lessons enable row level security;

create policy "Lessons public read"
on module_lessons for select using (true);

create policy "Admins manage lessons"
on module_lessons for all
using (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

-- ==============================
-- ENROLLMENTS
-- ==============================
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  track_id bigint references tracks(id) on delete cascade,
  progress integer default 0 check (progress between 0 and 100),
  status text check (status in ('active','completed','dropped')) default 'active',
  enrolled_at timestamptz default now(),
  unique(user_id, track_id)
);

alter table enrollments enable row level security;

create policy "View own enrollments"
on enrollments for select using (auth.uid() = user_id);

create policy "Self enrollment"
on enrollments for insert with check (auth.uid() = user_id);

create policy "Update own enrollment"
on enrollments for update using (auth.uid() = user_id);

-- ==============================
-- MENTOR SYSTEM
-- ==============================
create table public.mentors (
  id bigint generated always as identity primary key,
  user_id uuid unique references profiles(id) on delete cascade,
  bio text,
  company text,
  years_experience integer,
  hourly_rate numeric,
  rating numeric default 5 check (rating between 0 and 5),
  total_reviews integer default 0,
  created_at timestamptz default now()
);

alter table mentors enable row level security;

create policy "Mentors public read"
on mentors for select using (true);

create policy "Mentor manages own profile"
on mentors for all using (auth.uid() = user_id);

create table public.mentor_expertise (
  mentor_id bigint references mentors(id) on delete cascade,
  skill text,
  primary key (mentor_id, skill)
);

alter table mentor_expertise enable row level security;

create policy "Expertise public read"
on mentor_expertise for select using (true);

create policy "Mentor manages expertise"
on mentor_expertise for all
using (exists (
  select 1 from mentors where id = mentor_expertise.mentor_id and user_id = auth.uid()
));

-- ==============================
-- AVAILABILITY & BOOKINGS
-- ==============================
create table public.mentor_availability (
  id uuid default gen_random_uuid() primary key,
  mentor_id bigint references mentors(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean default false,
  check (end_time > start_time)
);

alter table mentor_availability enable row level security;

create policy "Availability public read"
on mentor_availability for select using (true);

create policy "Mentor manages availability"
on mentor_availability for all
using (exists (
  select 1 from mentors where id = mentor_availability.mentor_id and user_id = auth.uid()
));

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  mentor_id bigint references mentors(id) on delete cascade,
  availability_id uuid unique references mentor_availability(id),
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  meeting_link text,
  mentor_note text,
  payment_proof_url text, -- Deprecated
  payment_link text,
  created_at timestamptz default now()
);

alter table bookings enable row level security;

create policy "Student views bookings"
on bookings for select using (auth.uid() = student_id);

create policy "Mentor views bookings"
on bookings for select
using (exists (
  select 1 from mentors where id = bookings.mentor_id and user_id = auth.uid()
));

create policy "Student creates booking"
on bookings for insert with check (auth.uid() = student_id);

create policy "Booking updates"
on bookings for update using (
  auth.uid() = student_id OR
  exists (select 1 from mentors where id = bookings.mentor_id and user_id = auth.uid())
);

-- ==============================
-- PAYMENTS
-- ==============================
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  booking_id uuid references bookings(id),
  stripe_payment_intent text,
  amount numeric not null,
  currency text default 'inr',
  status text check (status in ('created','paid','failed','refunded')),
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy "User views payments"
on payments for select using (auth.uid() = user_id);

create policy "User inserts payment"
on payments for insert with check (auth.uid() = user_id);

-- ==============================
-- REVIEWS
-- ==============================
create table public.mentor_reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid unique references bookings(id) on delete cascade,
  mentor_id bigint references mentors(id),
  student_id uuid references profiles(id),
  rating integer check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

alter table mentor_reviews enable row level security;

create policy "Reviews public read"
on mentor_reviews for select using (true);

create policy "Student submits review"
on mentor_reviews for insert
with check (
  auth.uid() = student_id and
  exists (
    select 1 from bookings
    where id = mentor_reviews.booking_id
    and student_id = auth.uid()
    and status = 'completed'
  )
);

-- ==============================
-- ACTIVITY LOGS
-- ==============================
create table public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  event_type text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table activity_events enable row level security;

create policy "User logs activity"
on activity_events for insert with check (auth.uid() = user_id);

create policy "Admin analytics read"
on activity_events for select
using (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));
