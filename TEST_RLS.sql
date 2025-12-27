-- Test if RLS policies are working correctly
-- Run this to check if anonymous users can read data

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments')
AND schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments')
ORDER BY tablename, policyname;

-- Test simple select (this should work for anonymous users)
SELECT COUNT(*) as total_nodes FROM hierarchy_nodes;

-- Show all nodes
SELECT id, parent_id, type, title, is_active
FROM hierarchy_nodes
ORDER BY order_index;
