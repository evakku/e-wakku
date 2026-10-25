-- Migration: 20261024_unique_monthly_edition.sql
-- Description: Enforce Monthly Magazine Release Uniqueness on public.issues.
--              Guarantees that each calendar month and year can have at most one magazine edition
--              (published or draft), and standardizes month format to two digits ('01' to '12').
--
-- Business Rules:
-- 1. E-Wakku is a monthly periodical: exactly one issue can exist per calendar (year, month).
-- 2. Applies to all issues regardless of draft status or creator.
-- 3. Standardizes month format for reliable chronological ordering (year DESC, month DESC).

BEGIN;

-- 1. Pre-Check: Detect any existing historical duplicates before applying uniqueness constraint
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT year, LPAD(month, 2, '0') as norm_month
        FROM public.issues
        GROUP BY year, LPAD(month, 2, '0')
        HAVING COUNT(*) > 1
    ) dups;

    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Cannot apply unique constraint: % duplicate (year, month) edition(s) detected in public.issues. Resolve conflicts before running migration.', duplicate_count;
    END IF;
END $$;

-- 2. Format Normalization: Ensure all existing month values are 2-digit zero-padded ('01' to '12')
UPDATE public.issues
SET month = LPAD(month, 2, '0')
WHERE length(month) = 1;

-- 3. Format Constraint: Enforce valid two-digit month representation ('01' through '12')
ALTER TABLE public.issues
DROP CONSTRAINT IF EXISTS chk_issues_month_format;

ALTER TABLE public.issues
ADD CONSTRAINT chk_issues_month_format
CHECK (month ~ '^(0[1-9]|1[0-2])$');

-- 4. Unique Constraint: Ensure only one magazine edition exists per calendar month and year
--    Using a UNIQUE index allows concurrent safety and acts as a unique constraint.
CREATE UNIQUE INDEX IF NOT EXISTS uq_issues_year_month
ON public.issues(year, month);

-- 5. Documentation Comments
COMMENT ON CONSTRAINT chk_issues_month_format ON public.issues IS
'Enforces that issue publication month is strictly a two-digit zero-padded string between 01 and 12.';

COMMENT ON INDEX public.uq_issues_year_month IS
'Guarantees each calendar month and year has at most one magazine edition across all draft and published issues.';

COMMIT;

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
-- To revert this migration run the following statements in the Supabase SQL editor:
--
-- BEGIN;
-- DROP INDEX IF EXISTS public.uq_issues_year_month;
-- ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS chk_issues_month_format;
-- COMMIT;
-- ============================================================================
