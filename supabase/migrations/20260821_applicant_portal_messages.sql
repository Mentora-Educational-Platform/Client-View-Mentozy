-- Migration for Mentor Applicant Portal and Communication Messages

-- 1. Create mentor_application_messages table
CREATE TABLE IF NOT EXISTS public.mentor_application_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.mentor_applications(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'applicant', 'system')),
    sender_name TEXT,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_app_msgs_app_id ON public.mentor_application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_app_msgs_created ON public.mentor_application_messages(created_at ASC);

-- 3. Enable RLS
ALTER TABLE public.mentor_application_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can read own application messages" ON public.mentor_application_messages;
CREATE POLICY "Users can read own application messages"
ON public.mentor_application_messages FOR SELECT
USING (
    application_id IN (SELECT id FROM public.mentor_applications WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    ((auth.jwt() ->> 'email') = 'founder@mentozy.app')
);

DROP POLICY IF EXISTS "Users and admins can insert application messages" ON public.mentor_application_messages;
CREATE POLICY "Users and admins can insert application messages"
ON public.mentor_application_messages FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
);
