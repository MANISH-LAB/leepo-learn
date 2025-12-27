-- Add missing columns to hierarchy_nodes table
ALTER TABLE hierarchy_nodes
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Fix RLS policies for content_assets table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can update content_assets" ON content_assets;
DROP POLICY IF EXISTS "Authenticated users can insert content_assets" ON content_assets;
DROP POLICY IF EXISTS "Anyone can view content_assets" ON content_assets;

-- Create new permissive policies for content_assets
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

-- Fix RLS policies for chapter_assessments table
DROP POLICY IF EXISTS "Authenticated users can update assessments" ON chapter_assessments;
DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON chapter_assessments;
DROP POLICY IF EXISTS "Anyone can view assessments" ON chapter_assessments;

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

-- Verify the tables exist
DO $$
BEGIN
    -- Check if content_assets exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_assets') THEN
        RAISE NOTICE 'ERROR: content_assets table does not exist! Run COMPLETE_FIX.sql first!';
    END IF;

    -- Check if chapter_assessments exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapter_assessments') THEN
        RAISE NOTICE 'ERROR: chapter_assessments table does not exist! Run COMPLETE_FIX.sql first!';
    END IF;

    -- Check if hierarchy_nodes exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hierarchy_nodes') THEN
        RAISE NOTICE 'ERROR: hierarchy_nodes table does not exist! Run COMPLETE_FIX.sql first!';
    END IF;
END $$;
