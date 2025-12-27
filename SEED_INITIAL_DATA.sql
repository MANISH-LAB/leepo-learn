-- Seed initial course hierarchy data
-- This populates the database with the initial tree structure

-- Clear existing data (be careful - this deletes everything!)
DELETE FROM content_assets;
DELETE FROM chapter_assessments;
DELETE FROM assessments;
DELETE FROM hierarchy_nodes;

-- Insert Computer Science Engineering degree
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1', NULL, 'DEGREE', 'Computer Science Engineering', 0, true);

-- Insert 1st Year
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1', '1', 'YEAR', '1st Year', 0, true);

-- Insert 2nd Year
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-2', '1', 'YEAR', '2nd Year', 1, true);

-- Insert Engineering Mathematics I subject
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-1', '1-1', 'SUBJECT', 'Engineering Mathematics I', 0, true);

-- Insert Engineering Physics subject
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-2', '1-1', 'SUBJECT', 'Engineering Physics', 1, true);

-- Insert Matrices chapter under Engineering Mathematics I
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-1-1', '1-1-1', 'CHAPTER', 'Matrices', 0, true);

-- Insert Calculus chapter under Engineering Mathematics I
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-1-2', '1-1-1', 'CHAPTER', 'Calculus', 1, true);

-- Insert topics under Matrices chapter
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-1-1-1', '1-1-1-1', 'TOPIC', 'Introduction to Matrices', 0, true),
('1-1-1-1-2', '1-1-1-1', 'TOPIC', 'Types of Matrices', 1, true);

-- Insert topic under Calculus chapter
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('1-1-1-2-1', '1-1-1-2', 'TOPIC', 'Limits and Continuity', 0, true);

-- Insert Mechanical Engineering degree
INSERT INTO hierarchy_nodes (id, parent_id, type, title, order_index, is_active) VALUES
('2', NULL, 'DEGREE', 'Mechanical Engineering', 1, true);

-- Insert sample content assets for topics
INSERT INTO content_assets (node_id, video_url, is_premium) VALUES
('1-1-1-1-1', 'https://example.com/video1', false),
('1-1-1-1-2', 'https://example.com/video2', false);

-- Insert sample assessment for Matrices chapter
INSERT INTO chapter_assessments (chapter_node_id, questions) VALUES
('1-1-1-1', '[
  {
    "id": "q1",
    "text": "What is the determinant of a 2x2 identity matrix?",
    "options": ["0", "1", "2", "-1"],
    "correctAnswer": 1
  },
  {
    "id": "q2",
    "text": "Which of the following is a condition for a matrix to be invertible?",
    "options": ["Determinant is zero", "Matrix is square", "Determinant is non-zero", "Matrix is diagonal"],
    "correctAnswer": 2
  }
]'::jsonb);

-- Verify the data was inserted
DO $$
DECLARE
    node_count INTEGER;
    content_count INTEGER;
    assessment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO node_count FROM hierarchy_nodes;
    SELECT COUNT(*) INTO content_count FROM content_assets;
    SELECT COUNT(*) INTO assessment_count FROM chapter_assessments;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEED DATA INSERTED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Hierarchy nodes: %', node_count;
    RAISE NOTICE 'Content assets: %', content_count;
    RAISE NOTICE 'Chapter assessments: %', assessment_count;
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. View courses in the student view';
    RAISE NOTICE '2. Edit courses in the admin Course Manager';
    RAISE NOTICE '3. Add video URLs, PDFs, and other content';
    RAISE NOTICE '========================================';
END $$;
