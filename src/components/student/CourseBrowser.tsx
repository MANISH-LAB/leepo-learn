import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CourseView } from "./CourseView";
import { FullDashboard } from "./FullDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import {
  BookOpen,
  Clock,
  ChevronRight,
  Search,
  GraduationCap,
  CalendarDays,
  ArrowLeft,
  Loader2,
  Info
} from "lucide-react";

import { Node } from "../../utils/sharedData";
import { formatTimeAgo } from "../../utils/timeUtils";
import { ContinueLearningData } from "../../utils/continueLearning";
import * as db from "../../utils/supabase/database";
import { useIsMobile } from "../ui/use-mobile";
import { buildCoursePath } from "../../utils/slugify";
import {
  fetchDashboardStats,
  fetchResumePoint,
  type DashboardStats,
  type ResumePoint,
} from "../../utils/dashboardHelpers";

// Types
type BrowsingLevel = "DEGREE" | "YEAR" | "SUBJECT" | "CHAPTERS";

interface CourseBrowserProps {
  courseData: Node[];
  onSubjectSelect?: (subjectId: string) => void;
  initialLevel?: BrowsingLevel;
  onViewDashboard?: () => void;
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
  autoNavigateTarget?: { subjectId: string; chapterId: string; topicId: string } | null;
  onAutoNavigateComplete?: () => void;
}

export function CourseBrowser({ courseData, onSubjectSelect, initialLevel = "DEGREE", onViewDashboard, user, streak = 0, xp = 0, maxStreak = 0, avgScore = 0, continueLearning, onXPUpdate, autoNavigateTarget, onAutoNavigateComplete }: CourseBrowserProps) {
  const isMobile = useIsMobile();
  const params = useParams<{ degreeSlug?: string; subjectSlug?: string; chapterSlug?: string; topicSlug?: string }>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<BrowsingLevel>(initialLevel);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard data from database
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [resumePoint, setResumePoint] = useState<ResumePoint | null>(null);
  const [localContinueLearning, setLocalContinueLearning] = useState<db.ContinueLearningData | null>(null);

  // Selection History for Breadcrumbs
  const [selectedDegree, setSelectedDegree] = useState<Node | null>(null);
  const [selectedYear, setSelectedYear] = useState<Node | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Node | null>(null);

  // Local resume target for embedded dashboard
  const [localResumeTarget, setLocalResumeTarget] = useState<{ subjectId: string; chapterId: string; topicId: string } | null>(null);

  // Fetch continue learning data for collapsed dashboard cards
  useEffect(() => {
    const loadContinueLearning = async () => {
      if (user?.id) {
        const continueData = await db.getContinueLearning(user.id);
        setLocalContinueLearning(continueData);
      }
    };

    loadContinueLearning();
  }, [user?.id]);

  // Sync state with URL parameters (for direct links and back/forward navigation)
  useEffect(() => {
    const syncWithURL = async () => {
      // Skip if auto-navigate is active (it handles its own navigation)
      if (autoNavigateTarget || localResumeTarget) return;

      // Skip if no course data loaded yet
      if (courseData.length === 0) return;

      const { degreeSlug, subjectSlug } = params;

      // If no params, show degree selection
      if (!degreeSlug) {
        if (level !== "DEGREE") {
          setLevel("DEGREE");
          setSelectedDegree(null);
          setSelectedYear(null);
          setSelectedSubject(null);
        }
        return;
      }

      try {
        setIsLoading(true);

        // Find degree by slug
        const degree = courseData.find(d => d.slug === degreeSlug);
        if (!degree) {
          console.error(`Degree not found for slug: ${degreeSlug}`);
          navigate('/courses');
          return;
        }

        // Load years for this degree
        const years = await db.fetchYearsForDegree(degree.id);
        const updatedDegree = { ...degree, children: years };
        setSelectedDegree(updatedDegree);

        // If we have a subject slug, navigate to subject view
        if (subjectSlug) {
          // Search for subject across all years
          let foundSubject: Node | null = null;
          let foundYear: Node | null = null;

          for (const year of years) {
            const subjects = await db.fetchSubjectsForYear(year.id, user?.id);
            foundSubject = subjects.find(s => s.slug === subjectSlug) || null;
            if (foundSubject) {
              foundYear = { ...year, children: subjects };
              break;
            }
          }

          if (!foundSubject || !foundYear) {
            console.error(`Subject not found for slug: ${subjectSlug}`);
            setLevel("YEAR");
            return;
          }

          // Load chapters for the subject
          const chapters = await db.fetchChaptersForSubject(foundSubject.id);
          const updatedSubject = { ...foundSubject, children: chapters };

          setSelectedYear(foundYear);
          setSelectedSubject(updatedSubject);
          setLevel("CHAPTERS");
        } else {
          // Just show years for the degree
          setLevel("YEAR");
          setSelectedYear(null);
          setSelectedSubject(null);
        }
      } catch (error) {
        console.error('Error syncing with URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncWithURL();
  }, [params.degreeSlug, params.subjectSlug, courseData.length]);

  // Auto-navigate to topic when resume target is set
  useEffect(() => {
    // Use either prop or local resume target
    const effectiveResumeTarget = autoNavigateTarget || localResumeTarget;

    if (!effectiveResumeTarget) {
      console.log('⏸️ No auto-navigate target set');
      return;
    }

    if (courseData.length === 0) {
      console.log('⏸️ Waiting for course data to load...');
      return;
    }

    console.log('🎯 Auto-navigating to topic:', effectiveResumeTarget);
    console.log('📦 Course data available:', courseData.length, 'degrees');

    const navigateToTarget = async () => {
      setIsLoading(true);
      try {
        // Step 1: Find the degree
        const degree = courseData[0];
        if (!degree) {
          console.log('⚠️ No degree found');
          return;
        }
        console.log('✅ Found degree:', degree.title);

        // Step 2: Load years for this degree
        const years = await db.fetchYearsForDegree(degree.id);
        console.log('✅ Loaded', years.length, 'years');

        // Step 3: Find the year that contains our subject
        let targetYear = null;
        let targetSubject = null;

        for (const year of years) {
          const subjects = await db.fetchSubjectsForYear(year.id, user?.id);
          console.log('✅ Loaded', subjects.length, 'subjects for year:', year.title);

          targetSubject = subjects.find(s => s.id === effectiveResumeTarget.subjectId);
          if (targetSubject) {
            targetYear = { ...year, children: subjects };
            console.log('✅ Found target subject:', targetSubject.title, 'in year:', year.title);
            break;
          }
        }

        if (!targetYear || !targetSubject) {
          console.log('⚠️ Could not find subject:', effectiveResumeTarget.subjectId);
          return;
        }

        // Step 4: Load chapters for the subject (just like clicking a subject card)
        console.log('📚 Loading chapters for subject:', targetSubject.title);
        const chapters = await db.fetchChaptersForSubject(targetSubject.id);
        console.log('✅ Loaded', chapters.length, 'chapters');

        // Update the subject node with loaded children
        const updatedSubject = { ...targetSubject, children: chapters };

        // Step 5: Set all the states to navigate to the subject's chapters view
        const updatedDegree = { ...degree, children: years };
        setSelectedDegree(updatedDegree);
        setSelectedYear(targetYear);
        setSelectedSubject(updatedSubject); // Now includes chapters
        setLevel("CHAPTERS");
        setIsDashboardExpanded(false);

        console.log('✅ Navigation complete! Showing', chapters.length, 'chapters for:', targetSubject.title);

        // Scroll to top after navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Clear local resume target after navigation
        if (localResumeTarget) {
          setLocalResumeTarget(null);
        }

        // Notify parent that auto-navigation is complete (for prop-based targets)
        if (onAutoNavigateComplete && autoNavigateTarget) {
          onAutoNavigateComplete();
        }
      } catch (error) {
        console.error('❌ Error during auto-navigation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    navigateToTarget();
  }, [autoNavigateTarget, localResumeTarget, courseData]);

  // Resume course handler
  const handleResumeCourse = () => {
    if (!continueLearning) return;

    // Navigate to the subject that was being studied
    // Find the degree, year, and subject from the course data based on subject ID
    for (const degree of courseData) {
      for (const year of degree.children || []) {
        const subject = (year.children || []).find(s => s.id === continueLearning.subjectId);
        if (subject) {
          setSelectedDegree(degree);
          setSelectedYear(year);
          setSelectedSubject(subject);
          setLevel("CHAPTERS");
          setIsDashboardExpanded(false);

          // Scroll to top after navigation
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }
  };

  // Derive lists from state
  const degrees = courseData || [];
  const years = selectedDegree?.children || [];
  const subjects = selectedYear?.children || [];

  const handleDegreeClick = async (degree: Node) => {
    setIsLoading(true);
    try {
      // Fetch years for this degree
      const years = await db.fetchYearsForDegree(degree.id);

      // Update the degree node with loaded children
      const updatedDegree = { ...degree, children: years };

      setSelectedDegree(updatedDegree);
      setLevel("YEAR");
      setSearchQuery("");

      // Navigate to hierarchical URL
      if (degree.slug) {
        navigate(buildCoursePath(degree.slug));
      }
    } catch (error) {
      console.error("Error loading years:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearClick = async (year: Node) => {
    setIsLoading(true);
    try {
      // Fetch subjects for this year with progress (if user is logged in)
      const subjects = await db.fetchSubjectsForYear(year.id, user?.id);

      // Update the year node with loaded children
      const updatedYear = { ...year, children: subjects };

      setSelectedYear(updatedYear);
      setLevel("SUBJECT");
      setSearchQuery("");

      // Year selection updates state but URL stays at degree level
      // (following user's preferred structure: degree/subject/chapter/topic)
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = async (subject: Node) => {
    setIsLoading(true);
    try {
      // Fetch chapters for this subject
      const chapters = await db.fetchChaptersForSubject(subject.id);

      // Update the subject node with loaded children
      const updatedSubject = { ...subject, children: chapters };

      setSelectedSubject(updatedSubject);
      setLevel("CHAPTERS");
      setSearchQuery("");

      // Navigate to hierarchical URL: /courses/:degreeSlug/:subjectSlug
      if (selectedDegree?.slug && subject.slug) {
        navigate(buildCoursePath(selectedDegree.slug, subject.slug));
      }

      if (onSubjectSelect) {
        onSubjectSelect(subject.id);
      }
    } catch (error) {
      console.error("Error loading chapters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (level === "CHAPTERS") {
        setLevel("SUBJECT");
        setSelectedSubject(null);
        // Navigate back to degree level (year/subject selection)
        if (selectedDegree?.slug) {
          navigate(buildCoursePath(selectedDegree.slug));
        }
    } else if (level === "SUBJECT") {
      setLevel("YEAR");
      setSelectedYear(null);
      // Stay at degree level URL
    } else if (level === "YEAR") {
      setLevel("DEGREE");
      setSelectedDegree(null);
      // Navigate back to courses home
      navigate('/courses');
    }
  };

  const navigateToLevel = (targetLevel: BrowsingLevel) => {
    if (targetLevel === "DEGREE") {
      setLevel("DEGREE");
      setSelectedDegree(null);
      setSelectedYear(null);
      setSelectedSubject(null);
      navigate('/courses');
    } else if (targetLevel === "YEAR" && selectedDegree) {
      setLevel("YEAR");
      setSelectedYear(null);
      setSelectedSubject(null);
      if (selectedDegree.slug) {
        navigate(buildCoursePath(selectedDegree.slug));
      }
    } else if (targetLevel === "SUBJECT" && selectedYear) {
        setLevel("SUBJECT");
        setSelectedSubject(null);
        // Stay at degree level URL (year selection doesn't change URL)
    }
  };

  // Filter Logic
  const filteredDegrees = degrees.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredYears = years.filter(y => 
    y.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">

      {/* Student Command Center - Hidden when in Course View */}
      {level !== "CHAPTERS" && (
      <div className="bg-yellow-50 p-4 md:p-6 rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
           <div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Leepo Learn</h1>
             <p className="text-sm md:text-base text-slate-600 font-medium mt-1">
               {user?.name ? `Welcome back, ${user.name}!` : "Welcome back!"} Your AI-powered learning companion.
             </p>
           </div>
           {user && (
             <Button onClick={() => setIsDashboardExpanded(!isDashboardExpanded)} className="w-full md:w-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
               {isDashboardExpanded ? "Collapse Dashboard" : "View Full Dashboard"}
             </Button>
           )}
        </div>
        
        {isDashboardExpanded && user ? (
           <div className="bg-white rounded-xl border-2 border-black p-1 md:p-4 animate-in slide-in-from-top-4 duration-500">
              <FullDashboard
                onNavigate={() => setIsDashboardExpanded(false)}
                user={user}
                streak={streak}
                xp={xp}
                maxStreak={maxStreak}
                avgScore={avgScore}
                onResumeToTopic={(subjectId, chapterId, topicId) => {
                  console.log('🎯 CourseBrowser: Setting local resume target:', { subjectId, chapterId, topicId });
                  setLocalResumeTarget({ subjectId, chapterId, topicId });
                  setIsDashboardExpanded(false);
                }}
                continueLearning={continueLearning ? {
                  subjectTitle: continueLearning.subjectTitle,
                  chapterTitle: continueLearning.chapterTitle,
                  topicTitle: continueLearning.topicTitle,
                  completedTopicsInChapter: continueLearning.completedTopicsInChapter,
                  totalTopicsInChapter: continueLearning.totalTopicsInChapter
                } : null}
                onResumeCourse={handleResumeCourse}
              />
           </div>
        ) : (
        <div className="grid gap-4 md:grid-cols-3 animate-in fade-in duration-300">
             <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold text-slate-500 flex items-center justify-between">
                     <span>Overall Progress</span>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                       </TooltipTrigger>
                       <TooltipContent className="max-w-xs bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                         <p className="font-medium">Progress is calculated only for subjects you own or have access to.</p>
                       </TooltipContent>
                     </Tooltip>
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-black">{stats?.overall_completion_percentage || 0}%</div>
                   <Progress value={stats?.overall_completion_percentage || 0} className="h-3 mt-2 border border-black bg-gray-100 [&>div]:bg-green-500" />
                   <p className="text-xs text-slate-500 font-medium mt-1">
                     {stats?.completed_topics_count || 0} of {stats?.total_topics_count || 0} topics
                   </p>
                </CardContent>
             </Card>
             <Card
                className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${localContinueLearning ? 'cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all' : ''}`}
                onClick={async () => {
                  if (localContinueLearning && courseData.length > 0) {
                    // Navigate to subject's chapters view
                    setIsLoading(true);
                    try {
                      const degree = courseData[0];
                      const years = await db.fetchYearsForDegree(degree.id);

                      // Find the year containing this subject
                      let targetYear = null;
                      let targetSubject = null;

                      for (const year of years) {
                        const subjects = await db.fetchSubjectsForYear(year.id, user?.id);
                        targetSubject = subjects.find(s => s.id === localContinueLearning.subject_id);
                        if (targetSubject) {
                          targetYear = { ...year, children: subjects };
                          break;
                        }
                      }

                      if (targetSubject && targetYear) {
                        const chapters = await db.fetchChaptersForSubject(targetSubject.id);
                        const updatedSubject = { ...targetSubject, children: chapters };

                        setSelectedDegree({ ...degree, children: years });
                        setSelectedYear(targetYear);
                        setSelectedSubject(updatedSubject);
                        setLevel("CHAPTERS");
                        setIsDashboardExpanded(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    } catch (error) {
                      console.error("Error navigating to subject:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
             >
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold text-slate-500">Active Subject</CardTitle>
                </CardHeader>
                <CardContent>
                   {localContinueLearning ? (
                     <div>
                        <div className="font-bold text-lg truncate text-white hover:text-gray-200 bg-black px-3 py-2 rounded-lg inline-block border-2 border-black">{localContinueLearning.subject_title}</div>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-500">No active subject</p>
                   )}
                </CardContent>
             </Card>
             <Card
                className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${localContinueLearning ? 'cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all' : ''}`}
                onClick={async () => {
                  if (localContinueLearning && courseData.length > 0) {
                    // Navigate to parent chapter view (showing all topics in the chapter)
                    setIsLoading(true);
                    try {
                      const degree = courseData[0];
                      const years = await db.fetchYearsForDegree(degree.id);

                      // Find the year and subject containing this topic
                      let targetYear = null;
                      let targetSubject = null;

                      for (const year of years) {
                        const subjects = await db.fetchSubjectsForYear(year.id, user?.id);
                        targetSubject = subjects.find(s => s.id === localContinueLearning.subject_id);
                        if (targetSubject) {
                          targetYear = { ...year, children: subjects };
                          break;
                        }
                      }

                      if (targetSubject && targetYear) {
                        // Load chapters for the subject
                        const chapters = await db.fetchChaptersForSubject(targetSubject.id);
                        const updatedSubject = { ...targetSubject, children: chapters };

                        // Navigate to chapters view
                        setSelectedDegree({ ...degree, children: years });
                        setSelectedYear(targetYear);
                        setSelectedSubject(updatedSubject);
                        setLevel("CHAPTERS");
                        setIsDashboardExpanded(false);

                        // Scroll to top then trigger chapter click after navigation completes
                        window.scrollTo({ top: 0, behavior: 'smooth' });

                        // Small delay to ensure DOM is ready, then find and click the chapter
                        setTimeout(() => {
                          const chapterElement = document.querySelector(`[data-chapter-id="${localContinueLearning.chapter_id}"]`);
                          if (chapterElement instanceof HTMLElement) {
                            chapterElement.click();
                          }
                        }, 100);
                      }
                    } catch (error) {
                      console.error("Error navigating to chapter:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
             >
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold text-slate-500">Next Up</CardTitle>
                </CardHeader>
                <CardContent>
                   {localContinueLearning ? (
                     <div>
                        <div className="font-bold text-lg truncate text-white hover:text-gray-200 bg-black px-3 py-2 rounded-lg inline-block border-2 border-black">{localContinueLearning.topic_title}</div>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-500">No recent activity</p>
                   )}
                </CardContent>
             </Card>
        </div>
        )}
      </div>
      )}

      {/* Main Content Area */}
      {!isDashboardExpanded && (
      <div>
        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             {isMobile ? (
               // Mobile: Show only current level
               level === "DEGREE" ? (
                 <div className="px-3 py-1 bg-blue-100 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm whitespace-nowrap">
                   Select Degree
                 </div>
               ) : level === "YEAR" ? (
                 <div className="px-3 py-1 rounded-md text-sm font-bold border-2 bg-blue-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black whitespace-nowrap">
                   {selectedDegree?.title}
                 </div>
               ) : (
                 <div className="px-3 py-1 rounded-md text-sm font-bold border-2 bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black whitespace-nowrap">
                   {selectedYear?.title}
                 </div>
               )
             ) : (
               // Desktop: Show full breadcrumb
               <>
                 {level === "DEGREE" ? (
                   <div className="px-3 py-1 bg-blue-100 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm whitespace-nowrap">
                     Select Degree
                   </div>
                 ) : (
                   <>
                     <div
                       onClick={() => navigateToLevel("DEGREE")}
                       className="px-3 py-1 rounded-md text-sm font-bold border-2 border-transparent text-slate-500 cursor-pointer hover:bg-blue-100 hover:border-black hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap"
                     >
                       All Degrees
                     </div>
                     {selectedDegree && (
                       <>
                         <ChevronRight className="h-4 w-4 text-black shrink-0" />
                         <div
                           onClick={() => navigateToLevel("YEAR")}
                           className={`px-3 py-1 rounded-md text-sm font-bold border-2 transition-all whitespace-nowrap ${level === 'YEAR' ? 'bg-blue-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black cursor-default' : 'bg-transparent border-transparent text-slate-500 cursor-pointer hover:bg-blue-100 hover:border-black hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                         >
                           {selectedDegree.title}
                         </div>
                       </>
                     )}
                   </>
                 )}

                 {selectedYear && (
                   <>
                     <ChevronRight className="h-4 w-4 text-black shrink-0" />
                     <div
                       onClick={() => navigateToLevel("SUBJECT")}
                       className={`px-3 py-1 rounded-md text-sm font-bold border-2 transition-all whitespace-nowrap ${level === 'SUBJECT' ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black cursor-default' : 'bg-transparent border-transparent text-slate-500 cursor-pointer hover:bg-yellow-100 hover:border-black hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                     >
                       {selectedYear.title}
                     </div>
                   </>
                 )}
               </>
             )}
          </div>

          {level !== "DEGREE" && !(isMobile && level === "CHAPTERS") && (
            <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] font-bold bg-white text-black hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
              <p className="text-sm font-bold text-slate-600">Loading...</p>
            </div>
          </div>
        )}

        {/* Content Grids */}
        {!isLoading && level === "DEGREE" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDegrees.map((degree) => (
              <Card 
                key={degree.id} 
                className="group cursor-pointer bg-blue-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                onClick={() => handleDegreeClick(degree)}
              >
                <CardHeader>
                  <div className="mb-2">
                    <Badge variant="secondary" className="bg-white border-2 border-black text-black font-bold hover:bg-white">
                      Degree Program
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-blue-700 transition-colors flex items-center justify-between gap-2 font-black text-xl">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        {degree.title}
                    </div>
                    {degree.iconUrl && <img src={degree.iconUrl} alt="icon" className="h-8 w-8 object-contain" />}
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium">{degree.title} - Engineering</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm text-slate-600 font-semibold">
                        <span>Years</span>
                        <span>{degree.children?.length || 0} Years</span>
                     </div>
                     <div className="flex justify-between text-sm text-slate-600 font-semibold">
                        <span>Students</span>
                        <span>1200+ Enrolled</span>
                     </div>
                  </div>
                </CardContent>
                <CardFooter>
                   <Button className="w-full bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none group-hover:bg-black group-hover:text-white transition-all font-bold">
                     View Years <ChevronRight className="ml-2 h-4 w-4" />
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && level === "YEAR" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredYears.map((year) => (
              <Card 
                key={year.id} 
                className="group cursor-pointer bg-amber-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                onClick={() => handleYearClick(year)}
              >
                 <CardHeader>
                  <div className="mb-2">
                    <Badge variant="secondary" className="bg-white border-2 border-black text-black font-bold hover:bg-white">
                      Academic Year
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-amber-700 transition-colors flex items-center justify-between gap-2 font-black text-xl">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-6 w-6" />
                        {year.title}
                    </div>
                    {year.iconUrl && <img src={year.iconUrl} alt="icon" className="h-8 w-8 object-contain" />}
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium">Subjects and curriculum for {year.title}</CardDescription>
                </CardHeader>
                <CardFooter>
                   <Button className="w-full bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none group-hover:bg-black group-hover:text-white transition-all font-bold">
                     View Subjects <ChevronRight className="ml-2 h-4 w-4" />
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && level === "SUBJECT" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {filteredSubjects.map((subject) => {
               const progress = subject.progress || 0;
               const isStarted = progress > 0;
               const isCompleted = progress >= 100;

               return (
               <Card 
                 key={subject.id} 
                 className="group cursor-pointer bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                 onClick={() => handleSubjectClick(subject)}
               >
                 <CardHeader>
                   <div className="flex justify-between items-start mb-2">
                     <Badge variant="outline" className="mb-2 bg-purple-100 text-purple-700 border-2 border-black font-bold">
                       {subject.metadata?.chapterCount || subject.children?.length || 0} Chapters
                     </Badge>
                     {isStarted && !isCompleted && subject.lastAccessed && (
                        <div title="Last accessed time" className="flex items-center gap-1 text-xs font-bold text-slate-500 border-2 border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(subject.lastAccessed)}
                        </div>
                     )}
                   </div>
                   <CardTitle className="group-hover:text-purple-600 transition-colors font-black text-xl flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {subject.title}
                     </div>
                     {subject.iconUrl && <img src={subject.iconUrl} alt="icon" className="h-8 w-8 object-contain" />}
                   </CardTitle>
                   <CardDescription className="line-clamp-2 text-slate-600 font-medium">
                      Complete guide to {subject.title}
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-600 font-semibold">Progress</span>
                       <span className="font-bold">{progress}%</span>
                     </div>
                     <Progress value={progress} className="h-3 border border-black bg-gray-100 [&>div]:bg-purple-500" />
                   </div>
                 </CardContent>
                 <CardFooter>
                   <Button 
                     className={`w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold ${
                         isCompleted 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : isStarted 
                                ? "bg-purple-600 text-white hover:bg-purple-700" 
                                : "bg-white text-black group-hover:bg-black group-hover:text-white"
                     }`}
                   >
                     {isCompleted ? "Completed" : isStarted ? "Continue Learning" : "Start Course"}
                     <ChevronRight className="ml-2 h-4 w-4" />
                   </Button>
                 </CardFooter>
               </Card>
             );
             })}
          </div>
        )}

        {!isLoading && level === "CHAPTERS" && (() => {
          // Use either prop or local resume target
          const effectiveResumeTarget = autoNavigateTarget || localResumeTarget;

          return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CourseView
                  subjectNode={selectedSubject}
                  degreeNode={selectedDegree}
                  yearNode={selectedYear}
                  userId={user?.id}
                  onNavigate={(path) => {
                    if (path === "subject") navigateToLevel("SUBJECT");
                    if (path === "year") navigateToLevel("YEAR");
                    if (path === "degree") navigateToLevel("DEGREE");
                  }}
                  continueLearning={continueLearning && continueLearning.subjectId === selectedSubject?.id ? continueLearning : undefined}
                  onXPUpdate={onXPUpdate}
                  autoSelectChapterId={effectiveResumeTarget?.chapterId}
                  autoSelectTopicId={effectiveResumeTarget?.topicId}
                />
            </div>
          );
        })()}
      </div>
      )}
    </div>
  );
}