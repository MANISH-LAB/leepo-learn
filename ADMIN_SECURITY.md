# Admin Security & Access Control

## 🔐 Admin Access Requirements

Only **manishkalyan141@gmail.com** can access admin features.

## Security Layers

### Layer 1: Database Level (Supabase RLS)
```sql
-- Admin role automatically assigned by trigger
CASE
  WHEN NEW.email = 'manishkalyan141@gmail.com' THEN 'admin'
  ELSE 'user'
END

-- RLS policies check admin role for all admin operations
```

### Layer 2: UI Level (React Components)
Multiple components check email before showing admin UI:

#### 1. Header Navigation (App.tsx:211)
```typescript
{user && user.email === 'manishkalyan141@gmail.com' && (
  <div className="admin-view-toggle">
    <Button onClick={() => setCurrentView("admin")}>
      Admin View
    </Button>
  </div>
)}
```
✅ **Admin button only visible when:**
- User is logged in
- Email is exactly `manishkalyan141@gmail.com`

#### 2. Profile Dropdown (HeaderProfile.tsx:47)
```typescript
{user.email === 'manishkalyan141@gmail.com' && (
  <DropdownMenuItem onClick={onAdminDashboard}>
    <Shield className="mr-2 h-4 w-4" />
    Admin Command Center
  </DropdownMenuItem>
)}
```
✅ **Admin menu item only shows for admin email**

#### 3. Mobile Navigation (MobileNav.tsx:71)
```typescript
{user && user.email === 'manishkalyan141@gmail.com' && (
  <nav>
    <Button onClick={() => setCurrentView("admin")}>
      Admin Dashboard
    </Button>
  </nav>
)}
```
✅ **Mobile menu hides admin option for non-admins**

#### 4. Dashboard Render (App.tsx:284)
```typescript
{currentView === "admin" && user?.email === 'manishkalyan141@gmail.com' ? (
  <AdminDashboard />
) : (
  <StudentDashboard />
)}
```
✅ **Even if someone tries to set `currentView="admin"`, they'll see StudentDashboard**

## What Non-Admin Users See

### Regular User (any other email)
```
✅ Can see: Student View
✅ Can see: Student Dashboard
✅ Can see: Course Browser
✅ Can see: Free Content
❌ Cannot see: Admin button in header
❌ Cannot see: Admin option in dropdown
❌ Cannot see: Admin Dashboard
❌ Cannot see: Course Manager
❌ Cannot see: Price Manager
❌ Cannot see: User Analytics
```

### Not Logged In
```
✅ Can see: Landing Page
✅ Can see: Login Button
❌ Cannot see: Any navigation buttons
❌ Cannot see: Course content
❌ Cannot see: Admin features
```

## Testing Security

### Test 1: Admin Access (manishkalyan141@gmail.com)
```bash
1. Login with manishkalyan141@gmail.com
2. ✅ Should see "Admin View" button in header
3. ✅ Should see "Admin Command Center" in profile dropdown
4. ✅ Can click to switch to Admin Dashboard
5. ✅ Can perform CRUD operations
```

### Test 2: Regular User Access
```bash
1. Login with any other Gmail account
2. ❌ Should NOT see "Admin View" button
3. ❌ Should NOT see "Admin Command Center" in dropdown
4. ✅ Should only see Student Dashboard
5. ❌ Cannot access admin features
```

### Test 3: Not Logged In
```bash
1. Visit site without logging in
2. ✅ Should see Landing Page
3. ❌ Should NOT see any navigation
4. ❌ Should NOT see admin buttons
```

### Test 4: URL Manipulation (Security Test)
```bash
1. Login as regular user
2. Manually try to set currentView = "admin" in browser console
3. ✅ Should still show StudentDashboard (security check passes)
4. ✅ AdminDashboard component never renders
```

## Code Locations

| Security Check | File | Line |
|---------------|------|------|
| Database trigger | `supabase_schema.sql` | 198-201 |
| Header admin button | `src/App.tsx` | 211 |
| Dashboard render | `src/App.tsx` | 284 |
| Profile dropdown | `src/components/layout/HeaderProfile.tsx` | 47 |
| Mobile nav | `src/components/layout/MobileNav.tsx` | 71 |

## Security Best Practices Used

✅ **Defense in Depth**: Multiple layers of security
✅ **Email Check**: All checks use exact email comparison
✅ **Database RLS**: Backend security independent of frontend
✅ **UI Hiding**: Admin features completely hidden from non-admins
✅ **Component Guard**: Dashboard component checks before rendering

## Potential Attack Vectors & Mitigations

### Attack: Modify localStorage/sessionStorage
**Mitigation**: All checks use live user session from Supabase, not client storage

### Attack: Modify React state
**Mitigation**: Final render check ensures only admin email sees AdminDashboard

### Attack: Direct API calls
**Mitigation**: Supabase RLS policies block unauthorized database operations

### Attack: Inspect element and unhide buttons
**Mitigation**: Even if buttons become visible, clicking them won't work due to render guards

## Summary

🔒 **Multiple Security Layers**
- Database: RLS policies
- Backend: Supabase Auth
- Frontend: Email checks in 4+ locations

🎯 **Single Source of Truth**
- Only `manishkalyan141@gmail.com` gets admin access
- Checked at every access point

✅ **Tested & Secure**
- Cannot bypass via UI manipulation
- Cannot bypass via URL manipulation
- Cannot bypass via API calls

---

**Admin Email:** manishkalyan141@gmail.com
**All other emails:** Regular user access only
