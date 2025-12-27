-- Fix RLS policies to allow anonymous users to READ all course data
-- This allows everyone (logged in or not) to see the course hierarchy
-- Only write operations require authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view hierarchy_nodes" ON hierarchy_nodes;
DROP POLICY IF EXISTS "Authenticated users can insert hierarchy_nodes" ON hierarchy_nodes;
DROP POLICY IF EXISTS "Authenticated users can update hierarchy_nodes" ON hierarchy_nodes;
DROP POLICY IF EXISTS "Authenticated users can delete hierarchy_nodes" ON hierarchy_nodes;

-- Create new policies for hierarchy_nodes
-- READ: Allow everyone (including anonymous users)
CREATE POLICY "Anyone can view hierarchy_nodes"
ON hierarchy_nodes FOR SELECT
TO public
USING (true);

-- INSERT: Authenticated users only
CREATE POLICY "Authenticated users can insert hierarchy_nodes"
ON hierarchy_nodes FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Authenticated users only
CREATE POLICY "Authenticated users can update hierarchy_nodes"
ON hierarchy_nodes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Authenticated users only
CREATE POLICY "Authenticated users can delete hierarchy_nodes"
ON hierarchy_nodes FOR DELETE
TO authenticated
USING (true);

-- Fix content_assets policies
DROP POLICY IF EXISTS "Anyone can view content_assets" ON content_assets;
DROP POLICY IF EXISTS "Authenticated users can insert content_assets" ON content_assets;
DROP POLICY IF EXISTS "Authenticated users can update content_assets" ON content_assets;

CREATE POLICY "Anyone can view content_assets"
ON content_assets FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert content_assets"
ON content_assets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update content_assets"
ON content_assets FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix chapter_assessments policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        DROP POLICY IF EXISTS "Anyone can view assessments" ON chapter_assessments;
        DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON chapter_assessments;
        DROP POLICY IF EXISTS "Authenticated users can update assessments" ON chapter_assessments;

        CREATE POLICY "Anyone can view assessments"
        ON chapter_assessments FOR SELECT
        TO public
        USING (true);

        CREATE POLICY "Authenticated users can insert assessments"
        ON chapter_assessments FOR INSERT
        TO authenticated
        WITH CHECK (true);

        CREATE POLICY "Authenticated users can update assessments"
        ON chapter_assessments FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Fix assessments policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        DROP POLICY IF EXISTS "Anyone can view assessments" ON assessments;
        DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON assessments;
        DROP POLICY IF EXISTS "Authenticated users can update assessments" ON assessments;

        CREATE POLICY "Anyone can view assessments"
        ON assessments FOR SELECT
        TO public
        USING (true);

        CREATE POLICY "Authenticated users can insert assessments"
        ON assessments FOR INSERT
        TO authenticated
        WITH CHECK (true);

        CREATE POLICY "Authenticated users can update assessments"
        ON assessments FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Verify RLS is enabled
ALTER TABLE hierarchy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES UPDATED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Anonymous users can now READ all course data';
    RAISE NOTICE 'Only authenticated users can write/update/delete';
    RAISE NOTICE '';
    RAISE NOTICE 'Test by logging out and visiting the site';
    RAISE NOTICE 'You should see all courses from the database';
    RAISE NOTICE '========================================';
END $$;
