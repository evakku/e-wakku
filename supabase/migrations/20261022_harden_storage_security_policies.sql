-- Migration: 20261022_harden_storage_security_policies.sql
-- Description: Production-ready Supabase Storage policy hardening for 'covers' and 'issue-pdfs'.
--
-- Security Guarantees:
-- 1. Genuinely Conservative Preflight: Aborts immediately if ANY unapproved mutation policy
--    (INSERT, UPDATE, DELETE, ALL) exists on storage.objects. Does not guess or rely on text
--    matching (OR expressions, helper functions, or unconstrained predicates are treated as unsafe).
--    Documented allowlist permits only observed legacy policies and idempotent target policies.
-- 2. Preflight runs FIRST in transaction before any schema setup or data modification.
-- 3. Isolated Migration Namespace: Baseline data stored in private schema "_migration_20261022_storage_hardening"
--    with permissions revoked from PostgREST/client API roles (PUBLIC, anon, authenticated).
-- 4. Non-Destructive Rerun Safety: ON CONFLICT DO NOTHING ensures initial baseline is never overwritten.
-- 5. Exact Conditional Dynamic Rollback: Captures whether each policy actually existed along with
--    exact mode, roles, cmd, qual, and with_check. Restores only policies that existed pre-migration.
--    Cleanup uses DROP SCHEMA ... RESTRICT (never CASCADE).
-- 6. Name-Conflict & Scope Safe Public Read: Verifies if a SELECT policy was created by this migration.
--    Refuses to guess based on text matching if an external policy with the proposed name exists.
-- 7. Preserves public.is_admin(), lib/supabase/auth.ts, and public bucket CDN delivery without modification.

BEGIN;

-- ============================================================================
-- 1. Genuinely Conservative Preflight Check (Runs Before Any Changes)
-- ============================================================================
-- Preflight evaluates ALL policies on storage.objects for mutation commands:
-- ALL, INSERT, UPDATE, DELETE affecting public, authenticated, anon, or unspecified roles.
--
-- Fail-Closed Principle:
-- We do NOT use heuristic text matching. Complex boolean expressions (e.g. "bucket_id = 'x' OR true"),
-- subqueries, or helper functions could allow unauthorized writes to covers or issue-pdfs.
--
-- Approved Policies Allowlist & Explicit Justifications:
-- 1. 'Auth upload covers': Observed legacy policy (INSERT covers for authenticated). Explicitly dropped in Step 5.
-- 2. 'Auth upload pdfs': Observed legacy policy (INSERT issue-pdfs for authenticated). Explicitly dropped in Step 5.
-- 3. 'Auth delete covers': Observed legacy policy (DELETE covers for authenticated). Explicitly dropped in Step 5.
-- 4. 'Auth delete pdfs': Observed legacy policy (DELETE issue-pdfs for authenticated). Explicitly dropped in Step 5.
-- 5. 'Admins can insert objects in covers and issue-pdfs': Hardened target policy created in Step 6.1. Approved for idempotent rerun.
-- 6. 'Admins can update objects in covers and issue-pdfs': Hardened target policy created in Step 6.2. Approved for idempotent rerun.
-- 7. 'Admins can delete objects in covers and issue-pdfs': Hardened target policy created in Step 6.3. Approved for idempotent rerun.
--
-- If ANY unapproved mutation policy exists (PERMISSIVE or RESTRICTIVE), ABORT IMMEDIATELY.

DO $$
DECLARE
    v_policy RECORD;
    v_unapproved_count INT := 0;
    v_unapproved_names TEXT := '';
BEGIN
    FOR v_policy IN (
        SELECT policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
          AND (
              roles IS NULL
              OR array_length(roles, 1) = 0
              OR 'public' = ANY(roles)
              OR 'authenticated' = ANY(roles)
              OR 'anon' = ANY(roles)
          )
    ) LOOP
        IF v_policy.policyname NOT IN (
            'Auth upload covers',
            'Auth upload pdfs',
            'Auth delete covers',
            'Auth delete pdfs',
            'Admins can insert objects in covers and issue-pdfs',
            'Admins can update objects in covers and issue-pdfs',
            'Admins can delete objects in covers and issue-pdfs'
        ) THEN
            v_unapproved_count := v_unapproved_count + 1;
            v_unapproved_names := v_unapproved_names || format('"%s" (cmd: %s, mode: %s); ', v_policy.policyname, v_policy.cmd, v_policy.permissive);
        END IF;
    END LOOP;

    IF v_unapproved_count > 0 THEN
        RAISE EXCEPTION 'Preflight Check Failed: Found % unapproved mutation policy/policies on storage.objects: % Target buckets cannot be secured safely without manual review. Aborting migration.',
            v_unapproved_count, v_unapproved_names;
    END IF;
END $$;


-- ============================================================================
-- 2. Create Migration-Specific Isolated Backup Schema
-- ============================================================================
-- Schema is private to this migration and revoked from PostgREST/client roles.

CREATE SCHEMA IF NOT EXISTS _migration_20261022_storage_hardening;
REVOKE ALL ON SCHEMA _migration_20261022_storage_hardening FROM PUBLIC, anon, authenticated;

-- Table to store pre-migration bucket configuration
CREATE TABLE IF NOT EXISTS _migration_20261022_storage_hardening.bucket_baseline (
    bucket_id TEXT PRIMARY KEY,
    file_size_limit BIGINT,
    allowed_mime_types TEXT[],
    public BOOLEAN,
    backed_up_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON _migration_20261022_storage_hardening.bucket_baseline FROM PUBLIC, anon, authenticated;

-- Table to store pre-migration policy definitions and verify whether each existed
CREATE TABLE IF NOT EXISTS _migration_20261022_storage_hardening.policy_baseline (
    policyname TEXT PRIMARY KEY,
    existed BOOLEAN NOT NULL,
    schemaname TEXT,
    tablename TEXT,
    permissive TEXT,
    roles TEXT[],
    cmd TEXT,
    qual TEXT,
    with_check TEXT,
    backed_up_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON _migration_20261022_storage_hardening.policy_baseline FROM PUBLIC, anon, authenticated;

-- Table to record migration metadata (e.g. whether SELECT policy was newly created)
CREATE TABLE IF NOT EXISTS _migration_20261022_storage_hardening.migration_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON _migration_20261022_storage_hardening.migration_meta FROM PUBLIC, anon, authenticated;


-- ============================================================================
-- 3. Capture Pre-Migration Baseline (Idempotent: ON CONFLICT DO NOTHING)
-- ============================================================================

-- 3.1 Backup bucket configuration before any updates
INSERT INTO _migration_20261022_storage_hardening.bucket_baseline (bucket_id, file_size_limit, allowed_mime_types, public)
SELECT id, file_size_limit, allowed_mime_types, public
FROM storage.buckets
WHERE id IN ('covers', 'issue-pdfs')
ON CONFLICT (bucket_id) DO NOTHING;

-- 3.2 Capture exactly which legacy policies existed along with full metadata before dropping
INSERT INTO _migration_20261022_storage_hardening.policy_baseline (
    policyname, existed, schemaname, tablename, permissive, roles, cmd, qual, with_check
)
SELECT
    expected.p_name,
    p.policyname IS NOT NULL AS existed,
    p.schemaname,
    p.tablename,
    p.permissive,
    p.roles::text[],
    p.cmd,
    p.qual,
    p.with_check
FROM (
    VALUES
        ('Auth upload covers'),
        ('Auth upload pdfs'),
        ('Auth delete covers'),
        ('Auth delete pdfs')
) AS expected(p_name)
LEFT JOIN pg_policies p
  ON p.schemaname = 'storage'
 AND p.tablename = 'objects'
 AND p.policyname = expected.p_name
ON CONFLICT (policyname) DO NOTHING;


-- ============================================================================
-- 4. Configure Bucket Limits on storage.buckets
-- ============================================================================
-- 7.5 MiB = 7.5 * 1024 * 1024 = 7,864,320 bytes.
-- Confirmed matching client validation, server actions, and supported file formats:
-- - covers: image/png, image/jpeg, image/webp
-- - issue-pdfs: application/pdf
-- Bucket visibility (public = true) is preserved.

UPDATE storage.buckets
SET file_size_limit = 7864320,
    allowed_mime_types = CASE
        WHEN id = 'covers' THEN ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
        WHEN id = 'issue-pdfs' THEN ARRAY['application/pdf']::text[]
        ELSE allowed_mime_types
    END
WHERE id IN ('covers', 'issue-pdfs');


-- ============================================================================
-- 5. Explicitly Drop the Reviewed Permissive Legacy Policies
-- ============================================================================
-- Mandatory because PostgreSQL combines permissive policies with boolean OR.
-- Only the reviewed legacy policies are dropped; unrelated policies are untouched.

DROP POLICY IF EXISTS "Auth upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete covers" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete pdfs" ON storage.objects;

-- Also clean up idempotent target policies if re-running
DROP POLICY IF EXISTS "Admins can insert objects in covers and issue-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update objects in covers and issue-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete objects in covers and issue-pdfs" ON storage.objects;


-- ============================================================================
-- 6. Create Hardened Storage Policies Using Existing public.is_admin()
-- ============================================================================

-- 6.1. INSERT: Only verified administrators can upload objects to covers and issue-pdfs
CREATE POLICY "Admins can insert objects in covers and issue-pdfs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('covers', 'issue-pdfs')
        AND public.is_admin()
    );

-- 6.2. UPDATE: Only verified administrators can replace or update objects in covers and issue-pdfs
CREATE POLICY "Admins can update objects in covers and issue-pdfs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id IN ('covers', 'issue-pdfs')
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id IN ('covers', 'issue-pdfs')
        AND public.is_admin()
    );

-- 6.3. DELETE: Only verified administrators can delete objects in covers and issue-pdfs
CREATE POLICY "Admins can delete objects in covers and issue-pdfs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('covers', 'issue-pdfs')
        AND public.is_admin()
    );


-- ============================================================================
-- 7. Public Read Access Handling (Expression and Name Conflict Safe)
-- ============================================================================
-- Rationale:
-- While public CDN downloads (/storage/v1/object/public/...) bypass RLS because
-- storage.buckets.public = true, client SDK operations like supabase.storage.from("covers").download(...)
-- (used in Server Actions to verify uploads) execute SELECT queries against storage.objects subject to RLS.
-- Therefore, an explicit SELECT policy is required for SDK operations.
--
-- Safety:
-- If a policy named "Allow public select on covers and issue-pdfs" already exists:
-- - If created by a previous run of this migration (verified via migration_meta), we keep it (idempotent).
-- - If it already existed before this migration or was created externally, we DO NOT assume text matching
--   proves its behavior; we ABORT immediately for manual review.

DO $$
DECLARE
    v_has_proposed_policy BOOLEAN;
    v_existing_meta_val TEXT;
    v_policy_created BOOLEAN := false;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Allow public select on covers and issue-pdfs'
    ) INTO v_has_proposed_policy;

    SELECT value INTO v_existing_meta_val
    FROM _migration_20261022_storage_hardening.migration_meta
    WHERE key = 'created_select_policy';

    IF v_has_proposed_policy THEN
        IF v_existing_meta_val = 'true' THEN
            -- Idempotent rerun: created previously by this migration
            v_policy_created := true;
        ELSE
            -- Pre-existing policy with the proposed name. Do not assume text matching proves behavior.
            RAISE EXCEPTION 'A policy named "Allow public select on covers and issue-pdfs" already exists on storage.objects but was not created by this migration. Cannot verify its behavior safely via text matching. Aborting for manual review.';
        END IF;
    ELSE
        CREATE POLICY "Allow public select on covers and issue-pdfs"
            ON storage.objects
            FOR SELECT
            TO public
            USING (bucket_id IN ('covers', 'issue-pdfs'));
        v_policy_created := true;
    END IF;

    INSERT INTO _migration_20261022_storage_hardening.migration_meta (key, value)
    VALUES ('created_select_policy', v_policy_created::text)
    ON CONFLICT (key) DO NOTHING;
END $$;

COMMIT;


-- ============================================================================
-- 8. Rollback & Recovery Procedures
-- ============================================================================
-- IMPORTANT NOTICE ON EXACT ROLLBACK:
-- PostgreSQL pg_policies stores deparsed expressions. The automated procedure below
-- uses dynamic SQL to restore ONLY policies where existed = true using the exact
-- captured mode, roles, cmd, USING (qual), and WITH CHECK (with_check) clauses.
-- If dynamic restoration encounters deparsed expression idiosyncrasies, use the
-- explicit Manual Recovery Script provided below. Do not label hardcoded recreation an exact rollback.

/*
-- --- AUTOMATED RESTORATION PROCEDURE ---
BEGIN;

-- 1. Drop the admin-only storage policies created by this migration:
DROP POLICY IF EXISTS "Admins can insert objects in covers and issue-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update objects in covers and issue-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete objects in covers and issue-pdfs" ON storage.objects;

-- 2. Drop the public SELECT policy ONLY IF it was created by this migration:
DO $$
DECLARE
    v_created TEXT;
BEGIN
    SELECT value INTO v_created
    FROM _migration_20261022_storage_hardening.migration_meta
    WHERE key = 'created_select_policy';

    IF v_created = 'true' THEN
        DROP POLICY IF EXISTS "Allow public select on covers and issue-pdfs" ON storage.objects;
    END IF;
END $$;

-- 3. Restore ONLY the original policies that actually existed before migration using captured metadata:
DO $$
DECLARE
    rec RECORD;
    v_roles_sql TEXT;
    v_using_sql TEXT;
    v_with_check_sql TEXT;
    v_sql TEXT;
BEGIN
    FOR rec IN (
        SELECT policyname, permissive, roles, cmd, qual, with_check
        FROM _migration_20261022_storage_hardening.policy_baseline
        WHERE existed = true
    ) LOOP
        -- Build roles clause
        IF rec.roles IS NULL OR array_length(rec.roles, 1) = 0 THEN
            v_roles_sql := 'public';
        ELSE
            SELECT string_agg(quote_ident(r), ', ') INTO v_roles_sql FROM unnest(rec.roles) AS r;
        END IF;

        -- Build USING clause
        IF rec.qual IS NOT NULL THEN
            v_using_sql := ' USING (' || rec.qual || ')';
        ELSE
            v_using_sql := '';
        END IF;

        -- Build WITH CHECK clause
        IF rec.with_check IS NOT NULL THEN
            v_with_check_sql := ' WITH CHECK (' || rec.with_check || ')';
        ELSE
            v_with_check_sql := '';
        END IF;

        v_sql := format(
            'CREATE POLICY %I ON storage.objects AS %s FOR %s TO %s%s%s',
            rec.policyname,
            COALESCE(rec.permissive, 'PERMISSIVE'),
            rec.cmd,
            v_roles_sql,
            v_using_sql,
            v_with_check_sql
        );

        EXECUTE v_sql;
    END LOOP;
END $$;

-- 4. Accurately restore original bucket configuration from baseline:
UPDATE storage.buckets b
SET file_size_limit = m.file_size_limit,
    allowed_mime_types = m.allowed_mime_types,
    public = m.public
FROM _migration_20261022_storage_hardening.bucket_baseline m
WHERE b.id = m.bucket_id;

-- 5. Safe cleanup: Drop migration tables individually, then DROP SCHEMA with RESTRICT (never CASCADE)
DROP TABLE IF EXISTS _migration_20261022_storage_hardening.policy_baseline;
DROP TABLE IF EXISTS _migration_20261022_storage_hardening.bucket_baseline;
DROP TABLE IF EXISTS _migration_20261022_storage_hardening.migration_meta;
DROP SCHEMA IF EXISTS _migration_20261022_storage_hardening RESTRICT;

COMMIT;


-- --- MANUAL RECOVERY SCRIPT (If manual verification is preferred) ---
-- Run only if automated dynamic restoration is not used:
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Admins can insert objects in covers and issue-pdfs" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can update objects in covers and issue-pdfs" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can delete objects in covers and issue-pdfs" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public select on covers and issue-pdfs" ON storage.objects;
--
-- CREATE POLICY "Auth upload covers" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
-- CREATE POLICY "Auth upload pdfs" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-pdfs');
-- CREATE POLICY "Auth delete covers" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (bucket_id = 'covers');
-- CREATE POLICY "Auth delete pdfs" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (bucket_id = 'issue-pdfs');
--
-- UPDATE storage.buckets SET file_size_limit = NULL, allowed_mime_types = NULL WHERE id IN ('covers', 'issue-pdfs');
-- DROP TABLE IF EXISTS _migration_20261022_storage_hardening.policy_baseline;
-- DROP TABLE IF EXISTS _migration_20261022_storage_hardening.bucket_baseline;
-- DROP TABLE IF EXISTS _migration_20261022_storage_hardening.migration_meta;
-- DROP SCHEMA IF EXISTS _migration_20261022_storage_hardening RESTRICT;
-- COMMIT;
*/
