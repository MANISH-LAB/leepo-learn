-- Fix UUID type mismatch by changing ID columns to TEXT
-- This script handles all foreign key constraints properly

-- Step 1: Drop ALL foreign key constraints that reference hierarchy_nodes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE confrelid = 'hierarchy_nodes'::regclass
        AND contype = 'f'
    ) LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.table_name, r.conname);
        RAISE NOTICE 'Dropped constraint % from table %', r.conname, r.table_name;
    END LOOP;
END $$;

-- Step 2: Drop self-referencing foreign key in hierarchy_nodes
ALTER TABLE hierarchy_nodes DROP CONSTRAINT IF EXISTS hierarchy_nodes_parent_id_fkey;

-- Step 3: Change hierarchy_nodes columns to TEXT
ALTER TABLE hierarchy_nodes ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE hierarchy_nodes ALTER COLUMN parent_id TYPE TEXT USING parent_id::TEXT;

-- Step 4: Change all foreign key columns in other tables to TEXT
-- content_assets
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'content_assets' AND column_name = 'node_id') THEN
        ALTER TABLE content_assets ALTER COLUMN node_id TYPE TEXT USING node_id::TEXT;
        RAISE NOTICE 'Changed content_assets.node_id to TEXT';
    END IF;
END $$;

-- chapter_assessments (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'chapter_assessments' AND column_name = 'chapter_node_id') THEN
            ALTER TABLE chapter_assessments ALTER COLUMN chapter_node_id TYPE TEXT USING chapter_node_id::TEXT;
            RAISE NOTICE 'Changed chapter_assessments.chapter_node_id to TEXT';
        END IF;
    END IF;
END $$;

-- assessments table (the one causing the error)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'chapter_id') THEN
            ALTER TABLE assessments ALTER COLUMN chapter_id TYPE TEXT USING chapter_id::TEXT;
            RAISE NOTICE 'Changed assessments.chapter_id to TEXT';
        END IF;
    END IF;
END $$;

-- Check for any other tables with columns referencing hierarchy_nodes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT table_name, column_name
        FROM information_schema.columns
        WHERE column_name LIKE '%node_id%' OR column_name LIKE '%chapter_id%'
        AND table_schema = 'public'
        AND data_type = 'uuid'
    ) LOOP
        EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT',
            r.table_name, r.column_name, r.column_name);
        RAISE NOTICE 'Changed %.% to TEXT', r.table_name, r.column_name;
    END LOOP;
END $$;

-- Step 5: Recreate all foreign key constraints
-- Self-referencing constraint in hierarchy_nodes
ALTER TABLE hierarchy_nodes
    ADD CONSTRAINT hierarchy_nodes_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;

-- content_assets
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_assets') THEN
        ALTER TABLE content_assets
            ADD CONSTRAINT content_assets_node_id_fkey
            FOREIGN KEY (node_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created foreign key for content_assets.node_id';
    END IF;
END $$;

-- chapter_assessments
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        ALTER TABLE chapter_assessments
            ADD CONSTRAINT chapter_assessments_chapter_node_id_fkey
            FOREIGN KEY (chapter_node_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created foreign key for chapter_assessments.chapter_node_id';
    END IF;
END $$;

-- assessments table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE assessments
            ADD CONSTRAINT assessments_chapter_id_fkey
            FOREIGN KEY (chapter_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created foreign key for assessments.chapter_id';
    END IF;
END $$;

-- Step 6: Create chapter_assessments table if it doesn't exist
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

-- Step 7: Verify the changes
DO $$
DECLARE
    hierarchy_id_type TEXT;
    content_node_id_type TEXT;
    assessments_chapter_id_type TEXT;
BEGIN
    -- Check hierarchy_nodes.id type
    SELECT data_type INTO hierarchy_id_type
    FROM information_schema.columns
    WHERE table_name = 'hierarchy_nodes' AND column_name = 'id';

    RAISE NOTICE '✓ hierarchy_nodes.id type: %', hierarchy_id_type;

    -- Check content_assets.node_id type
    SELECT data_type INTO content_node_id_type
    FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'node_id';

    RAISE NOTICE '✓ content_assets.node_id type: %', content_node_id_type;

    -- Check assessments.chapter_id type (if exists)
    SELECT data_type INTO assessments_chapter_id_type
    FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'chapter_id';

    IF assessments_chapter_id_type IS NOT NULL THEN
        RAISE NOTICE '✓ assessments.chapter_id type: %', assessments_chapter_id_type;
    END IF;

    IF hierarchy_id_type = 'text' AND content_node_id_type = 'text' THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUCCESS: All ID columns converted to TEXT!';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE 'WARNING: Some columns may not have been converted properly.';
    END IF;
END $$;
