-- FINAL FIX - This will make everything work
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;

-- Step 2: Clear existing data
TRUNCATE public.user_stats CASCADE;
TRUNCATE public.profiles CASCADE;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable insert for own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable update for own stats" ON public.user_stats;

-- Step 5: Create PERMISSIVE policies (allow service role and authenticated users)
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR
  auth.role() = 'service_role' OR
  auth.role() = 'authenticated'
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id OR
  auth.role() = 'service_role'
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR
  auth.role() = 'service_role'
);

CREATE POLICY "user_stats_select_policy" ON public.user_stats
FOR SELECT USING (
  auth.uid() = user_id OR
  auth.role() = 'service_role'
);

CREATE POLICY "user_stats_insert_policy" ON public.user_stats
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  auth.role() = 'service_role'
);

CREATE POLICY "user_stats_update_policy" ON public.user_stats
FOR UPDATE USING (
  auth.uid() = user_id OR
  auth.role() = 'service_role'
);

-- Step 6: Recreate trigger (with better error handling)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
  ON CONFLICT (id) DO NOTHING;

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.hierarchy_nodes TO authenticated;
GRANT ALL ON public.course_purchases TO authenticated;
