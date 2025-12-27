-- ========================================
-- USER_NOTES TABLE MIGRATION
-- ========================================
-- Stores individual notes that users create while watching topics
-- Each note can have a timestamp (video/audio position) and optional screenshot
--
-- Run this in Supabase SQL Editor to create the notes table

CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_timestamp DECIMAL(10, 2) DEFAULT 0, -- Timestamp in seconds (e.g., 125.50 for 2:05.50)
  screenshot_url TEXT, -- Optional screenshot/image URL (can be data URL or storage URL)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for faster queries
CREATE INDEX idx_user_notes_user ON public.user_notes(user_id);
CREATE INDEX idx_user_notes_topic ON public.user_notes(topic_id);
CREATE INDEX idx_user_notes_user_topic ON public.user_notes(user_id, topic_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USER_NOTES POLICIES
-- ========================================

-- Users can view their own notes
CREATE POLICY "Users can view own notes"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON public.user_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes"
  ON public.user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all notes (optional - for admin dashboard)
CREATE POLICY "Admins can view all notes"
  ON public.user_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON public.user_notes TO authenticated;
GRANT SELECT ON public.user_notes TO anon;

-- ========================================
-- HELPER FUNCTION: Get all notes for a topic
-- ========================================
-- This function retrieves all notes for a specific topic for the logged-in user

CREATE OR REPLACE FUNCTION get_user_notes_for_topic(
  p_topic_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  media_timestamp DECIMAL,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    un.id,
    un.content,
    un.media_timestamp,
    un.screenshot_url,
    un.created_at,
    un.updated_at
  FROM public.user_notes un
  WHERE un.user_id = auth.uid()
    AND un.topic_id = p_topic_id
  ORDER BY un.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMPLETE - user_notes table is ready!
-- ========================================
