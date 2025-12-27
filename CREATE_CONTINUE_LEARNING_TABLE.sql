-- Create table for tracking user's continue learning position
CREATE TABLE IF NOT EXISTS user_learning_position (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    subject_title TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    topic_title TEXT NOT NULL,
    video_timestamp INTEGER DEFAULT 0, -- in seconds
    completed_topics INTEGER DEFAULT 0,
    total_topics INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_learning_position ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own learning position
CREATE POLICY "Users can read own learning position"
    ON user_learning_position
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own learning position
CREATE POLICY "Users can insert own learning position"
    ON user_learning_position
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own learning position
CREATE POLICY "Users can update own learning position"
    ON user_learning_position
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own learning position
CREATE POLICY "Users can delete own learning position"
    ON user_learning_position
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_learning_position_user_id ON user_learning_position(user_id);
CREATE INDEX idx_user_learning_position_last_accessed ON user_learning_position(last_accessed);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'CONTINUE LEARNING TABLE CREATED SUCCESSFULLY';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Table: user_learning_position';
    RAISE NOTICE 'RLS: Enabled with user-specific policies';
    RAISE NOTICE 'Indexes: Created for performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can now track their learning progress!';
    RAISE NOTICE '================================================';
END $$;
