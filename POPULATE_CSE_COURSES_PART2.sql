-- ============================================================================
-- POPULATE CSE COURSE HIERARCHY - PART 2 (Semesters 5-8)
-- ============================================================================
-- Run this script AFTER POPULATE_CSE_COURSES.sql
-- Structure: Years 3 & 4 → Subjects → Chapters → Topics
-- Table: hierarchy_nodes
-- ============================================================================

-- ============================================================================
-- YEAR 3 (Semesters 5 & 6) - Advanced CS & Specializations
-- ============================================================================
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-year-3',
  'Third Year - Advanced Topics & Specializations',
  'YEAR',
  'cse-degree',
  3,
  true
);

-- ============================================================================
-- SEMESTER 5 SUBJECTS
-- ============================================================================

-- Compiler Design
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-cd',
  'Compiler Design',
  'SUBJECT',
  'cse-year-3',
  1,
  true
);

-- Chapters for Compiler Design
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-cd-ch1', 'Language Translators and Phases', 'CHAPTER', 'cse-s5-cd', 1, true),
('cse-s5-cd-ch2', 'Lexical Analysis and Tokenization', 'CHAPTER', 'cse-s5-cd', 2, true),
('cse-s5-cd-ch3', 'Syntax Analysis and Parsing', 'CHAPTER', 'cse-s5-cd', 3, true),
('cse-s5-cd-ch4', 'Semantic Analysis and Type Checking', 'CHAPTER', 'cse-s5-cd', 4, true),
('cse-s5-cd-ch5', 'Intermediate Code and Optimization', 'CHAPTER', 'cse-s5-cd', 5, true),
('cse-s5-cd-ch6', 'Code Generation and Runtime', 'CHAPTER', 'cse-s5-cd', 6, true);

-- Topics for Compiler Design
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-cd-ch1-t1', 'Compiler Phases and Structure', 'TOPIC', 'cse-s5-cd-ch1', 1, true),
('cse-s5-cd-ch1-t2', 'Front-end vs Back-end', 'TOPIC', 'cse-s5-cd-ch1', 2, true),
('cse-s5-cd-ch1-t3', 'Compiler Tools and Generators', 'TOPIC', 'cse-s5-cd-ch1', 3, true),
('cse-s5-cd-ch1-t4', 'Multi-pass Compilation', 'TOPIC', 'cse-s5-cd-ch1', 4, true),
-- Chapter 2 topics
('cse-s5-cd-ch2-t1', 'Regular Expressions', 'TOPIC', 'cse-s5-cd-ch2', 1, true),
('cse-s5-cd-ch2-t2', 'Finite Automata for Lexing', 'TOPIC', 'cse-s5-cd-ch2', 2, true),
('cse-s5-cd-ch2-t3', 'Scanner Generators (Lex/Flex)', 'TOPIC', 'cse-s5-cd-ch2', 3, true),
('cse-s5-cd-ch2-t4', 'Token Recognition', 'TOPIC', 'cse-s5-cd-ch2', 4, true);

-- Artificial Intelligence
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-ai',
  'Artificial Intelligence',
  'SUBJECT',
  'cse-year-3',
  2,
  true
);

-- Chapters for AI
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-ai-ch1', 'Intelligent Agents and Problem Formulation', 'CHAPTER', 'cse-s5-ai', 1, true),
('cse-s5-ai-ch2', 'Search Strategies and Heuristics', 'CHAPTER', 'cse-s5-ai', 2, true),
('cse-s5-ai-ch3', 'Knowledge Representation and Reasoning', 'CHAPTER', 'cse-s5-ai', 3, true),
('cse-s5-ai-ch4', 'Planning and Decision Making', 'CHAPTER', 'cse-s5-ai', 4, true),
('cse-s5-ai-ch5', 'Uncertainty and Probabilistic Reasoning', 'CHAPTER', 'cse-s5-ai', 5, true),
('cse-s5-ai-ch6', 'AI Applications and Ethics', 'CHAPTER', 'cse-s5-ai', 6, true);

-- Topics for AI
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-ai-ch1-t1', 'Agent Environments and Rationality', 'TOPIC', 'cse-s5-ai-ch1', 1, true),
('cse-s5-ai-ch1-t2', 'Problem Formulation', 'TOPIC', 'cse-s5-ai-ch1', 2, true),
('cse-s5-ai-ch1-t3', 'State Space Representation', 'TOPIC', 'cse-s5-ai-ch1', 3, true),
('cse-s5-ai-ch1-t4', 'Agent Architectures', 'TOPIC', 'cse-s5-ai-ch1', 4, true),
-- Chapter 2 topics
('cse-s5-ai-ch2-t1', 'Uninformed Search: BFS, DFS', 'TOPIC', 'cse-s5-ai-ch2', 1, true),
('cse-s5-ai-ch2-t2', 'Informed Search: A* Algorithm', 'TOPIC', 'cse-s5-ai-ch2', 2, true),
('cse-s5-ai-ch2-t3', 'Heuristic Functions', 'TOPIC', 'cse-s5-ai-ch2', 3, true),
('cse-s5-ai-ch2-t4', 'Game Playing and Minimax', 'TOPIC', 'cse-s5-ai-ch2', 4, true);

-- Information Security and Cyber Laws
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-infosec',
  'Information Security and Cyber Laws',
  'SUBJECT',
  'cse-year-3',
  3,
  true
);

-- Chapters for Info Security
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-infosec-ch1', 'Security Principles and Threat Landscape', 'CHAPTER', 'cse-s5-infosec', 1, true),
('cse-s5-infosec-ch2', 'Cryptography Foundations', 'CHAPTER', 'cse-s5-infosec', 2, true),
('cse-s5-infosec-ch3', 'Network and System Security', 'CHAPTER', 'cse-s5-infosec', 3, true),
('cse-s5-infosec-ch4', 'Web and Application Security', 'CHAPTER', 'cse-s5-infosec', 4, true),
('cse-s5-infosec-ch5', 'Incident Response and Forensics', 'CHAPTER', 'cse-s5-infosec', 5, true),
('cse-s5-infosec-ch6', 'Legal and Regulatory Framework', 'CHAPTER', 'cse-s5-infosec', 6, true);

-- Topics for Info Security
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-infosec-ch1-t1', 'CIA Triad', 'TOPIC', 'cse-s5-infosec-ch1', 1, true),
('cse-s5-infosec-ch1-t2', 'Risk Management', 'TOPIC', 'cse-s5-infosec-ch1', 2, true),
('cse-s5-infosec-ch1-t3', 'Threat Modeling', 'TOPIC', 'cse-s5-infosec-ch1', 3, true),
('cse-s5-infosec-ch1-t4', 'Security Policies', 'TOPIC', 'cse-s5-infosec-ch1', 4, true),
-- Chapter 2 topics
('cse-s5-infosec-ch2-t1', 'Symmetric Encryption', 'TOPIC', 'cse-s5-infosec-ch2', 1, true),
('cse-s5-infosec-ch2-t2', 'Asymmetric Encryption', 'TOPIC', 'cse-s5-infosec-ch2', 2, true),
('cse-s5-infosec-ch2-t3', 'Key Management', 'TOPIC', 'cse-s5-infosec-ch2', 3, true),
('cse-s5-infosec-ch2-t4', 'Digital Signatures', 'TOPIC', 'cse-s5-infosec-ch2', 4, true);

-- Distributed Systems
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-ds',
  'Distributed Systems',
  'SUBJECT',
  'cse-year-3',
  4,
  true
);

-- Chapters for Distributed Systems
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-ds-ch1', 'Architectural Models and Communication', 'CHAPTER', 'cse-s5-ds', 1, true),
('cse-s5-ds-ch2', 'Synchronization and Coordination', 'CHAPTER', 'cse-s5-ds', 2, true),
('cse-s5-ds-ch3', 'Consistency and Replication', 'CHAPTER', 'cse-s5-ds', 3, true),
('cse-s5-ds-ch4', 'Fault Tolerance and Recovery', 'CHAPTER', 'cse-s5-ds', 4, true),
('cse-s5-ds-ch5', 'Distributed File and Object Stores', 'CHAPTER', 'cse-s5-ds', 5, true),
('cse-s5-ds-ch6', 'Case Studies and Trends', 'CHAPTER', 'cse-s5-ds', 6, true);

-- Topics for Distributed Systems
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-ds-ch1-t1', 'Client-Server Architecture', 'TOPIC', 'cse-s5-ds-ch1', 1, true),
('cse-s5-ds-ch1-t2', 'Remote Procedure Calls', 'TOPIC', 'cse-s5-ds-ch1', 2, true),
('cse-s5-ds-ch1-t3', 'Socket Programming', 'TOPIC', 'cse-s5-ds-ch1', 3, true),
('cse-s5-ds-ch1-t4', 'Peer-to-Peer Systems', 'TOPIC', 'cse-s5-ds-ch1', 4, true),
-- Chapter 2 topics
('cse-s5-ds-ch2-t1', 'Logical Clocks', 'TOPIC', 'cse-s5-ds-ch2', 1, true),
('cse-s5-ds-ch2-t2', 'Vector Clocks', 'TOPIC', 'cse-s5-ds-ch2', 2, true),
('cse-s5-ds-ch2-t3', 'Mutual Exclusion Algorithms', 'TOPIC', 'cse-s5-ds-ch2', 3, true),
('cse-s5-ds-ch2-t4', 'Leader Election', 'TOPIC', 'cse-s5-ds-ch2', 4, true);

-- Data Mining and Warehousing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-dmw',
  'Data Mining and Data Warehousing',
  'SUBJECT',
  'cse-year-3',
  5,
  true
);

-- Chapters for Data Mining
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-dmw-ch1', 'Data Preprocessing and Feature Engineering', 'CHAPTER', 'cse-s5-dmw', 1, true),
('cse-s5-dmw-ch2', 'Association and Pattern Discovery', 'CHAPTER', 'cse-s5-dmw', 2, true),
('cse-s5-dmw-ch3', 'Classification Techniques', 'CHAPTER', 'cse-s5-dmw', 3, true),
('cse-s5-dmw-ch4', 'Clustering Methods', 'CHAPTER', 'cse-s5-dmw', 4, true),
('cse-s5-dmw-ch5', 'Data Warehousing and OLAP', 'CHAPTER', 'cse-s5-dmw', 5, true),
('cse-s5-dmw-ch6', 'Big Data Platforms Overview', 'CHAPTER', 'cse-s5-dmw', 6, true);

-- Topics for Data Mining
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-dmw-ch1-t1', 'Data Cleaning Techniques', 'TOPIC', 'cse-s5-dmw-ch1', 1, true),
('cse-s5-dmw-ch1-t2', 'Data Transformation', 'TOPIC', 'cse-s5-dmw-ch1', 2, true),
('cse-s5-dmw-ch1-t3', 'Feature Selection', 'TOPIC', 'cse-s5-dmw-ch1', 3, true),
('cse-s5-dmw-ch1-t4', 'Feature Extraction', 'TOPIC', 'cse-s5-dmw-ch1', 4, true),
-- Chapter 2 topics
('cse-s5-dmw-ch2-t1', 'Apriori Algorithm', 'TOPIC', 'cse-s5-dmw-ch2', 1, true),
('cse-s5-dmw-ch2-t2', 'FP-Growth Algorithm', 'TOPIC', 'cse-s5-dmw-ch2', 2, true),
('cse-s5-dmw-ch2-t3', 'Interestingness Measures', 'TOPIC', 'cse-s5-dmw-ch2', 3, true),
('cse-s5-dmw-ch2-t4', 'Sequential Patterns', 'TOPIC', 'cse-s5-dmw-ch2', 4, true),
-- Chapter 3 topics
('cse-s5-dmw-ch3-t1', 'Decision Tree Classifiers', 'TOPIC', 'cse-s5-dmw-ch3', 1, true),
('cse-s5-dmw-ch3-t2', 'Naive Bayes Classifier', 'TOPIC', 'cse-s5-dmw-ch3', 2, true),
('cse-s5-dmw-ch3-t3', 'Model Evaluation Metrics', 'TOPIC', 'cse-s5-dmw-ch3', 3, true),
('cse-s5-dmw-ch3-t4', 'Cross-Validation', 'TOPIC', 'cse-s5-dmw-ch3', 4, true),
-- Chapter 4 topics
('cse-s5-dmw-ch4-t1', 'K-Means Clustering', 'TOPIC', 'cse-s5-dmw-ch4', 1, true),
('cse-s5-dmw-ch4-t2', 'Hierarchical Clustering', 'TOPIC', 'cse-s5-dmw-ch4', 2, true),
('cse-s5-dmw-ch4-t3', 'DBSCAN', 'TOPIC', 'cse-s5-dmw-ch4', 3, true),
('cse-s5-dmw-ch4-t4', 'Cluster Evaluation', 'TOPIC', 'cse-s5-dmw-ch4', 4, true);

-- Professional Elective I - Human-Computer Interaction
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s5-pe1-hci',
  'Human-Computer Interaction',
  'SUBJECT',
  'cse-year-3',
  6,
  true
);

-- Chapters for HCI
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s5-pe1-hci-ch1', 'HCI Foundations and User-Centered Design', 'CHAPTER', 'cse-s5-pe1-hci', 1, true),
('cse-s5-pe1-hci-ch2', 'Interaction Styles and Prototyping', 'CHAPTER', 'cse-s5-pe1-hci', 2, true),
('cse-s5-pe1-hci-ch3', 'Cognitive Models and Usability', 'CHAPTER', 'cse-s5-pe1-hci', 3, true),
('cse-s5-pe1-hci-ch4', 'Evaluation Methods and Metrics', 'CHAPTER', 'cse-s5-pe1-hci', 4, true),
('cse-s5-pe1-hci-ch5', 'Accessibility and Inclusive Design', 'CHAPTER', 'cse-s5-pe1-hci', 5, true),
('cse-s5-pe1-hci-ch6', 'Design Systems and Patterns', 'CHAPTER', 'cse-s5-pe1-hci', 6, true);

-- Topics for HCI
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s5-pe1-hci-ch1-t1', 'User-Centered Design Principles', 'TOPIC', 'cse-s5-pe1-hci-ch1', 1, true),
('cse-s5-pe1-hci-ch1-t2', 'Personas and Scenarios', 'TOPIC', 'cse-s5-pe1-hci-ch1', 2, true),
('cse-s5-pe1-hci-ch1-t3', 'User Research Methods', 'TOPIC', 'cse-s5-pe1-hci-ch1', 3, true),
('cse-s5-pe1-hci-ch1-t4', 'Design Thinking Process', 'TOPIC', 'cse-s5-pe1-hci-ch1', 4, true);

-- ============================================================================
-- SEMESTER 6 SUBJECTS
-- ============================================================================

-- Machine Learning
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-ml',
  'Machine Learning',
  'SUBJECT',
  'cse-year-3',
  7,
  true
);

-- Chapters for ML
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-ml-ch1', 'ML Foundations and Model Evaluation', 'CHAPTER', 'cse-s6-ml', 1, true),
('cse-s6-ml-ch2', 'Linear Models and Regularization', 'CHAPTER', 'cse-s6-ml', 2, true),
('cse-s6-ml-ch3', 'Tree-Based Methods and Ensembles', 'CHAPTER', 'cse-s6-ml', 3, true),
('cse-s6-ml-ch4', 'Support Vector Machines and Kernels', 'CHAPTER', 'cse-s6-ml', 4, true),
('cse-s6-ml-ch5', 'Unsupervised Learning', 'CHAPTER', 'cse-s6-ml', 5, true),
('cse-s6-ml-ch6', 'Model Deployment and MLOps Basics', 'CHAPTER', 'cse-s6-ml', 6, true);

-- Topics for ML
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-ml-ch1-t1', 'Bias-Variance Tradeoff', 'TOPIC', 'cse-s6-ml-ch1', 1, true),
('cse-s6-ml-ch1-t2', 'Cross-Validation Techniques', 'TOPIC', 'cse-s6-ml-ch1', 2, true),
('cse-s6-ml-ch1-t3', 'Overfitting and Underfitting', 'TOPIC', 'cse-s6-ml-ch1', 3, true),
('cse-s6-ml-ch1-t4', 'Performance Metrics', 'TOPIC', 'cse-s6-ml-ch1', 4, true),
-- Chapter 2 topics
('cse-s6-ml-ch2-t1', 'Linear Regression', 'TOPIC', 'cse-s6-ml-ch2', 1, true),
('cse-s6-ml-ch2-t2', 'Logistic Regression', 'TOPIC', 'cse-s6-ml-ch2', 2, true),
('cse-s6-ml-ch2-t3', 'Ridge and Lasso Regularization', 'TOPIC', 'cse-s6-ml-ch2', 3, true),
('cse-s6-ml-ch2-t4', 'Gradient Descent Optimization', 'TOPIC', 'cse-s6-ml-ch2', 4, true),
-- Chapter 3 topics
('cse-s6-ml-ch3-t1', 'Decision Trees', 'TOPIC', 'cse-s6-ml-ch3', 1, true),
('cse-s6-ml-ch3-t2', 'Random Forests', 'TOPIC', 'cse-s6-ml-ch3', 2, true),
('cse-s6-ml-ch3-t3', 'Gradient Boosting', 'TOPIC', 'cse-s6-ml-ch3', 3, true),
('cse-s6-ml-ch3-t4', 'XGBoost and Ensemble Methods', 'TOPIC', 'cse-s6-ml-ch3', 4, true),
-- Chapter 4 topics
('cse-s6-ml-ch4-t1', 'SVM Fundamentals', 'TOPIC', 'cse-s6-ml-ch4', 1, true),
('cse-s6-ml-ch4-t2', 'Kernel Trick', 'TOPIC', 'cse-s6-ml-ch4', 2, true),
('cse-s6-ml-ch4-t3', 'Margin Optimization', 'TOPIC', 'cse-s6-ml-ch4', 3, true),
('cse-s6-ml-ch4-t4', 'Multi-class SVM', 'TOPIC', 'cse-s6-ml-ch4', 4, true),
-- Chapter 5 topics
('cse-s6-ml-ch5-t1', 'Principal Component Analysis', 'TOPIC', 'cse-s6-ml-ch5', 1, true),
('cse-s6-ml-ch5-t2', 'K-Means Clustering', 'TOPIC', 'cse-s6-ml-ch5', 2, true),
('cse-s6-ml-ch5-t3', 'Anomaly Detection', 'TOPIC', 'cse-s6-ml-ch5', 3, true),
('cse-s6-ml-ch5-t4', 'Dimensionality Reduction', 'TOPIC', 'cse-s6-ml-ch5', 4, true);

-- Cloud Computing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-cloud',
  'Cloud Computing',
  'SUBJECT',
  'cse-year-3',
  8,
  true
);

-- Chapters for Cloud
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-cloud-ch1', 'Cloud Service Models and Architectures', 'CHAPTER', 'cse-s6-cloud', 1, true),
('cse-s6-cloud-ch2', 'Virtualization and Containers', 'CHAPTER', 'cse-s6-cloud', 2, true),
('cse-s6-cloud-ch3', 'Cloud Storage and Databases', 'CHAPTER', 'cse-s6-cloud', 3, true),
('cse-s6-cloud-ch4', 'Networking, Load Balancing, and CDN', 'CHAPTER', 'cse-s6-cloud', 4, true),
('cse-s6-cloud-ch5', 'Security, Identity, and Compliance', 'CHAPTER', 'cse-s6-cloud', 5, true),
('cse-s6-cloud-ch6', 'Cloud-Native Design and Serverless', 'CHAPTER', 'cse-s6-cloud', 6, true);

-- Topics for Cloud
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-cloud-ch1-t1', 'IaaS, PaaS, SaaS Models', 'TOPIC', 'cse-s6-cloud-ch1', 1, true),
('cse-s6-cloud-ch1-t2', 'Multi-Cloud and Hybrid Cloud', 'TOPIC', 'cse-s6-cloud-ch1', 2, true),
('cse-s6-cloud-ch1-t3', 'Cloud Provider Comparison', 'TOPIC', 'cse-s6-cloud-ch1', 3, true),
('cse-s6-cloud-ch1-t4', 'Cloud Economics', 'TOPIC', 'cse-s6-cloud-ch1', 4, true),
-- Chapter 2 topics
('cse-s6-cloud-ch2-t1', 'Hypervisors and Virtual Machines', 'TOPIC', 'cse-s6-cloud-ch2', 1, true),
('cse-s6-cloud-ch2-t2', 'Docker Fundamentals', 'TOPIC', 'cse-s6-cloud-ch2', 2, true),
('cse-s6-cloud-ch2-t3', 'Container Orchestration', 'TOPIC', 'cse-s6-cloud-ch2', 3, true),
('cse-s6-cloud-ch2-t4', 'Kubernetes Basics', 'TOPIC', 'cse-s6-cloud-ch2', 4, true);

-- Internet of Things
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-iot',
  'Internet of Things',
  'SUBJECT',
  'cse-year-3',
  9,
  true
);

-- Chapters for IoT
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-iot-ch1', 'IoT Architecture and Protocols', 'CHAPTER', 'cse-s6-iot', 1, true),
('cse-s6-iot-ch2', 'Sensors, Actuators, and Embedded Nodes', 'CHAPTER', 'cse-s6-iot', 2, true),
('cse-s6-iot-ch3', 'Connectivity and Gateways', 'CHAPTER', 'cse-s6-iot', 3, true),
('cse-s6-iot-ch4', 'Data Ingestion and Processing', 'CHAPTER', 'cse-s6-iot', 4, true),
('cse-s6-iot-ch5', 'Security and Privacy in IoT', 'CHAPTER', 'cse-s6-iot', 5, true),
('cse-s6-iot-ch6', 'Applications and Case Studies', 'CHAPTER', 'cse-s6-iot', 6, true);

-- Topics for IoT
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-iot-ch1-t1', 'Edge, Fog, and Cloud Layers', 'TOPIC', 'cse-s6-iot-ch1', 1, true),
('cse-s6-iot-ch1-t2', 'MQTT Protocol', 'TOPIC', 'cse-s6-iot-ch1', 2, true),
('cse-s6-iot-ch1-t3', 'CoAP Protocol', 'TOPIC', 'cse-s6-iot-ch1', 3, true),
('cse-s6-iot-ch1-t4', 'IoT Communication Patterns', 'TOPIC', 'cse-s6-iot-ch1', 4, true);

-- Mobile Application Development
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-mobile',
  'Mobile Application Development',
  'SUBJECT',
  'cse-year-3',
  10,
  true
);

-- Chapters for Mobile
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-mobile-ch1', 'Mobile Platforms and UI Paradigms', 'CHAPTER', 'cse-s6-mobile', 1, true),
('cse-s6-mobile-ch2', 'Activity/Fragment Lifecycles and Navigation', 'CHAPTER', 'cse-s6-mobile', 2, true),
('cse-s6-mobile-ch3', 'Data Storage and Networking', 'CHAPTER', 'cse-s6-mobile', 3, true),
('cse-s6-mobile-ch4', 'Reactive Programming and MV* Patterns', 'CHAPTER', 'cse-s6-mobile', 4, true),
('cse-s6-mobile-ch5', 'Performance, Battery, and Accessibility', 'CHAPTER', 'cse-s6-mobile', 5, true),
('cse-s6-mobile-ch6', 'Testing and Publishing', 'CHAPTER', 'cse-s6-mobile', 6, true);

-- Topics for Mobile
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-mobile-ch1-t1', 'Android vs iOS Development', 'TOPIC', 'cse-s6-mobile-ch1', 1, true),
('cse-s6-mobile-ch1-t2', 'Adaptive Layouts', 'TOPIC', 'cse-s6-mobile-ch1', 2, true),
('cse-s6-mobile-ch1-t3', 'Material Design', 'TOPIC', 'cse-s6-mobile-ch1', 3, true),
('cse-s6-mobile-ch1-t4', 'Cross-Platform Frameworks', 'TOPIC', 'cse-s6-mobile-ch1', 4, true);

-- Big Data Analytics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-bigdata',
  'Big Data Analytics',
  'SUBJECT',
  'cse-year-3',
  11,
  true
);

-- Chapters for Big Data
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-bigdata-ch1', 'Big Data Ecosystem and HDFS', 'CHAPTER', 'cse-s6-bigdata', 1, true),
('cse-s6-bigdata-ch2', 'MapReduce and YARN', 'CHAPTER', 'cse-s6-bigdata', 2, true),
('cse-s6-bigdata-ch3', 'Apache Spark Core and SQL', 'CHAPTER', 'cse-s6-bigdata', 3, true),
('cse-s6-bigdata-ch4', 'Streaming and Event Processing', 'CHAPTER', 'cse-s6-bigdata', 4, true),
('cse-s6-bigdata-ch5', 'NoSQL Systems and Column Stores', 'CHAPTER', 'cse-s6-bigdata', 5, true),
('cse-s6-bigdata-ch6', 'Scalable ML Pipelines', 'CHAPTER', 'cse-s6-bigdata', 6, true);

-- Topics for Big Data
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-bigdata-ch1-t1', 'Big Data Characteristics', 'TOPIC', 'cse-s6-bigdata-ch1', 1, true),
('cse-s6-bigdata-ch1-t2', 'HDFS Architecture', 'TOPIC', 'cse-s6-bigdata-ch1', 2, true),
('cse-s6-bigdata-ch1-t3', 'Data Replication', 'TOPIC', 'cse-s6-bigdata-ch1', 3, true),
('cse-s6-bigdata-ch1-t4', 'Fault Tolerance', 'TOPIC', 'cse-s6-bigdata-ch1', 4, true),
-- Chapter 2 topics
('cse-s6-bigdata-ch2-t1', 'MapReduce Execution Model', 'TOPIC', 'cse-s6-bigdata-ch2', 1, true),
('cse-s6-bigdata-ch2-t2', 'YARN Resource Management', 'TOPIC', 'cse-s6-bigdata-ch2', 2, true),
('cse-s6-bigdata-ch2-t3', 'MapReduce Optimizations', 'TOPIC', 'cse-s6-bigdata-ch2', 3, true),
('cse-s6-bigdata-ch2-t4', 'MapReduce Applications', 'TOPIC', 'cse-s6-bigdata-ch2', 4, true),
-- Chapter 3 topics
('cse-s6-bigdata-ch3-t1', 'RDD Concepts', 'TOPIC', 'cse-s6-bigdata-ch3', 1, true),
('cse-s6-bigdata-ch3-t2', 'DataFrames and Datasets', 'TOPIC', 'cse-s6-bigdata-ch3', 2, true),
('cse-s6-bigdata-ch3-t3', 'Spark SQL', 'TOPIC', 'cse-s6-bigdata-ch3', 3, true),
('cse-s6-bigdata-ch3-t4', 'Caching and Persistence', 'TOPIC', 'cse-s6-bigdata-ch3', 4, true);

-- Professional Elective II - Blockchain
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s6-pe2-blockchain',
  'Blockchain Technologies',
  'SUBJECT',
  'cse-year-3',
  12,
  true
);

-- Chapters for Blockchain
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s6-pe2-blockchain-ch1', 'Cryptographic Primitives for Blockchain', 'CHAPTER', 'cse-s6-pe2-blockchain', 1, true),
('cse-s6-pe2-blockchain-ch2', 'Distributed Ledgers and Consensus', 'CHAPTER', 'cse-s6-pe2-blockchain', 2, true),
('cse-s6-pe2-blockchain-ch3', 'Smart Contracts and Platforms', 'CHAPTER', 'cse-s6-pe2-blockchain', 3, true),
('cse-s6-pe2-blockchain-ch4', 'Blockchain Security and Privacy', 'CHAPTER', 'cse-s6-pe2-blockchain', 4, true),
('cse-s6-pe2-blockchain-ch5', 'Enterprise and Permissioned Chains', 'CHAPTER', 'cse-s6-pe2-blockchain', 5, true),
('cse-s6-pe2-blockchain-ch6', 'Use Cases and Limitations', 'CHAPTER', 'cse-s6-pe2-blockchain', 6, true);

-- Topics for Blockchain
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s6-pe2-blockchain-ch1-t1', 'Hash Functions', 'TOPIC', 'cse-s6-pe2-blockchain-ch1', 1, true),
('cse-s6-pe2-blockchain-ch1-t2', 'Digital Signatures', 'TOPIC', 'cse-s6-pe2-blockchain-ch1', 2, true),
('cse-s6-pe2-blockchain-ch1-t3', 'Merkle Trees', 'TOPIC', 'cse-s6-pe2-blockchain-ch1', 3, true),
('cse-s6-pe2-blockchain-ch1-t4', 'Public Key Infrastructure', 'TOPIC', 'cse-s6-pe2-blockchain-ch1', 4, true),
-- Chapter 2 topics
('cse-s6-pe2-blockchain-ch2-t1', 'Proof of Work', 'TOPIC', 'cse-s6-pe2-blockchain-ch2', 1, true),
('cse-s6-pe2-blockchain-ch2-t2', 'Proof of Stake', 'TOPIC', 'cse-s6-pe2-blockchain-ch2', 2, true),
('cse-s6-pe2-blockchain-ch2-t3', 'Byzantine Fault Tolerance', 'TOPIC', 'cse-s6-pe2-blockchain-ch2', 3, true),
('cse-s6-pe2-blockchain-ch2-t4', 'Consensus Algorithms', 'TOPIC', 'cse-s6-pe2-blockchain-ch2', 4, true);

-- ============================================================================
-- YEAR 4 (Semesters 7 & 8) - Specialization & Capstone
-- ============================================================================
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-year-4',
  'Fourth Year - Specialization & Capstone',
  'YEAR',
  'cse-degree',
  4,
  true
);

-- ============================================================================
-- SEMESTER 7 SUBJECTS
-- ============================================================================

-- Deep Learning
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-dl',
  'Deep Learning',
  'SUBJECT',
  'cse-year-4',
  1,
  true
);

-- Chapters for Deep Learning
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-dl-ch1', 'Neural Network Foundations', 'CHAPTER', 'cse-s7-dl', 1, true),
('cse-s7-dl-ch2', 'Convolutional Networks for Vision', 'CHAPTER', 'cse-s7-dl', 2, true),
('cse-s7-dl-ch3', 'Sequence Models and RNNs', 'CHAPTER', 'cse-s7-dl', 3, true),
('cse-s7-dl-ch4', 'Optimization and Generalization', 'CHAPTER', 'cse-s7-dl', 4, true),
('cse-s7-dl-ch5', 'Advanced Topics and Transformers', 'CHAPTER', 'cse-s7-dl', 5, true),
('cse-s7-dl-ch6', 'Engineering DL Systems', 'CHAPTER', 'cse-s7-dl', 6, true);

-- Topics for Deep Learning
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-dl-ch1-t1', 'Perceptrons and Activation Functions', 'TOPIC', 'cse-s7-dl-ch1', 1, true),
('cse-s7-dl-ch1-t2', 'Backpropagation Algorithm', 'TOPIC', 'cse-s7-dl-ch1', 2, true),
('cse-s7-dl-ch1-t3', 'Multilayer Perceptrons', 'TOPIC', 'cse-s7-dl-ch1', 3, true),
('cse-s7-dl-ch1-t4', 'Weight Initialization', 'TOPIC', 'cse-s7-dl-ch1', 4, true),
-- Chapter 2 topics
('cse-s7-dl-ch2-t1', 'Convolutional Layers', 'TOPIC', 'cse-s7-dl-ch2', 1, true),
('cse-s7-dl-ch2-t2', 'Pooling Layers', 'TOPIC', 'cse-s7-dl-ch2', 2, true),
('cse-s7-dl-ch2-t3', 'CNN Architectures: VGG, ResNet', 'TOPIC', 'cse-s7-dl-ch2', 3, true),
('cse-s7-dl-ch2-t4', 'Transfer Learning', 'TOPIC', 'cse-s7-dl-ch2', 4, true),
-- Chapter 3 topics
('cse-s7-dl-ch3-t1', 'Recurrent Neural Networks', 'TOPIC', 'cse-s7-dl-ch3', 1, true),
('cse-s7-dl-ch3-t2', 'LSTM and GRU', 'TOPIC', 'cse-s7-dl-ch3', 2, true),
('cse-s7-dl-ch3-t3', 'Attention Mechanisms', 'TOPIC', 'cse-s7-dl-ch3', 3, true),
('cse-s7-dl-ch3-t4', 'Sequence-to-Sequence Models', 'TOPIC', 'cse-s7-dl-ch3', 4, true),
-- Chapter 4 topics
('cse-s7-dl-ch4-t1', 'SGD and Variants', 'TOPIC', 'cse-s7-dl-ch4', 1, true),
('cse-s7-dl-ch4-t2', 'Batch Normalization', 'TOPIC', 'cse-s7-dl-ch4', 2, true),
('cse-s7-dl-ch4-t3', 'Dropout and Regularization', 'TOPIC', 'cse-s7-dl-ch4', 3, true),
('cse-s7-dl-ch4-t4', 'Learning Rate Schedules', 'TOPIC', 'cse-s7-dl-ch4', 4, true),
-- Chapter 5 topics
('cse-s7-dl-ch5-t1', 'Self-Attention', 'TOPIC', 'cse-s7-dl-ch5', 1, true),
('cse-s7-dl-ch5-t2', 'Transformer Architecture', 'TOPIC', 'cse-s7-dl-ch5', 2, true),
('cse-s7-dl-ch5-t3', 'BERT and GPT Models', 'TOPIC', 'cse-s7-dl-ch5', 3, true),
('cse-s7-dl-ch5-t4', 'Fine-Tuning Strategies', 'TOPIC', 'cse-s7-dl-ch5', 4, true);

-- Natural Language Processing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-nlp',
  'Natural Language Processing',
  'SUBJECT',
  'cse-year-4',
  2,
  true
);

-- Chapters for NLP
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-nlp-ch1', 'Text Processing and Representations', 'CHAPTER', 'cse-s7-nlp', 1, true),
('cse-s7-nlp-ch2', 'Classical NLP Models', 'CHAPTER', 'cse-s7-nlp', 2, true),
('cse-s7-nlp-ch3', 'Neural NLP and Sequence-to-Sequence', 'CHAPTER', 'cse-s7-nlp', 3, true),
('cse-s7-nlp-ch4', 'Contextual Language Models', 'CHAPTER', 'cse-s7-nlp', 4, true),
('cse-s7-nlp-ch5', 'Information Extraction and QA', 'CHAPTER', 'cse-s7-nlp', 5, true),
('cse-s7-nlp-ch6', 'Evaluation, Bias, and Ethics', 'CHAPTER', 'cse-s7-nlp', 6, true);

-- Topics for NLP
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-nlp-ch1-t1', 'Tokenization Techniques', 'TOPIC', 'cse-s7-nlp-ch1', 1, true),
('cse-s7-nlp-ch1-t2', 'Word Embeddings: Word2Vec, GloVe', 'TOPIC', 'cse-s7-nlp-ch1', 2, true),
('cse-s7-nlp-ch1-t3', 'Subword Tokenization', 'TOPIC', 'cse-s7-nlp-ch1', 3, true),
('cse-s7-nlp-ch1-t4', 'Text Preprocessing', 'TOPIC', 'cse-s7-nlp-ch1', 4, true);

-- Software Project Management and Agile
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-spm',
  'Software Project Management and Agile',
  'SUBJECT',
  'cse-year-4',
  3,
  true
);

-- Chapters for SPM
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-spm-ch1', 'Project Initiation and Scope', 'CHAPTER', 'cse-s7-spm', 1, true),
('cse-s7-spm-ch2', 'Estimation and Planning', 'CHAPTER', 'cse-s7-spm', 2, true),
('cse-s7-spm-ch3', 'Agile Execution and DevOps', 'CHAPTER', 'cse-s7-spm', 3, true),
('cse-s7-spm-ch4', 'Risk and Quality Management', 'CHAPTER', 'cse-s7-spm', 4, true),
('cse-s7-spm-ch5', 'Metrics and Governance', 'CHAPTER', 'cse-s7-spm', 5, true),
('cse-s7-spm-ch6', 'Contracts and Procurement', 'CHAPTER', 'cse-s7-spm', 6, true);

-- Topics for SPM
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-spm-ch1-t1', 'Project Charters', 'TOPIC', 'cse-s7-spm-ch1', 1, true),
('cse-s7-spm-ch1-t2', 'Stakeholder Mapping', 'TOPIC', 'cse-s7-spm-ch1', 2, true),
('cse-s7-spm-ch1-t3', 'Scope Definition', 'TOPIC', 'cse-s7-spm-ch1', 3, true),
('cse-s7-spm-ch1-t4', 'Work Breakdown Structure', 'TOPIC', 'cse-s7-spm-ch1', 4, true);

-- High-Performance Computing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-hpc',
  'High-Performance Computing',
  'SUBJECT',
  'cse-year-4',
  4,
  true
);

-- Chapters for HPC
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-hpc-ch1', 'Parallel Architectures and Models', 'CHAPTER', 'cse-s7-hpc', 1, true),
('cse-s7-hpc-ch2', 'Parallel Programming with OpenMP', 'CHAPTER', 'cse-s7-hpc', 2, true),
('cse-s7-hpc-ch3', 'Distributed Programming with MPI', 'CHAPTER', 'cse-s7-hpc', 3, true),
('cse-s7-hpc-ch4', 'GPU Computing with CUDA', 'CHAPTER', 'cse-s7-hpc', 4, true),
('cse-s7-hpc-ch5', 'Performance Analysis and Tuning', 'CHAPTER', 'cse-s7-hpc', 5, true),
('cse-s7-hpc-ch6', 'Parallel Algorithms and Case Studies', 'CHAPTER', 'cse-s7-hpc', 6, true);

-- Topics for HPC
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-hpc-ch1-t1', 'Shared Memory vs Distributed Memory', 'TOPIC', 'cse-s7-hpc-ch1', 1, true),
('cse-s7-hpc-ch1-t2', 'SIMD and MIMD Models', 'TOPIC', 'cse-s7-hpc-ch1', 2, true),
('cse-s7-hpc-ch1-t3', 'Parallel Processing Fundamentals', 'TOPIC', 'cse-s7-hpc-ch1', 3, true),
('cse-s7-hpc-ch1-t4', 'Performance Metrics', 'TOPIC', 'cse-s7-hpc-ch1', 4, true);

-- Professional Elective III - Computer Vision
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-pe3-cv',
  'Computer Vision',
  'SUBJECT',
  'cse-year-4',
  5,
  true
);

-- Chapters for CV
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-pe3-cv-ch1', 'Image Formation and Camera Models', 'CHAPTER', 'cse-s7-pe3-cv', 1, true),
('cse-s7-pe3-cv-ch2', 'Image Processing and Features', 'CHAPTER', 'cse-s7-pe3-cv', 2, true),
('cse-s7-pe3-cv-ch3', 'Recognition and Detection', 'CHAPTER', 'cse-s7-pe3-cv', 3, true),
('cse-s7-pe3-cv-ch4', 'Deep Vision Architectures', 'CHAPTER', 'cse-s7-pe3-cv', 4, true),
('cse-s7-pe3-cv-ch5', '3D Vision and Geometry', 'CHAPTER', 'cse-s7-pe3-cv', 5, true),
('cse-s7-pe3-cv-ch6', 'Applications and Evaluation', 'CHAPTER', 'cse-s7-pe3-cv', 6, true);

-- Topics for CV
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-pe3-cv-ch1-t1', 'Camera Projections', 'TOPIC', 'cse-s7-pe3-cv-ch1', 1, true),
('cse-s7-pe3-cv-ch1-t2', 'Camera Calibration', 'TOPIC', 'cse-s7-pe3-cv-ch1', 2, true),
('cse-s7-pe3-cv-ch1-t3', 'Lens Distortion', 'TOPIC', 'cse-s7-pe3-cv-ch1', 3, true),
('cse-s7-pe3-cv-ch1-t4', 'Perspective Transformation', 'TOPIC', 'cse-s7-pe3-cv-ch1', 4, true);

-- Open Elective I - AR/VR
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s7-oe1-arvr',
  'Augmented and Virtual Reality',
  'SUBJECT',
  'cse-year-4',
  6,
  true
);

-- Chapters for AR/VR
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s7-oe1-arvr-ch1', 'Visual Computing Foundations', 'CHAPTER', 'cse-s7-oe1-arvr', 1, true),
('cse-s7-oe1-arvr-ch2', 'Tracking and Pose Estimation', 'CHAPTER', 'cse-s7-oe1-arvr', 2, true),
('cse-s7-oe1-arvr-ch3', 'Interaction and UX for XR', 'CHAPTER', 'cse-s7-oe1-arvr', 3, true),
('cse-s7-oe1-arvr-ch4', 'AR Frameworks and Toolchains', 'CHAPTER', 'cse-s7-oe1-arvr', 4, true),
('cse-s7-oe1-arvr-ch5', 'VR Systems and Content', 'CHAPTER', 'cse-s7-oe1-arvr', 5, true),
('cse-s7-oe1-arvr-ch6', 'Deployment and Ethics', 'CHAPTER', 'cse-s7-oe1-arvr', 6, true);

-- Topics for AR/VR
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s7-oe1-arvr-ch1-t1', 'Rendering Pipeline', 'TOPIC', 'cse-s7-oe1-arvr-ch1', 1, true),
('cse-s7-oe1-arvr-ch1-t2', 'Shaders and Graphics Programming', 'TOPIC', 'cse-s7-oe1-arvr-ch1', 2, true),
('cse-s7-oe1-arvr-ch1-t3', '3D Graphics Fundamentals', 'TOPIC', 'cse-s7-oe1-arvr-ch1', 3, true),
('cse-s7-oe1-arvr-ch1-t4', 'Real-Time Rendering', 'TOPIC', 'cse-s7-oe1-arvr-ch1', 4, true);

-- ============================================================================
-- SEMESTER 8 SUBJECTS
-- ============================================================================

-- DevOps and MLOps
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s8-devops',
  'DevOps and MLOps',
  'SUBJECT',
  'cse-year-4',
  7,
  true
);

-- Chapters for DevOps
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s8-devops-ch1', 'Continuous Integration and Delivery', 'CHAPTER', 'cse-s8-devops', 1, true),
('cse-s8-devops-ch2', 'Infrastructure as Code and Containers', 'CHAPTER', 'cse-s8-devops', 2, true),
('cse-s8-devops-ch3', 'Observability and Reliability', 'CHAPTER', 'cse-s8-devops', 3, true),
('cse-s8-devops-ch4', 'Security and Compliance in CI/CD', 'CHAPTER', 'cse-s8-devops', 4, true),
('cse-s8-devops-ch5', 'MLOps Lifecycle and Model Management', 'CHAPTER', 'cse-s8-devops', 5, true),
('cse-s8-devops-ch6', 'Serving, Monitoring, and Governance', 'CHAPTER', 'cse-s8-devops', 6, true);

-- Topics for DevOps
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s8-devops-ch1-t1', 'CI/CD Pipelines', 'TOPIC', 'cse-s8-devops-ch1', 1, true),
('cse-s8-devops-ch1-t2', 'Build Artifacts', 'TOPIC', 'cse-s8-devops-ch1', 2, true),
('cse-s8-devops-ch1-t3', 'Deployment Environments', 'TOPIC', 'cse-s8-devops-ch1', 3, true),
('cse-s8-devops-ch1-t4', 'Continuous Testing', 'TOPIC', 'cse-s8-devops-ch1', 4, true);

-- Entrepreneurship and IPR
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s8-entrep',
  'Entrepreneurship and IPR',
  'SUBJECT',
  'cse-year-4',
  8,
  true
);

-- Chapters for Entrepreneurship
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s8-entrep-ch1', 'Opportunity Discovery and Validation', 'CHAPTER', 'cse-s8-entrep', 1, true),
('cse-s8-entrep-ch2', 'Business Models and Strategy', 'CHAPTER', 'cse-s8-entrep', 2, true),
('cse-s8-entrep-ch3', 'Product Management and Roadmaps', 'CHAPTER', 'cse-s8-entrep', 3, true),
('cse-s8-entrep-ch4', 'Financing and Growth', 'CHAPTER', 'cse-s8-entrep', 4, true),
('cse-s8-entrep-ch5', 'Intellectual Property and Legal', 'CHAPTER', 'cse-s8-entrep', 5, true),
('cse-s8-entrep-ch6', 'Tech Venture Case Studies', 'CHAPTER', 'cse-s8-entrep', 6, true);

-- Topics for Entrepreneurship
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s8-entrep-ch1-t1', 'Problem-Solution Fit', 'TOPIC', 'cse-s8-entrep-ch1', 1, true),
('cse-s8-entrep-ch1-t2', 'Jobs-To-Be-Done Framework', 'TOPIC', 'cse-s8-entrep-ch1', 2, true),
('cse-s8-entrep-ch1-t3', 'Customer Discovery', 'TOPIC', 'cse-s8-entrep-ch1', 3, true),
('cse-s8-entrep-ch1-t4', 'Market Validation', 'TOPIC', 'cse-s8-entrep-ch1', 4, true);

-- Professional Ethics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s8-ethics',
  'Professional Ethics and Social Responsibility',
  'SUBJECT',
  'cse-year-4',
  9,
  true
);

-- Chapters for Ethics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s8-ethics-ch1', 'Ethical Theories and Decision Frameworks', 'CHAPTER', 'cse-s8-ethics', 1, true),
('cse-s8-ethics-ch2', 'Data Privacy and Governance', 'CHAPTER', 'cse-s8-ethics', 2, true),
('cse-s8-ethics-ch3', 'Responsible AI and Fairness', 'CHAPTER', 'cse-s8-ethics', 3, true),
('cse-s8-ethics-ch4', 'Cyber Ethics and Digital Rights', 'CHAPTER', 'cse-s8-ethics', 4, true),
('cse-s8-ethics-ch5', 'Sustainability in Technology', 'CHAPTER', 'cse-s8-ethics', 5, true),
('cse-s8-ethics-ch6', 'Professional Conduct and Leadership', 'CHAPTER', 'cse-s8-ethics', 6, true);

-- Topics for Ethics
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s8-ethics-ch1-t1', 'Deontological Ethics', 'TOPIC', 'cse-s8-ethics-ch1', 1, true),
('cse-s8-ethics-ch1-t2', 'Consequentialism', 'TOPIC', 'cse-s8-ethics-ch1', 2, true),
('cse-s8-ethics-ch1-t3', 'Virtue Ethics', 'TOPIC', 'cse-s8-ethics-ch1', 3, true),
('cse-s8-ethics-ch1-t4', 'Ethical Decision Making', 'TOPIC', 'cse-s8-ethics-ch1', 4, true);

-- Open Elective II - Edge Computing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s8-oe2-edge',
  'Edge Computing',
  'SUBJECT',
  'cse-year-4',
  10,
  true
);

-- Chapters for Edge Computing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s8-oe2-edge-ch1', 'Edge Architectures and Orchestration', 'CHAPTER', 'cse-s8-oe2-edge', 1, true),
('cse-s8-oe2-edge-ch2', 'Edge AI and Acceleration', 'CHAPTER', 'cse-s8-oe2-edge', 2, true),
('cse-s8-oe2-edge-ch3', 'Scheduling and Resource Management', 'CHAPTER', 'cse-s8-oe2-edge', 3, true),
('cse-s8-oe2-edge-ch4', 'Data Management at the Edge', 'CHAPTER', 'cse-s8-oe2-edge', 4, true),
('cse-s8-oe2-edge-ch5', 'Security and Trust at the Edge', 'CHAPTER', 'cse-s8-oe2-edge', 5, true),
('cse-s8-oe2-edge-ch6', 'Use Cases and Benchmarks', 'CHAPTER', 'cse-s8-oe2-edge', 6, true);

-- Topics for Edge Computing
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s8-oe2-edge-ch1-t1', 'Multi-Access Edge Computing', 'TOPIC', 'cse-s8-oe2-edge-ch1', 1, true),
('cse-s8-oe2-edge-ch1-t2', 'K3s and Lightweight Kubernetes', 'TOPIC', 'cse-s8-oe2-edge-ch1', 2, true),
('cse-s8-oe2-edge-ch1-t3', 'Function Offloading', 'TOPIC', 'cse-s8-oe2-edge-ch1', 3, true),
('cse-s8-oe2-edge-ch1-t4', 'Edge Orchestration', 'TOPIC', 'cse-s8-oe2-edge-ch1', 4, true);

-- Capstone Project
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active)
VALUES (
  'cse-s8-capstone',
  'Capstone Project',
  'SUBJECT',
  'cse-year-4',
  11,
  true
);

-- Chapters for Capstone
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
('cse-s8-capstone-ch1', 'Problem Definition and Literature Survey', 'CHAPTER', 'cse-s8-capstone', 1, true),
('cse-s8-capstone-ch2', 'Requirements and System Design', 'CHAPTER', 'cse-s8-capstone', 2, true),
('cse-s8-capstone-ch3', 'Implementation Planning and Iterations', 'CHAPTER', 'cse-s8-capstone', 3, true),
('cse-s8-capstone-ch4', 'Verification, Validation, and Testing', 'CHAPTER', 'cse-s8-capstone', 4, true),
('cse-s8-capstone-ch5', 'Documentation and Presentation', 'CHAPTER', 'cse-s8-capstone', 5, true),
('cse-s8-capstone-ch6', 'Deployment and Impact Assessment', 'CHAPTER', 'cse-s8-capstone', 6, true);

-- Topics for Capstone
INSERT INTO hierarchy_nodes (id, title, type, parent_id, order_index, is_active) VALUES
-- Chapter 1 topics
('cse-s8-capstone-ch1-t1', 'Problem Scoping', 'TOPIC', 'cse-s8-capstone-ch1', 1, true),
('cse-s8-capstone-ch1-t2', 'Novelty Assessment', 'TOPIC', 'cse-s8-capstone-ch1', 2, true),
('cse-s8-capstone-ch1-t3', 'Literature Review', 'TOPIC', 'cse-s8-capstone-ch1', 3, true),
('cse-s8-capstone-ch1-t4', 'Prior Art Analysis', 'TOPIC', 'cse-s8-capstone-ch1', 4, true);

-- ============================================================================
-- Success Message
-- ============================================================================
SELECT 'Part 2 (Semesters 5-8) populated successfully!' as message;
SELECT 'Complete CSE hierarchy with 4 years, 8 semesters, and 48 subjects is now ready!' as message;
