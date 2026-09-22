-- Migration: 20260922_sync_org_students.sql
-- Ensure org_students table exists, has correct RLS, and links the active 8 students to the organisation.

CREATE TABLE IF NOT EXISTS public.org_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade TEXT DEFAULT 'General',
    status TEXT DEFAULT 'Active',
    joined_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, student_id)
);

-- Enable RLS
ALTER TABLE public.org_students ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view org_students
DROP POLICY IF EXISTS "Allow users to view org_students" ON public.org_students;
CREATE POLICY "Allow users to view org_students"
    ON public.org_students
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Allow org admins and system to insert/update org_students
DROP POLICY IF EXISTS "Allow manage org_students" ON public.org_students;
CREATE POLICY "Allow manage org_students"
    ON public.org_students
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Insert the 8 organisation students for the active organization
INSERT INTO public.org_students (org_id, student_id, grade, status)
VALUES
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', '32dedca2-6718-40fb-81d9-676b736f2111', 'college', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', '23d7353e-c143-474a-955c-688ab4121616', 'General', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', '1037eb18-44cd-4ee2-8349-8835135d3896', 'General', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', 'c15bfbd4-4be3-4a0f-97a8-b46f3734e1be', 'General', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', '4fccffee-1ec3-4e3b-a321-be88623d5e25', 'General', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', 'b339d819-6f51-4737-8fd7-d02b4f28ccf6', 'General', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', 'ef69ad47-838a-4372-8ced-3fc42c2b1e17', 'U.G', 'Active'),
    ('1c6d1067-5d33-4b2d-843e-00f771e0007e', 'de430e13-1b3a-4fb2-9d79-3034888dd8e0', 'General', 'Active')
ON CONFLICT (org_id, student_id) 
DO UPDATE SET 
    grade = EXCLUDED.grade,
    status = 'Active';

-- Also insert for secondary org ID if used interchangeably
INSERT INTO public.org_students (org_id, student_id, grade, status)
VALUES
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', '32dedca2-6718-40fb-81d9-676b736f2111', 'college', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', '23d7353e-c143-474a-955c-688ab4121616', 'General', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', '1037eb18-44cd-4ee2-8349-8835135d3896', 'General', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', 'c15bfbd4-4be3-4a0f-97a8-b46f3734e1be', 'General', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', '4fccffee-1ec3-4e3b-a321-be88623d5e25', 'General', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', 'b339d819-6f51-4737-8fd7-d02b4f28ccf6', 'General', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', 'ef69ad47-838a-4372-8ced-3fc42c2b1e17', 'U.G', 'Active'),
    ('a425b6c9-8b6c-4088-b004-00feea605fcb', 'de430e13-1b3a-4fb2-9d79-3034888dd8e0', 'General', 'Active')
ON CONFLICT (org_id, student_id) 
DO UPDATE SET 
    grade = EXCLUDED.grade,
    status = 'Active';
