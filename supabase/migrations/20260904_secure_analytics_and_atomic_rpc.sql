-- Migration: Secure Analytics Tables & Add Atomic RPC Function
-- Description: Revokes public mutation on analytics tables (DB-01) and encapsulates analytics logging & aggregation into a single atomic transaction (DB-03).

-- 1. Drop insecure public mutation policies on issue_analytics if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert on issue_analytics" ON public.issue_analytics;
    DROP POLICY IF EXISTS "Allow public update on issue_analytics" ON public.issue_analytics;
    DROP POLICY IF EXISTS "Allow authenticated full access on issue_analytics" ON public.issue_analytics;

    CREATE POLICY "Allow authenticated full access on issue_analytics"
        ON public.issue_analytics
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
END $$;

-- 2. Drop insecure public mutation policies on analytics_summary if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert on analytics_summary" ON public.analytics_summary;
    DROP POLICY IF EXISTS "Allow public update on analytics_summary" ON public.analytics_summary;
    DROP POLICY IF EXISTS "Allow authenticated full access on analytics_summary" ON public.analytics_summary;

    CREATE POLICY "Allow authenticated full access on analytics_summary"
        ON public.analytics_summary
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
END $$;

-- 3. Atomic Database Function (RPC) for Multi-Table Analytics Mutations (DB-03)
-- Encapsulates event logging and counter increments into a single atomic transaction.
CREATE OR REPLACE FUNCTION public.track_analytics_event(
    p_event_type TEXT,
    p_issue_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_total_readers INTEGER;
    v_active_readers INTEGER;
    v_total_views INTEGER;
    v_total_downloads INTEGER;
BEGIN
    -- 1. Record granular event
    INSERT INTO public.analytics_events (event_type, issue_id, created_at)
    VALUES (p_event_type, p_issue_id, v_now);

    -- 2. Update per-issue statistics if valid issue_id provided
    IF p_issue_id IS NOT NULL THEN
        INSERT INTO public.issue_analytics (issue_id, views, readers, downloads, last_viewed_at, last_downloaded_at, updated_at)
        VALUES (
            p_issue_id,
            CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'download' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'view' THEN v_now ELSE NULL END,
            CASE WHEN p_event_type = 'download' THEN v_now ELSE NULL END,
            v_now
        )
        ON CONFLICT (issue_id) DO UPDATE SET
            views = CASE WHEN p_event_type = 'view' THEN public.issue_analytics.views + 1 ELSE public.issue_analytics.views END,
            readers = CASE WHEN p_event_type = 'view' THEN public.issue_analytics.readers + 1 ELSE public.issue_analytics.readers END,
            downloads = CASE WHEN p_event_type = 'download' THEN public.issue_analytics.downloads + 1 ELSE public.issue_analytics.downloads END,
            last_viewed_at = CASE WHEN p_event_type = 'view' THEN v_now ELSE public.issue_analytics.last_viewed_at END,
            last_downloaded_at = CASE WHEN p_event_type = 'download' THEN v_now ELSE public.issue_analytics.last_downloaded_at END,
            updated_at = v_now;
    END IF;

    -- 3. Update global summary atomically
    INSERT INTO public.analytics_summary (id, total_readers, active_readers, total_views, total_downloads, last_updated)
    VALUES (
        'global',
        CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'download' THEN 1 ELSE 0 END,
        v_now
    )
    ON CONFLICT (id) DO UPDATE SET
        total_views = CASE WHEN p_event_type = 'view' THEN public.analytics_summary.total_views + 1 ELSE public.analytics_summary.total_views END,
        total_readers = CASE WHEN p_event_type = 'view' THEN public.analytics_summary.total_readers + 1 ELSE public.analytics_summary.total_readers END,
        active_readers = CASE WHEN p_event_type = 'view' THEN GREATEST(1, ROUND((public.analytics_summary.total_readers + 1) * 0.28)) ELSE public.analytics_summary.active_readers END,
        total_downloads = CASE WHEN p_event_type = 'download' THEN public.analytics_summary.total_downloads + 1 ELSE public.analytics_summary.total_downloads END,
        last_updated = v_now;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.track_analytics_event(TEXT, UUID) TO anon, authenticated;
