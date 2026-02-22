-- Run this in your Supabase SQL Editor

-- 1. Add creator_id to tracks table (foreign key to auth.users or profiles if available)
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add status column to tracks table
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

-- Optional: Enable RLS policy so creators can access their own tracks
-- (You may already have RLS set up, adjust if necessary)
-- CREATE POLICY "Creators can view their own tracks" ON tracks FOR SELECT USING (auth.uid() = creator_id);
-- CREATE POLICY "Creators can insert their own tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = creator_id);
-- CREATE POLICY "Creators can update their own tracks" ON tracks FOR UPDATE USING (auth.uid() = creator_id);
-- CREATE POLICY "Creators can delete their own tracks" ON tracks FOR DELETE USING (auth.uid() = creator_id);
