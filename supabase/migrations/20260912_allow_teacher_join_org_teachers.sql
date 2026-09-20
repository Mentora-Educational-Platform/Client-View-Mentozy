-- ==============================================================================
-- Allow teachers to join (insert) and manage their membership in org_teachers
-- Run this in your Supabase SQL Editor to grant teachers RLS permissions
-- ==============================================================================

-- 1. Ensure Teachers can insert their own record when accepting an invitation
DROP POLICY IF EXISTS "Teachers can join organizations" ON public.org_teachers;
CREATE POLICY "Teachers can join organizations" 
ON public.org_teachers FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

-- 2. Ensure Teachers can update their own status
DROP POLICY IF EXISTS "Teachers can update membership status" ON public.org_teachers;
CREATE POLICY "Teachers can update membership status" 
ON public.org_teachers FOR UPDATE 
USING (auth.uid() = teacher_id);

-- 3. Ensure org_invitations can be updated by invited mentors
DROP POLICY IF EXISTS "Mentors can update invitation status" ON public.org_invitations;
CREATE POLICY "Mentors can update invitation status" 
ON public.org_invitations FOR UPDATE 
USING (auth.uid() = mentor_id);
