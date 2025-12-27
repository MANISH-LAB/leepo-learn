-- Enable anonymous access to course data
-- This script ensures anonymous users can read all course hierarchy

-- Step 1: Completely disable RLS (for now)
ALTER TABLE hierarchy_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 2: Grant SELECT permission to anonymous users (public role)
GRANT SELECT ON hierarchy_nodes TO anon;
GRANT SELECT ON content_assets TO anon;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        GRANT SELECT ON chapter_assessments TO anon;
    END IF;
END $$;

-- Step 3: Grant INSERT/UPDATE/DELETE to authenticated users only
GRANT INSERT, UPDATE, DELETE ON hierarchy_nodes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON content_assets TO authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        GRANT INSERT, UPDATE, DELETE ON chapter_assessments TO authenticated;
    END IF;
END $$;

-- Step 4: Verify grants
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments')
ORDER BY table_name, grantee, privilege_type;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ANONYMOUS ACCESS ENABLED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS: Disabled';
    RAISE NOTICE 'Anonymous users (anon): Can read all data';
    RAISE NOTICE 'Authenticated users: Can read and write';
    RAISE NOTICE '';
    RAISE NOTICE 'Now logout and refresh - you should see all courses!';
    RAISE NOTICE '========================================';
END $$;
