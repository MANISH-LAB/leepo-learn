-- ========================================
-- DATABASE PERFORMANCE OPTIMIZATIONS
-- ========================================
-- Run these SQL commands in Supabase SQL Editor to add indexes
-- for faster query performance

-- CRITICAL: Index on type column for super-fast degree/year/subject queries
CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_type
ON hierarchy_nodes(type);

-- CRITICAL: Composite index for type + order filtering
CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_type_order
ON hierarchy_nodes(type, order_index);

-- 1. Index on hierarchy_nodes.parent_id for faster tree building
CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_parent_id
ON hierarchy_nodes(parent_id);

-- 2. Index on hierarchy_nodes.order_index for faster sorting
CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_order_index
ON hierarchy_nodes(order_index);

-- 3. Composite index for common query pattern (parent_id + order_index)
CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_parent_order
ON hierarchy_nodes(parent_id, order_index);

-- 5. Index on content_assets.node_id for joining with hierarchy
CREATE INDEX IF NOT EXISTS idx_content_assets_node_id
ON content_assets(node_id);

-- 6. Index on chapter_assessments.chapter_node_id for joining
CREATE INDEX IF NOT EXISTS idx_chapter_assessments_chapter_node_id
ON chapter_assessments(chapter_node_id);

-- 7. Index on user_progress for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id
ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_node_id
ON user_progress(node_id);

-- 8. Composite index for progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_node
ON user_progress(user_id, node_id);

-- Verify indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('hierarchy_nodes', 'content_assets', 'chapter_assessments', 'user_progress')
ORDER BY tablename, indexname;
