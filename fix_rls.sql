-- FIX RLS POLICIES - Run this to fix infinite recursion error
-- Copy and paste into Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do anything profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Service role can do anything stats" ON public.user_stats;

DROP POLICY IF EXISTS "Anyone can view hierarchy" ON public.hierarchy_nodes;
DROP POLICY IF EXISTS "Service role can manage hierarchy" ON public.hierarchy_nodes;
DROP POLICY IF EXISTS "Admin can manage hierarchy" ON public.hierarchy_nodes;

DROP POLICY IF EXISTS "Users can view own purchases" ON public.course_purchases;
DROP POLICY IF EXISTS "Users can create purchases" ON public.course_purchases;
DROP POLICY IF EXISTS "Service role can manage purchases" ON public.course_purchases;

-- PROFILES: Simple policies without recursion
CREATE POLICY "Enable read for users based on user_id"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- USER_STATS: Simple policies
CREATE POLICY "Enable read for own stats"
ON public.user_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own stats"
ON public.user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own stats"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id);

-- HIERARCHY_NODES: Allow everyone to read
CREATE POLICY "Enable read for all users"
ON public.hierarchy_nodes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.hierarchy_nodes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.hierarchy_nodes FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for authenticated users"
ON public.hierarchy_nodes FOR DELETE
USING (true);

-- COURSE_PURCHASES: User can see and create own purchases
CREATE POLICY "Enable read for own purchases"
ON public.course_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own purchases"
ON public.course_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);
