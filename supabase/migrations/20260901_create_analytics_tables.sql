-- Migration: Create persistent analytics tables and migrate historical data
-- Description: Replaces local file-based analytics (analytics.json) with Supabase PostgreSQL storage

-- 1. Analytics Events (Detailed event log for views and downloads)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download')),
    issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient querying by issue and event type
CREATE INDEX IF NOT EXISTS idx_analytics_events_issue_id ON public.analytics_events(issue_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to record view/download events
CREATE POLICY "Allow public insert on analytics_events"
    ON public.analytics_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated users / server client to select events
CREATE POLICY "Allow public select on analytics_events"
    ON public.analytics_events
    FOR SELECT
    TO anon, authenticated
    USING (true);


-- 2. Issue Analytics (Aggregated metrics per issue)
CREATE TABLE IF NOT EXISTS public.issue_analytics (
    issue_id UUID PRIMARY KEY REFERENCES public.issues(id) ON DELETE CASCADE,
    views INTEGER NOT NULL DEFAULT 0,
    readers INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.issue_analytics ENABLE ROW LEVEL SECURITY;

-- Allow select and upsert for analytics processing
CREATE POLICY "Allow public select on issue_analytics"
    ON public.issue_analytics
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public insert on issue_analytics"
    ON public.issue_analytics
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public update on issue_analytics"
    ON public.issue_analytics
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);


-- 3. Analytics Summary (Global totals and active reader statistics)
CREATE TABLE IF NOT EXISTS public.analytics_summary (
    id TEXT PRIMARY KEY DEFAULT 'global',
    total_readers INTEGER NOT NULL DEFAULT 0,
    active_readers INTEGER NOT NULL DEFAULT 0,
    total_views INTEGER NOT NULL DEFAULT 0,
    total_downloads INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on analytics_summary"
    ON public.analytics_summary
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public insert on analytics_summary"
    ON public.analytics_summary
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public update on analytics_summary"
    ON public.analytics_summary
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);


-- 4. Initial Migration of Historical Data from analytics.json (Idempotent)

-- Seed global summary
INSERT INTO public.analytics_summary (id, total_readers, active_readers, total_views, total_downloads, last_updated)
VALUES ('global', 1485, 416, 4955, 1252, '2026-08-31T16:35:47.179Z')
ON CONFLICT (id) DO NOTHING;

-- Seed per-issue historical statistics
INSERT INTO public.issue_analytics (issue_id, views, readers, downloads, last_viewed_at, last_downloaded_at, updated_at)
VALUES
    ('ac9eba56-8f9a-4af3-a659-91016f78c6f5', 1250, 410, 380, '2026-08-25T08:30:00Z', '2026-08-25T07:15:00Z', '2026-08-31T16:35:47.179Z'),
    ('c6b21c7d-1974-4952-bfda-a58edd0f4846', 986, 316, 245, '2026-08-31T13:55:18.723Z', '2026-08-24T15:40:00Z', '2026-08-31T16:35:47.179Z'),
    ('1c75dda5-93d4-4783-a52a-92ae1b60bfe6', 875, 275, 212, '2026-08-31T16:35:35.935Z', '2026-08-30T16:28:08.285Z', '2026-08-31T16:35:47.179Z'),
    ('67cb3136-4910-4ca6-9811-0bb031b72bad', 1139, 359, 292, '2026-08-31T16:31:56.105Z', '2026-08-25T09:34:20.281Z', '2026-08-31T16:35:47.179Z'),
    ('1be4746a-8a78-4a60-8343-edab07b37508', 705, 245, 123, '2026-08-31T16:35:47.179Z', '2026-08-30T10:55:31.997Z', '2026-08-31T16:35:47.179Z')
ON CONFLICT (issue_id) DO NOTHING;
