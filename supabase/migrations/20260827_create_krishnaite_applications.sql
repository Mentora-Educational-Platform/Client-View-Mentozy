-- Migration: 20260827_create_krishnaite_applications.sql
-- Description: Complete schema for Krishnaite 18-Day Practical AI Course Applications, Communication Messages, and Audit Events

-- 1. Create krishnaite_course_applications Table
CREATE TABLE IF NOT EXISTS public.krishnaite_course_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic Applicant Information
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    age TEXT,
    gender TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    profile_photo_url TEXT,

    -- Multi-Step Application JSONB Data Payloads
    education_data JSONB DEFAULT '{}'::jsonb,
    professional_data JSONB DEFAULT '{}'::jsonb,
    ai_experience JSONB DEFAULT '{}'::jsonb,
    learning_goals JSONB DEFAULT '{}'::jsonb,
    skills JSONB DEFAULT '{}'::jsonb,
    automation_interests JSONB DEFAULT '{}'::jsonb,
    creative_interests JSONB DEFAULT '{}'::jsonb,
    learning_commitment JSONB DEFAULT '{}'::jsonb,
    motivation_data JSONB DEFAULT '{}'::jsonb,
    community_data JSONB DEFAULT '{}'::jsonb,
    portfolio_data JSONB DEFAULT '{}'::jsonb,
    device_data JSONB DEFAULT '{}'::jsonb,
    acknowledgements JSONB DEFAULT '{}'::jsonb,

    -- Application Source & Status
    source TEXT NOT NULL DEFAULT 'general_application' CHECK (source IN ('general_application', 'aivantage_direct_invitation')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'needs_info', 'accepted', 'declined', 'waitlisted', 'invited')),
    
    -- Financial & Scholarship Fields
    scholarship_type TEXT NOT NULL DEFAULT 'standard_50' CHECK (scholarship_type IN ('standard_50', 'scholarship_75', 'aivantage_100')),
    scholarship_percentage INTEGER NOT NULL DEFAULT 50 CHECK (scholarship_percentage IN (0, 50, 75, 100)),
    course_value NUMERIC NOT NULL DEFAULT 10000,
    discount_amount NUMERIC NOT NULL DEFAULT 5000,
    payable_amount NUMERIC NOT NULL DEFAULT 5000,
    
    -- Progress & Administrative
    current_step INTEGER NOT NULL DEFAULT 0,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create krishnaite_application_messages Table (Two-way communications / Needs Info)
CREATE TABLE IF NOT EXISTS public.krishnaite_application_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.krishnaite_course_applications(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'applicant', 'system')),
    sender_name TEXT,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create krishnaite_application_events Table (Audit History Log)
CREATE TABLE IF NOT EXISTS public.krishnaite_application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.krishnaite_course_applications(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_kga_app_user_id ON public.krishnaite_course_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_kga_app_app_id ON public.krishnaite_course_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_kga_app_status ON public.krishnaite_course_applications(status);
CREATE INDEX IF NOT EXISTS idx_kga_app_email ON public.krishnaite_course_applications(email);
CREATE INDEX IF NOT EXISTS idx_kga_app_source ON public.krishnaite_course_applications(source);
CREATE INDEX IF NOT EXISTS idx_kga_app_created ON public.krishnaite_course_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kga_msg_app_id ON public.krishnaite_application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_kga_msg_created ON public.krishnaite_application_messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_kga_events_app_id ON public.krishnaite_application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_kga_events_created ON public.krishnaite_application_events(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.krishnaite_course_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.krishnaite_application_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.krishnaite_application_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for krishnaite_course_applications
DROP POLICY IF EXISTS "Applicants can view own krishnaite applications" ON public.krishnaite_course_applications;
CREATE POLICY "Applicants can view own krishnaite applications"
ON public.krishnaite_course_applications FOR SELECT
USING (
    auth.uid() = user_id OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Applicants can insert own krishnaite applications" ON public.krishnaite_course_applications;
CREATE POLICY "Applicants can insert own krishnaite applications"
ON public.krishnaite_course_applications FOR INSERT
WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Applicants can update own draft application" ON public.krishnaite_course_applications;
CREATE POLICY "Applicants can update own draft application"
ON public.krishnaite_course_applications FOR UPDATE
USING (
    (auth.uid() = user_id AND status IN ('draft', 'submitted', 'under_review', 'needs_info')) OR
    public.is_admin()
)
WITH CHECK (
    auth.uid() = user_id OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Admins full access to krishnaite applications" ON public.krishnaite_course_applications;
CREATE POLICY "Admins full access to krishnaite applications"
ON public.krishnaite_course_applications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. RLS Policies for krishnaite_application_messages
DROP POLICY IF EXISTS "Applicants can read own krishnaite application messages" ON public.krishnaite_application_messages;
CREATE POLICY "Applicants can read own krishnaite application messages"
ON public.krishnaite_application_messages FOR SELECT
USING (
    application_id IN (SELECT id FROM public.krishnaite_course_applications WHERE user_id = auth.uid()) OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Applicants and admins can insert application messages" ON public.krishnaite_application_messages;
CREATE POLICY "Applicants and admins can insert application messages"
ON public.krishnaite_application_messages FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL OR
    public.is_admin()
);

-- 8. RLS Policies for krishnaite_application_events
DROP POLICY IF EXISTS "Applicants and admins can read application events" ON public.krishnaite_application_events;
CREATE POLICY "Applicants and admins can read application events"
ON public.krishnaite_application_events FOR SELECT
USING (
    application_id IN (SELECT id FROM public.krishnaite_course_applications WHERE user_id = auth.uid()) OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Applicants and admins can insert application events" ON public.krishnaite_application_events;
CREATE POLICY "Applicants and admins can insert application events"
ON public.krishnaite_application_events FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL OR
    public.is_admin()
);

-- 9. Trigger for Auto-Updating updated_at Timestamp
CREATE OR REPLACE FUNCTION public.set_krishnaite_app_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_krishnaite_app_updated_at ON public.krishnaite_course_applications;
CREATE TRIGGER tr_krishnaite_app_updated_at
BEFORE UPDATE ON public.krishnaite_course_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_krishnaite_app_updated_at();
