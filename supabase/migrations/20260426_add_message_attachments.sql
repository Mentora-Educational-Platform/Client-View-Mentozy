-- Add attachment columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_size BIGINT;

-- Ensure storage bucket for message-attachments exists or policy allows authenticated users
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message-attachments
CREATE POLICY "Public Read for Message Attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated Upload for Message Attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');
