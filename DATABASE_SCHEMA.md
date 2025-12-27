# Database Schema Documentation

## Overview
This document describes all tables in the Supabase database and their purposes.

---

## Core Tables

### 1. **profiles**
**Purpose:** Stores user profile information
**Key Fields:**
- `id` (uuid, PK) - User ID (references auth.users)
- `email` (text, unique) - User email
- `full_name` (text) - User's full name
- `avatar_url` (text) - Profile picture URL
- `college` (text) - College name
- `degree` (text) - Degree program
- `current_year` (text) - Current academic year
- `passing_year` (text) - Expected graduation year
- `role` (text) - User role (default: 'user')
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Used By:** All user-related operations

---

### 2. **user_stats**
**Purpose:** Stores user XP, streak, and activity tracking
**Key Fields:**
- `user_id` (uuid, PK) - References profiles(id)
- `streak_days` (integer) - Current login streak
- `total_xp` (integer) - Total XP earned
- `last_activity_date` (date) - Last activity date
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**RLS Policies:**
- Users can read own stats: `auth.uid() = user_id`
- Users can insert own stats: `auth.uid() = user_id`
- Users can update own stats: `auth.uid() = user_id`

**XP Rewards:**
- Complete Topic: 50 XP
- Complete Chapter: 100 XP
- Complete Assessment: 150 XP
- Perfect Assessment (100%): 200 XP
- Daily Login: 10 XP
- 3-day Streak Bonus: 50 XP
- 7-day Streak Bonus: 100 XP
- 30-day Streak Bonus: 500 XP

**Updated By:**
- `awardXPForCompletion()` in src/utils/streakAndXP.ts
- `updateDailyActivity()` in src/utils/streakAndXP.ts

---

### 3. **user_progress**
**Purpose:** Tracks user progress for each topic/node
**Key Fields:**
- `id` (uuid, PK) - Progress record ID
- `user_id` (uuid) - References profiles(id)
- `node_id` (text) - References hierarchy_nodes(id)
- `is_completed` (boolean) - Completion status
- `last_accessed` (timestamptz) - Last accessed time
- `private_notes` (text) - User's private notes
- `created_at`, `updated_at` (timestamptz)

**Unique Constraint:** `(user_id, node_id)` - One progress record per user per node
**Row Level Security:** Enabled ✅
**RLS Policies:**
- Users can read own progress: `auth.uid() = user_id`
- Users can insert own progress: `auth.uid() = user_id`
- Users can update own progress: `auth.uid() = user_id`

**Triggers:**
- `trigger_topic_completion_notification` - Creates notification on INSERT/UPDATE

**Updated By:**
- `updateUserProgress()` in src/utils/supabase/database.ts
- Called when user marks topic as complete

---

### 4. **hierarchy_nodes** (923 nodes)
**Purpose:** Stores the course hierarchy structure
**Key Fields:**
- `id` (text, PK) - Node ID (e.g., 'cse-s1-math1-ch1-t1')
- `parent_id` (text) - References hierarchy_nodes(id)
- `type` (text) - Node type: DEGREE, YEAR, SUBJECT, CHAPTER, TOPIC
- `title` (text) - Node title
- `icon_url` (text) - Icon URL
- `order_index` (integer) - Display order
- `is_active` (boolean) - Active status
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Hierarchy:**
```
DEGREE (e.g., B.Tech CSE)
  └── YEAR (e.g., Semester 1)
      └── SUBJECT (e.g., Engineering Mathematics I)
          └── CHAPTER (e.g., Differential Calculus)
              └── TOPIC (e.g., Limits and Continuity)
```

**Used By:** All course navigation and content display

---

### 5. **content_assets**
**Purpose:** Stores media and content for topics
**Key Fields:**
- `id` (uuid, PK) - Asset ID
- `node_id` (text, unique) - References hierarchy_nodes(id)
- `video_url` (text) - Video URL (English)
- `video_url_hindi` (text) - Video URL (Hindi)
- `audio_url` (text) - Audio URL (English)
- `audio_url_hindi` (text) - Audio URL (Hindi)
- `pdf_url` (text) - PDF URL
- `duration` (text) - Content duration
- `is_premium` (boolean) - Premium content flag
- `interactive_content` (text) - Interactive content data
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Used By:** CourseView component to display topic content

---

## Assessment Tables

### 6. **assessments**
**Purpose:** Stores assessment metadata for chapters
**Key Fields:**
- `id` (uuid, PK) - Assessment ID
- `chapter_id` (text, unique) - References hierarchy_nodes(id)
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅

---

### 7. **assessment_questions**
**Purpose:** Stores individual assessment questions
**Key Fields:**
- `id` (uuid, PK) - Question ID
- `assessment_id` (uuid) - References assessments(id)
- `question_text` (text) - Question text
- `options` (text[]) - Answer options array
- `correct_answer` (integer) - Index of correct answer
- `order_index` (integer) - Question order
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅

---

### 8. **chapter_assessments**
**Purpose:** Stores assessment data for chapters (JSONB format)
**Key Fields:**
- `id` (integer, PK) - Assessment ID
- `chapter_node_id` (text) - References hierarchy_nodes(id)
- `questions` (jsonb) - Questions in JSON format
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Note:** Alternative format to assessments table

---

### 9. **assessment_results**
**Purpose:** Stores user assessment scores and results
**Key Fields:**
- `id` (uuid, PK) - Result ID
- `user_id` (uuid) - References profiles(id)
- `chapter_id` (text) - Chapter ID
- `assessment_id` (uuid) - References assessments(id)
- `score` (numeric) - Percentage score (0-100)
- `total_questions` (integer) - Total questions
- `correct_answers` (integer) - Number of correct answers
- `completed_at` (timestamptz) - Completion timestamp
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Used By:** Dashboard to calculate average score

---

## Commerce Tables

### 10. **pricing**
**Purpose:** Stores pricing for year nodes
**Key Fields:**
- `id` (uuid, PK) - Pricing ID
- `year_node_id` (text, unique) - References hierarchy_nodes(id)
- `price` (numeric) - Price amount
- `currency` (text) - Currency code (default: 'USD')
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅

---

### 11. **pricing_config**
**Purpose:** Global pricing configuration
**Key Fields:**
- `id` (uuid, PK) - Config ID
- `config_key` (text, unique) - Configuration key
- `config_value` (numeric) - Configuration value
- `description` (text) - Description
- `currency` (text) - Currency code
- `is_active` (boolean) - Active status
- `created_at`, `updated_at` (timestamptz)

**Row Level Security:** Enabled ✅

---

### 12. **course_purchases**
**Purpose:** Stores user course purchase transactions
**Key Fields:**
- `id` (uuid, PK) - Purchase ID
- `user_id` (uuid) - References profiles(id)
- `year_node_id` (text) - Purchased year
- `amount` (numeric) - Purchase amount
- `currency` (text) - Currency (default: 'INR')
- `status` (text) - Payment status (default: 'pending')
- `payment_provider` (text) - Payment provider (default: 'stripe')
- `transaction_id` (text) - Transaction ID
- `purchased_at` (timestamptz) - Purchase timestamp

**Row Level Security:** Enabled ✅

---

## Utility Tables

### 13. **user_learning_position**
**Purpose:** Tracks user's current learning position for "Continue Learning"
**Key Fields:**
- `user_id` (uuid, PK) - References auth.users(id)
- `subject_id` (text) - Current subject
- `subject_title` (text) - Subject title
- `chapter_id` (text) - Current chapter
- `chapter_title` (text) - Chapter title
- `topic_id` (text) - Current topic
- `topic_title` (text) - Topic title
- `video_timestamp` (integer) - Video playback position
- `completed_topics` (integer) - Completed topics count
- `total_topics` (integer) - Total topics count
- `last_accessed` (timestamptz) - Last accessed time
- `created_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Used By:** Dashboard "Continue Learning" feature

---

### 14. **user_notifications**
**Purpose:** Stores user notifications
**Key Fields:**
- `id` (uuid, PK) - Notification ID
- `user_id` (uuid) - References profiles(id)
- `type` (text) - Notification type: welcome, topic_completed, assessment_completed, achievement, streak
- `title` (text) - Notification title
- `message` (text) - Notification message
- `metadata` (jsonb) - Additional metadata
- `is_read` (boolean) - Read status
- `created_at` (timestamptz)

**Row Level Security:** Enabled ✅
**Triggers:**
- `create_welcome_notification()` - Creates welcome notification for new users
- `create_topic_completion_notification()` - Creates notification when topic is completed

---

## Key Relationships

### User Flow for Topic Completion
1. User completes a topic in CourseView
2. `handleMarkComplete(topicId)` is called
3. **user_progress** table updated: `is_completed = true`
4. **user_stats** table updated: `total_xp += 50`
5. **user_notifications** table: Notification created via trigger
6. UI updates: XP animation shows, nav/dashboard refresh

### Database Functions Used
- `updateUserProgress(userId, nodeId, isCompleted)` - Updates user_progress
- `updateUserStats(userId, streakDays, totalXP)` - Updates user_stats
- `awardXPForCompletion(userId, nodeId, nodeType)` - Awards XP and marks complete
- `getUserStats(userId)` - Fetches user stats
- `getUserProgress(userId)` - Fetches all user progress records

---

## Important Notes

1. **All tables have RLS enabled** after recent migration
2. **user_progress** has unique constraint on `(user_id, node_id)` to prevent duplicates
3. **Direct fetch API** is used for user_stats and user_progress to ensure proper RLS handling
4. **Triggers** automatically create notifications on user actions
5. **XP system** awards points based on completion type (topic, chapter, assessment)

---

## Current Data (as of last check)
- **Total users:** 2
- **Total completed topics:** 3
- **User 1 (manishkalyan141@gmail.com):** 420 XP, 2 completed topics, 5-day streak
- **User 2 (aklmkdna@gmail.com):** 10 XP, 1 completed topic, 1-day streak
