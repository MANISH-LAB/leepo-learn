-- ============================================================================
-- POPULATE CSE COURSE HIERARCHY - PART 1 (Semesters 1-4)
-- ============================================================================
-- This script populates B.Tech CSE curriculum for Years 1 & 2
-- Structure: Degree → Year → Subject → Chapter → Topic
-- Table: hierarchy_nodes
-- ============================================================================

-- Clean up existing CSE data (OPTIONAL - comment out if you want to keep existing data)
-- DELETE FROM hierarchy_nodes WHERE id LIKE 'cse-%';

-- ============================================================================
-- DEGREE: B.Tech Computer Science Engineering
-- ============================================================================
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-degree',
  'B.Tech Computer Science Engineering',
  'DEGREE',
  NULL,
  1,
  true
);

-- ============================================================================
-- YEAR 1 (Semesters 1 & 2) - Foundation Year
-- ============================================================================
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-year-1',
  'First Year - Engineering Fundamentals',
  'YEAR',
  'cse-degree',
  1,
  true
);

-- ============================================================================
-- SEMESTER 1 SUBJECTS
-- ============================================================================

-- Engineering Mathematics I
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-math1',
  'Engineering Mathematics I',
  'SUBJECT',
  'cse-year-1',
  1,
  true
);

-- Chapters for Engineering Mathematics I
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-math1-ch1', 'Limits, Continuity, and Differentiability', 'CHAPTER', 'cse-s1-math1', 1, true),
('cse-s1-math1-ch2', 'Applications of Derivatives', 'CHAPTER', 'cse-s1-math1', 2, true),
('cse-s1-math1-ch3', 'Integral Calculus and Applications', 'CHAPTER', 'cse-s1-math1', 3, true),
('cse-s1-math1-ch4', 'Multiple Integrals', 'CHAPTER', 'cse-s1-math1', 4, true),
('cse-s1-math1-ch5', 'Vector Calculus Basics', 'CHAPTER', 'cse-s1-math1', 5, true),
('cse-s1-math1-ch6', 'Matrices and Linear Algebra', 'CHAPTER', 'cse-s1-math1', 6, true);

-- Topics for Math I Chapters
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-math1-ch1-t1', 'Epsilon-Delta Definition of Limits', 'TOPIC', 'cse-s1-math1-ch1', 1, true),
('cse-s1-math1-ch1-t2', 'Continuity Tests and Theorems', 'TOPIC', 'cse-s1-math1-ch1', 2, true),
('cse-s1-math1-ch1-t3', 'Differentiability Concepts', 'TOPIC', 'cse-s1-math1-ch1', 3, true),
('cse-s1-math1-ch1-t4', 'Rolle''s and Mean Value Theorems', 'TOPIC', 'cse-s1-math1-ch1', 4, true),
-- Chapter 2 topics
('cse-s1-math1-ch2-t1', 'Monotonicity and Function Behavior', 'TOPIC', 'cse-s1-math1-ch2', 1, true),
('cse-s1-math1-ch2-t2', 'Finding Maxima and Minima', 'TOPIC', 'cse-s1-math1-ch2', 2, true),
('cse-s1-math1-ch2-t3', 'Curvature and Concavity Analysis', 'TOPIC', 'cse-s1-math1-ch2', 3, true),
('cse-s1-math1-ch2-t4', 'Taylor Series Expansion', 'TOPIC', 'cse-s1-math1-ch2', 4, true),
('cse-s1-math1-ch2-t5', 'Error Bounds and Estimation', 'TOPIC', 'cse-s1-math1-ch2', 5, true),
-- Chapter 3 topics
('cse-s1-math1-ch3-t1', 'Definite and Indefinite Integrals', 'TOPIC', 'cse-s1-math1-ch3', 1, true),
('cse-s1-math1-ch3-t2', 'Improper Integrals', 'TOPIC', 'cse-s1-math1-ch3', 2, true),
('cse-s1-math1-ch3-t3', 'Reduction Formulae', 'TOPIC', 'cse-s1-math1-ch3', 3, true),
('cse-s1-math1-ch3-t4', 'Areas and Volumes of Revolution', 'TOPIC', 'cse-s1-math1-ch3', 4, true),
-- Chapter 4 topics
('cse-s1-math1-ch4-t1', 'Double Integrals', 'TOPIC', 'cse-s1-math1-ch4', 1, true),
('cse-s1-math1-ch4-t2', 'Triple Integrals', 'TOPIC', 'cse-s1-math1-ch4', 2, true),
('cse-s1-math1-ch4-t3', 'Jacobians and Change of Variables', 'TOPIC', 'cse-s1-math1-ch4', 3, true),
('cse-s1-math1-ch4-t4', 'Applications to Area and Mass', 'TOPIC', 'cse-s1-math1-ch4', 4, true),
-- Chapter 5 topics
('cse-s1-math1-ch5-t1', 'Gradient, Divergence, and Curl', 'TOPIC', 'cse-s1-math1-ch5', 1, true),
('cse-s1-math1-ch5-t2', 'Line and Surface Integrals', 'TOPIC', 'cse-s1-math1-ch5', 2, true),
('cse-s1-math1-ch5-t3', 'Green''s Theorem', 'TOPIC', 'cse-s1-math1-ch5', 3, true),
('cse-s1-math1-ch5-t4', 'Gauss'' and Stokes'' Theorems', 'TOPIC', 'cse-s1-math1-ch5', 4, true),
-- Chapter 6 topics
('cse-s1-math1-ch6-t1', 'Matrix Rank and Echelon Forms', 'TOPIC', 'cse-s1-math1-ch6', 1, true),
('cse-s1-math1-ch6-t2', 'Systems of Linear Equations', 'TOPIC', 'cse-s1-math1-ch6', 2, true),
('cse-s1-math1-ch6-t3', 'Eigenvalues and Eigenvectors', 'TOPIC', 'cse-s1-math1-ch6', 3, true),
('cse-s1-math1-ch6-t4', 'Matrix Diagonalization', 'TOPIC', 'cse-s1-math1-ch6', 4, true);

-- Programming for Problem Solving (C)
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-cprog',
  'Programming for Problem Solving (C)',
  'SUBJECT',
  'cse-year-1',
  2,
  true
);

-- Chapters for C Programming
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-cprog-ch1', 'Algorithms and C Program Structure', 'CHAPTER', 'cse-s1-cprog', 1, true),
('cse-s1-cprog-ch2', 'Data Types and Operators', 'CHAPTER', 'cse-s1-cprog', 2, true),
('cse-s1-cprog-ch3', 'Control Flow and Functions', 'CHAPTER', 'cse-s1-cprog', 3, true),
('cse-s1-cprog-ch4', 'Arrays and Strings', 'CHAPTER', 'cse-s1-cprog', 4, true),
('cse-s1-cprog-ch5', 'Pointers and Memory Management', 'CHAPTER', 'cse-s1-cprog', 5, true),
('cse-s1-cprog-ch6', 'Structures and File I/O', 'CHAPTER', 'cse-s1-cprog', 6, true);

-- Topics for C Programming
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-cprog-ch1-t1', 'Problem Solving Techniques', 'TOPIC', 'cse-s1-cprog-ch1', 1, true),
('cse-s1-cprog-ch1-t2', 'Flowcharts and Pseudocode', 'TOPIC', 'cse-s1-cprog-ch1', 2, true),
('cse-s1-cprog-ch1-t3', 'C Compilation Model', 'TOPIC', 'cse-s1-cprog-ch1', 3, true),
('cse-s1-cprog-ch1-t4', 'Header Files and main Function', 'TOPIC', 'cse-s1-cprog-ch1', 4, true),
-- Chapter 2 topics
('cse-s1-cprog-ch2-t1', 'Integer and Floating Types', 'TOPIC', 'cse-s1-cprog-ch2', 1, true),
('cse-s1-cprog-ch2-t2', 'Arithmetic Operators', 'TOPIC', 'cse-s1-cprog-ch2', 2, true),
('cse-s1-cprog-ch2-t3', 'Bitwise Operators', 'TOPIC', 'cse-s1-cprog-ch2', 3, true),
('cse-s1-cprog-ch2-t4', 'Operator Precedence and Associativity', 'TOPIC', 'cse-s1-cprog-ch2', 4, true),
-- Chapter 3 topics
('cse-s1-cprog-ch3-t1', 'If-Else and Switch Statements', 'TOPIC', 'cse-s1-cprog-ch3', 1, true),
('cse-s1-cprog-ch3-t2', 'Loops: for, while, do-while', 'TOPIC', 'cse-s1-cprog-ch3', 2, true),
('cse-s1-cprog-ch3-t3', 'Functions and Recursion', 'TOPIC', 'cse-s1-cprog-ch3', 3, true),
('cse-s1-cprog-ch3-t4', 'Scope and Storage Classes', 'TOPIC', 'cse-s1-cprog-ch3', 4, true),
-- Chapter 4 topics
('cse-s1-cprog-ch4-t1', 'One-Dimensional Arrays', 'TOPIC', 'cse-s1-cprog-ch4', 1, true),
('cse-s1-cprog-ch4-t2', 'Multi-Dimensional Arrays', 'TOPIC', 'cse-s1-cprog-ch4', 2, true),
('cse-s1-cprog-ch4-t3', 'String Handling Functions', 'TOPIC', 'cse-s1-cprog-ch4', 3, true),
('cse-s1-cprog-ch4-t4', 'Array and String Applications', 'TOPIC', 'cse-s1-cprog-ch4', 4, true),
-- Chapter 5 topics
('cse-s1-cprog-ch5-t1', 'Pointer Basics and Syntax', 'TOPIC', 'cse-s1-cprog-ch5', 1, true),
('cse-s1-cprog-ch5-t2', 'Pointer Arithmetic', 'TOPIC', 'cse-s1-cprog-ch5', 2, true),
('cse-s1-cprog-ch5-t3', 'Dynamic Memory Allocation', 'TOPIC', 'cse-s1-cprog-ch5', 3, true),
('cse-s1-cprog-ch5-t4', 'Pointers to Functions', 'TOPIC', 'cse-s1-cprog-ch5', 4, true),
-- Chapter 6 topics
('cse-s1-cprog-ch6-t1', 'Structure Definition and Usage', 'TOPIC', 'cse-s1-cprog-ch6', 1, true),
('cse-s1-cprog-ch6-t2', 'Nested Structures and Arrays of Structures', 'TOPIC', 'cse-s1-cprog-ch6', 2, true),
('cse-s1-cprog-ch6-t3', 'File Operations: Open, Read, Write', 'TOPIC', 'cse-s1-cprog-ch6', 3, true),
('cse-s1-cprog-ch6-t4', 'Binary Files and Error Handling', 'TOPIC', 'cse-s1-cprog-ch6', 4, true);

-- Engineering Physics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-physics',
  'Engineering Physics',
  'SUBJECT',
  'cse-year-1',
  3,
  true
);

-- Chapters for Engineering Physics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-physics-ch1', 'Quantum Mechanics Fundamentals', 'CHAPTER', 'cse-s1-physics', 1, true),
('cse-s1-physics-ch2', 'Waves and Optics', 'CHAPTER', 'cse-s1-physics', 2, true),
('cse-s1-physics-ch3', 'Semiconductor Physics', 'CHAPTER', 'cse-s1-physics', 3, true),
('cse-s1-physics-ch4', 'Magnetic Materials', 'CHAPTER', 'cse-s1-physics', 4, true),
('cse-s1-physics-ch5', 'Lasers and Fiber Optics', 'CHAPTER', 'cse-s1-physics', 5, true),
('cse-s1-physics-ch6', 'Nanomaterials', 'CHAPTER', 'cse-s1-physics', 6, true);

-- Topics for Engineering Physics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-physics-ch1-t1', 'Wave-Particle Duality', 'TOPIC', 'cse-s1-physics-ch1', 1, true),
('cse-s1-physics-ch1-t2', 'Schrödinger Equation', 'TOPIC', 'cse-s1-physics-ch1', 2, true),
('cse-s1-physics-ch1-t3', 'Quantum Wells and Barriers', 'TOPIC', 'cse-s1-physics-ch1', 3, true),
('cse-s1-physics-ch1-t4', 'Uncertainty Principle', 'TOPIC', 'cse-s1-physics-ch1', 4, true);

-- Basic Electrical and Electronics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-bee',
  'Basic Electrical and Electronics',
  'SUBJECT',
  'cse-year-1',
  4,
  true
);

-- Chapters for BEE
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-bee-ch1', 'DC Circuits and Network Analysis', 'CHAPTER', 'cse-s1-bee', 1, true),
('cse-s1-bee-ch2', 'AC Circuits and Phasors', 'CHAPTER', 'cse-s1-bee', 2, true),
('cse-s1-bee-ch3', 'Transformers and Electrical Machines', 'CHAPTER', 'cse-s1-bee', 3, true),
('cse-s1-bee-ch4', 'Semiconductor Devices', 'CHAPTER', 'cse-s1-bee', 4, true),
('cse-s1-bee-ch5', 'Amplifiers and Oscillators', 'CHAPTER', 'cse-s1-bee', 5, true),
('cse-s1-bee-ch6', 'Digital Electronics Basics', 'CHAPTER', 'cse-s1-bee', 6, true);

-- Topics for BEE
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-bee-ch1-t1', 'Ohm''s Law and Kirchhoff''s Laws', 'TOPIC', 'cse-s1-bee-ch1', 1, true),
('cse-s1-bee-ch1-t2', 'Series and Parallel Circuits', 'TOPIC', 'cse-s1-bee-ch1', 2, true),
('cse-s1-bee-ch1-t3', 'Mesh and Nodal Analysis', 'TOPIC', 'cse-s1-bee-ch1', 3, true),
('cse-s1-bee-ch1-t4', 'Thevenin and Norton Theorems', 'TOPIC', 'cse-s1-bee-ch1', 4, true);

-- Engineering Graphics and CAD
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-graphics',
  'Engineering Graphics and CAD',
  'SUBJECT',
  'cse-year-1',
  5,
  true
);

-- Chapters for Engineering Graphics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-graphics-ch1', 'Orthographic Projections', 'CHAPTER', 'cse-s1-graphics', 1, true),
('cse-s1-graphics-ch2', 'Isometric and Perspective Views', 'CHAPTER', 'cse-s1-graphics', 2, true),
('cse-s1-graphics-ch3', 'Sections of Solids', 'CHAPTER', 'cse-s1-graphics', 3, true),
('cse-s1-graphics-ch4', 'Development of Surfaces', 'CHAPTER', 'cse-s1-graphics', 4, true),
('cse-s1-graphics-ch5', 'AutoCAD Fundamentals', 'CHAPTER', 'cse-s1-graphics', 5, true),
('cse-s1-graphics-ch6', '3D Modeling Basics', 'CHAPTER', 'cse-s1-graphics', 6, true);

-- Topics for Engineering Graphics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-graphics-ch1-t1', 'First Angle Projection', 'TOPIC', 'cse-s1-graphics-ch1', 1, true),
('cse-s1-graphics-ch1-t2', 'Third Angle Projection', 'TOPIC', 'cse-s1-graphics-ch1', 2, true),
('cse-s1-graphics-ch1-t3', 'Multi-View Drawings', 'TOPIC', 'cse-s1-graphics-ch1', 3, true),
('cse-s1-graphics-ch1-t4', 'Dimensioning Standards', 'TOPIC', 'cse-s1-graphics-ch1', 4, true);

-- Professional Communication and Ethics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s1-comm',
  'Professional Communication and Ethics',
  'SUBJECT',
  'cse-year-1',
  6,
  true
);

-- Chapters for Communication
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s1-comm-ch1', 'Effective Communication Skills', 'CHAPTER', 'cse-s1-comm', 1, true),
('cse-s1-comm-ch2', 'Business Writing', 'CHAPTER', 'cse-s1-comm', 2, true),
('cse-s1-comm-ch3', 'Presentation Skills', 'CHAPTER', 'cse-s1-comm', 3, true),
('cse-s1-comm-ch4', 'Professional Ethics', 'CHAPTER', 'cse-s1-comm', 4, true),
('cse-s1-comm-ch5', 'Group Discussion and Teamwork', 'CHAPTER', 'cse-s1-comm', 5, true),
('cse-s1-comm-ch6', 'Interview Preparation', 'CHAPTER', 'cse-s1-comm', 6, true);

-- Topics for Communication
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s1-comm-ch1-t1', 'Verbal and Non-Verbal Communication', 'TOPIC', 'cse-s1-comm-ch1', 1, true),
('cse-s1-comm-ch1-t2', 'Listening Skills', 'TOPIC', 'cse-s1-comm-ch1', 2, true),
('cse-s1-comm-ch1-t3', 'Barriers to Communication', 'TOPIC', 'cse-s1-comm-ch1', 3, true),
('cse-s1-comm-ch1-t4', 'Cross-Cultural Communication', 'TOPIC', 'cse-s1-comm-ch1', 4, true);

-- ============================================================================
-- SEMESTER 2 SUBJECTS
-- ============================================================================

-- Engineering Mathematics II
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-math2',
  'Engineering Mathematics II',
  'SUBJECT',
  'cse-year-1',
  7,
  true
);

-- Chapters for Math II
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-math2-ch1', 'Differential Equations', 'CHAPTER', 'cse-s2-math2', 1, true),
('cse-s2-math2-ch2', 'Laplace Transforms', 'CHAPTER', 'cse-s2-math2', 2, true),
('cse-s2-math2-ch3', 'Fourier Series and Transforms', 'CHAPTER', 'cse-s2-math2', 3, true),
('cse-s2-math2-ch4', 'Complex Analysis', 'CHAPTER', 'cse-s2-math2', 4, true),
('cse-s2-math2-ch5', 'Probability and Statistics', 'CHAPTER', 'cse-s2-math2', 5, true),
('cse-s2-math2-ch6', 'Numerical Methods', 'CHAPTER', 'cse-s2-math2', 6, true);

-- Topics for Math II
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-math2-ch1-t1', 'First Order ODEs', 'TOPIC', 'cse-s2-math2-ch1', 1, true),
('cse-s2-math2-ch1-t2', 'Higher Order Linear ODEs', 'TOPIC', 'cse-s2-math2-ch1', 2, true),
('cse-s2-math2-ch1-t3', 'Series Solutions', 'TOPIC', 'cse-s2-math2-ch1', 3, true),
('cse-s2-math2-ch1-t4', 'Applications to Engineering Problems', 'TOPIC', 'cse-s2-math2-ch1', 4, true);

-- Data Structures
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-ds',
  'Data Structures',
  'SUBJECT',
  'cse-year-1',
  8,
  true
);

-- Chapters for Data Structures
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-ds-ch1', 'Introduction and Complexity Analysis', 'CHAPTER', 'cse-s2-ds', 1, true),
('cse-s2-ds-ch2', 'Stacks and Queues', 'CHAPTER', 'cse-s2-ds', 2, true),
('cse-s2-ds-ch3', 'Linked Lists', 'CHAPTER', 'cse-s2-ds', 3, true),
('cse-s2-ds-ch4', 'Trees and Binary Search Trees', 'CHAPTER', 'cse-s2-ds', 4, true),
('cse-s2-ds-ch5', 'Graphs and Graph Algorithms', 'CHAPTER', 'cse-s2-ds', 5, true),
('cse-s2-ds-ch6', 'Hashing and Advanced Structures', 'CHAPTER', 'cse-s2-ds', 6, true);

-- Topics for Data Structures
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-ds-ch1-t1', 'Abstract Data Types', 'TOPIC', 'cse-s2-ds-ch1', 1, true),
('cse-s2-ds-ch1-t2', 'Big-O Notation', 'TOPIC', 'cse-s2-ds-ch1', 2, true),
('cse-s2-ds-ch1-t3', 'Time and Space Complexity', 'TOPIC', 'cse-s2-ds-ch1', 3, true),
('cse-s2-ds-ch1-t4', 'Best, Average, Worst Cases', 'TOPIC', 'cse-s2-ds-ch1', 4, true),
-- Chapter 2 topics
('cse-s2-ds-ch2-t1', 'Stack Implementation and Operations', 'TOPIC', 'cse-s2-ds-ch2', 1, true),
('cse-s2-ds-ch2-t2', 'Queue and Circular Queue', 'TOPIC', 'cse-s2-ds-ch2', 2, true),
('cse-s2-ds-ch2-t3', 'Applications: Expression Evaluation', 'TOPIC', 'cse-s2-ds-ch2', 3, true),
('cse-s2-ds-ch2-t4', 'Priority Queues', 'TOPIC', 'cse-s2-ds-ch2', 4, true),
-- Chapter 3 topics
('cse-s2-ds-ch3-t1', 'Singly Linked Lists', 'TOPIC', 'cse-s2-ds-ch3', 1, true),
('cse-s2-ds-ch3-t2', 'Doubly and Circular Linked Lists', 'TOPIC', 'cse-s2-ds-ch3', 2, true),
('cse-s2-ds-ch3-t3', 'List Operations: Insert, Delete, Search', 'TOPIC', 'cse-s2-ds-ch3', 3, true),
('cse-s2-ds-ch3-t4', 'Applications of Linked Lists', 'TOPIC', 'cse-s2-ds-ch3', 4, true),
-- Chapter 4 topics
('cse-s2-ds-ch4-t1', 'Binary Tree Traversals', 'TOPIC', 'cse-s2-ds-ch4', 1, true),
('cse-s2-ds-ch4-t2', 'Binary Search Trees', 'TOPIC', 'cse-s2-ds-ch4', 2, true),
('cse-s2-ds-ch4-t3', 'AVL Trees and Balancing', 'TOPIC', 'cse-s2-ds-ch4', 3, true),
('cse-s2-ds-ch4-t4', 'B-Trees and Heaps', 'TOPIC', 'cse-s2-ds-ch4', 4, true),
-- Chapter 5 topics
('cse-s2-ds-ch5-t1', 'Graph Representation', 'TOPIC', 'cse-s2-ds-ch5', 1, true),
('cse-s2-ds-ch5-t2', 'BFS and DFS Traversals', 'TOPIC', 'cse-s2-ds-ch5', 2, true),
('cse-s2-ds-ch5-t3', 'Shortest Path Algorithms', 'TOPIC', 'cse-s2-ds-ch5', 3, true),
('cse-s2-ds-ch5-t4', 'Minimum Spanning Trees', 'TOPIC', 'cse-s2-ds-ch5', 4, true),
-- Chapter 6 topics
('cse-s2-ds-ch6-t1', 'Hash Functions and Collision Resolution', 'TOPIC', 'cse-s2-ds-ch6', 1, true),
('cse-s2-ds-ch6-t2', 'Open and Closed Hashing', 'TOPIC', 'cse-s2-ds-ch6', 2, true),
('cse-s2-ds-ch6-t3', 'Tries and Suffix Trees', 'TOPIC', 'cse-s2-ds-ch6', 3, true),
('cse-s2-ds-ch6-t4', 'Disjoint Sets', 'TOPIC', 'cse-s2-ds-ch6', 4, true);

-- Engineering Chemistry
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-chem',
  'Engineering Chemistry',
  'SUBJECT',
  'cse-year-1',
  9,
  true
);

-- Chapters for Chemistry
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-chem-ch1', 'Water and Its Treatment', 'CHAPTER', 'cse-s2-chem', 1, true),
('cse-s2-chem-ch2', 'Electrochemistry and Batteries', 'CHAPTER', 'cse-s2-chem', 2, true),
('cse-s2-chem-ch3', 'Corrosion and Prevention', 'CHAPTER', 'cse-s2-chem', 3, true),
('cse-s2-chem-ch4', 'Polymers and Plastics', 'CHAPTER', 'cse-s2-chem', 4, true),
('cse-s2-chem-ch5', 'Fuels and Combustion', 'CHAPTER', 'cse-s2-chem', 5, true),
('cse-s2-chem-ch6', 'Nanochemistry', 'CHAPTER', 'cse-s2-chem', 6, true);

-- Topics for Chemistry
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-chem-ch1-t1', 'Hardness of Water', 'TOPIC', 'cse-s2-chem-ch1', 1, true),
('cse-s2-chem-ch1-t2', 'Water Softening Methods', 'TOPIC', 'cse-s2-chem-ch1', 2, true),
('cse-s2-chem-ch1-t3', 'Desalination Techniques', 'TOPIC', 'cse-s2-chem-ch1', 3, true),
('cse-s2-chem-ch1-t4', 'Municipal Water Treatment', 'TOPIC', 'cse-s2-chem-ch1', 4, true);

-- Python Programming
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-python',
  'Python Programming',
  'SUBJECT',
  'cse-year-1',
  10,
  true
);

-- Chapters for Python
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-python-ch1', 'Python Basics and Syntax', 'CHAPTER', 'cse-s2-python', 1, true),
('cse-s2-python-ch2', 'Control Structures and Functions', 'CHAPTER', 'cse-s2-python', 2, true),
('cse-s2-python-ch3', 'Data Structures in Python', 'CHAPTER', 'cse-s2-python', 3, true),
('cse-s2-python-ch4', 'Object-Oriented Programming', 'CHAPTER', 'cse-s2-python', 4, true),
('cse-s2-python-ch5', 'File Handling and Exceptions', 'CHAPTER', 'cse-s2-python', 5, true),
('cse-s2-python-ch6', 'Libraries and Modules', 'CHAPTER', 'cse-s2-python', 6, true);

-- Topics for Python
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-python-ch1-t1', 'Variables and Data Types', 'TOPIC', 'cse-s2-python-ch1', 1, true),
('cse-s2-python-ch1-t2', 'Operators and Expressions', 'TOPIC', 'cse-s2-python-ch1', 2, true),
('cse-s2-python-ch1-t3', 'Input and Output', 'TOPIC', 'cse-s2-python-ch1', 3, true),
('cse-s2-python-ch1-t4', 'String Manipulation', 'TOPIC', 'cse-s2-python-ch1', 4, true),
-- Chapter 2 topics
('cse-s2-python-ch2-t1', 'Conditional Statements', 'TOPIC', 'cse-s2-python-ch2', 1, true),
('cse-s2-python-ch2-t2', 'Loops and Iteration', 'TOPIC', 'cse-s2-python-ch2', 2, true),
('cse-s2-python-ch2-t3', 'Functions and Parameters', 'TOPIC', 'cse-s2-python-ch2', 3, true),
('cse-s2-python-ch2-t4', 'Lambda and Higher-Order Functions', 'TOPIC', 'cse-s2-python-ch2', 4, true),
-- Chapter 3 topics
('cse-s2-python-ch3-t1', 'Lists and Tuples', 'TOPIC', 'cse-s2-python-ch3', 1, true),
('cse-s2-python-ch3-t2', 'Dictionaries and Sets', 'TOPIC', 'cse-s2-python-ch3', 2, true),
('cse-s2-python-ch3-t3', 'List Comprehensions', 'TOPIC', 'cse-s2-python-ch3', 3, true),
('cse-s2-python-ch3-t4', 'Data Structure Operations', 'TOPIC', 'cse-s2-python-ch3', 4, true),
-- Chapter 4 topics
('cse-s2-python-ch4-t1', 'Classes and Objects', 'TOPIC', 'cse-s2-python-ch4', 1, true),
('cse-s2-python-ch4-t2', 'Inheritance and Polymorphism', 'TOPIC', 'cse-s2-python-ch4', 2, true),
('cse-s2-python-ch4-t3', 'Encapsulation and Abstraction', 'TOPIC', 'cse-s2-python-ch4', 3, true),
('cse-s2-python-ch4-t4', 'Special Methods and Operator Overloading', 'TOPIC', 'cse-s2-python-ch4', 4, true),
-- Chapter 5 topics
('cse-s2-python-ch5-t1', 'File I/O Operations', 'TOPIC', 'cse-s2-python-ch5', 1, true),
('cse-s2-python-ch5-t2', 'Exception Handling', 'TOPIC', 'cse-s2-python-ch5', 2, true),
('cse-s2-python-ch5-t3', 'Working with CSV and JSON', 'TOPIC', 'cse-s2-python-ch5', 3, true),
('cse-s2-python-ch5-t4', 'Context Managers', 'TOPIC', 'cse-s2-python-ch5', 4, true),
-- Chapter 6 topics
('cse-s2-python-ch6-t1', 'NumPy for Numerical Computing', 'TOPIC', 'cse-s2-python-ch6', 1, true),
('cse-s2-python-ch6-t2', 'Pandas for Data Analysis', 'TOPIC', 'cse-s2-python-ch6', 2, true),
('cse-s2-python-ch6-t3', 'Matplotlib for Visualization', 'TOPIC', 'cse-s2-python-ch6', 3, true),
('cse-s2-python-ch6-t4', 'Creating Custom Modules', 'TOPIC', 'cse-s2-python-ch6', 4, true);

-- Digital Logic Design
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-dld',
  'Digital Logic Design',
  'SUBJECT',
  'cse-year-1',
  11,
  true
);

-- Chapters for Digital Logic
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-dld-ch1', 'Number Systems and Codes', 'CHAPTER', 'cse-s2-dld', 1, true),
('cse-s2-dld-ch2', 'Boolean Algebra and Logic Gates', 'CHAPTER', 'cse-s2-dld', 2, true),
('cse-s2-dld-ch3', 'Combinational Circuits', 'CHAPTER', 'cse-s2-dld', 3, true),
('cse-s2-dld-ch4', 'Sequential Circuits', 'CHAPTER', 'cse-s2-dld', 4, true),
('cse-s2-dld-ch5', 'Registers and Counters', 'CHAPTER', 'cse-s2-dld', 5, true),
('cse-s2-dld-ch6', 'Memory and PLDs', 'CHAPTER', 'cse-s2-dld', 6, true);

-- Topics for Digital Logic
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-dld-ch1-t1', 'Binary, Octal, Hexadecimal Systems', 'TOPIC', 'cse-s2-dld-ch1', 1, true),
('cse-s2-dld-ch1-t2', 'Number System Conversions', 'TOPIC', 'cse-s2-dld-ch1', 2, true),
('cse-s2-dld-ch1-t3', 'Binary Codes: BCD, Gray, ASCII', 'TOPIC', 'cse-s2-dld-ch1', 3, true),
('cse-s2-dld-ch1-t4', 'Error Detection Codes', 'TOPIC', 'cse-s2-dld-ch1', 4, true),
-- Chapter 2 topics
('cse-s2-dld-ch2-t1', 'Boolean Algebra Laws and Theorems', 'TOPIC', 'cse-s2-dld-ch2', 1, true),
('cse-s2-dld-ch2-t2', 'Logic Gates: AND, OR, NOT, NAND, NOR', 'TOPIC', 'cse-s2-dld-ch2', 2, true),
('cse-s2-dld-ch2-t3', 'Simplification using K-Maps', 'TOPIC', 'cse-s2-dld-ch2', 3, true),
('cse-s2-dld-ch2-t4', 'Quine-McCluskey Method', 'TOPIC', 'cse-s2-dld-ch2', 4, true),
-- Chapter 3 topics
('cse-s2-dld-ch3-t1', 'Adders and Subtractors', 'TOPIC', 'cse-s2-dld-ch3', 1, true),
('cse-s2-dld-ch3-t2', 'Multiplexers and Demultiplexers', 'TOPIC', 'cse-s2-dld-ch3', 2, true),
('cse-s2-dld-ch3-t3', 'Encoders and Decoders', 'TOPIC', 'cse-s2-dld-ch3', 3, true),
('cse-s2-dld-ch3-t4', 'Comparators and Parity Generators', 'TOPIC', 'cse-s2-dld-ch3', 4, true),
-- Chapter 4 topics
('cse-s2-dld-ch4-t1', 'SR, JK, D, T Flip-Flops', 'TOPIC', 'cse-s2-dld-ch4', 1, true),
('cse-s2-dld-ch4-t2', 'Flip-Flop Conversions', 'TOPIC', 'cse-s2-dld-ch4', 2, true),
('cse-s2-dld-ch4-t3', 'State Machines and State Diagrams', 'TOPIC', 'cse-s2-dld-ch4', 3, true),
('cse-s2-dld-ch4-t4', 'Sequential Circuit Design', 'TOPIC', 'cse-s2-dld-ch4', 4, true),
-- Chapter 5 topics
('cse-s2-dld-ch5-t1', 'Shift Registers', 'TOPIC', 'cse-s2-dld-ch5', 1, true),
('cse-s2-dld-ch5-t2', 'Universal Shift Register', 'TOPIC', 'cse-s2-dld-ch5', 2, true),
('cse-s2-dld-ch5-t3', 'Asynchronous and Synchronous Counters', 'TOPIC', 'cse-s2-dld-ch5', 3, true),
('cse-s2-dld-ch5-t4', 'Counter Design and Applications', 'TOPIC', 'cse-s2-dld-ch5', 4, true),
-- Chapter 6 topics
('cse-s2-dld-ch6-t1', 'ROM, RAM, and Memory Organization', 'TOPIC', 'cse-s2-dld-ch6', 1, true),
('cse-s2-dld-ch6-t2', 'Programmable Logic Devices', 'TOPIC', 'cse-s2-dld-ch6', 2, true),
('cse-s2-dld-ch6-t3', 'FPGA and CPLD', 'TOPIC', 'cse-s2-dld-ch6', 3, true),
('cse-s2-dld-ch6-t4', 'Memory Interfacing', 'TOPIC', 'cse-s2-dld-ch6', 4, true);

-- Environmental Science
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s2-env',
  'Environmental Science',
  'SUBJECT',
  'cse-year-1',
  12,
  true
);

-- Chapters for Environmental Science
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s2-env-ch1', 'Ecosystems and Biodiversity', 'CHAPTER', 'cse-s2-env', 1, true),
('cse-s2-env-ch2', 'Natural Resources', 'CHAPTER', 'cse-s2-env', 2, true),
('cse-s2-env-ch3', 'Environmental Pollution', 'CHAPTER', 'cse-s2-env', 3, true),
('cse-s2-env-ch4', 'Climate Change and Global Warming', 'CHAPTER', 'cse-s2-env', 4, true),
('cse-s2-env-ch5', 'Solid Waste Management', 'CHAPTER', 'cse-s2-env', 5, true),
('cse-s2-env-ch6', 'Sustainable Development', 'CHAPTER', 'cse-s2-env', 6, true);

-- Topics for Environmental Science
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s2-env-ch1-t1', 'Types of Ecosystems', 'TOPIC', 'cse-s2-env-ch1', 1, true),
('cse-s2-env-ch1-t2', 'Food Chains and Energy Flow', 'TOPIC', 'cse-s2-env-ch1', 2, true),
('cse-s2-env-ch1-t3', 'Biodiversity Conservation', 'TOPIC', 'cse-s2-env-ch1', 3, true),
('cse-s2-env-ch1-t4', 'Threatened Species', 'TOPIC', 'cse-s2-env-ch1', 4, true);

-- ============================================================================
-- YEAR 2 (Semesters 3 & 4) - Core CS Fundamentals
-- ============================================================================
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-year-2',
  'Second Year - Core Computer Science',
  'YEAR',
  'cse-degree',
  2,
  true
);

-- ============================================================================
-- SEMESTER 3 SUBJECTS
-- ============================================================================

-- Discrete Mathematics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-dm',
  'Discrete Mathematics for Computing',
  'SUBJECT',
  'cse-year-2',
  1,
  true
);

-- Chapters for Discrete Math
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-dm-ch1', 'Logic and Proofs', 'CHAPTER', 'cse-s3-dm', 1, true),
('cse-s3-dm-ch2', 'Sets, Relations, and Functions', 'CHAPTER', 'cse-s3-dm', 2, true),
('cse-s3-dm-ch3', 'Combinatorics', 'CHAPTER', 'cse-s3-dm', 3, true),
('cse-s3-dm-ch4', 'Graph Theory', 'CHAPTER', 'cse-s3-dm', 4, true),
('cse-s3-dm-ch5', 'Recurrence Relations', 'CHAPTER', 'cse-s3-dm', 5, true),
('cse-s3-dm-ch6', 'Algebraic Structures', 'CHAPTER', 'cse-s3-dm', 6, true);

-- Topics for Discrete Math
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-dm-ch1-t1', 'Propositional Logic', 'TOPIC', 'cse-s3-dm-ch1', 1, true),
('cse-s3-dm-ch1-t2', 'Predicate Logic and Quantifiers', 'TOPIC', 'cse-s3-dm-ch1', 2, true),
('cse-s3-dm-ch1-t3', 'Rules of Inference', 'TOPIC', 'cse-s3-dm-ch1', 3, true),
('cse-s3-dm-ch1-t4', 'Proof Techniques', 'TOPIC', 'cse-s3-dm-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-dm-ch2-t1', 'Set Operations and Properties', 'TOPIC', 'cse-s3-dm-ch2', 1, true),
('cse-s3-dm-ch2-t2', 'Relations and Their Properties', 'TOPIC', 'cse-s3-dm-ch2', 2, true),
('cse-s3-dm-ch2-t3', 'Equivalence Relations and Partitions', 'TOPIC', 'cse-s3-dm-ch2', 3, true),
('cse-s3-dm-ch2-t4', 'Functions: Injective, Surjective, Bijective', 'TOPIC', 'cse-s3-dm-ch2', 4, true),
-- Chapter 3 topics
('cse-s3-dm-ch3-t1', 'Counting Principles', 'TOPIC', 'cse-s3-dm-ch3', 1, true),
('cse-s3-dm-ch3-t2', 'Permutations and Combinations', 'TOPIC', 'cse-s3-dm-ch3', 2, true),
('cse-s3-dm-ch3-t3', 'Binomial Theorem', 'TOPIC', 'cse-s3-dm-ch3', 3, true),
('cse-s3-dm-ch3-t4', 'Pigeonhole Principle', 'TOPIC', 'cse-s3-dm-ch3', 4, true),
-- Chapter 4 topics
('cse-s3-dm-ch4-t1', 'Graph Terminology and Representation', 'TOPIC', 'cse-s3-dm-ch4', 1, true),
('cse-s3-dm-ch4-t2', 'Graph Traversals and Connectivity', 'TOPIC', 'cse-s3-dm-ch4', 2, true),
('cse-s3-dm-ch4-t3', 'Trees and Spanning Trees', 'TOPIC', 'cse-s3-dm-ch4', 3, true),
('cse-s3-dm-ch4-t4', 'Planar Graphs and Coloring', 'TOPIC', 'cse-s3-dm-ch4', 4, true),
-- Chapter 5 topics
('cse-s3-dm-ch5-t1', 'Linear Recurrence Relations', 'TOPIC', 'cse-s3-dm-ch5', 1, true),
('cse-s3-dm-ch5-t2', 'Solving Recurrences', 'TOPIC', 'cse-s3-dm-ch5', 2, true),
('cse-s3-dm-ch5-t3', 'Generating Functions', 'TOPIC', 'cse-s3-dm-ch5', 3, true),
('cse-s3-dm-ch5-t4', 'Applications to Algorithms', 'TOPIC', 'cse-s3-dm-ch5', 4, true),
-- Chapter 6 topics
('cse-s3-dm-ch6-t1', 'Groups and Subgroups', 'TOPIC', 'cse-s3-dm-ch6', 1, true),
('cse-s3-dm-ch6-t2', 'Rings and Fields', 'TOPIC', 'cse-s3-dm-ch6', 2, true),
('cse-s3-dm-ch6-t3', 'Boolean Algebra', 'TOPIC', 'cse-s3-dm-ch6', 3, true),
('cse-s3-dm-ch6-t4', 'Lattices', 'TOPIC', 'cse-s3-dm-ch6', 4, true);

-- Computer Organization and Architecture
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-coa',
  'Computer Organization and Architecture',
  'SUBJECT',
  'cse-year-2',
  2,
  true
);

-- Chapters for COA
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-coa-ch1', 'Introduction and Computer Evolution', 'CHAPTER', 'cse-s3-coa', 1, true),
('cse-s3-coa-ch2', 'Data Representation and Arithmetic', 'CHAPTER', 'cse-s3-coa', 2, true),
('cse-s3-coa-ch3', 'Instruction Set Architecture', 'CHAPTER', 'cse-s3-coa', 3, true),
('cse-s3-coa-ch4', 'Memory Hierarchy and Cache', 'CHAPTER', 'cse-s3-coa', 4, true),
('cse-s3-coa-ch5', 'Pipelining and Parallelism', 'CHAPTER', 'cse-s3-coa', 5, true),
('cse-s3-coa-ch6', 'I/O Organization', 'CHAPTER', 'cse-s3-coa', 6, true);

-- Topics for COA
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-coa-ch1-t1', 'Von Neumann Architecture', 'TOPIC', 'cse-s3-coa-ch1', 1, true),
('cse-s3-coa-ch1-t2', 'Performance Metrics', 'TOPIC', 'cse-s3-coa-ch1', 2, true),
('cse-s3-coa-ch1-t3', 'RISC vs CISC', 'TOPIC', 'cse-s3-coa-ch1', 3, true),
('cse-s3-coa-ch1-t4', 'Computer Generations', 'TOPIC', 'cse-s3-coa-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-coa-ch2-t1', 'Fixed and Floating Point Representation', 'TOPIC', 'cse-s3-coa-ch2', 1, true),
('cse-s3-coa-ch2-t2', 'Integer Arithmetic', 'TOPIC', 'cse-s3-coa-ch2', 2, true),
('cse-s3-coa-ch2-t3', 'Floating Point Arithmetic', 'TOPIC', 'cse-s3-coa-ch2', 3, true),
('cse-s3-coa-ch2-t4', 'ALU Design', 'TOPIC', 'cse-s3-coa-ch2', 4, true),
-- Chapter 3 topics
('cse-s3-coa-ch3-t1', 'Instruction Formats', 'TOPIC', 'cse-s3-coa-ch3', 1, true),
('cse-s3-coa-ch3-t2', 'Addressing Modes', 'TOPIC', 'cse-s3-coa-ch3', 2, true),
('cse-s3-coa-ch3-t3', 'MIPS and ARM Instruction Sets', 'TOPIC', 'cse-s3-coa-ch3', 3, true),
('cse-s3-coa-ch3-t4', 'Assembly Language Programming', 'TOPIC', 'cse-s3-coa-ch3', 4, true),
-- Chapter 4 topics
('cse-s3-coa-ch4-t1', 'Cache Memory Concepts', 'TOPIC', 'cse-s3-coa-ch4', 1, true),
('cse-s3-coa-ch4-t2', 'Cache Mapping Techniques', 'TOPIC', 'cse-s3-coa-ch4', 2, true),
('cse-s3-coa-ch4-t3', 'Virtual Memory', 'TOPIC', 'cse-s3-coa-ch4', 3, true),
('cse-s3-coa-ch4-t4', 'Memory Management Unit', 'TOPIC', 'cse-s3-coa-ch4', 4, true),
-- Chapter 5 topics
('cse-s3-coa-ch5-t1', 'Instruction Pipelining', 'TOPIC', 'cse-s3-coa-ch5', 1, true),
('cse-s3-coa-ch5-t2', 'Pipeline Hazards and Solutions', 'TOPIC', 'cse-s3-coa-ch5', 2, true),
('cse-s3-coa-ch5-t3', 'Superscalar Architecture', 'TOPIC', 'cse-s3-coa-ch5', 3, true),
('cse-s3-coa-ch5-t4', 'Multi-core Processors', 'TOPIC', 'cse-s3-coa-ch5', 4, true),
-- Chapter 6 topics
('cse-s3-coa-ch6-t1', 'I/O Devices and Interfaces', 'TOPIC', 'cse-s3-coa-ch6', 1, true),
('cse-s3-coa-ch6-t2', 'Interrupt Handling', 'TOPIC', 'cse-s3-coa-ch6', 2, true),
('cse-s3-coa-ch6-t3', 'DMA and I/O Processors', 'TOPIC', 'cse-s3-coa-ch6', 3, true),
('cse-s3-coa-ch6-t4', 'Bus Arbitration', 'TOPIC', 'cse-s3-coa-ch6', 4, true);

-- Database Management Systems
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-dbms',
  'Database Management Systems',
  'SUBJECT',
  'cse-year-2',
  3,
  true
);

-- Chapters for DBMS
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-dbms-ch1', 'Relational Model and SQL Foundations', 'CHAPTER', 'cse-s3-dbms', 1, true),
('cse-s3-dbms-ch2', 'Advanced SQL and Query Processing', 'CHAPTER', 'cse-s3-dbms', 2, true),
('cse-s3-dbms-ch3', 'Database Design and Normalization', 'CHAPTER', 'cse-s3-dbms', 3, true),
('cse-s3-dbms-ch4', 'Transaction Management', 'CHAPTER', 'cse-s3-dbms', 4, true),
('cse-s3-dbms-ch5', 'Concurrency Control', 'CHAPTER', 'cse-s3-dbms', 5, true),
('cse-s3-dbms-ch6', 'Database Recovery and Security', 'CHAPTER', 'cse-s3-dbms', 6, true);

-- Topics for DBMS
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-dbms-ch1-t1', 'Database Schemas and Constraints', 'TOPIC', 'cse-s3-dbms-ch1', 1, true),
('cse-s3-dbms-ch1-t2', 'Relational Algebra Operations', 'TOPIC', 'cse-s3-dbms-ch1', 2, true),
('cse-s3-dbms-ch1-t3', 'Basic SQL: SELECT, INSERT, UPDATE', 'TOPIC', 'cse-s3-dbms-ch1', 3, true),
('cse-s3-dbms-ch1-t4', 'Keys and Referential Integrity', 'TOPIC', 'cse-s3-dbms-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-dbms-ch2-t1', 'Joins and Nested Queries', 'TOPIC', 'cse-s3-dbms-ch2', 1, true),
('cse-s3-dbms-ch2-t2', 'Aggregate Functions and Grouping', 'TOPIC', 'cse-s3-dbms-ch2', 2, true),
('cse-s3-dbms-ch2-t3', 'Views and Indexes', 'TOPIC', 'cse-s3-dbms-ch2', 3, true),
('cse-s3-dbms-ch2-t4', 'Query Optimization', 'TOPIC', 'cse-s3-dbms-ch2', 4, true),
-- Chapter 3 topics
('cse-s3-dbms-ch3-t1', 'ER Modeling', 'TOPIC', 'cse-s3-dbms-ch3', 1, true),
('cse-s3-dbms-ch3-t2', 'Functional Dependencies', 'TOPIC', 'cse-s3-dbms-ch3', 2, true),
('cse-s3-dbms-ch3-t3', 'Normal Forms: 1NF to BCNF', 'TOPIC', 'cse-s3-dbms-ch3', 3, true),
('cse-s3-dbms-ch3-t4', 'Denormalization Trade-offs', 'TOPIC', 'cse-s3-dbms-ch3', 4, true),
-- Chapter 4 topics
('cse-s3-dbms-ch4-t1', 'ACID Properties', 'TOPIC', 'cse-s3-dbms-ch4', 1, true),
('cse-s3-dbms-ch4-t2', 'Transaction States', 'TOPIC', 'cse-s3-dbms-ch4', 2, true),
('cse-s3-dbms-ch4-t3', 'Serializability', 'TOPIC', 'cse-s3-dbms-ch4', 3, true),
('cse-s3-dbms-ch4-t4', 'Schedules and Conflicts', 'TOPIC', 'cse-s3-dbms-ch4', 4, true),
-- Chapter 5 topics
('cse-s3-dbms-ch5-t1', 'Locking Protocols', 'TOPIC', 'cse-s3-dbms-ch5', 1, true),
('cse-s3-dbms-ch5-t2', 'Two-Phase Locking', 'TOPIC', 'cse-s3-dbms-ch5', 2, true),
('cse-s3-dbms-ch5-t3', 'Timestamp Ordering', 'TOPIC', 'cse-s3-dbms-ch5', 3, true),
('cse-s3-dbms-ch5-t4', 'Deadlock Prevention and Detection', 'TOPIC', 'cse-s3-dbms-ch5', 4, true),
-- Chapter 6 topics
('cse-s3-dbms-ch6-t1', 'Failure Classification', 'TOPIC', 'cse-s3-dbms-ch6', 1, true),
('cse-s3-dbms-ch6-t2', 'Log-Based Recovery', 'TOPIC', 'cse-s3-dbms-ch6', 2, true),
('cse-s3-dbms-ch6-t3', 'Checkpoints and Rollback', 'TOPIC', 'cse-s3-dbms-ch6', 3, true),
('cse-s3-dbms-ch6-t4', 'Database Security and Authorization', 'TOPIC', 'cse-s3-dbms-ch6', 4, true);

-- Operating Systems
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-os',
  'Operating Systems',
  'SUBJECT',
  'cse-year-2',
  4,
  true
);

-- Chapters for OS
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-os-ch1', 'OS Fundamentals and Process Management', 'CHAPTER', 'cse-s3-os', 1, true),
('cse-s3-os-ch2', 'CPU Scheduling Algorithms', 'CHAPTER', 'cse-s3-os', 2, true),
('cse-s3-os-ch3', 'Process Synchronization', 'CHAPTER', 'cse-s3-os', 3, true),
('cse-s3-os-ch4', 'Deadlocks', 'CHAPTER', 'cse-s3-os', 4, true),
('cse-s3-os-ch5', 'Memory Management', 'CHAPTER', 'cse-s3-os', 5, true),
('cse-s3-os-ch6', 'File Systems and I/O', 'CHAPTER', 'cse-s3-os', 6, true);

-- Topics for OS
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-os-ch1-t1', 'OS Services and System Calls', 'TOPIC', 'cse-s3-os-ch1', 1, true),
('cse-s3-os-ch1-t2', 'Process States and PCB', 'TOPIC', 'cse-s3-os-ch1', 2, true),
('cse-s3-os-ch1-t3', 'Threads and Multithreading', 'TOPIC', 'cse-s3-os-ch1', 3, true),
('cse-s3-os-ch1-t4', 'Inter-Process Communication', 'TOPIC', 'cse-s3-os-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-os-ch2-t1', 'FCFS, SJF, Priority Scheduling', 'TOPIC', 'cse-s3-os-ch2', 1, true),
('cse-s3-os-ch2-t2', 'Round Robin Scheduling', 'TOPIC', 'cse-s3-os-ch2', 2, true),
('cse-s3-os-ch2-t3', 'Multilevel Queue Scheduling', 'TOPIC', 'cse-s3-os-ch2', 3, true),
('cse-s3-os-ch2-t4', 'Real-Time Scheduling', 'TOPIC', 'cse-s3-os-ch2', 4, true),
-- Chapter 3 topics
('cse-s3-os-ch3-t1', 'Critical Section Problem', 'TOPIC', 'cse-s3-os-ch3', 1, true),
('cse-s3-os-ch3-t2', 'Semaphores and Mutexes', 'TOPIC', 'cse-s3-os-ch3', 2, true),
('cse-s3-os-ch3-t3', 'Classical Synchronization Problems', 'TOPIC', 'cse-s3-os-ch3', 3, true),
('cse-s3-os-ch3-t4', 'Monitors and Condition Variables', 'TOPIC', 'cse-s3-os-ch3', 4, true),
-- Chapter 4 topics
('cse-s3-os-ch4-t1', 'Deadlock Characterization', 'TOPIC', 'cse-s3-os-ch4', 1, true),
('cse-s3-os-ch4-t2', 'Deadlock Prevention', 'TOPIC', 'cse-s3-os-ch4', 2, true),
('cse-s3-os-ch4-t3', 'Deadlock Avoidance: Banker''s Algorithm', 'TOPIC', 'cse-s3-os-ch4', 3, true),
('cse-s3-os-ch4-t4', 'Deadlock Detection and Recovery', 'TOPIC', 'cse-s3-os-ch4', 4, true),
-- Chapter 5 topics
('cse-s3-os-ch5-t1', 'Contiguous and Non-Contiguous Allocation', 'TOPIC', 'cse-s3-os-ch5', 1, true),
('cse-s3-os-ch5-t2', 'Paging and Segmentation', 'TOPIC', 'cse-s3-os-ch5', 2, true),
('cse-s3-os-ch5-t3', 'Virtual Memory and Demand Paging', 'TOPIC', 'cse-s3-os-ch5', 3, true),
('cse-s3-os-ch5-t4', 'Page Replacement Algorithms', 'TOPIC', 'cse-s3-os-ch5', 4, true),
-- Chapter 6 topics
('cse-s3-os-ch6-t1', 'File System Structure', 'TOPIC', 'cse-s3-os-ch6', 1, true),
('cse-s3-os-ch6-t2', 'File Allocation Methods', 'TOPIC', 'cse-s3-os-ch6', 2, true),
('cse-s3-os-ch6-t3', 'Disk Scheduling Algorithms', 'TOPIC', 'cse-s3-os-ch6', 3, true),
('cse-s3-os-ch6-t4', 'I/O Systems and Buffering', 'TOPIC', 'cse-s3-os-ch6', 4, true);

-- Design and Analysis of Algorithms
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-daa',
  'Design and Analysis of Algorithms',
  'SUBJECT',
  'cse-year-2',
  5,
  true
);

-- Chapters for DAA
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-daa-ch1', 'Algorithm Analysis and Asymptotic Notations', 'CHAPTER', 'cse-s3-daa', 1, true),
('cse-s3-daa-ch2', 'Divide and Conquer', 'CHAPTER', 'cse-s3-daa', 2, true),
('cse-s3-daa-ch3', 'Greedy Algorithms', 'CHAPTER', 'cse-s3-daa', 3, true),
('cse-s3-daa-ch4', 'Dynamic Programming', 'CHAPTER', 'cse-s3-daa', 4, true),
('cse-s3-daa-ch5', 'Backtracking and Branch-and-Bound', 'CHAPTER', 'cse-s3-daa', 5, true),
('cse-s3-daa-ch6', 'NP-Completeness and Approximation', 'CHAPTER', 'cse-s3-daa', 6, true);

-- Topics for DAA
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-daa-ch1-t1', 'Growth of Functions', 'TOPIC', 'cse-s3-daa-ch1', 1, true),
('cse-s3-daa-ch1-t2', 'Big-O, Omega, Theta Notations', 'TOPIC', 'cse-s3-daa-ch1', 2, true),
('cse-s3-daa-ch1-t3', 'Recurrence Relations and Master Theorem', 'TOPIC', 'cse-s3-daa-ch1', 3, true),
('cse-s3-daa-ch1-t4', 'Amortized Analysis', 'TOPIC', 'cse-s3-daa-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-daa-ch2-t1', 'Merge Sort and Quick Sort', 'TOPIC', 'cse-s3-daa-ch2', 1, true),
('cse-s3-daa-ch2-t2', 'Binary Search and Variants', 'TOPIC', 'cse-s3-daa-ch2', 2, true),
('cse-s3-daa-ch2-t3', 'Strassen''s Matrix Multiplication', 'TOPIC', 'cse-s3-daa-ch2', 3, true),
('cse-s3-daa-ch2-t4', 'Closest Pair and Convex Hull', 'TOPIC', 'cse-s3-daa-ch2', 4, true),
-- Chapter 3 topics
('cse-s3-daa-ch3-t1', 'Activity Selection Problem', 'TOPIC', 'cse-s3-daa-ch3', 1, true),
('cse-s3-daa-ch3-t2', 'Huffman Coding', 'TOPIC', 'cse-s3-daa-ch3', 2, true),
('cse-s3-daa-ch3-t3', 'Fractional Knapsack', 'TOPIC', 'cse-s3-daa-ch3', 3, true),
('cse-s3-daa-ch3-t4', 'Minimum Spanning Tree: Kruskal and Prim', 'TOPIC', 'cse-s3-daa-ch3', 4, true),
-- Chapter 4 topics
('cse-s3-daa-ch4-t1', '0/1 Knapsack Problem', 'TOPIC', 'cse-s3-daa-ch4', 1, true),
('cse-s3-daa-ch4-t2', 'Longest Common Subsequence', 'TOPIC', 'cse-s3-daa-ch4', 2, true),
('cse-s3-daa-ch4-t3', 'Matrix Chain Multiplication', 'TOPIC', 'cse-s3-daa-ch4', 3, true),
('cse-s3-daa-ch4-t4', 'All-Pairs Shortest Paths: Floyd-Warshall', 'TOPIC', 'cse-s3-daa-ch4', 4, true),
-- Chapter 5 topics
('cse-s3-daa-ch5-t1', 'N-Queens Problem', 'TOPIC', 'cse-s3-daa-ch5', 1, true),
('cse-s3-daa-ch5-t2', 'Sum of Subsets', 'TOPIC', 'cse-s3-daa-ch5', 2, true),
('cse-s3-daa-ch5-t3', 'Graph Coloring', 'TOPIC', 'cse-s3-daa-ch5', 3, true),
('cse-s3-daa-ch5-t4', 'Branch-and-Bound Applications', 'TOPIC', 'cse-s3-daa-ch5', 4, true),
-- Chapter 6 topics
('cse-s3-daa-ch6-t1', 'P vs NP Problem', 'TOPIC', 'cse-s3-daa-ch6', 1, true),
('cse-s3-daa-ch6-t2', 'NP-Complete Problems', 'TOPIC', 'cse-s3-daa-ch6', 2, true),
('cse-s3-daa-ch6-t3', 'Reduction Techniques', 'TOPIC', 'cse-s3-daa-ch6', 3, true),
('cse-s3-daa-ch6-t4', 'Approximation Algorithms', 'TOPIC', 'cse-s3-daa-ch6', 4, true);

-- Unix Utilities and Shell Programming
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s3-unix',
  'Unix Utilities and Shell Programming',
  'SUBJECT',
  'cse-year-2',
  6,
  true
);

-- Chapters for Unix
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s3-unix-ch1', 'Unix Architecture and File System', 'CHAPTER', 'cse-s3-unix', 1, true),
('cse-s3-unix-ch2', 'Unix Commands and Utilities', 'CHAPTER', 'cse-s3-unix', 2, true),
('cse-s3-unix-ch3', 'Shell Programming Basics', 'CHAPTER', 'cse-s3-unix', 3, true),
('cse-s3-unix-ch4', 'Advanced Shell Scripting', 'CHAPTER', 'cse-s3-unix', 4, true),
('cse-s3-unix-ch5', 'Process Management and IPC', 'CHAPTER', 'cse-s3-unix', 5, true),
('cse-s3-unix-ch6', 'Regular Expressions and Text Processing', 'CHAPTER', 'cse-s3-unix', 6, true);

-- Topics for Unix
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s3-unix-ch1-t1', 'Unix History and Architecture', 'TOPIC', 'cse-s3-unix-ch1', 1, true),
('cse-s3-unix-ch1-t2', 'File System Hierarchy', 'TOPIC', 'cse-s3-unix-ch1', 2, true),
('cse-s3-unix-ch1-t3', 'File Permissions and Ownership', 'TOPIC', 'cse-s3-unix-ch1', 3, true),
('cse-s3-unix-ch1-t4', 'Links: Hard and Soft', 'TOPIC', 'cse-s3-unix-ch1', 4, true),
-- Chapter 2 topics
('cse-s3-unix-ch2-t1', 'File Manipulation: cp, mv, rm', 'TOPIC', 'cse-s3-unix-ch2', 1, true),
('cse-s3-unix-ch2-t2', 'Text Processing: cat, grep, sed, awk', 'TOPIC', 'cse-s3-unix-ch2', 2, true),
('cse-s3-unix-ch2-t3', 'System Information Commands', 'TOPIC', 'cse-s3-unix-ch2', 3, true),
('cse-s3-unix-ch2-t4', 'Networking Commands', 'TOPIC', 'cse-s3-unix-ch2', 4, true);

-- ============================================================================
-- SEMESTER 4 SUBJECTS
-- ============================================================================

-- Formal Languages and Automata Theory
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-flat',
  'Formal Languages and Automata Theory',
  'SUBJECT',
  'cse-year-2',
  7,
  true
);

-- Chapters for FLAT
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-flat-ch1', 'Finite Automata', 'CHAPTER', 'cse-s4-flat', 1, true),
('cse-s4-flat-ch2', 'Regular Expressions and Languages', 'CHAPTER', 'cse-s4-flat', 2, true),
('cse-s4-flat-ch3', 'Context-Free Grammars', 'CHAPTER', 'cse-s4-flat', 3, true),
('cse-s4-flat-ch4', 'Pushdown Automata', 'CHAPTER', 'cse-s4-flat', 4, true),
('cse-s4-flat-ch5', 'Turing Machines', 'CHAPTER', 'cse-s4-flat', 5, true),
('cse-s4-flat-ch6', 'Computability and Complexity', 'CHAPTER', 'cse-s4-flat', 6, true);

-- Topics for FLAT
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-flat-ch1-t1', 'DFA and NFA', 'TOPIC', 'cse-s4-flat-ch1', 1, true),
('cse-s4-flat-ch1-t2', 'NFA to DFA Conversion', 'TOPIC', 'cse-s4-flat-ch1', 2, true),
('cse-s4-flat-ch1-t3', 'Minimization of DFA', 'TOPIC', 'cse-s4-flat-ch1', 3, true),
('cse-s4-flat-ch1-t4', 'Epsilon-NFA', 'TOPIC', 'cse-s4-flat-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-flat-ch2-t1', 'Regular Expression Syntax', 'TOPIC', 'cse-s4-flat-ch2', 1, true),
('cse-s4-flat-ch2-t2', 'RE to FA Conversion', 'TOPIC', 'cse-s4-flat-ch2', 2, true),
('cse-s4-flat-ch2-t3', 'Pumping Lemma for Regular Languages', 'TOPIC', 'cse-s4-flat-ch2', 3, true),
('cse-s4-flat-ch2-t4', 'Closure Properties', 'TOPIC', 'cse-s4-flat-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-flat-ch3-t1', 'CFG Derivations and Parse Trees', 'TOPIC', 'cse-s4-flat-ch3', 1, true),
('cse-s4-flat-ch3-t2', 'Ambiguity in Grammars', 'TOPIC', 'cse-s4-flat-ch3', 2, true),
('cse-s4-flat-ch3-t3', 'Normal Forms: CNF and GNF', 'TOPIC', 'cse-s4-flat-ch3', 3, true),
('cse-s4-flat-ch3-t4', 'Pumping Lemma for CFLs', 'TOPIC', 'cse-s4-flat-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-flat-ch4-t1', 'PDA Definition and Operations', 'TOPIC', 'cse-s4-flat-ch4', 1, true),
('cse-s4-flat-ch4-t2', 'PDA and CFG Equivalence', 'TOPIC', 'cse-s4-flat-ch4', 2, true),
('cse-s4-flat-ch4-t3', 'Deterministic vs Non-deterministic PDA', 'TOPIC', 'cse-s4-flat-ch4', 3, true),
('cse-s4-flat-ch4-t4', 'PDA Design Examples', 'TOPIC', 'cse-s4-flat-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-flat-ch5-t1', 'Turing Machine Model', 'TOPIC', 'cse-s4-flat-ch5', 1, true),
('cse-s4-flat-ch5-t2', 'TM Variants and Equivalence', 'TOPIC', 'cse-s4-flat-ch5', 2, true),
('cse-s4-flat-ch5-t3', 'Universal Turing Machine', 'TOPIC', 'cse-s4-flat-ch5', 3, true),
('cse-s4-flat-ch5-t4', 'Church-Turing Thesis', 'TOPIC', 'cse-s4-flat-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-flat-ch6-t1', 'Decidability and Undecidability', 'TOPIC', 'cse-s4-flat-ch6', 1, true),
('cse-s4-flat-ch6-t2', 'Halting Problem', 'TOPIC', 'cse-s4-flat-ch6', 2, true),
('cse-s4-flat-ch6-t3', 'Complexity Classes: P and NP', 'TOPIC', 'cse-s4-flat-ch6', 3, true),
('cse-s4-flat-ch6-t4', 'NP-Complete Problems', 'TOPIC', 'cse-s4-flat-ch6', 4, true);

-- Computer Networks
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-cn',
  'Computer Networks',
  'SUBJECT',
  'cse-year-2',
  8,
  true
);

-- Chapters for Computer Networks
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-cn-ch1', 'Network Fundamentals and Layered Architecture', 'CHAPTER', 'cse-s4-cn', 1, true),
('cse-s4-cn-ch2', 'Data Link Layer Protocols', 'CHAPTER', 'cse-s4-cn', 2, true),
('cse-s4-cn-ch3', 'Network Layer and Routing', 'CHAPTER', 'cse-s4-cn', 3, true),
('cse-s4-cn-ch4', 'Transport Layer Protocols', 'CHAPTER', 'cse-s4-cn', 4, true),
('cse-s4-cn-ch5', 'Application Layer Protocols', 'CHAPTER', 'cse-s4-cn', 5, true),
('cse-s4-cn-ch6', 'Network Security Fundamentals', 'CHAPTER', 'cse-s4-cn', 6, true);

-- Topics for Computer Networks
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-cn-ch1-t1', 'OSI and TCP/IP Models', 'TOPIC', 'cse-s4-cn-ch1', 1, true),
('cse-s4-cn-ch1-t2', 'Network Topologies', 'TOPIC', 'cse-s4-cn-ch1', 2, true),
('cse-s4-cn-ch1-t3', 'Transmission Media', 'TOPIC', 'cse-s4-cn-ch1', 3, true),
('cse-s4-cn-ch1-t4', 'Network Performance Metrics', 'TOPIC', 'cse-s4-cn-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-cn-ch2-t1', 'Framing and Error Detection', 'TOPIC', 'cse-s4-cn-ch2', 1, true),
('cse-s4-cn-ch2-t2', 'Flow Control: Stop-and-Wait, Sliding Window', 'TOPIC', 'cse-s4-cn-ch2', 2, true),
('cse-s4-cn-ch2-t3', 'MAC Protocols: ALOHA, CSMA/CD', 'TOPIC', 'cse-s4-cn-ch2', 3, true),
('cse-s4-cn-ch2-t4', 'Ethernet and VLANs', 'TOPIC', 'cse-s4-cn-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-cn-ch3-t1', 'IP Addressing and Subnetting', 'TOPIC', 'cse-s4-cn-ch3', 1, true),
('cse-s4-cn-ch3-t2', 'IPv4 vs IPv6', 'TOPIC', 'cse-s4-cn-ch3', 2, true),
('cse-s4-cn-ch3-t3', 'Routing Algorithms: Distance Vector, Link State', 'TOPIC', 'cse-s4-cn-ch3', 3, true),
('cse-s4-cn-ch3-t4', 'Routing Protocols: RIP, OSPF, BGP', 'TOPIC', 'cse-s4-cn-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-cn-ch4-t1', 'TCP: Connection Management', 'TOPIC', 'cse-s4-cn-ch4', 1, true),
('cse-s4-cn-ch4-t2', 'TCP Flow and Congestion Control', 'TOPIC', 'cse-s4-cn-ch4', 2, true),
('cse-s4-cn-ch4-t3', 'UDP Protocol', 'TOPIC', 'cse-s4-cn-ch4', 3, true),
('cse-s4-cn-ch4-t4', 'Port Numbers and Multiplexing', 'TOPIC', 'cse-s4-cn-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-cn-ch5-t1', 'HTTP and HTTPS', 'TOPIC', 'cse-s4-cn-ch5', 1, true),
('cse-s4-cn-ch5-t2', 'DNS and Email Protocols', 'TOPIC', 'cse-s4-cn-ch5', 2, true),
('cse-s4-cn-ch5-t3', 'FTP and SSH', 'TOPIC', 'cse-s4-cn-ch5', 3, true),
('cse-s4-cn-ch5-t4', 'Web Caching and CDNs', 'TOPIC', 'cse-s4-cn-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-cn-ch6-t1', 'Cryptography Basics', 'TOPIC', 'cse-s4-cn-ch6', 1, true),
('cse-s4-cn-ch6-t2', 'Authentication and Digital Signatures', 'TOPIC', 'cse-s4-cn-ch6', 2, true),
('cse-s4-cn-ch6-t3', 'Firewalls and IDS', 'TOPIC', 'cse-s4-cn-ch6', 3, true),
('cse-s4-cn-ch6-t4', 'VPNs and Secure Communication', 'TOPIC', 'cse-s4-cn-ch6', 4, true);

-- Object-Oriented Programming (Java)
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-java',
  'Object-Oriented Programming (Java)',
  'SUBJECT',
  'cse-year-2',
  9,
  true
);

-- Chapters for Java
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-java-ch1', 'Java Fundamentals', 'CHAPTER', 'cse-s4-java', 1, true),
('cse-s4-java-ch2', 'OOP Concepts in Java', 'CHAPTER', 'cse-s4-java', 2, true),
('cse-s4-java-ch3', 'Inheritance and Polymorphism', 'CHAPTER', 'cse-s4-java', 3, true),
('cse-s4-java-ch4', 'Exception Handling and I/O', 'CHAPTER', 'cse-s4-java', 4, true),
('cse-s4-java-ch5', 'Collections Framework', 'CHAPTER', 'cse-s4-java', 5, true),
('cse-s4-java-ch6', 'Multithreading and Concurrency', 'CHAPTER', 'cse-s4-java', 6, true);

-- Topics for Java
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-java-ch1-t1', 'Java Syntax and Data Types', 'TOPIC', 'cse-s4-java-ch1', 1, true),
('cse-s4-java-ch1-t2', 'Operators and Control Flow', 'TOPIC', 'cse-s4-java-ch1', 2, true),
('cse-s4-java-ch1-t3', 'Arrays and Strings', 'TOPIC', 'cse-s4-java-ch1', 3, true),
('cse-s4-java-ch1-t4', 'Methods and Parameter Passing', 'TOPIC', 'cse-s4-java-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-java-ch2-t1', 'Classes and Objects', 'TOPIC', 'cse-s4-java-ch2', 1, true),
('cse-s4-java-ch2-t2', 'Constructors and this Keyword', 'TOPIC', 'cse-s4-java-ch2', 2, true),
('cse-s4-java-ch2-t3', 'Access Modifiers and Encapsulation', 'TOPIC', 'cse-s4-java-ch2', 3, true),
('cse-s4-java-ch2-t4', 'Static Members and Nested Classes', 'TOPIC', 'cse-s4-java-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-java-ch3-t1', 'Inheritance and super Keyword', 'TOPIC', 'cse-s4-java-ch3', 1, true),
('cse-s4-java-ch3-t2', 'Method Overriding and Overloading', 'TOPIC', 'cse-s4-java-ch3', 2, true),
('cse-s4-java-ch3-t3', 'Abstract Classes and Interfaces', 'TOPIC', 'cse-s4-java-ch3', 3, true),
('cse-s4-java-ch3-t4', 'Polymorphism and Dynamic Binding', 'TOPIC', 'cse-s4-java-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-java-ch4-t1', 'Exception Hierarchy', 'TOPIC', 'cse-s4-java-ch4', 1, true),
('cse-s4-java-ch4-t2', 'Try-Catch-Finally Blocks', 'TOPIC', 'cse-s4-java-ch4', 2, true),
('cse-s4-java-ch4-t3', 'File I/O Streams', 'TOPIC', 'cse-s4-java-ch4', 3, true),
('cse-s4-java-ch4-t4', 'Serialization', 'TOPIC', 'cse-s4-java-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-java-ch5-t1', 'List, Set, and Map Interfaces', 'TOPIC', 'cse-s4-java-ch5', 1, true),
('cse-s4-java-ch5-t2', 'ArrayList, LinkedList, HashSet', 'TOPIC', 'cse-s4-java-ch5', 2, true),
('cse-s4-java-ch5-t3', 'HashMap and TreeMap', 'TOPIC', 'cse-s4-java-ch5', 3, true),
('cse-s4-java-ch5-t4', 'Iterators and Comparators', 'TOPIC', 'cse-s4-java-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-java-ch6-t1', 'Thread Creation and Lifecycle', 'TOPIC', 'cse-s4-java-ch6', 1, true),
('cse-s4-java-ch6-t2', 'Synchronization and Locks', 'TOPIC', 'cse-s4-java-ch6', 2, true),
('cse-s4-java-ch6-t3', 'Inter-Thread Communication', 'TOPIC', 'cse-s4-java-ch6', 3, true),
('cse-s4-java-ch6-t4', 'Executor Framework', 'TOPIC', 'cse-s4-java-ch6', 4, true);

-- Software Engineering
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-se',
  'Software Engineering',
  'SUBJECT',
  'cse-year-2',
  10,
  true
);

-- Chapters for Software Engineering
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-se-ch1', 'Software Process Models', 'CHAPTER', 'cse-s4-se', 1, true),
('cse-s4-se-ch2', 'Requirements Engineering', 'CHAPTER', 'cse-s4-se', 2, true),
('cse-s4-se-ch3', 'System Design and Architecture', 'CHAPTER', 'cse-s4-se', 3, true),
('cse-s4-se-ch4', 'Software Testing', 'CHAPTER', 'cse-s4-se', 4, true),
('cse-s4-se-ch5', 'Software Maintenance and Evolution', 'CHAPTER', 'cse-s4-se', 5, true),
('cse-s4-se-ch6', 'Agile and DevOps', 'CHAPTER', 'cse-s4-se', 6, true);

-- Topics for Software Engineering
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-se-ch1-t1', 'Waterfall and V-Model', 'TOPIC', 'cse-s4-se-ch1', 1, true),
('cse-s4-se-ch1-t2', 'Iterative and Incremental Models', 'TOPIC', 'cse-s4-se-ch1', 2, true),
('cse-s4-se-ch1-t3', 'Spiral Model', 'TOPIC', 'cse-s4-se-ch1', 3, true),
('cse-s4-se-ch1-t4', 'Rapid Application Development', 'TOPIC', 'cse-s4-se-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-se-ch2-t1', 'Requirement Elicitation Techniques', 'TOPIC', 'cse-s4-se-ch2', 1, true),
('cse-s4-se-ch2-t2', 'Functional and Non-Functional Requirements', 'TOPIC', 'cse-s4-se-ch2', 2, true),
('cse-s4-se-ch2-t3', 'Use Case Diagrams', 'TOPIC', 'cse-s4-se-ch2', 3, true),
('cse-s4-se-ch2-t4', 'Requirement Specification and Validation', 'TOPIC', 'cse-s4-se-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-se-ch3-t1', 'System Architecture Patterns', 'TOPIC', 'cse-s4-se-ch3', 1, true),
('cse-s4-se-ch3-t2', 'UML Diagrams: Class, Sequence, Activity', 'TOPIC', 'cse-s4-se-ch3', 2, true),
('cse-s4-se-ch3-t3', 'Design Patterns: Creational, Structural, Behavioral', 'TOPIC', 'cse-s4-se-ch3', 3, true),
('cse-s4-se-ch3-t4', 'Coupling and Cohesion', 'TOPIC', 'cse-s4-se-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-se-ch4-t1', 'Testing Levels: Unit, Integration, System', 'TOPIC', 'cse-s4-se-ch4', 1, true),
('cse-s4-se-ch4-t2', 'Black Box and White Box Testing', 'TOPIC', 'cse-s4-se-ch4', 2, true),
('cse-s4-se-ch4-t3', 'Test Case Design Techniques', 'TOPIC', 'cse-s4-se-ch4', 3, true),
('cse-s4-se-ch4-t4', 'Regression and Automation Testing', 'TOPIC', 'cse-s4-se-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-se-ch5-t1', 'Types of Software Maintenance', 'TOPIC', 'cse-s4-se-ch5', 1, true),
('cse-s4-se-ch5-t2', 'Configuration Management', 'TOPIC', 'cse-s4-se-ch5', 2, true),
('cse-s4-se-ch5-t3', 'Version Control Systems', 'TOPIC', 'cse-s4-se-ch5', 3, true),
('cse-s4-se-ch5-t4', 'Re-engineering and Refactoring', 'TOPIC', 'cse-s4-se-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-se-ch6-t1', 'Scrum and Kanban', 'TOPIC', 'cse-s4-se-ch6', 1, true),
('cse-s4-se-ch6-t2', 'User Stories and Sprint Planning', 'TOPIC', 'cse-s4-se-ch6', 2, true),
('cse-s4-se-ch6-t3', 'CI/CD Pipelines', 'TOPIC', 'cse-s4-se-ch6', 3, true),
('cse-s4-se-ch6-t4', 'Docker and Kubernetes Basics', 'TOPIC', 'cse-s4-se-ch6', 4, true);

-- Web Technologies
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-web',
  'Web Technologies',
  'SUBJECT',
  'cse-year-2',
  11,
  true
);

-- Chapters for Web Technologies
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-web-ch1', 'HTML5 and CSS3 Fundamentals', 'CHAPTER', 'cse-s4-web', 1, true),
('cse-s4-web-ch2', 'JavaScript and DOM Manipulation', 'CHAPTER', 'cse-s4-web', 2, true),
('cse-s4-web-ch3', 'Frontend Frameworks: React Basics', 'CHAPTER', 'cse-s4-web', 3, true),
('cse-s4-web-ch4', 'Backend Development with Node.js', 'CHAPTER', 'cse-s4-web', 4, true),
('cse-s4-web-ch5', 'RESTful APIs and AJAX', 'CHAPTER', 'cse-s4-web', 5, true),
('cse-s4-web-ch6', 'Web Security Essentials', 'CHAPTER', 'cse-s4-web', 6, true);

-- Topics for Web Technologies
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-web-ch1-t1', 'HTML Semantic Elements', 'TOPIC', 'cse-s4-web-ch1', 1, true),
('cse-s4-web-ch1-t2', 'CSS Selectors and Box Model', 'TOPIC', 'cse-s4-web-ch1', 2, true),
('cse-s4-web-ch1-t3', 'Flexbox and Grid Layouts', 'TOPIC', 'cse-s4-web-ch1', 3, true),
('cse-s4-web-ch1-t4', 'Responsive Design', 'TOPIC', 'cse-s4-web-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-web-ch2-t1', 'JavaScript Variables and Functions', 'TOPIC', 'cse-s4-web-ch2', 1, true),
('cse-s4-web-ch2-t2', 'DOM Traversal and Manipulation', 'TOPIC', 'cse-s4-web-ch2', 2, true),
('cse-s4-web-ch2-t3', 'Event Handling', 'TOPIC', 'cse-s4-web-ch2', 3, true),
('cse-s4-web-ch2-t4', 'Async JavaScript and Promises', 'TOPIC', 'cse-s4-web-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-web-ch3-t1', 'React Components and Props', 'TOPIC', 'cse-s4-web-ch3', 1, true),
('cse-s4-web-ch3-t2', 'State Management with Hooks', 'TOPIC', 'cse-s4-web-ch3', 2, true),
('cse-s4-web-ch3-t3', 'React Router', 'TOPIC', 'cse-s4-web-ch3', 3, true),
('cse-s4-web-ch3-t4', 'Forms and Validation', 'TOPIC', 'cse-s4-web-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-web-ch4-t1', 'Node.js and NPM', 'TOPIC', 'cse-s4-web-ch4', 1, true),
('cse-s4-web-ch4-t2', 'Express.js Basics', 'TOPIC', 'cse-s4-web-ch4', 2, true),
('cse-s4-web-ch4-t3', 'Middleware and Routing', 'TOPIC', 'cse-s4-web-ch4', 3, true),
('cse-s4-web-ch4-t4', 'Database Integration with MongoDB', 'TOPIC', 'cse-s4-web-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-web-ch5-t1', 'REST API Design Principles', 'TOPIC', 'cse-s4-web-ch5', 1, true),
('cse-s4-web-ch5-t2', 'HTTP Methods and Status Codes', 'TOPIC', 'cse-s4-web-ch5', 2, true),
('cse-s4-web-ch5-t3', 'AJAX and Fetch API', 'TOPIC', 'cse-s4-web-ch5', 3, true),
('cse-s4-web-ch5-t4', 'JSON and Data Serialization', 'TOPIC', 'cse-s4-web-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-web-ch6-t1', 'XSS and CSRF Attacks', 'TOPIC', 'cse-s4-web-ch6', 1, true),
('cse-s4-web-ch6-t2', 'Authentication: JWT and OAuth', 'TOPIC', 'cse-s4-web-ch6', 2, true),
('cse-s4-web-ch6-t3', 'HTTPS and SSL/TLS', 'TOPIC', 'cse-s4-web-ch6', 3, true),
('cse-s4-web-ch6-t4', 'Input Validation and Sanitization', 'TOPIC', 'cse-s4-web-ch6', 4, true);

-- Probability and Statistics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s4-prob',
  'Probability and Statistics',
  'SUBJECT',
  'cse-year-2',
  12,
  true
);

-- Chapters for Probability and Statistics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s4-prob-ch1', 'Probability Foundations', 'CHAPTER', 'cse-s4-prob', 1, true),
('cse-s4-prob-ch2', 'Random Variables and Distributions', 'CHAPTER', 'cse-s4-prob', 2, true),
('cse-s4-prob-ch3', 'Descriptive Statistics', 'CHAPTER', 'cse-s4-prob', 3, true),
('cse-s4-prob-ch4', 'Statistical Inference', 'CHAPTER', 'cse-s4-prob', 4, true),
('cse-s4-prob-ch5', 'Hypothesis Testing', 'CHAPTER', 'cse-s4-prob', 5, true),
('cse-s4-prob-ch6', 'Regression and Correlation', 'CHAPTER', 'cse-s4-prob', 6, true);

-- Topics for Probability and Statistics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s4-prob-ch1-t1', 'Sample Space and Events', 'TOPIC', 'cse-s4-prob-ch1', 1, true),
('cse-s4-prob-ch1-t2', 'Conditional Probability and Bayes Theorem', 'TOPIC', 'cse-s4-prob-ch1', 2, true),
('cse-s4-prob-ch1-t3', 'Independence of Events', 'TOPIC', 'cse-s4-prob-ch1', 3, true),
('cse-s4-prob-ch1-t4', 'Combinatorial Probability', 'TOPIC', 'cse-s4-prob-ch1', 4, true),
-- Chapter 2 topics
('cse-s4-prob-ch2-t1', 'Discrete Random Variables', 'TOPIC', 'cse-s4-prob-ch2', 1, true),
('cse-s4-prob-ch2-t2', 'Continuous Random Variables', 'TOPIC', 'cse-s4-prob-ch2', 2, true),
('cse-s4-prob-ch2-t3', 'Binomial and Poisson Distributions', 'TOPIC', 'cse-s4-prob-ch2', 3, true),
('cse-s4-prob-ch2-t4', 'Normal Distribution', 'TOPIC', 'cse-s4-prob-ch2', 4, true),
-- Chapter 3 topics
('cse-s4-prob-ch3-t1', 'Measures of Central Tendency', 'TOPIC', 'cse-s4-prob-ch3', 1, true),
('cse-s4-prob-ch3-t2', 'Measures of Dispersion', 'TOPIC', 'cse-s4-prob-ch3', 2, true),
('cse-s4-prob-ch3-t3', 'Skewness and Kurtosis', 'TOPIC', 'cse-s4-prob-ch3', 3, true),
('cse-s4-prob-ch3-t4', 'Data Visualization', 'TOPIC', 'cse-s4-prob-ch3', 4, true),
-- Chapter 4 topics
('cse-s4-prob-ch4-t1', 'Point and Interval Estimation', 'TOPIC', 'cse-s4-prob-ch4', 1, true),
('cse-s4-prob-ch4-t2', 'Confidence Intervals', 'TOPIC', 'cse-s4-prob-ch4', 2, true),
('cse-s4-prob-ch4-t3', 'Maximum Likelihood Estimation', 'TOPIC', 'cse-s4-prob-ch4', 3, true),
('cse-s4-prob-ch4-t4', 'Sampling Distributions', 'TOPIC', 'cse-s4-prob-ch4', 4, true),
-- Chapter 5 topics
('cse-s4-prob-ch5-t1', 'Null and Alternative Hypotheses', 'TOPIC', 'cse-s4-prob-ch5', 1, true),
('cse-s4-prob-ch5-t2', 'Type I and Type II Errors', 'TOPIC', 'cse-s4-prob-ch5', 2, true),
('cse-s4-prob-ch5-t3', 'Z-Test and T-Test', 'TOPIC', 'cse-s4-prob-ch5', 3, true),
('cse-s4-prob-ch5-t4', 'Chi-Square Test', 'TOPIC', 'cse-s4-prob-ch5', 4, true),
-- Chapter 6 topics
('cse-s4-prob-ch6-t1', 'Linear Regression Model', 'TOPIC', 'cse-s4-prob-ch6', 1, true),
('cse-s4-prob-ch6-t2', 'Least Squares Method', 'TOPIC', 'cse-s4-prob-ch6', 2, true),
('cse-s4-prob-ch6-t3', 'Correlation Coefficient', 'TOPIC', 'cse-s4-prob-ch6', 3, true),
('cse-s4-prob-ch6-t4', 'Multiple Regression', 'TOPIC', 'cse-s4-prob-ch6', 4, true);

-- ============================================================================
-- END OF PART 1 (SEMESTERS 1-4)
-- ============================================================================

SELECT 'Part 1 (Semesters 1-4) populated successfully!' as message;
