-- Migration: 20260928_create_learning_videos.sql
-- Description: Create learning_videos table for "Learn with us" educational video library

CREATE TABLE IF NOT EXISTS public.learning_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    thumbnail_url TEXT,
    published BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.learning_videos ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy:
-- Authenticated individual students can view published videos
-- Admins can view all videos (both published and draft)
CREATE POLICY "View learning videos"
ON public.learning_videos FOR SELECT
TO authenticated
USING (
    published = true 
    OR (auth.role() = 'authenticated' AND (public.is_admin() OR auth.jwt() ->> 'role' = 'admin'))
);

-- 2. Admin Insert Policy
CREATE POLICY "Admins insert learning videos"
ON public.learning_videos FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin() OR (auth.jwt() ->> 'role' = 'admin')
);

-- 3. Admin Update Policy
CREATE POLICY "Admins update learning videos"
ON public.learning_videos FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR (auth.jwt() ->> 'role' = 'admin')
)
WITH CHECK (
    public.is_admin() OR (auth.jwt() ->> 'role' = 'admin')
);

-- 4. Admin Delete Policy
CREATE POLICY "Admins delete learning videos"
ON public.learning_videos FOR DELETE
TO authenticated
USING (
    public.is_admin() OR (auth.jwt() ->> 'role' = 'admin')
);

-- Indexes for fast filtering and ordering
CREATE INDEX IF NOT EXISTS idx_learning_videos_grade_subject ON public.learning_videos (grade, subject);
CREATE INDEX IF NOT EXISTS idx_learning_videos_published ON public.learning_videos (published);
CREATE INDEX IF NOT EXISTS idx_learning_videos_display_order ON public.learning_videos (display_order ASC, created_at DESC);

-- Seed initial real Mentozy educational videos
INSERT INTO public.learning_videos (grade, subject, chapter, title, description, youtube_url, youtube_video_id, thumbnail_url, published, display_order)
VALUES
    (
        'Grade 10', 
        'CBSE 10th Boards', 
        'Syllabus & Strategy', 
        'Class 10 Boards 2027: Complete Syllabus, Important Chapters & Study Plan | CBSE', 
        'Complete breakdown of CBSE Class 10 Board syllabus, high-weightage chapters, timeline, and master strategy for scoring top marks.', 
        'https://youtu.be/y7I1Xzv0qIA', 
        'y7I1Xzv0qIA', 
        'https://img.youtube.com/vi/y7I1Xzv0qIA/hqdefault.jpg', 
        true, 
        1
    ),
    (
        'Grade 10', 
        'Mathematics', 
        'Real Numbers', 
        'REAL NUMBERS 🔢 | Class 10 Maths Chapter 1 | Complete NCERT Explanation | CBSE 2026-27', 
        'Complete NCERT concept explanation, Fundamental Theorem of Arithmetic, Euclid division, and proofs of irrationality for Class 10.', 
        'https://youtu.be/RAGungtYDhc', 
        'RAGungtYDhc', 
        'https://img.youtube.com/vi/RAGungtYDhc/hqdefault.jpg', 
        true, 
        2
    ),
    (
        'Grade 10', 
        'Mathematics', 
        'Real Numbers', 
        'Real Numbers | Most Important Board Questions | AP SSC 2027 | 1 • 2 • 4 • 8 Marks', 
        'High-weightage board exam questions analyzed step-by-step for AP SSC 2027 covering 1, 2, 4, and 8 marks problem patterns.', 
        'https://youtu.be/wyv8W0iGEGs', 
        'wyv8W0iGEGs', 
        'https://img.youtube.com/vi/wyv8W0iGEGs/hqdefault.jpg', 
        true, 
        3
    ),
    (
        'Grade 10', 
        'Mathematics', 
        'Real Numbers', 
        'Real Numbers Class 10 | Most Important Board Questions | CBSE 2026-27 | NCERT + Sample Paper', 
        'Most important CBSE Class 10 board questions from NCERT, Exemplar, and official sample papers with exam-oriented solving techniques.', 
        'https://youtu.be/C_gaPwwVWOw', 
        'C_gaPwwVWOw', 
        'https://img.youtube.com/vi/C_gaPwwVWOw/hqdefault.jpg', 
        true, 
        4
    )
ON CONFLICT DO NOTHING;

