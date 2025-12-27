-- ========================================
-- COMPLETE DATABASE FIX - RUN THIS IN SUPABASE SQL EDITOR
-- This will set up everything correctly
-- ========================================

-- Step 1: Drop existing tables and start fresh
DROP TABLE IF EXISTS public.course_purchases CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.hierarchy_nodes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.content_assets CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.assessment_questions CASCADE;
DROP TABLE IF EXISTS public.pricing CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;

-- Step 2: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college TEXT,
  degree TEXT,
  current_year TEXT,
  passing_year TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- USER_STATS TABLE
-- ========================================
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- HIERARCHY_NODES TABLE
-- ========================================
CREATE TABLE public.hierarchy_nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- CONTENT_ASSETS TABLE
-- ========================================
CREATE TABLE public.content_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_id UUID UNIQUE REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE,
  video_url TEXT,
  video_url_hindi TEXT,
  audio_url TEXT,
  audio_url_hindi TEXT,
  pdf_url TEXT,
  duration TEXT,
  is_premium BOOLEAN DEFAULT false,
  interactive_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- ASSESSMENTS TABLE
-- ========================================
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID UNIQUE REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- ASSESSMENT_QUESTIONS TABLE
-- ========================================
CREATE TABLE public.assessment_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- PRICING TABLE
-- ========================================
CREATE TABLE public.pricing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year_node_id UUID UNIQUE REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- COURSE_PURCHASES TABLE
-- ========================================
CREATE TABLE public.course_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  year_node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_provider TEXT DEFAULT 'stripe',
  transaction_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, year_node_id)
);

-- ========================================
-- USER_PROGRESS TABLE
-- ========================================
CREATE TABLE public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  private_notes TEXT,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, node_id)
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES - PROFILES
-- ========================================
CREATE POLICY "Anyone can read profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ========================================
-- RLS POLICIES - USER_STATS
-- ========================================
CREATE POLICY "Users can read own stats"
ON public.user_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON public.user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - HIERARCHY_NODES (Public read, authenticated write)
-- ========================================
CREATE POLICY "Anyone can read hierarchy"
ON public.hierarchy_nodes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert hierarchy"
ON public.hierarchy_nodes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hierarchy"
ON public.hierarchy_nodes FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete hierarchy"
ON public.hierarchy_nodes FOR DELETE
USING (auth.role() = 'authenticated');

-- ========================================
-- RLS POLICIES - CONTENT_ASSETS
-- ========================================
CREATE POLICY "Anyone can read content"
ON public.content_assets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage content"
ON public.content_assets FOR ALL
USING (auth.role() = 'authenticated');

-- ========================================
-- RLS POLICIES - ASSESSMENTS
-- ========================================
CREATE POLICY "Anyone can read assessments"
ON public.assessments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage assessments"
ON public.assessments FOR ALL
USING (auth.role() = 'authenticated');

-- ========================================
-- RLS POLICIES - ASSESSMENT_QUESTIONS
-- ========================================
CREATE POLICY "Anyone can read questions"
ON public.assessment_questions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage questions"
ON public.assessment_questions FOR ALL
USING (auth.role() = 'authenticated');

-- ========================================
-- RLS POLICIES - PRICING
-- ========================================
CREATE POLICY "Anyone can read pricing"
ON public.pricing FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage pricing"
ON public.pricing FOR ALL
USING (auth.role() = 'authenticated');

-- ========================================
-- RLS POLICIES - COURSE_PURCHASES
-- ========================================
CREATE POLICY "Users can read own purchases"
ON public.course_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
ON public.course_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - USER_PROGRESS
-- ========================================
CREATE POLICY "Users can read own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.hierarchy_nodes TO authenticated;
GRANT ALL ON public.content_assets TO authenticated;
GRANT ALL ON public.assessments TO authenticated;
GRANT ALL ON public.assessment_questions TO authenticated;
GRANT ALL ON public.pricing TO authenticated;
GRANT ALL ON public.course_purchases TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;

GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.user_stats TO anon;
GRANT ALL ON public.hierarchy_nodes TO anon;
GRANT ALL ON public.content_assets TO anon;
GRANT ALL ON public.assessments TO anon;
GRANT ALL ON public.assessment_questions TO anon;
GRANT ALL ON public.pricing TO anon;
GRANT ALL ON public.course_purchases TO anon;
GRANT ALL ON public.user_progress TO anon;

-- ========================================
-- TRIGGER FUNCTION - Auto-create profile on signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE
      WHEN NEW.email = 'manishkalyan141@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  -- Insert user stats
  INSERT INTO public.user_stats (user_id, streak_days, total_xp)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ========================================
-- CREATE TRIGGER
-- ========================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- CREATE PROFILES FOR EXISTING USERS (if any)
-- ========================================
INSERT INTO public.profiles (id, email, avatar_url, role)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data->>'avatar_url', ''),
  CASE
    WHEN email = 'manishkalyan141@gmail.com' THEN 'admin'
    ELSE 'user'
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_stats (user_id, streak_days, total_xp)
SELECT id, 0, 0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- DONE!
-- ========================================
