-- Migration: 20261023_admin_management.sql
-- Description: Admin directory query RPC and administrator management RLS policies.
--
-- Security Architecture:
-- 1. Authorization Core: Preserves `public.admins` as the authoritative source of truth
--    for administrator privileges. Function `public.is_admin()` relies on this table.
-- 2. Row Level Security: Enforces strict table-level boundaries on `public.admins`.
-- 3. Definer Isolation: `public.get_admin_directory()` is marked SECURITY DEFINER with
--    a fixed search_path to securely join `auth.users` without exposing raw auth tables.
-- 4. Principle of Least Privilege: Default public and anon execute rights are revoked.

BEGIN;

-- 1. Ensure public.admins table exists with RLS enabled
-- Purpose: Authoritative registry of user UUIDs possessing administrative privileges.
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Baseline Policy: Users can read own admin row
-- Purpose: Allows any authenticated user to verify whether their own session possesses
-- an admin record (e.g. used during login verification).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'admins'
          AND policyname = 'Users can read own admin row'
    ) THEN
        CREATE POLICY "Users can read own admin row"
            ON public.admins
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- 3. Directory Policy: Admins can view all admin rows
-- Purpose: Allows verified administrators (evaluated via public.is_admin()) to inspect
-- the full membership list in public.admins.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'admins'
          AND policyname = 'Admins can view all admin rows'
    ) THEN
        CREATE POLICY "Admins can view all admin rows"
            ON public.admins
            FOR SELECT
            TO authenticated
            USING (public.is_admin());
    END IF;
END $$;

-- 4. Secure RPC function: public.get_admin_directory()
-- Purpose: Returns a clean directory of authorized administrators.
-- Security Guarantees:
-- - `SECURITY DEFINER`: Runs with creator rights to read display metadata from `auth.users`,
--   which standard authenticated clients cannot directly query under default Supabase RLS.
-- - `SET search_path = public, auth, pg_temp`: Guards against search-path injection attacks.
-- - Caller must be a verified administrator (`IF NOT public.is_admin() THEN RAISE EXCEPTION`).
CREATE OR REPLACE FUNCTION public.get_admin_directory()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    is_active BOOLEAN
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
        (u.banned_until IS NULL OR u.banned_until < now()) AS is_active
    FROM public.admins a
    JOIN auth.users u ON u.id = a.user_id
    ORDER BY u.created_at ASC;
END;
$$;

-- Revoke default execute from PUBLIC and anon; grant exclusively to authenticated
REVOKE ALL ON FUNCTION public.get_admin_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_directory() TO authenticated;

COMMIT;

-- ============================================================================
-- Rollback Instructions (If Reverting Migration)
-- ============================================================================
/*
BEGIN;
DROP FUNCTION IF EXISTS public.get_admin_directory();
DROP POLICY IF EXISTS "Admins can view all admin rows" ON public.admins;
COMMIT;
*/
