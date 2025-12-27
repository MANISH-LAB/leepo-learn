# Login & Onboarding Flow

## Complete User Journey

### 1️⃣ Landing Page
- User sees the landing page on first visit
- Two options:
  - **Get Started** → Hides landing, shows course browser (no login required)
  - **Login** → Opens enrollment wizard with Gmail OAuth

### 2️⃣ Gmail OAuth Login
- User clicks "Continue with Google" button
- Redirects to Google OAuth consent screen
- User authorizes the app
- Redirects back to app

### 3️⃣ Auto Profile Creation
- Database trigger automatically creates profile in `profiles` table
- `manishkalyan141@gmail.com` → Gets **admin** role
- All other emails → Get **user** role
- Profile is created with **ONLY**: `id`, `email`, `avatar_url`, `role`
- ⚠️ **Intentionally excludes** `full_name` and `college` (even if Google provides them)
- ✅ This ensures **first-time users ALWAYS see onboarding**

### 4️⃣ Onboarding Wizard (Automatic)
After successful login, the app detects incomplete profile and:
- ✅ Hides landing page
- ✅ Shows onboarding wizard (Step 2: Complete Profile)
- ✅ Pre-fills email from OAuth
- User fills in:
  - Full Name
  - College Name
  - Branch/Degree (dropdown)
  - Passing Year
  - Current Year (dropdown)

### 5️⃣ Profile Completion
- User clicks **"Continue"** button
- Profile data saves to Supabase `profiles` table:
  ```sql
  UPDATE profiles SET
    full_name = 'User Name',
    college = 'College Name',
    degree = 'CSE',
    current_year = '1',
    passing_year = '2028'
  WHERE id = user_id
  ```
- Success toast: "Profile completed successfully!"

### 6️⃣ Course Dashboard
- ✅ User is now on main dashboard
- ✅ Can browse all courses
- ✅ Can access free content
- ✅ Premium content requires payment
- ✅ Admin users see "Admin View" button

## Flow States

### State 1: Not Logged In (First Visit)
```
Landing Page → [Get Started] → Course Browser (Guest)
Landing Page → [Login] → OAuth → Onboarding → Dashboard
```

### State 2: First-Time Login (Profile Incomplete)
```
Login → OAuth → Profile Created (id, email, role only)
     → App detects NULL full_name & college
     → Opens Onboarding Wizard Automatically
     → User fills form → Profile Updated → Dashboard
```

### State 3: Returning User (Profile Complete)
```
Login → OAuth → App detects full_name & college exist
     → Skips Onboarding
     → Direct to Dashboard ✅
```

## Technical Implementation

### App.tsx - Session Management
```typescript
// Checks if user is logged in on mount
useEffect(() => {
  if (session) {
    if (profile.full_name && profile.college) {
      // Complete profile → Show dashboard
      setUser(profile)
      setShowLanding(false)
    } else {
      // Incomplete profile → Show onboarding
      setUser(basicProfile)
      setShowLanding(false)
      setIsEnrollOpen(true)
    }
  }
}, [])
```

### EnrollmentWizard.tsx - Profile Update
```typescript
// Saves profile to database
const handleNext = async () => {
  if (step === 2) {
    await supabase.from('profiles').update({
      full_name: formData.name,
      college: formData.college,
      degree: formData.degree,
      current_year: formData.year,
      passing_year: formData.passingYear,
    }).eq('id', currentUserId)

    // Reload user and close wizard
    onComplete(updatedProfile)
  }
}
```

## Database Tables Involved

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,           -- NULL on first login, filled by onboarding
  college TEXT,             -- NULL on first login, filled by onboarding
  degree TEXT,              -- NULL on first login, filled by onboarding
  current_year TEXT,        -- NULL on first login, filled by onboarding
  passing_year TEXT,        -- NULL on first login, filled by onboarding
  role TEXT ('admin'/'user'),  -- Set by trigger
  avatar_url TEXT,          -- From Google OAuth
  created_at TIMESTAMPTZ
)

-- Database trigger creates profile with ONLY:
-- id, email, avatar_url, role
--
-- This ensures onboarding always shows for first-time users!
```

## Admin vs User Behavior

### Admin (manishkalyan141@gmail.com)
- ✅ Complete same onboarding flow
- ✅ Can switch to "Admin View"
- ✅ Full CRUD access to courses, pricing, users
- ✅ Can view analytics

### Regular User
- ✅ Complete same onboarding flow
- ✅ Only "Student View" available
- ✅ Can browse courses, access free content
- ✅ Must pay to unlock premium content

## Success Indicators

✅ **Login successful** → Landing page disappears
✅ **Onboarding shown** → Wizard opens automatically
✅ **Profile saved** → Toast notification appears
✅ **Dashboard loaded** → Course structure visible
✅ **Session persists** → Refresh doesn't log out

## Troubleshooting

### Issue: Stuck on landing page after login
- **Cause**: OAuth redirect not configured
- **Fix**: Add redirect URI in Google Console and Supabase

### Issue: Onboarding doesn't show
- **Cause**: Profile already complete
- **Fix**: Check database - profile should have null full_name/college

### Issue: Profile not saving
- **Cause**: RLS policies blocking update
- **Fix**: Check SQL schema has correct policies

---

**Ready to test?**
1. Run `npm run dev`
2. Click "Login"
3. Sign in with Gmail
4. Complete onboarding form
5. See your dashboard! 🎉
