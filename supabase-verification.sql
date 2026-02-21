-- Run this in your Supabase SQL Editor if you want to ensure users can't login without verification
-- or if you need to create a trigger to manage verified status

-- 1. If you want to require email confirmation for login, go to:
-- Supabase Dashboard -> Authentication -> Providers -> Email -> Enable "Confirm email"

-- 2. Optional: If you want to track verification status manually in the profiles table
-- (Note: Supabase auth.users already tracks email_confirmed_at, but this is useful for client-side queries)

-- Add is_verified column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Create a function that automatically syncs the verified status
CREATE OR REPLACE FUNCTION sync_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email_confirmed_at was just set
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles 
    SET is_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_verification();
