-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text check (type in ('booking', 'system', 'message')),
  message text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users default read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System inserts notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;

-- Create policies
CREATE POLICY "Users default read own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System inserts notifications" ON public.notifications
FOR INSERT WITH CHECK (true); -- Allow any authenticated user (student) to create notification for others

CREATE POLICY "Users update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Verify
SELECT 'Notifications table created successfully!' as status;
