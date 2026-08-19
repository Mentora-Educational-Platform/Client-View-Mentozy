-- 1. Create org_tasks table if it does not exist
CREATE TABLE IF NOT EXISTS public.org_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for org_tasks
ALTER TABLE public.org_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Anyone can view organization tasks" ON public.org_tasks;
DROP POLICY IF EXISTS "Org admins can manage their own tasks" ON public.org_tasks;

-- Create policies for org_tasks
CREATE POLICY "Anyone can view organization tasks"
    ON public.org_tasks FOR SELECT
    USING (true);

CREATE POLICY "Org admins can manage their own tasks"
    ON public.org_tasks FOR ALL
    USING (auth.uid() = org_id)
    WITH CHECK (auth.uid() = org_id);


-- 2. Create org_task_submissions table if it does not exist
CREATE TABLE IF NOT EXISTS public.org_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.org_tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    files JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'redo')),
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    graded_at TIMESTAMPTZ,
    
    -- Ensure a student can submit only once per task (upserts update the record)
    CONSTRAINT unique_student_task UNIQUE (task_id, student_id)
);

ALTER TABLE public.org_task_submissions ADD COLUMN IF NOT EXISTS submission_text TEXT;

-- Enable RLS for org_task_submissions
ALTER TABLE public.org_task_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Students can insert their own submissions" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Org admins can view all submissions for their tasks" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Org admins can update submissions for their tasks" ON public.org_task_submissions;

-- Create policies for org_task_submissions
CREATE POLICY "Students can view their own submissions"
    ON public.org_task_submissions FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions"
    ON public.org_task_submissions FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions"
    ON public.org_task_submissions FOR UPDATE
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Org admins can view all submissions for their tasks"
    ON public.org_task_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.org_tasks t
            WHERE t.id = task_id AND t.org_id = auth.uid()
        )
    );

CREATE POLICY "Org admins can update submissions for their tasks"
    ON public.org_task_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.org_tasks t
            WHERE t.id = task_id AND t.org_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_tasks t
            WHERE t.id = task_id AND t.org_id = auth.uid()
        )
    );
