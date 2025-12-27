-- ========================================
-- SUPABASE SQL SCHEMA FOR ADMIN COMMAND CENTER
-- Learning Management System with Gmail Auth
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. PROFILES TABLE
-- ========================================
-- Stores user information with role-based access
-- Admin: manishkalyan141@gmail.com
-- Others: Regular users (students)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college TEXT,
  degree TEXT,
  current_year TEXT,
  passing_year TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- 2. HIERARCHY_NODES TABLE
-- ========================================
-- Course structure: DEGREE → YEAR → SUBJECT → CHAPTER → TOPIC

CREATE TABLE IF NOT EXISTS public.hierarchy_nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('DEGREE', 'YEAR', 'SUBJECT', 'CHAPTER', 'TOPIC')) NOT NULL,
  title TEXT NOT NULL,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes for faster queries
  CONSTRAINT valid_hierarchy CHECK (
    (type = 'DEGREE' AND parent_id IS NULL) OR
    (type != 'DEGREE' AND parent_id IS NOT NULL)
  )
);

CREATE INDEX idx_hierarchy_parent ON public.hierarchy_nodes(parent_id);
CREATE INDEX idx_hierarchy_type ON public.hierarchy_nodes(type);

-- ========================================
-- 3. CONTENT_ASSETS TABLE
-- ========================================
-- Media and interactive content for TOPIC nodes

CREATE TABLE IF NOT EXISTS public.content_assets (
  node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE PRIMARY KEY,
  video_url TEXT,
  video_url_hindi TEXT,
  audio_url TEXT,
  audio_url_hindi TEXT,
  pdf_url TEXT,
  duration TEXT, -- e.g., "15:30"
  interactive_content TEXT, -- HTML/JS for interactive elements
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- 4. ASSESSMENTS TABLE
-- ========================================
-- Chapter-level assessments/quizzes

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(chapter_id)
);

-- ========================================
-- 5. ASSESSMENT_QUESTIONS TABLE
-- ========================================
-- Questions for chapter assessments

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INTEGER CHECK (correct_answer >= 0 AND correct_answer <= 3) NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_questions_assessment ON public.assessment_questions(assessment_id);

-- ========================================
-- 6. USER_PROGRESS TABLE
-- ========================================
-- Track completion and notes for each user per node

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  private_notes TEXT,
  last_accessed TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  PRIMARY KEY (user_id, node_id)
);

CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_progress_node ON public.user_progress(node_id);

-- ========================================
-- 7. COURSE_PURCHASES TABLE
-- ========================================
-- Track which YEAR content users have unlocked
-- When a user pays for a YEAR, they unlock all content under that YEAR node

CREATE TABLE IF NOT EXISTS public.course_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  year_node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending' NOT NULL,
  payment_provider TEXT DEFAULT 'stripe',
  transaction_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, year_node_id)
);

CREATE INDEX idx_purchases_user ON public.course_purchases(user_id);
CREATE INDEX idx_purchases_year ON public.course_purchases(year_node_id);

-- ========================================
-- 8. USER_STATS TABLE
-- ========================================
-- Track user streak, XP, and gamification metrics

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- 9. PRICING TABLE
-- ========================================
-- Dynamic pricing for YEAR nodes (admin can edit)

CREATE TABLE IF NOT EXISTS public.pricing (
  year_node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE PRIMARY KEY,
  price DECIMAL(10, 2) NOT NULL DEFAULT 99.00,
  currency TEXT DEFAULT 'USD' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES public.profiles(id)
);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hierarchy_nodes_updated_at BEFORE UPDATE ON public.hierarchy_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_assets_updated_at BEFORE UPDATE ON public.content_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-assign admin role to specific email
-- NOTE: We intentionally do NOT set full_name here, even if Google provides it
-- This ensures first-time users always see the onboarding wizard
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email = 'manishkalyan141@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );

  -- Create initial user stats
  INSERT INTO public.user_stats (user_id, streak_days, total_xp)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- HIERARCHY_NODES POLICIES
-- ========================================

-- Everyone can view hierarchy nodes (course structure is public)
CREATE POLICY "Public can view hierarchy"
  ON public.hierarchy_nodes FOR SELECT
  USING (true);

-- Only admins can insert nodes
CREATE POLICY "Admins can insert nodes"
  ON public.hierarchy_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update nodes
CREATE POLICY "Admins can update nodes"
  ON public.hierarchy_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete nodes
CREATE POLICY "Admins can delete nodes"
  ON public.hierarchy_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- CONTENT_ASSETS POLICIES
-- ========================================

-- Users can view content if:
-- 1. Content is not premium, OR
-- 2. They have purchased the parent YEAR, OR
-- 3. They are admin
CREATE POLICY "Users can view accessible content"
  ON public.content_assets FOR SELECT
  USING (
    -- Not premium content
    is_premium = false
    OR
    -- User has purchased the parent YEAR
    EXISTS (
      SELECT 1
      FROM public.hierarchy_nodes topic
      JOIN public.hierarchy_nodes chapter ON topic.parent_id = chapter.id
      JOIN public.hierarchy_nodes subject ON chapter.parent_id = subject.id
      JOIN public.hierarchy_nodes year ON subject.parent_id = year.id
      JOIN public.course_purchases cp ON cp.year_node_id = year.id
      WHERE topic.id = content_assets.node_id
        AND cp.user_id = auth.uid()
        AND cp.status = 'success'
    )
    OR
    -- User is admin
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert/update/delete content
CREATE POLICY "Admins can manage content"
  ON public.content_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- ASSESSMENTS POLICIES
-- ========================================

-- Everyone can view assessments (questions structure)
CREATE POLICY "Public can view assessments"
  ON public.assessments FOR SELECT
  USING (true);

-- Only admins can manage assessments
CREATE POLICY "Admins can manage assessments"
  ON public.assessments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- ASSESSMENT_QUESTIONS POLICIES
-- ========================================

-- Everyone can view questions
CREATE POLICY "Public can view questions"
  ON public.assessment_questions FOR SELECT
  USING (true);

-- Only admins can manage questions
CREATE POLICY "Admins can manage questions"
  ON public.assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- USER_PROGRESS POLICIES
-- ========================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON public.user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- COURSE_PURCHASES POLICIES
-- ========================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.course_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.course_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own purchases
CREATE POLICY "Users can create own purchases"
  ON public.course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all purchases
CREATE POLICY "Admins can manage purchases"
  ON public.course_purchases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- PRICING POLICIES
-- ========================================

-- Everyone can view pricing
CREATE POLICY "Public can view pricing"
  ON public.pricing FOR SELECT
  USING (true);

-- Only admins can manage pricing
CREATE POLICY "Admins can manage pricing"
  ON public.pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to check if user has access to a specific node
CREATE OR REPLACE FUNCTION user_has_access_to_node(
  p_user_id UUID,
  p_node_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_node_type TEXT;
  v_year_id UUID;
  v_has_purchased BOOLEAN;
  v_is_premium BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT role = 'admin' INTO v_is_admin
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_is_admin THEN
    RETURN true;
  END IF;

  -- Get node type
  SELECT type INTO v_node_type
  FROM public.hierarchy_nodes
  WHERE id = p_node_id;

  -- Non-TOPIC nodes are always accessible
  IF v_node_type != 'TOPIC' THEN
    RETURN true;
  END IF;

  -- Check if content is premium
  SELECT COALESCE(is_premium, false) INTO v_is_premium
  FROM public.content_assets
  WHERE node_id = p_node_id;

  -- Non-premium content is accessible
  IF NOT v_is_premium THEN
    RETURN true;
  END IF;

  -- Find parent YEAR node
  WITH RECURSIVE parent_chain AS (
    SELECT id, parent_id, type
    FROM public.hierarchy_nodes
    WHERE id = p_node_id

    UNION ALL

    SELECT hn.id, hn.parent_id, hn.type
    FROM public.hierarchy_nodes hn
    INNER JOIN parent_chain pc ON hn.id = pc.parent_id
  )
  SELECT id INTO v_year_id
  FROM parent_chain
  WHERE type = 'YEAR'
  LIMIT 1;

  -- Check if user has purchased this YEAR
  SELECT EXISTS (
    SELECT 1
    FROM public.course_purchases
    WHERE user_id = p_user_id
      AND year_node_id = v_year_id
      AND status = 'success'
  ) INTO v_has_purchased;

  RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- USER_STATS POLICIES
-- ========================================

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all stats
CREATE POLICY "Admins can view all stats"
  ON public.user_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert sample degree structure
-- Uncomment to populate initial data

/*
INSERT INTO public.hierarchy_nodes (id, parent_id, type, title, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'DEGREE', 'Computer Science Engineering', 1),
  ('22222222-2222-2222-2222-222222222222', NULL, 'DEGREE', 'Mechanical Engineering', 2);

INSERT INTO public.hierarchy_nodes (id, parent_id, type, title, order_index) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'YEAR', '1st Year', 1),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'YEAR', '2nd Year', 2);

-- Set pricing for years
INSERT INTO public.pricing (year_node_id, price, currency) VALUES
  ('33333333-3333-3333-3333-333333333333', 99.00, 'USD'),
  ('44444444-4444-4444-4444-444444444444', 99.00, 'USD');
*/

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant all on tables to authenticated users (RLS will control access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

-- ========================================
-- COMPLETE SCHEMA READY FOR SUPABASE
-- ========================================
-- Run this script in Supabase SQL Editor
-- Make sure Gmail OAuth is enabled in Supabase Auth settings
