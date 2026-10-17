-- Migration: Create core issues table
-- Description: Baseline migration for the primary magazine publication entity: public.issues

CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover_image_url TEXT NOT NULL,
    pdf_url TEXT NOT NULL DEFAULT '',
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    is_draft BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes for querying and sorting
CREATE INDEX IF NOT EXISTS idx_issues_published_at ON public.issues(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_is_draft ON public.issues(is_draft);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_year_month ON public.issues(year DESC, month);

-- Enable Row Level Security (RLS)
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public (anon & authenticated) to view published issues
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'issues'
          AND policyname = 'Allow public select on published issues'
    ) THEN
        CREATE POLICY "Allow public select on published issues"
            ON public.issues
            FOR SELECT
            TO anon, authenticated
            USING (is_draft = false);
    END IF;
END $$;

-- Policy 2: Allow authenticated admin users full access (SELECT, INSERT, UPDATE, DELETE) on all issues
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'issues'
          AND policyname = 'Allow authenticated users full access on issues'
    ) THEN
        CREATE POLICY "Allow authenticated users full access on issues"
            ON public.issues
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
