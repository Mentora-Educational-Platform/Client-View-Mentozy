-- Add status column to mentors table
ALTER TABLE mentors
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Optional: ensure constraint
ALTER TABLE mentors
ADD CONSTRAINT mentors_status_check CHECK (status IN ('active', 'unavailable'));
