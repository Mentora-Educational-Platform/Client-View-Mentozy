-- 1. Create a new storage bucket for course documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course_documents',
  'course_documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files in the bucket
CREATE POLICY "Public Read Access for Course Documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'course_documents');

-- 3. Allow authenticated users to upload files to the bucket
CREATE POLICY "Authenticated Upload Access for Course Documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course_documents' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to update their own files
CREATE POLICY "Authenticated Update Access for Course Documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course_documents' 
  AND auth.uid() = owner
);

-- 5. Allow authenticated users to delete their own files
CREATE POLICY "Authenticated Delete Access for Course Documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course_documents' 
  AND auth.uid() = owner
);
