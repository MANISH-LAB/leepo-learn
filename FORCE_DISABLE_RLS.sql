-- TEMPORARY: Completely disable RLS to test if that's the issue
-- WARNING: This removes all security. Only use for testing!

-- Disable RLS on all tables
ALTER TABLE hierarchy_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Verify RLS is disabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments', 'assessments')
AND schemaname = 'public';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS DISABLED FOR TESTING';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables are now readable by everyone';
    RAISE NOTICE 'Refresh your app and it should work';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Re-enable RLS later for security!';
    RAISE NOTICE '========================================';
END $$;
