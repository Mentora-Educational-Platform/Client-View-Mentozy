-- Comprehensive Mentor Applications Table & Policies for Mentozy
CREATE TABLE IF NOT EXISTS public.mentor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id BIGINT NULL REFERENCES public.mentors(id) ON DELETE SET NULL,

    -- 1. Personal Information
    full_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth TEXT,
    gender TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    profile_photo_url TEXT,

    -- 2. Education
    education_status TEXT,
    current_grade TEXT,
    degree TEXT,
    field_of_study TEXT,
    institution TEXT,
    graduation_year TEXT,
    highest_qualification TEXT,
    academic_achievements TEXT,

    -- 3. Professional
    occupation TEXT,
    organization TEXT,
    job_title TEXT,
    years_experience TEXT,
    professional_summary TEXT,
    previous_experiences JSONB DEFAULT '[]'::jsonb,

    -- 4. Expertise & Skills
    primary_expertise TEXT,
    secondary_expertise TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    skill_levels JSONB DEFAULT '{}'::jsonb,
    what_can_you_teach TEXT,

    -- 5. Mentoring Experience
    has_mentoring_experience BOOLEAN DEFAULT false,
    mentoring_types TEXT[] DEFAULT '{}',
    mentored_audience TEXT[] DEFAULT '{}',
    learner_count TEXT,
    mentoring_duration TEXT,
    mentoring_description TEXT,
    previous_teaching_platforms TEXT[] DEFAULT '{}',
    mentoring_evidence_links TEXT,
    no_experience_confidence TEXT,

    -- 6. Mentorship Preferences
    student_levels TEXT[] DEFAULT '{}',
    student_age_groups TEXT[] DEFAULT '{}',
    mentorship_formats TEXT[] DEFAULT '{}',
    session_styles TEXT[] DEFAULT '{}',
    topics_not_to_mentor TEXT,

    -- 7. Teaching Approach & Philosophy
    mentoring_philosophy TEXT,
    teaching_style TEXT[] DEFAULT '{}',
    scenario_difficult_student TEXT,
    scenario_different_skill_levels TEXT,
    scenario_unmotivated_student TEXT,
    scenario_unknown_question TEXT,
    scenario_constructive_feedback TEXT,

    -- 8. Availability & Scheduling
    hours_per_week TEXT,
    preferred_session_lengths TEXT[] DEFAULT '{}',
    available_days TEXT[] DEFAULT '{}',
    available_time_slots JSONB DEFAULT '{}'::jsonb,
    minimum_notice TEXT,
    languages JSONB DEFAULT '[]'::jsonb,
    communication_methods TEXT[] DEFAULT '{}',

    -- 9. Portfolio & Verification
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    website_url TEXT,
    other_links TEXT,
    achievements TEXT,
    supporting_documents JSONB DEFAULT '[]'::jsonb,

    -- 10. General Application Questions
    q_why_mentozy TEXT,
    q_student_outcomes TEXT,
    q_wish_known_earlier TEXT,
    q_helped_someone TEXT,
    q_different_approach TEXT,
    q_student_disagrees TEXT,
    q_professional_boundaries TEXT,
    q_academic_integrity TEXT,

    -- 11. Safety & Conduct
    code_of_conduct_agreed BOOLEAN DEFAULT false,
    terms_agreed BOOLEAN DEFAULT false,
    accurate_info_declared BOOLEAN DEFAULT false,

    -- 12. Pricing & Platform Preferences
    paid_mentoring_interest TEXT DEFAULT 'Yes',
    price_30_min NUMERIC,
    price_60_min NUMERIC,
    price_recommendation_requested BOOLEAN DEFAULT false,
    free_intro_sessions TEXT DEFAULT 'Maybe',

    -- 13. Application Status & Moderation
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('draft', 'submitted', 'under_review', 'needs_info', 'approved', 'rejected', 'withdrawn')),
    admin_notes TEXT,
    admin_feedback TEXT,
    applicant_response TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_apps_status ON public.mentor_applications(status);
CREATE INDEX IF NOT EXISTS idx_mentor_apps_user ON public.mentor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_apps_number ON public.mentor_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_mentor_apps_submitted ON public.mentor_applications(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

-- Select policy: users can view their own application, and admins can view all
DROP POLICY IF EXISTS "Users can view own mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can view own mentor applications"
ON public.mentor_applications FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Insert policy: authenticated users can insert their own application
DROP POLICY IF EXISTS "Users can insert own mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can insert own mentor applications"
ON public.mentor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Update policy: users can update their own application if draft, pending, or needs_info
DROP POLICY IF EXISTS "Users can update own mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can update own mentor applications"
ON public.mentor_applications FOR UPDATE
USING (auth.uid() = user_id AND status IN ('draft', 'submitted', 'under_review', 'needs_info'))
WITH CHECK (auth.uid() = user_id);

-- Admin management policy
DROP POLICY IF EXISTS "Admins can manage mentor applications" ON public.mentor_applications;
CREATE POLICY "Admins can manage mentor applications"
ON public.mentor_applications FOR ALL
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
