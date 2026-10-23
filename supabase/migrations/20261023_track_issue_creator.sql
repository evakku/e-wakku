-- Migration: 20261023_track_issue_creator.sql
-- Description: Track administrator creator attribution for magazine issues.
--              Adds created_by UUID column referencing auth.users with ON DELETE SET NULL,
--              performance index, and database-level immutability trigger.
--
-- Security & Architectural Guarantees:
-- 1. Attribution Integrity: Stores the Supabase Auth UUID of the administrator who originally created the issue.
-- 2. Deletion Policy (ON DELETE SET NULL): When an administrator account is removed/deleted from auth.users,
--    the corresponding publication issues remain intact with created_by set to NULL. Issues are NEVER cascade-deleted.
-- 3. Backward Compatibility: Column is nullable with no default. Existing historical issues remain valid
--    with created_by = NULL (rendered as legacy/unknown in UI).
-- 4. Database-Level Immutability: The `trg_protect_issue_created_by` trigger prevents any subsequent UPDATE
--    from modifying `created_by` once it has been assigned, guaranteeing permanent creator provenance.

BEGIN;

-- 1. Add created_by column referencing auth.users
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add performance index on created_by for administrator issue lookups
CREATE INDEX IF NOT EXISTS idx_issues_created_by
ON public.issues(created_by);

-- 3. Database Trigger Function: Protect created_by from alteration on UPDATE
CREATE OR REPLACE FUNCTION public.protect_issue_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prevent altering created_by once assigned
    IF OLD.created_by IS NOT NULL AND NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'Forbidden: Issue created_by attribution is immutable and cannot be modified.';
    END IF;
    RETURN NEW;
END;
$$;

-- 4. Attach trigger to public.issues table
DROP TRIGGER IF EXISTS trg_protect_issue_created_by ON public.issues;
CREATE TRIGGER trg_protect_issue_created_by
BEFORE UPDATE ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.protect_issue_created_by();

-- 5. Documentation Comments
COMMENT ON COLUMN public.issues.created_by IS 'Supabase Auth UUID of the administrator who originally created this issue. Nullable for legacy issues predating attribution.';
COMMENT ON FUNCTION public.protect_issue_created_by() IS 'Database trigger enforcing immutability of issue creator attribution on UPDATE.';

COMMIT;
