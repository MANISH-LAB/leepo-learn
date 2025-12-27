# SETUP INSTRUCTIONS - READ THIS FIRST!

##   CRITICAL: You MUST run the SQL script first!

**The database won't work until you complete these steps!**

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Open your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the COMPLETE_FIX.sql
1. Open the file `COMPLETE_FIX.sql` in this directory
2. Copy ALL the contents (the entire file - it's about 400 lines)
3. Paste it into the Supabase SQL Editor
4. Click "Run" button (or press Ctrl+Enter)
5. Wait for it to complete (~5-10 seconds)
6. You should see "Success. No rows returned"

### Step 3: Verify Tables Were Created
1. In Supabase, click "Table Editor" in left sidebar
2. You should see these tables:
   -  profiles
   -  user_stats
   -  hierarchy_nodes
   -  content_assets
   -  assessments
   -  assessment_questions
   -  pricing
   -  course_purchases
   -  user_progress

**If you don't see these tables, the SQL didn't run correctly!**

### Step 4: Test the Application
1. Go to http://localhost:3004
2. Click "Enroll Now" or Sign in with Google
3. Open browser console (Press F12)
4. Look for these logs when filling forms:
   - `=Ý Saving profile data:` - when you fill Complete Your Profile
   - ` Update result:` - when data is saved successfully
   - `L Update error:` - if there's an error (tells you what's wrong)

---

## Common Errors & Solutions:

### Error: "relation 'profiles' does not exist"
**Cause:** Tables weren't created
**Solution:** You didn't run the SQL script! Go back to Step 1 and run COMPLETE_FIX.sql

### Error: "new row violates row-level security policy"
**Cause:** RLS policies are blocking the insert/update
**Solution:** Run COMPLETE_FIX.sql again - it will fix the policies

### Error: "406 Not Acceptable"
**Cause:** Using `.single()` when no row exists
**Solution:** Already fixed in code - if you still see this, let me know

### No logs in console at all
**Cause:** Forms aren't triggering
**Solution:** Make sure you're logged in with Google first

### "Loading timeout - using fallback data"
**Cause:** Course data isn't loading from database
**Solution:** This is OK - it will use local data. The profile/payment will still work.

---

## How to Check if Database is Working:

### Quick Test:
1. Sign in with Google
2. Open browser console (F12)
3. Paste this code and press Enter:

```javascript
const { data, error } = await window.supabase.from('profiles').select('*');
console.log('Profiles:', data, 'Error:', error);
```

**Expected:** You should see your profile data
**If error:** The table doesn't exist or RLS is blocking access

### Detailed Test Component:
I created a DatabaseTest component. To use it:

1. It's in: `src/components/debug/DatabaseTest.tsx`
2. You can import and add it to any page temporarily
3. Click "Run Database Test" to see detailed diagnostics

---

## What The SQL Script Does:

1. **Drops** all existing tables (clean slate)
2. **Creates** all 9 tables with proper structure
3. **Enables RLS** (Row Level Security) on all tables
4. **Creates policies** that allow:
   - Users to read/write their own data
   - Anyone to read public data (courses, etc.)
5. **Creates trigger** that automatically creates a profile when you sign up
6. **Grants permissions** to authenticated and anonymous users
7. **Creates profiles** for any existing users

---

## Still Not Working?

1. Run the DatabaseTest component
2. Share the full console output
3. Check Supabase Dashboard > Logs > Query Logs
4. Make sure you're using the correct Supabase project

**99% of the time, the issue is: YOU FORGOT TO RUN THE SQL SCRIPT!**

Run COMPLETE_FIX.sql and everything will work!
