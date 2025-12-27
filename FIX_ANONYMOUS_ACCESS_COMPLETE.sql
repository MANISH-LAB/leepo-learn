-- ==============================================================================
-- COMPLETE FIX FOR ANONYMOUS ACCESS
-- Run this script in Supabase SQL Editor to allow anonymous users to read data
-- ==============================================================================

-- Step 1: Disable RLS on all tables
ALTER TABLE hierarchy_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets DISABLE ROW LEVEL SECURITY;

-- Handle tables that might not exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_questions') THEN
        ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing') THEN
        ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_purchases') THEN
        ALTER TABLE course_purchases DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_progress') THEN
        ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_stats') THEN
        ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 2: Grant SELECT to anonymous users (anon role)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON hierarchy_nodes TO anon;
GRANT SELECT ON content_assets TO anon;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        GRANT SELECT ON chapter_assessments TO anon;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        GRANT SELECT ON assessments TO anon;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_questions') THEN
        GRANT SELECT ON assessment_questions TO anon;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing') THEN
        GRANT SELECT ON pricing TO anon;
    END IF;
END $$;

-- Step 3: Grant full access to authenticated users
GRANT ALL ON hierarchy_nodes TO authenticated;
GRANT ALL ON content_assets TO authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        GRANT ALL ON chapter_assessments TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        GRANT ALL ON assessments TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_questions') THEN
        GRANT ALL ON assessment_questions TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing') THEN
        GRANT ALL ON pricing TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_purchases') THEN
        GRANT ALL ON course_purchases TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_progress') THEN
        GRANT ALL ON user_progress TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_stats') THEN
        GRANT ALL ON user_stats TO authenticated;
    END IF;
END $$;

-- Step 4: Verify RLS is disabled
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments', 'assessments', 'assessment_questions', 'pricing', 'course_purchases', 'user_progress', 'user_stats')
ORDER BY tablename;

-- Step 5: Verify grants
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments', 'assessments', 'assessment_questions', 'pricing')
ORDER BY table_name, grantee, privilege_type;

-- Step 6: Test anonymous access
DO $$
DECLARE
    node_count INTEGER;
BEGIN
    -- This should work for anonymous users
    SELECT COUNT(*) INTO node_count FROM hierarchy_nodes;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ANONYMOUS ACCESS CONFIGURATION COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total nodes in database: %', node_count;
    RAISE NOTICE '';
    RAISE NOTICE 'RLS: DISABLED on all tables';
    RAISE NOTICE 'Anonymous users (anon): Can SELECT (read)';
    RAISE NOTICE 'Authenticated users: Full access (CRUD)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Restart your frontend dev server';
    RAISE NOTICE '2. Hard refresh browser (Ctrl+Shift+R)';
    RAISE NOTICE '3. Test while logged OUT';
    RAISE NOTICE '============================================';
END $$;
