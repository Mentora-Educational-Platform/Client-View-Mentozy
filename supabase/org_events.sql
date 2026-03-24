-- Create org_events table
CREATE TABLE IF NOT EXISTS public.org_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.org_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Orgs can view their own events"
    ON public.org_events FOR SELECT
    USING (auth.uid() = org_id);

CREATE POLICY "Orgs can insert their own events"
    ON public.org_events FOR INSERT
    WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Orgs can update their own events"
    ON public.org_events FOR UPDATE
    USING (auth.uid() = org_id);

CREATE POLICY "Orgs can delete their own events"
    ON public.org_events FOR DELETE
    USING (auth.uid() = org_id);
