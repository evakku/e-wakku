-- Migration: 20261023_admin_removal_and_primary_protection.sql
-- Description: Implement database-level primary administrator protection, zero-admin prevention triggers,
--              and secure administrator removal RPC.
--
-- Security & Authorization Architecture:
-- 1. Defense in Depth: While application Server Actions enforce business rules in Next.js,
--    this migration establishes PostgreSQL engine-level constraints and triggers that make it
--    physically impossible to delete the primary administrator or remove the final administrator,
--    even if invoked via raw SQL or administrative clients.
-- 2. Partial Unique Index: Guarantees that at most one primary administrator exists in `public.admins`.
-- 3. Trigger Invariants: `BEFORE DELETE OR UPDATE` triggers abort illegal operations before data modification.
-- 4. Scope Distinction:
--    - Database Level: Revokes privilege membership by deleting rows from `public.admins`.
--    - Application Level: Revokes session tokens and purges Auth accounts from `auth.users` via admin client.

BEGIN;

-- 1. Column: is_primary
-- Purpose: Identifies the primary administrator account (e.g. founder/organization owner).
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

-- 2. Partial Unique Index: idx_admins_primary
-- Purpose: Guarantees database-level singleton constraint ensuring at most one administrator
-- can ever have `is_primary = true` at any point in time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_primary
ON public.admins (is_primary)
WHERE is_primary = true;

-- 3. Initial Primary Administrator Designation
-- Purpose: Automatically flags the earliest created administrator row as primary if none is yet flagged.
UPDATE public.admins
SET is_primary = true
WHERE user_id = (
    SELECT a.user_id
    FROM public.admins a
    JOIN auth.users u ON u.id = a.user_id
    ORDER BY u.created_at ASC
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM public.admins WHERE is_primary = true
);

-- 4. Database Trigger Function: Protect Primary Administrator
-- Security Guarantee: Runs BEFORE DELETE OR UPDATE OF is_primary on `public.admins`.
-- Aborts immediately if attempting to delete or demote an administrator flagged with `is_primary = true`.
CREATE OR REPLACE FUNCTION public.protect_primary_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF OLD.is_primary THEN
        RAISE EXCEPTION 'Forbidden: The primary administrator account cannot be removed or demoted.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_primary_admin ON public.admins;
CREATE TRIGGER trg_protect_primary_admin
BEFORE DELETE OR UPDATE OF is_primary ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.protect_primary_admin();

-- 5. Database Trigger Function: Prevent Zero Administrators
-- Security Guarantee: Runs BEFORE DELETE on `public.admins`.
-- Prevents system lockout by verifying that total remaining administrators > 1 before permitting deletion.
CREATE OR REPLACE FUNCTION public.prevent_zero_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    admin_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.admins;
    IF admin_count <= 1 THEN
        RAISE EXCEPTION 'Forbidden: Cannot remove the last administrator account. At least one administrator must remain.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_zero_admins ON public.admins;
CREATE TRIGGER trg_prevent_zero_admins
BEFORE DELETE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.prevent_zero_admins();

-- 6. Updated RPC: public.get_admin_directory()
-- Includes is_primary flag in returned records.
CREATE OR REPLACE FUNCTION public.get_admin_directory()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    is_active BOOLEAN,
    is_primary BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    -- Authorization check: Caller must be a verified administrator
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required.';
    END IF;

    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.email::text,
        COALESCE(
            NULLIF(trim(u.raw_user_meta_data->>'name'), ''),
            NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''),
            NULLIF(trim(u.raw_user_meta_data->>'display_name'), ''),
            split_part(u.email::text, '@', 1)
        ) AS display_name,
        u.created_at,
        u.last_sign_in_at,
        (u.banned_until IS NULL OR u.banned_until < now()) AS is_active,
        COALESCE(a.is_primary, false) AS is_primary
    FROM public.admins a
    JOIN auth.users u ON u.id = a.user_id
    ORDER BY a.is_primary DESC, u.created_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_directory() TO authenticated;

-- 7. Secure RPC: public.remove_admin(target_user_id UUID)
-- Purpose: Atomically revokes administrator privileges by deleting the authorization row from public.admins.
--
-- Security Guarantees:
-- - `SECURITY DEFINER`: Runs with creator rights to manage `public.admins`.
-- - `SET search_path = public, auth, pg_temp`: Guards against search-path hijacking attacks.
-- - Validates caller authorization (`public.is_admin()`).
-- - Enforces self-removal prevention (`caller_id = target_user_id`).
-- - Verifies target exists in `public.admins` (raises 'NotFound: ...' if already removed).
-- - Protects primary administrator from deletion (raises 'Forbidden: ...').
-- - Enforces minimum administrator count > 1 (raises 'Forbidden: ...').
--
-- Architecture Note:
-- This RPC handles database-level privilege revocation by deleting the row from `public.admins`.
-- Supabase Auth account deletion (`auth.users`) is subsequently executed by the server action
-- via the service-role client (`createAdminClient().auth.admin.deleteUser(targetUserId)`).
CREATE OR REPLACE FUNCTION public.remove_admin(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    target_is_primary BOOLEAN;
    caller_id UUID;
    total_admins INT;
BEGIN
    -- 1. Ensure caller is a verified administrator
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required.';
    END IF;

    caller_id := auth.uid();

    -- 2. Prevent self-removal
    IF caller_id = target_user_id THEN
        RAISE EXCEPTION 'Forbidden: You cannot remove your own administrator account.';
    END IF;

    -- 3. Verify target exists in public.admins
    SELECT is_primary INTO target_is_primary
    FROM public.admins
    WHERE user_id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NotFound: Administrator not found or already removed.';
    END IF;

    -- 4. Prevent removal of primary admin
    IF target_is_primary THEN
        RAISE EXCEPTION 'Forbidden: The primary administrator account cannot be removed.';
    END IF;

    -- 5. Prevent removing the last administrator
    SELECT COUNT(*) INTO total_admins FROM public.admins;
    IF total_admins <= 1 THEN
        RAISE EXCEPTION 'Forbidden: Cannot remove the last administrator account.';
    END IF;

    -- 6. Delete row from public.admins
    DELETE FROM public.admins WHERE user_id = target_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'removed_user_id', target_user_id
    );
END;
$$;

-- Restrict execute permissions: Revoke from public/anon, grant exclusively to authenticated
REVOKE ALL ON FUNCTION public.remove_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_admin(UUID) TO authenticated;

COMMIT;

-- ============================================================================
-- Rollback Instructions (If Reverting Migration)
--
-- PURPOSE & LIMITATIONS:
-- - Reverts public.admins back to the pre-migration baseline schema.
-- - Drops triggers trg_prevent_zero_admins and trg_protect_primary_admin.
-- - Drops functions public.remove_admin and trigger functions.
-- - Drops unique index idx_admins_primary and drops is_primary column.
-- - WARNING: Once is_primary is dropped, database-level primary admin protection
--   is removed and the application relies entirely on application-layer fallbacks.
-- ============================================================================
/*
BEGIN;
DROP FUNCTION IF EXISTS public.remove_admin(UUID);
DROP TRIGGER IF EXISTS trg_prevent_zero_admins ON public.admins;
DROP FUNCTION IF EXISTS public.prevent_zero_admins();
DROP TRIGGER IF EXISTS trg_protect_primary_admin ON public.admins;
DROP FUNCTION IF EXISTS public.protect_primary_admin();
DROP INDEX IF EXISTS public.idx_admins_primary;
ALTER TABLE public.admins DROP COLUMN IF EXISTS is_primary;
COMMIT;
*/
