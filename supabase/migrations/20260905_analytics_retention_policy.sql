-- Migration: 20260905_analytics_retention_policy.sql
-- Description: Implement data retention and pruning policy for raw analytics_events.
-- Raw events older than 90 days are pruned because aggregated counters in issue_analytics
-- and analytics_summary permanently preserve lifetime readership and download totals.

-- 1. Create maintenance function to purge raw events older than N days (default: 90)
CREATE OR REPLACE FUNCTION public.purge_old_analytics_events(days_to_keep INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT := 0;
  cutoff_time TIMESTAMPTZ;
BEGIN
  -- Validate input boundary (at least 7 days retention)
  IF days_to_keep < 7 THEN
    RAISE EXCEPTION 'Retention period must be at least 7 days.';
  END IF;

  cutoff_time := NOW() - (days_to_keep || ' days')::INTERVAL;

  -- Delete stale raw event records
  WITH deleted AS (
    DELETE FROM public.analytics_events
    WHERE created_at < cutoff_time
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- 2. Restrict execution of purge function to postgres and service_role
REVOKE ALL ON FUNCTION public.purge_old_analytics_events(INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_old_analytics_events(INT) FROM anon;
REVOKE ALL ON FUNCTION public.purge_old_analytics_events(INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_analytics_events(INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_old_analytics_events(INT) TO postgres;

COMMENT ON FUNCTION public.purge_old_analytics_events(INT) IS
  'Prunes raw analytics_events older than specified days (default 90) to prevent unbounded table growth.';

-- 3. If pg_cron extension is installed and available, schedule monthly execution
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'purge-old-analytics-events',
      '0 3 1 * *', -- At 03:00 on day-of-month 1
      'SELECT public.purge_old_analytics_events(90);'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- In environments without pg_cron privileges, function remains callable by service_role cron
    NULL;
END;
$$;
