# Onboarding Logic Explained

## 🎯 Goal
**Onboarding wizard should ONLY show for first-time users**

## How It Works

### Database Trigger Strategy
When a user logs in with Gmail OAuth for the first time:

```sql
-- Trigger creates profile with MINIMAL data
INSERT INTO profiles (id, email, avatar_url, role)
VALUES (
  user_id,
  'user@gmail.com',
  'https://google-avatar.jpg',
  'user' -- or 'admin' if manishkalyan141@gmail.com
)

-- Intentionally OMITS:
-- ❌ full_name (even though Google provides it)
-- ❌ college
-- ❌ degree
-- ❌ current_year
-- ❌ passing_year
```

### App Detection Logic

```typescript
// In App.tsx - checks profile completeness
if (profile && profile.full_name && profile.college) {
  // ✅ COMPLETE PROFILE - Returning user
  setUser(profile)
  setShowLanding(false)
  setNeedsOnboarding(false)  // Skip onboarding!

} else if (profile) {
  // ❌ INCOMPLETE PROFILE - First-time user
  setUser(basicInfo)
  setShowLanding(false)
  setNeedsOnboarding(true)
  setIsEnrollOpen(true)  // Show onboarding wizard!
}
```

## 🔄 User Journey Comparison

### 👤 First-Time User

```
1. Clicks "Login" → Gmail OAuth
   ↓
2. Google redirects back
   ↓
3. Database trigger creates:
   profiles {
     id: "abc123",
     email: "john@gmail.com",
     role: "user",
     avatar_url: "...",
     full_name: NULL,    ← KEY!
     college: NULL       ← KEY!
   }
   ↓
4. App checks: full_name && college
   → Both are NULL ❌
   ↓
5. ✅ Opens Onboarding Wizard
   ↓
6. User fills: Name, College, Degree, Year
   ↓
7. Updates database:
   profiles {
     full_name: "John Doe",
     college: "MIT",
     degree: "CSE",
     ...
   }
   ↓
8. ✅ Dashboard appears
```

### 🔄 Returning User (Same Login Later)

```
1. Clicks "Login" → Gmail OAuth
   ↓
2. Google redirects back
   ↓
3. Profile already exists in database:
   profiles {
     id: "abc123",
     email: "john@gmail.com",
     full_name: "John Doe",    ← EXISTS!
     college: "MIT"             ← EXISTS!
   }
   ↓
4. App checks: full_name && college
   → Both exist ✅
   ↓
5. ✅ Skips Onboarding
   ↓
6. ✅ Goes directly to Dashboard
```

## 🔍 Why This Approach?

### Option 1: Use Google's full_name ❌
```sql
-- If we did this:
INSERT INTO profiles (id, email, full_name, ...)
VALUES (user_id, 'user@gmail.com', google_name, ...)

-- Problem: full_name would NOT be NULL
-- App would think profile is complete
-- Onboarding would never show!
```

### Option 2: Leave full_name NULL ✅
```sql
-- What we do:
INSERT INTO profiles (id, email, avatar_url, role)
VALUES (user_id, 'user@gmail.com', avatar, role)
-- Omit full_name completely

-- Result: full_name is NULL
-- App detects incomplete profile
-- Onboarding shows automatically!
```

## 🧪 Testing

### Test First-Time Login
1. Clear database (or use new email)
2. Login with Gmail
3. ✅ Should see onboarding wizard
4. Fill form and submit
5. ✅ Should go to dashboard

### Test Returning User
1. Logout
2. Login again with same email
3. ✅ Should skip onboarding
4. ✅ Should go directly to dashboard

## 🗄️ Database State

### After First Login (Before Onboarding)
```sql
SELECT * FROM profiles WHERE email = 'john@gmail.com';
```
| id | email | full_name | college | role |
|----|-------|-----------|---------|------|
| abc123 | john@gmail.com | **NULL** | **NULL** | user |

### After Onboarding Complete
```sql
SELECT * FROM profiles WHERE email = 'john@gmail.com';
```
| id | email | full_name | college | degree | role |
|----|-------|-----------|---------|--------|------|
| abc123 | john@gmail.com | John Doe | MIT | CSE | user |

### On Next Login
```
App checks:
- full_name exists? ✅ "John Doe"
- college exists? ✅ "MIT"
→ Profile complete → Skip onboarding
```

## 🎯 Summary

✅ **First-time users:** Onboarding shows (profile incomplete)
✅ **Returning users:** Onboarding skipped (profile complete)
✅ **Detection method:** Check if `full_name` and `college` exist
✅ **Trigger strategy:** Don't populate these fields on initial profile creation

---

**Key Insight:** By intentionally leaving `full_name` and `college` as NULL during initial profile creation, we create a reliable way to detect first-time users! 🎉
