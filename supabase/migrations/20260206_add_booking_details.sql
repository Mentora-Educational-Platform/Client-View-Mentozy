-- Add columns for session acceptance details
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS mentor_note text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_proof_url text;
