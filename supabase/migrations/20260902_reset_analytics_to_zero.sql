-- Migration: Reset Analytics to Zero and Enable Supabase Realtime
-- Description: Sets all views, readers, and downloads counters to 0, and enables Realtime publication

-- 1. Enable Supabase Realtime on analytics tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_summary;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;

-- 2. Clear granular event history
TRUNCATE TABLE public.analytics_events;

-- 3. Reset all issue analytics metrics to 0
UPDATE public.issue_analytics
SET views = 0,
    readers = 0,
    downloads = 0,
    last_viewed_at = NULL,
    last_downloaded_at = NULL,
    updated_at = now();

-- 4. Reset global analytics summary to 0
INSERT INTO public.analytics_summary (id, total_readers, active_readers, total_views, total_downloads, last_updated)
VALUES ('global', 0, 0, 0, 0, now())
ON CONFLICT (id) DO UPDATE
SET total_readers = 0,
    active_readers = 0,
    total_views = 0,
    total_downloads = 0,
    last_updated = now();
