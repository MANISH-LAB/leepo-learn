-- RUN THIS TO FIX YOUR DATABASE
-- Copy and paste into Supabase SQL Editor

-- Step 1: Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Drop existing tables (be careful!)
DROP TABLE IF EXISTS public.course_purchases CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.hierarchy_nodes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 3: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 4: Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
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

-- Step 5: Create user_stats table
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 6: Create hierarchy_nodes table
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

-- Step 7: Create course_purchases table
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

-- Step 8: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can do anything profiles" ON public.profiles;
CREATE POLICY "Service role can do anything profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can do anything stats" ON public.user_stats;
CREATE POLICY "Service role can do anything stats" ON public.user_stats FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can view hierarchy" ON public.hierarchy_nodes;
CREATE POLICY "Anyone can view hierarchy" ON public.hierarchy_nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage hierarchy" ON public.hierarchy_nodes;
CREATE POLICY "Service role can manage hierarchy" ON public.hierarchy_nodes FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view own purchases" ON public.course_purchases;
CREATE POLICY "Users can view own purchases" ON public.course_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create purchases" ON public.course_purchases;
CREATE POLICY "Users can create purchases" ON public.course_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage purchases" ON public.course_purchases;
CREATE POLICY "Service role can manage purchases" ON public.course_purchases FOR ALL USING (true);

-- Step 10: Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE
      WHEN NEW.email = 'manishkalyan141@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );

  INSERT INTO public.user_stats (user_id, streak_days, total_xp)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 11: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
