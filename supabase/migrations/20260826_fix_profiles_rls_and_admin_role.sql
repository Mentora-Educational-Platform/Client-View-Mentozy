-- Migration: 20260826_fix_profiles_rls_and_admin_role.sql
-- Description: Fixes 42P17 infinite recursion on public.profiles and sets up non-recursive admin helper function

-- 1. Create SECURITY DEFINER helper function for non-recursive admin checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop all existing policies on public.profiles to avoid 42710 conflicts
DROP POLICY IF EXISTS "Admins can view and update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "User creates own profile" ON public.profiles;
DROP POLICY IF EXISTS "User updates own profile" ON public.profiles;
DROP POLICY IF EXISTS "User deletes own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 3. Recreate clean, non-recursive RLS policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id OR public.is_admin());

-- 4. Ensure profiles.role constraint allows valid roles
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'mentor', 'admin', 'teacher', 'org'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Fix RLS policies on mentor_applications to use public.is_admin()
DROP POLICY IF EXISTS "Users can view own mentor applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Users can insert own mentor applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Users and admins can update mentor applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Admins have full access to mentor applications" ON public.mentor_applications;

CREATE POLICY "Users can view own mentor applications"
ON public.mentor_applications FOR SELECT
USING (
    auth.uid() = user_id OR 
    public.is_admin()
);

CREATE POLICY "Users can insert own mentor applications"
ON public.mentor_applications FOR INSERT
WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL OR
    public.is_admin()
);

CREATE POLICY "Users and admins can update mentor applications"
ON public.mentor_applications FOR UPDATE
USING (
    (auth.uid() = user_id AND status IN ('draft', 'submitted', 'under_review', 'needs_info')) OR
    public.is_admin()
)
WITH CHECK (
    (auth.uid() = user_id) OR
    public.is_admin()
);

CREATE POLICY "Admins have full access to mentor applications"
ON public.mentor_applications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Fix RLS policies on mentor_application_messages to use public.is_admin()
DROP POLICY IF EXISTS "Users can read own application messages" ON public.mentor_application_messages;
DROP POLICY IF EXISTS "Users and admins can insert application messages" ON public.mentor_application_messages;

CREATE POLICY "Users can read own application messages"
ON public.mentor_application_messages FOR SELECT
USING (
    application_id IN (SELECT id FROM public.mentor_applications WHERE user_id = auth.uid()) OR
    public.is_admin()
);

CREATE POLICY "Users and admins can insert application messages"
ON public.mentor_application_messages FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
);

-- 7. Fix RLS policies on mentor_application_events to use public.is_admin()
DROP POLICY IF EXISTS "Users can view own application events" ON public.mentor_application_events;
DROP POLICY IF EXISTS "Admins and applicants can insert application events" ON public.mentor_application_events;

CREATE POLICY "Users can view own application events"
ON public.mentor_application_events FOR SELECT
USING (
    application_id IN (SELECT id FROM public.mentor_applications WHERE user_id = auth.uid()) OR
    public.is_admin()
);

-- 8. Assign role = 'admin' to founder@mentozy.app in public.profiles
DO $$
DECLARE
    founder_user_id UUID;
    founder_name TEXT;
BEGIN
    SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Mentozy Founder')
    INTO founder_user_id, founder_name
    FROM auth.users
    WHERE email = 'founder@mentozy.app'
    LIMIT 1;

    IF founder_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (founder_user_id, founder_name, 'admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';
    END IF;
END $$;
