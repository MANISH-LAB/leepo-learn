
export type NodeType = "DEGREE" | "YEAR" | "SUBJECT" | "CHAPTER" | "TOPIC";

export interface Node {
  id: string;
  title: string;
  type: NodeType;
  children?: Node[];
  // Content properties
  iconUrl?: string; // New field for icon/logo
  videoUrl?: string;
  videoUrlHindi?: string;
  duration?: string;
  audioUrl?: string;
  audioUrlHindi?: string;
  pdfUrl?: string;
  isPremium?: boolean;
  isActive?: boolean; // Controls visibility to students
  interactiveContent?: string;
  assessment?: {
    questions: {
      id: string;
      text: string;
      options: string[];
      correctAnswer: number;
    }[];
  };
  // User progress (Mock)
  progress?: number;
  lastAccessed?: string; // ISO string
  // Metadata for counts without loading all children
  metadata?: {
    topicCount?: number;
    chapterCount?: number;
    [key: string]: any;
  };
}

export const initialTree: Node[] = [
  {
    id: "1",
    title: "Computer Science Engineering",
    type: "DEGREE",
    children: [
      {
        id: "1-1",
        title: "1st Year",
        type: "YEAR",
        children: [
          {
            id: "1-1-1",
            title: "Engineering Mathematics I",
            type: "SUBJECT",
            progress: 33,
            lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            children: [
              {
                id: "1-1-1-1",
                title: "Matrices",
                type: "CHAPTER",
                lastAccessed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                assessment: {
                  questions: [
                    {
                      id: "q1",
                      text: "What is the determinant of a 2x2 identity matrix?",
                      options: ["0", "1", "2", "-1"],
                      correctAnswer: 1
                    },
                    {
                      id: "q2",
                      text: "Which of the following is a condition for a matrix to be invertible?",
                      options: ["Determinant is zero", "Matrix is square", "Determinant is non-zero", "Matrix is diagonal"],
                      correctAnswer: 2
                    }
                  ]
                },
                children: [
                  {
                    id: "1-1-1-1-1",
                    title: "Introduction to Matrices",
                    type: "TOPIC",
                    videoUrl: "https://example.com/video1",
                    isPremium: false,
                  },
                  {
                    id: "1-1-1-1-2",
                    title: "Types of Matrices",
                    type: "TOPIC",
                    videoUrl: "https://example.com/video2",
                    isPremium: false,
                  }
                ]
              },
              {
                id: "1-1-1-2",
                title: "Calculus",
                type: "CHAPTER",
                children: [
                    {
                        id: "1-1-1-2-1",
                        title: "Limits and Continuity",
                        type: "TOPIC",
                    }
                ]
              }
            ]
          },
          {
             id: "1-1-2",
             title: "Engineering Physics",
             type: "SUBJECT",
             progress: 15,
             lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
             children: []
          }
        ]
      },
      {
        id: "1-2",
        title: "2nd Year",
        type: "YEAR",
        children: []
      }
    ]
  },
  {
      id: "2",
      title: "Mechanical Engineering",
      type: "DEGREE",
      children: []
  }
];
