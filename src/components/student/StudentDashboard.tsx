import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CourseBrowser } from "./CourseBrowser";
import { FullDashboard } from "./FullDashboard";
import { Node } from "../../utils/sharedData";
import { ContinueLearningData } from "../../utils/continueLearning";

interface StudentDashboardProps {
  courseData: Node[];
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  streak?: number;
  xp?: number;
  maxStreak?: number;
  avgScore?: number;
  continueLearning?: ContinueLearningData | null;
  onXPUpdate?: () => void;
}

export function StudentDashboard({ courseData, user, streak = 0, xp = 0, maxStreak = 0, avgScore = 0, continueLearning, onXPUpdate }: StudentDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'dashboard' | 'courses'>('courses'); // Default to courses view
  const [resumeTarget, setResumeTarget] = useState<{ subjectId: string; chapterId: string; topicId: string } | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState<string | null>(null);

  console.log('📱 StudentDashboard props:', { user: user?.email, streak, xp, avgScore });

  // Check URL parameter on mount to see if we should show dashboard
  useEffect(() => {
    if (searchParams.get('view') === 'dashboard') {
      console.log('📊 Dashboard view requested');
      setView('dashboard');
    }
  }, [searchParams]);

  // Show full dashboard only when explicitly requested
  if (view === 'dashboard') {
    console.log('🎬 Rendering FullDashboard with onResumeToTopic callback');
    return (
      <FullDashboard
        onNavigate={(path) => {
          if (path === 'courses') {
            console.log('🔀 Navigating to courses (no target)');
            setView('courses');
            setSearchParams({}); // Clear URL params
          } else if (path.startsWith('/subject/')) {
            // Handle subject navigation from accessible subjects
            const subjectId = path.replace('/subject/', '');
            console.log('🔀 Navigating to subject:', subjectId);
            setTargetSubjectId(subjectId);
            setView('courses');
            setSearchParams({}); // Clear URL params
          }
        }}
        user={user}
        streak={streak}
        xp={xp}
        maxStreak={maxStreak}
        avgScore={avgScore}
        onResumeToTopic={(subjectId, chapterId, topicId) => {
          console.log('🎯 StudentDashboard: Setting resume target:', { subjectId, chapterId, topicId });
          setResumeTarget({ subjectId, chapterId, topicId });
          console.log('🔀 StudentDashboard: Switching to courses view');
          setView('courses');
          setSearchParams({}); // Clear URL params
        }}
      />
    );
  }

  // Show course browser by default
  console.log('🎬 Rendering CourseBrowser with resumeTarget:', resumeTarget, 'targetSubjectId:', targetSubjectId);
  return (
    <CourseBrowser
      courseData={courseData}
      user={user}
      streak={streak}
      xp={xp}
      maxStreak={maxStreak}
      avgScore={avgScore}
      continueLearning={continueLearning}
      onViewDashboard={() => {
        setView('dashboard');
        setSearchParams({ view: 'dashboard' }); // Set URL param
      }}
      onXPUpdate={onXPUpdate}
      autoNavigateTarget={resumeTarget}
      onAutoNavigateComplete={() => {
        console.log('✅ Auto-navigation complete, clearing target');
        setResumeTarget(null);
      }}
      targetSubjectId={targetSubjectId}
      onSubjectNavigationComplete={() => {
        console.log('✅ Subject navigation complete, clearing target');
        setTargetSubjectId(null);
      }}
    />
  );
}
