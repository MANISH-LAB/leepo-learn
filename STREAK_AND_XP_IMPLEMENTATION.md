# Streak and XP System Implementation

## Overview

This document describes the complete implementation of the Streak and XP (Experience Points) tracking system for the platform.

## Database Tables

### `user_stats` Table
Stores user streak and XP data:
- `user_id` (UUID) - Foreign key to profiles table
- `streak_days` (INTEGER) - Current consecutive days streak
- `total_xp` (INTEGER) - Total experience points earned
- `last_activity_date` (DATE) - Last day user was active
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## XP Reward System

### XP Values
```typescript
COMPLETE_TOPIC: 50 XP
COMPLETE_CHAPTER: 100 XP
COMPLETE_ASSESSMENT: 150 XP
PERFECT_ASSESSMENT: 200 XP (All questions correct)
DAILY_LOGIN: 10 XP
STREAK_BONUS_3_DAYS: 50 XP
STREAK_BONUS_7_DAYS: 100 XP
STREAK_BONUS_30_DAYS: 500 XP
```

## Streak Logic

### How Streaks Work

1. **First Login**: Streak starts at 1 day
2. **Consecutive Days**:
   - If user logs in the next day, streak increments by 1
   - If user logs in on the same day, streak stays the same
   - If user misses a day (or more), streak resets to 1

3. **Streak Calculation**:
   ```typescript
   const diffDays = (today - lastActivityDate) in days;

   if (diffDays === 0) return currentStreak;        // Same day
   if (diffDays === 1) return currentStreak + 1;    // Next day
   else return 1;                                   // Reset
   ```

4. **Bonus XP**: Users get bonus XP when reaching streak milestones:
   - 3 days: +50 XP
   - 7 days: +100 XP
   - 30 days: +500 XP

## Implementation Files

### 1. `src/utils/streakAndXP.ts`
Core logic for streak and XP management:

#### Key Functions:

**`calculateStreak(lastActivityDate, currentStreakDays)`**
- Determines if streak should continue or reset
- Returns new streak count

**`updateDailyActivity(userId)`**
- Called when user logs in
- Updates streak based on last activity date
- Awards daily login XP (10 XP)
- Awards bonus XP for streak milestones
- Returns: `{ streak: number, xpGained: number }`

**`awardXPForCompletion(userId, nodeId, nodeType, assessmentScore?)`**
- Awards XP when user completes content
- nodeType can be 'TOPIC' or 'CHAPTER'
- For chapters, includes assessment score bonus
- Updates database
- Marks content as completed
- Returns: XP earned

**`getCurrentUserStats(userId)`**
- Fetches current streak and XP from database
- Returns: `{ streak: number, xp: number }`

**`initializeUserStats(userId)`**
- Initializes stats for new users
- Sets streak to 1 and awards first login XP

### 2. `src/utils/supabase/database.ts`
Database operations:

**`getUserStats(userId)`**
- Fetches user_stats record
- Returns: `{ streak_days, total_xp, last_activity_date }`

**`updateUserStats(userId, streakDays, totalXP)`**
- Updates user_stats table
- Sets last_activity_date to current date
- Updates both streak and XP in one transaction

### 3. `src/App.tsx`
Main application integration:

#### On User Login (Two Places):
1. **checkSession** - Initial load
2. **onAuthStateChange** - Sign-in event

Both locations now call:
```typescript
// Update daily activity and streak
const activityResult = await updateDailyActivity(session.user.id);
console.log("Daily activity updated:", activityResult);

// Fetch updated stats
const stats = await getCurrentUserStats(session.user.id);
setUserStats({
  streak: stats.streak,
  xp: stats.xp
});
```

This ensures:
- Streak is updated every time user logs in
- Daily login XP is awarded
- Real stats are displayed in header

## Display Components

### Header (`src/components/layout/StudentStats.tsx`)
Shows streak and XP icons:
- 🔥 Flame icon for streak (orange)
- 🏆 Trophy icon for XP (purple)
- Real-time data from `userStats` prop

### Dashboard (`src/components/student/FullDashboard.tsx`)
Shows larger cards with:
- Daily Streak card (🔥)
- Quartz League card (🏆)
- Currently uses hardcoded values - needs to be updated to receive props

## Next Steps (To Complete Implementation)

### 1. Update CourseView to Award XP on Completion

Currently, `CourseView` has a `handleMarkComplete` function that awards XP locally. This needs to be updated to:

```typescript
const handleMarkComplete = async (topicId: string) => {
  if (!user?.id) return;
  if (completedTopicIds.has(topicId)) return; // Already completed

  // Award XP and save to database
  const xpEarned = await awardXPForCompletion(
    user.id,
    topicId,
    'TOPIC'
  );

  // Show XP animation
  setXPAmount(xpEarned);
  setShowXP(true);

  // Update local state
  setCompletedTopicIds(prev => new Set([...prev, topicId]));

  // Refresh stats in App component
  if (onStatsUpdate) {
    const stats = await getCurrentUserStats(user.id);
    onStatsUpdate(stats);
  }

  // Check for chapter completion
  // ... existing logic
};
```

### 2. Pass User and Callback to CourseView

Update CourseView props:
```typescript
export function CourseView({
  subjectNode,
  onNavigate,
  user,
  onStatsUpdate
}: {
  subjectNode?: Node | null;
  onNavigate?: (path: string) => void;
  user?: { id: string; name?: string; email?: string };
  onStatsUpdate?: (stats: { streak: number; xp: number }) => void;
})
```

### 3. Update FullDashboard to Show Real Stats

Pass real streak and XP to dashboard:
```typescript
<FullDashboard
  onNavigate={navigate}
  user={user}
  streak={userStats.streak}
  xp={userStats.xp}
/>
```

Update FullDashboard component to use these props instead of hardcoded values.

### 4. Load User's Completion Progress

On CourseView mount, load which topics the user has already completed:
```typescript
useEffect(() => {
  async function loadCompletedTopics() {
    if (!user?.id) return;

    const progress = await db.getUserProgress(user.id);
    const completedIds = new Set(
      progress
        .filter(p => p.is_completed)
        .map(p => p.node_id)
    );
    setCompletedTopicIds(completedIds);
  }

  loadCompletedTopics();
}, [user?.id, subject Node?.id]);
```

### 5. Assessment Completion with Score

When user completes a chapter assessment:
```typescript
const handleAssessmentComplete = async (score: number) => {
  if (!user?.id || !selectedChapter?.id) return;

  const xpEarned = await awardXPForCompletion(
    user.id,
    selectedChapter.id,
    'CHAPTER',
    score // Pass assessment score for bonus XP
  );

  // Show completion screen with XP earned
  setXPAmount(xpEarned);
  setShowCompletionScreen(true);

  // Refresh stats
  if (onStatsUpdate) {
    const stats = await getCurrentUserStats(user.id);
    onStatsUpdate(stats);
  }
};
```

## Testing Checklist

- [ ] User logs in for first time → Streak = 1, XP = 10
- [ ] User logs in next day → Streak = 2, XP = 20
- [ ] User logs in same day again → Streak stays 2, XP stays 20
- [ ] User skips a day then logs in → Streak = 1, XP = 30
- [ ] User reaches 3-day streak → Gets bonus 50 XP
- [ ] User completes a topic → Gets 50 XP
- [ ] User completes a chapter → Gets 100 XP
- [ ] User gets 100% on assessment → Gets 200 XP bonus
- [ ] User gets 80-99% on assessment → Gets 150 XP bonus
- [ ] Stats display correctly in header
- [ ] Stats display correctly in dashboard
- [ ] XP animation plays on completion
- [ ] Stats persist across page refreshes
- [ ] Stats sync between tabs

## Database Queries

### Check User Stats
```sql
SELECT * FROM user_stats WHERE user_id = 'user-uuid-here';
```

### Reset User Stats (for testing)
```sql
UPDATE user_stats
SET streak_days = 0, total_xp = 0, last_activity_date = NULL
WHERE user_id = 'user-uuid-here';
```

### View All Progress
```sql
SELECT
  up.*,
  hn.title,
  hn.type
FROM user_progress up
JOIN hierarchy_nodes hn ON up.node_id = hn.id
WHERE up.user_id = 'user-uuid-here'
  AND up.is_completed = true
ORDER BY up.last_accessed DESC;
```

## Notes

- All XP awards and streak updates are atomic operations in the database
- Streak is calculated server-side based on actual dates (no client manipulation)
- User cannot "game" the system by changing device time
- last_activity_date is set to the start of the day (00:00:00) for consistent comparison
- XP can only increase, never decrease
- Completing the same content twice doesn't award XP again
