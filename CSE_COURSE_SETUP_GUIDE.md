# CSE Course Population Guide

## Overview
This guide helps you populate your Supabase database with the complete B.Tech Computer Science Engineering curriculum covering all 8 semesters.

## What's Included

### 📊 Complete Hierarchy
- **1 Degree**: B.Tech Computer Science Engineering
- **4 Years**: Grouped by academic years
- **8 Semesters**: All semesters from 1 to 8
- **48 Subjects**: Core + elective subjects
- **~288 Chapters**: 6 chapters per subject on average
- **Topics**: Sample topics included, expandable

### 📁 Files Created

1. **POPULATE_CSE_COURSES.sql** - Part 1 (Semesters 1-4)
   - Year 1: Foundation subjects
   - Year 2: Core CS subjects

2. **POPULATE_CSE_COURSES_PART2.sql** - Part 2 (Semesters 5-8)
   - Year 3: Advanced topics
   - Year 4: Specialization & capstone

3. **CREATE_CONTINUE_LEARNING_TABLE.sql** - Continue learning feature
   - User learning position tracking
   - Video timestamp storage
   - Progress tracking

## How to Run

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Part 1 (Semesters 1-4)
1. Copy the entire contents of `POPULATE_CSE_COURSES.sql`
2. Paste into the SQL Editor
3. Click **Run** or press `Ctrl+Enter`
4. Wait for completion message

### Step 3: Run Part 2 (Semesters 5-8)
1. Copy the entire contents of `POPULATE_CSE_COURSES_PART2.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for completion message

### Step 4: Create Continue Learning Table
1. Copy the entire contents of `CREATE_CONTINUE_LEARNING_TABLE.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Confirm success message

## Database Structure

```
hierarchy_nodes table:
┌──────────────────────────────────────────────┐
│ id (text, primary key)                       │
│ title (text)                                 │
│ type (text: DEGREE/YEAR/SUBJECT/CHAPTER/TOPIC) │
│ parent_id (text, foreign key, nullable)     │
│ order_index (integer, default 0)            │
│ icon_url (text, nullable)                   │
│ is_active (boolean, default true)           │
│ created_at (timestamptz, auto)              │
│ updated_at (timestamptz, auto)              │
└──────────────────────────────────────────────┘
```

## Hierarchy Levels

### 1. Degree Level
- **ID Format**: `cse-degree`
- **Example**: B.Tech Computer Science Engineering

### 2. Year Level
- **ID Format**: `cse-year-{1-4}`
- **Parent**: Degree
- **Examples**:
  - Year 1: Foundation & Core Skills
  - Year 2: Core CS Fundamentals
  - Year 3: Advanced CS & Emerging Technologies
  - Year 4: Specialization & Industry Readiness

### 3. Subject Level
- **ID Format**: `cse-s{semester}-{subject-code}`
- **Parent**: Year
- **Examples**:
  - `cse-s1-math1`: Engineering Mathematics I
  - `cse-s3-dbms`: Database Management Systems
  - `cse-s6-ml`: Machine Learning

### 4. Chapter Level
- **ID Format**: `cse-s{semester}-{subject}-ch{number}`
- **Parent**: Subject
- **Example**: `cse-s3-dbms-ch1`: Relational Model and SQL Foundations

### 5. Topic Level
- **ID Format**: `cse-s{semester}-{subject}-ch{chapter}-t{number}`
- **Parent**: Chapter
- **Example**: `cse-s3-dbms-ch1-t1`: Database schemas and constraints

## Sample Subjects by Semester

### Semester 1 (Foundation)
- Engineering Mathematics I
- Programming for Problem Solving (C)
- Engineering Physics
- Basic Electrical and Electronics
- Engineering Graphics and CAD
- Professional Communication and Ethics

### Semester 3 (Core CS)
- Discrete Mathematics for Computing
- Computer Organization and Architecture
- Database Management Systems
- Operating Systems
- Design and Analysis of Algorithms
- Unix Utilities and Shell Programming

### Semester 5 (Advanced)
- Compiler Design
- Artificial Intelligence
- Information Security and Cyber Laws
- Distributed Systems
- Data Mining and Warehousing
- Professional Elective I (HCI)

### Semester 7 (Specialization)
- Deep Learning
- Natural Language Processing
- Software Project Management
- High-Performance Computing
- Professional Elective III (Computer Vision)
- Open Elective I (AR/VR)

## Customization Options

### Adding More Topics
To add topics to a chapter, use this SQL pattern:

```sql
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-dbms-ch1-t{number}',
  'Topic Title',
  'TOPIC',
  'cse-s3-dbms-ch1',  -- Parent chapter ID
  {order_number},
  true
);
```

### Replacing Electives
The scripts include example electives:
- **Semester 5 PE1**: Human-Computer Interaction
- **Semester 6 PE2**: Blockchain Technologies
- **Semester 7 PE3**: Computer Vision
- **Semester 7 OE1**: AR/VR
- **Semester 8 OE2**: Edge Computing

To replace with your electives:
1. Find the subject in the SQL file
2. Replace the subject details
3. Update all chapter and topic IDs accordingly

### Hiding Courses
To temporarily hide courses:

```sql
UPDATE hierarchy_nodes
SET is_active = false
WHERE id = 'cse-s8-oe2-edge';
```

## Verification Queries

### Check Total Count
```sql
-- Count by type
SELECT type, COUNT(*)
FROM hierarchy_nodes
WHERE id LIKE 'cse-%'
GROUP BY type
ORDER BY CASE type
  WHEN 'DEGREE' THEN 1
  WHEN 'YEAR' THEN 2
  WHEN 'SUBJECT' THEN 3
  WHEN 'CHAPTER' THEN 4
  WHEN 'TOPIC' THEN 5
END;
```

### View Semester Structure
```sql
-- See all subjects in Semester 3 (Year 2)
SELECT
  ch.id,
  ch.title,
  COUNT(chapters.id) as chapter_count
FROM hierarchy_nodes ch
LEFT JOIN hierarchy_nodes chapters ON chapters.parent_id = ch.id
WHERE ch.parent_id = 'cse-year-2'
  AND ch.type = 'SUBJECT'
GROUP BY ch.id, ch.title
ORDER BY ch.order_index;
```

### Check Hierarchy Integrity
```sql
-- Find orphaned records
SELECT * FROM hierarchy_nodes
WHERE parent_id IS NOT NULL
  AND parent_id NOT IN (SELECT id FROM hierarchy_nodes);
```

## Troubleshooting

### Issue: "Duplicate key value violates unique constraint"
**Solution**: You've already run the script. Either:
- Run the cleanup at the start of the SQL (uncomment the DELETE line)
- Manually delete: `DELETE FROM hierarchy_nodes WHERE id LIKE 'cse-%';`

### Issue: "Foreign key violation"
**Solution**: Make sure you run Part 1 before Part 2, as Part 2 depends on Year entries from Part 1.

### Issue: "Table doesn't exist"
**Solution**: Make sure your `hierarchy_nodes` table exists. Check your database schema or migration files.

## Next Steps

After populating the database:

1. **Test in Admin Panel**
   - Log in as admin (manishkalyan141@gmail.com)
   - Navigate to Admin View
   - Verify all courses are visible

2. **Test in Student View**
   - Switch to Student View
   - Browse through degrees → years → subjects
   - Check that chapters and topics load correctly

3. **Configure Premium Courses**
   - Mark advanced courses as premium
   - Test payment flow if implemented

4. **Add Content**
   - Upload video lectures for topics
   - Add PDFs and infographics
   - Configure assessments

## Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify RLS policies are not blocking inserts
3. Check browser console for errors
4. Ensure you're logged in as admin when testing

## Data Maintenance

### Backup Before Changes
```sql
-- Backup to JSON
COPY (
  SELECT json_agg(row_to_json(hierarchy_nodes))
  FROM hierarchy_nodes
  WHERE id LIKE 'cse-%'
) TO '/tmp/cse_backup.json';
```

### Clear All CSE Data
```sql
DELETE FROM hierarchy_nodes WHERE id LIKE 'cse-%';
```

---

**Created**: Based on AICTE model curriculum
**Coverage**: All 8 semesters, foundation to specialization
**Expandable**: Topics can be added for each chapter as needed
