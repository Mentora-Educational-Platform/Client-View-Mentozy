-- ==============================
-- ADD MENTOR PROFILE FIELDS
-- Migration: Add LinkedIn and Website fields to mentors table
-- Date: 2026-02-06
-- ==============================

-- Add new columns to mentors table
ALTER TABLE mentors 
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS website text;

-- Update RLS policies remain unchanged (they already allow mentors to manage their own profiles)

-- Optional: Add index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_mentors_linkedin ON mentors(linkedin);
CREATE INDEX IF NOT EXISTS idx_mentors_website ON mentors(website);
