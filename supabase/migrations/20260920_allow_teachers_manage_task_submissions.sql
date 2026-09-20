-- ==============================================================================
-- Allow Organization Teachers & Admins to view and evaluate task submissions
-- ==============================================================================

DROP POLICY IF EXISTS "Org admins can view all submissions for their tasks" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Org admins can update submissions for their tasks" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Org teachers and admins can view submissions" ON public.org_task_submissions;
DROP POLICY IF EXISTS "Org teachers and admins can update submissions" ON public.org_task_submissions;

-- 1. View policy for students, teachers, and org admins
CREATE POLICY "Org teachers and admins can view submissions"
ON public.org_task_submissions FOR SELECT
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.org_tasks t
        WHERE t.id = task_id AND (
            t.org_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.org_teachers ot
                WHERE ot.org_id = t.org_id AND ot.teacher_id = auth.uid() AND ot.status = 'Active'
            )
        )
    )
);

-- 2. Update policy for students, teachers, and org admins
CREATE POLICY "Org teachers and admins can update submissions"
ON public.org_task_submissions FOR UPDATE
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.org_tasks t
        WHERE t.id = task_id AND (
            t.org_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.org_teachers ot
                WHERE ot.org_id = t.org_id AND ot.teacher_id = auth.uid() AND ot.status = 'Active'
            )
        )
    )
)
WITH CHECK (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.org_tasks t
        WHERE t.id = task_id AND (
            t.org_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.org_teachers ot
                WHERE ot.org_id = t.org_id AND ot.teacher_id = auth.uid() AND ot.status = 'Active'
            )
        )
    )
);
