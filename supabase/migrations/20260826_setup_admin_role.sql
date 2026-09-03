-- Migration: 20260826_setup_admin_role.sql
-- Description: Ensures admin role is properly supported in public.profiles and assigns role='admin' to the founder user account.

-- 1. Ensure profiles.role column allows 'student', 'mentor', 'admin', 'teacher', 'org'
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'mentor', 'admin', 'teacher', 'org'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 2. Synchronize founder account in auth.users with public.profiles role = 'admin'
DO $$
DECLARE
    founder_rec RECORD;
BEGIN
    FOR founder_rec IN 
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        WHERE email = 'founder@mentozy.app'
    LOOP
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (
            founder_rec.id, 
            COALESCE(founder_rec.raw_user_meta_data->>'full_name', 'Mentozy Founder'), 
            'admin'
        )
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin';
    END LOOP;
END $$;

-- 3. Ensure RLS policies for profiles allow admins to read all profiles
DROP POLICY IF EXISTS "Admins can view and update all profiles" ON public.profiles;
CREATE POLICY "Admins can view and update all profiles"
ON public.profiles FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
