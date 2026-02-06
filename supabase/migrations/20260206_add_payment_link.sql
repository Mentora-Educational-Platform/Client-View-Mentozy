-- Add payment_link column
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_link text;

-- (Optional) Rename/Drop old column if strictly cleaning up, but keeping it for safety for now is fine.
-- ALTER TABLE public.bookings DROP COLUMN payment_proof_url; 
