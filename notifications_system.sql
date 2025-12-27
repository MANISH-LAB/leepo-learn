-- ========================================
-- USER NOTIFICATIONS SYSTEM
-- ========================================
-- Tracks user actions and achievements with auto-cleanup

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('welcome', 'topic_completed', 'assessment_completed', 'achievement', 'streak')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB, -- Store extra data like XP, score, topic name, etc.
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications(is_read);

-- ========================================
-- TRIGGER 1: Welcome Notification
-- ========================================
-- Creates a welcome notification when a new user profile is created

CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome to Leepo Learn! 🎉',
    'Thanks for joining! Start your learning journey today.',
    jsonb_build_object('userName', NEW.full_name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_welcome_notification
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION create_welcome_notification();

-- ========================================
-- TRIGGER 2: Topic Completion Notification
-- ========================================
-- Creates a notification when user completes a topic (+50 XP)

CREATE OR REPLACE FUNCTION create_topic_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
  topic_title TEXT;
  user_name TEXT;
BEGIN
  -- Only create notification if topic is being marked as completed (not just updated)
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN

    -- Get topic title from hierarchy_nodes
    SELECT title INTO topic_title
    FROM public.hierarchy_nodes
    WHERE id = NEW.node_id;

    -- Get user name
    SELECT full_name INTO user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Create notification
    INSERT INTO public.user_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'topic_completed',
      '🎯 Topic Completed!',
      format('Great job! You completed "%s" and earned +50 XP', topic_title),
      jsonb_build_object(
        'topicId', NEW.node_id,
        'topicTitle', topic_title,
        'xpEarned', 50
      )
    );

    -- Auto-cleanup: Keep only 5 most recent notifications per user
    DELETE FROM public.user_notifications
    WHERE id IN (
      SELECT id
      FROM public.user_notifications
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      OFFSET 5
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_topic_completion_notification
AFTER INSERT OR UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION create_topic_completion_notification();

-- ========================================
-- TRIGGER 3: Assessment Completion Notification
-- ========================================
-- Creates a notification when user completes an assessment

CREATE OR REPLACE FUNCTION create_assessment_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
  chapter_title TEXT;
BEGIN
  -- Get chapter title
  SELECT title INTO chapter_title
  FROM public.hierarchy_nodes
  WHERE id = NEW.chapter_id;

  -- Create notification with score
  INSERT INTO public.user_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.user_id,
    'assessment_completed',
    '📝 Assessment Complete!',
    format('You scored %s/%s on "%s" chapter assessment!',
      NEW.correct_answers,
      NEW.total_questions,
      chapter_title
    ),
    jsonb_build_object(
      'chapterId', NEW.chapter_id,
      'chapterTitle', chapter_title,
      'score', NEW.score,
      'correctAnswers', NEW.correct_answers,
      'totalQuestions', NEW.total_questions
    )
  );

  -- Auto-cleanup: Keep only 5 most recent notifications per user
  DELETE FROM public.user_notifications
  WHERE id IN (
    SELECT id
    FROM public.user_notifications
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 5
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assessment_completion_notification
AFTER INSERT ON public.assessment_results
FOR EACH ROW
EXECUTE FUNCTION create_assessment_completion_notification();

-- ========================================
-- HELPER FUNCTION: Cleanup Old Notifications
-- ========================================
-- Manual cleanup function (also called in triggers)

CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_notifications
  WHERE id IN (
    SELECT id
    FROM public.user_notifications
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    OFFSET 5
  );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications (via triggers)
CREATE POLICY "System can insert notifications"
  ON public.user_notifications
  FOR INSERT
  WITH CHECK (true);

-- System can delete old notifications (via triggers)
CREATE POLICY "System can delete notifications"
  ON public.user_notifications
  FOR DELETE
  USING (true);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT SELECT, UPDATE ON public.user_notifications TO authenticated;
GRANT INSERT, DELETE ON public.user_notifications TO service_role;
