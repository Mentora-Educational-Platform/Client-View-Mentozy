-- ==============================
-- ORGANISATIONS PARENT MIGRATION
-- ==============================

CREATE TABLE IF NOT EXISTS public.organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "View authorized organisations" ON public.organisations;
CREATE POLICY "View authorized organisations" 
ON public.organisations FOR SELECT 
USING (
    auth.uid() = owner_id 
    OR EXISTS (
        SELECT 1 FROM public.org_students 
        WHERE org_students.org_id = organisations.id 
        AND org_students.student_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.org_teachers 
        WHERE org_teachers.org_id = organisations.id 
        AND org_teachers.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Owners can update organisations" ON public.organisations;
CREATE POLICY "Owners can update organisations" 
ON public.organisations FOR UPDATE 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert organisations" ON public.organisations;
CREATE POLICY "Users can insert organisations" 
ON public.organisations FOR INSERT 
WITH CHECK (auth.uid() = owner_id OR auth.uid() = id);
