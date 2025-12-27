-- Fix UUID type mismatch by changing ID columns to TEXT
-- This allows the application to use simple string IDs like "1-1-1-1-1"

-- First, drop foreign key constraints that reference these columns
ALTER TABLE hierarchy_nodes DROP CONSTRAINT IF EXISTS hierarchy_nodes_parent_id_fkey;
ALTER TABLE content_assets DROP CONSTRAINT IF EXISTS content_assets_node_id_fkey;

-- Change hierarchy_nodes id and parent_id from UUID to TEXT
ALTER TABLE hierarchy_nodes ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE hierarchy_nodes ALTER COLUMN parent_id TYPE TEXT USING parent_id::TEXT;

-- Change content_assets node_id from UUID to TEXT
ALTER TABLE content_assets ALTER COLUMN node_id TYPE TEXT USING node_id::TEXT;

-- Change chapter_assessments chapter_node_id from UUID to TEXT (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments ALTER COLUMN chapter_node_id TYPE TEXT USING chapter_node_id::TEXT;
    END IF;
END $$;

-- Recreate foreign key constraints
ALTER TABLE hierarchy_nodes
    ADD CONSTRAINT hierarchy_nodes_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;

ALTER TABLE content_assets
    ADD CONSTRAINT content_assets_node_id_fkey
    FOREIGN KEY (node_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;

-- Create chapter_assessments table if it doesn't exist
CREATE TABLE IF NOT EXISTS chapter_assessments (
    id SERIAL PRIMARY KEY,
    chapter_node_id TEXT NOT NULL REFERENCES hierarchy_nodes(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for chapter_assessments
ALTER TABLE chapter_assessments ENABLE ROW LEVEL SECURITY;

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

-- Verify the changes
DO $$
DECLARE
    hierarchy_id_type TEXT;
    content_node_id_type TEXT;
BEGIN
    -- Check hierarchy_nodes.id type
    SELECT data_type INTO hierarchy_id_type
    FROM information_schema.columns
    WHERE table_name = 'hierarchy_nodes' AND column_name = 'id';

    RAISE NOTICE 'hierarchy_nodes.id type: %', hierarchy_id_type;

    -- Check content_assets.node_id type
    SELECT data_type INTO content_node_id_type
    FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'node_id';

    RAISE NOTICE 'content_assets.node_id type: %', content_node_id_type;

    IF hierarchy_id_type = 'text' AND content_node_id_type = 'text' THEN
        RAISE NOTICE 'SUCCESS: All ID columns converted to TEXT type!';
    ELSE
        RAISE NOTICE 'WARNING: Some columns may not have been converted properly.';
    END IF;
END $$;
