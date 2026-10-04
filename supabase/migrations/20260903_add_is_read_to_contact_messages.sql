-- Migration: Add is_read column to contact_messages table
-- Description: Ensures contact_messages schema consistency by adding is_read boolean column with default false.

-- 1. Ensure contact_messages table exists (for fresh database setup)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Safely add is_read column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'contact_messages'
          AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.contact_messages
        ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 3. Ensure any existing rows without is_read value are populated with false
UPDATE public.contact_messages
SET is_read = false
WHERE is_read IS NULL;

-- 4. Add performance indexes for admin filtering and sorting
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public (anon & authenticated) to insert contact messages via the public contact form
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'contact_messages'
          AND policyname = 'Allow public insert on contact_messages'
    ) THEN
        CREATE POLICY "Allow public insert on contact_messages"
            ON public.contact_messages
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;
END $$;

-- Allow authenticated admin users full access (SELECT, UPDATE, DELETE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'contact_messages'
          AND policyname = 'Allow authenticated users full access on contact_messages'
    ) THEN
        CREATE POLICY "Allow authenticated users full access on contact_messages"
            ON public.contact_messages
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
