-- Run this in your Supabase SQL Editor to support Deep Lesson Saving

-- 1. Add a JSONB column to track_modules to store all nested Lessons and Quizzes
ALTER TABLE public.track_modules
ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;
