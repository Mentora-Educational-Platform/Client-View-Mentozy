-- ==========================================
-- CENTRAL NOTIFICATIONS SYSTEM MIGRATION
-- ==========================================

-- Drop any previous outdated notifications table schema if present
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id UUID,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    source_type VARCHAR(50),
    source_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set Replica Identity for Supabase Realtime filtering
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_is_read 
    ON public.notifications(recipient_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created_at 
    ON public.notifications(recipient_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ===================================================
-- SECURE POSTGRESQL RPC FUNCTIONS FOR NOTIFICATIONS
-- ===================================================

-- 1. Create single notification (Bypasses sender SELECT RLS restrictions safely)
CREATE OR REPLACE FUNCTION public.create_notification(
    p_recipient_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_body TEXT,
    p_link TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_org_id UUID DEFAULT NULL,
    p_source_type TEXT DEFAULT NULL,
    p_source_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
    v_actor UUID := COALESCE(p_actor_id, auth.uid());
BEGIN
    -- Senders should not receive notifications for their own actions
    IF v_actor IS NOT NULL AND v_actor = p_recipient_id THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        org_id,
        type,
        title,
        body,
        link,
        source_type,
        source_id,
        is_read
    ) VALUES (
        p_recipient_id,
        v_actor,
        p_org_id,
        p_type,
        p_title,
        p_body,
        p_link,
        p_source_type,
        p_source_id,
        FALSE
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- 2. Create bulk notifications
CREATE OR REPLACE FUNCTION public.create_bulk_notifications(
    p_recipient_ids UUID[],
    p_type TEXT,
    p_title TEXT,
    p_body TEXT,
    p_link TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_org_id UUID DEFAULT NULL,
    p_source_type TEXT DEFAULT NULL,
    p_source_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER := 0;
    v_recipient UUID;
    v_actor UUID := COALESCE(p_actor_id, auth.uid());
BEGIN
    FOREACH v_recipient IN ARRAY p_recipient_ids
    LOOP
        IF v_recipient IS NOT NULL AND (v_actor IS NULL OR v_recipient <> v_actor) THEN
            INSERT INTO public.notifications (
                recipient_id,
                actor_id,
                org_id,
                type,
                title,
                body,
                link,
                source_type,
                source_id,
                is_read
            ) VALUES (
                v_recipient,
                v_actor,
                p_org_id,
                p_type,
                p_title,
                p_body,
                p_link,
                p_source_type,
                p_source_id,
                FALSE
            );
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Enable Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
