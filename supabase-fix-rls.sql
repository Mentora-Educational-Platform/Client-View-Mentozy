-- Option 1: Disable RLS completely (Quickest for development)
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;

-- Option 2: Keep RLS but allow authenticated users to insert courses
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."tracks";
-- CREATE POLICY "Enable insert for authenticated users only" ON "public"."tracks" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
