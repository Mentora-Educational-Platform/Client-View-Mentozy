-- Mentozy Community & Forum Database Architecture Migration
-- 2026-04-27: Create organisation-scoped community tables, categories, posts, replies, reactions, and RLS policies

-- 1. Create community_categories table
CREATE TABLE IF NOT EXISTS public.community_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_category_slug UNIQUE (org_id, slug)
);

-- 2. Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_type TEXT,
    attachment_size NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create community_replies table
CREATE TABLE IF NOT EXISTS public.community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_type TEXT,
    attachment_size NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create community_reactions table
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'heart',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reaction_target_check CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR
        (post_id IS NULL AND reply_id IS NOT NULL)
    ),
    CONSTRAINT unique_user_post_reaction UNIQUE (post_id, user_id),
    CONSTRAINT unique_user_reply_reaction UNIQUE (reply_id, user_id)
);

-- Indexes for ultra-fast organisation-scoped queries & feeds
CREATE INDEX IF NOT EXISTS idx_community_categories_org ON public.community_categories(org_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_org ON public.community_posts(org_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_post ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_reply ON public.community_reactions(reply_id);

-- Enable RLS on all community tables
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user belongs to an organisation
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Direct match: user is the organisation account / admin
    IF p_org_id = p_user_id THEN
        RETURN TRUE;
    END IF;

    -- 2. Check if user is organisation owner in organisations table
    IF EXISTS (
        SELECT 1 FROM public.organisations 
        WHERE (id = p_org_id OR owner_id = p_org_id) 
          AND (owner_id = p_user_id OR id = p_user_id)
    ) THEN
        RETURN TRUE;
    END IF;

    -- 3. Check if user is active student in org
    IF EXISTS (
        SELECT 1 FROM public.org_students 
        WHERE org_id = p_org_id 
          AND student_id = p_user_id 
          AND LOWER(status) = 'active'
    ) THEN
        RETURN TRUE;
    END IF;

    -- 4. Check if user is active teacher in org (uses teacher_id column)
    IF EXISTS (
        SELECT 1 FROM public.org_teachers 
        WHERE org_id = p_org_id 
          AND teacher_id = p_user_id 
          AND LOWER(status) = 'active'
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- RLS Policies for community_categories
CREATE POLICY "Categories viewable by organisation members" ON public.community_categories
    FOR SELECT USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Categories manageable by organisation owners and teachers" ON public.community_categories
    FOR ALL USING (public.is_org_member(org_id, auth.uid()));

-- RLS Policies for community_posts
CREATE POLICY "Posts viewable by organisation members" ON public.community_posts
    FOR SELECT USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Posts insertable by organisation members" ON public.community_posts
    FOR INSERT WITH CHECK (public.is_org_member(org_id, auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Posts updateable by author or org owner" ON public.community_posts
    FOR UPDATE USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Posts deletable by author or org owner" ON public.community_posts
    FOR DELETE USING (public.is_org_member(org_id, auth.uid()));

-- RLS Policies for community_replies
CREATE POLICY "Replies viewable by post organisation members" ON public.community_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );

CREATE POLICY "Replies insertable by post organisation members" ON public.community_replies
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );

CREATE POLICY "Replies updateable by author or org member" ON public.community_replies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );

CREATE POLICY "Replies deletable by author or org member" ON public.community_replies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );

-- RLS Policies for community_reactions
CREATE POLICY "Reactions viewable by post organisation members" ON public.community_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );

CREATE POLICY "Reactions manageable by post organisation members" ON public.community_reactions
    FOR ALL USING (
        user_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.community_posts p 
            WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())
        )
    );
