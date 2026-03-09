-- 1. Create a new storage bucket for images and logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Allow public access to read files in the bucket
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Public Read Access for Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  -- 3. Allow authenticated users to upload files
  BEGIN
    CREATE POLICY "Authenticated Upload Access for Avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- 4. Allow authenticated users to update files
  BEGIN
    CREATE POLICY "Authenticated Update Access for Avatars"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END
$$;
