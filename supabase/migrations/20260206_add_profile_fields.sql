-- Add missing Profile columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS about_me text,
ADD COLUMN IF NOT EXISTS curiosities text,
ADD COLUMN IF NOT EXISTS learning_now text,
ADD COLUMN IF NOT EXISTS future_goals text,
ADD COLUMN IF NOT EXISTS learning_goals text,
ADD COLUMN IF NOT EXISTS learning_style text,
ADD COLUMN IF NOT EXISTS availability text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS age text; -- Kept as text to match frontend interface

-- Optional: Add policies if needed (assuming update policy already exists)
