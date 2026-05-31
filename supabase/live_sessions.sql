-- Create live_sessions table
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration TEXT NOT NULL,
    room_id TEXT NOT NULL UNIQUE,
    passcode TEXT NOT NULL,
    invited_student_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Select policy: Orgs can view their own, and students can view if they are invited
CREATE POLICY "Users can select live sessions they are part of"
    ON public.live_sessions FOR SELECT
    USING (
        auth.uid() = org_id OR 
        auth.uid() = ANY(invited_student_ids)
    );

-- Insert/Update/Delete policy: Only the creator organization can modify
CREATE POLICY "Orgs can manage their own live sessions"
    ON public.live_sessions FOR ALL
    USING (auth.uid() = org_id)
    WITH CHECK (auth.uid() = org_id);
