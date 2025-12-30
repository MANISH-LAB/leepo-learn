import { useEffect, useState } from "react";
import {
  Zap,
  Trophy,
  Smartphone,
  CheckCircle,
  BookOpen,
  Clock,
  MoreHorizontal,
  Flame,
  Award,
  ArrowRight,
  TrendingUp,
  Layout,
  Gem,
  Target,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  ArrowLeft
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner@2.0.3";
import { supabase } from "../../utils/supabase/client";
import { MobileAppModal } from "./MobileAppModal";
import { ContinueLearning } from "./ContinueLearning";
import {
  fetchUserDegrees,
  fetchDashboardStats,
  fetchAccessibleSubjects,
  fetchResumePoint,
  calculateProgressPercentage,
  formatLastAccessed,
  type DegreeContext,
  type DashboardStats,
  type SubjectProgress,
  type ResumePoint,
} from "../../utils/dashboardHelpers";

interface FullDashboardProps {
  onNavigate: (path: string) => void;
  onResumeToTopic?: (subjectId: string, chapterId: string, topicId: string) => void;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  streak?: number;
  xp?: number;
  maxStreak?: number;
  avgScore?: number;
}

export function FullDashboard({ onNavigate, onResumeToTopic, user, streak = 0, xp = 0, maxStreak = 0, avgScore = 0 }: FullDashboardProps) {
  console.log('🎯 FullDashboard component mounted!');
  console.log('📊 Props received:', { user: user?.email, streak, xp, avgScore });

  // Get first name from user
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST';

  // Database state
  const [loading, setLoading] = useState(true);
  console.log('⏳ Initial loading state:', loading);
  const [degrees, setDegrees] = useState<DegreeContext[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<string>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [resumePoint, setResumePoint] = useState<ResumePoint | null>(null);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);

  // Format XP for display
  const formatXP = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Load dashboard data on mount
  useEffect(() => {
    console.log('🚀 useEffect STARTED - fetching dashboard data');

    const loadDashboardData = async () => {
      console.log('💫 loadDashboardData function called');
      setLoading(true);

      // Set a timeout fallback - if data doesn't load in 3 seconds, show dashboard anyway
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout reached - showing dashboard with available data');
        setLoading(false);
      }, 3000);

      try {
        // Get user ID from the user prop instead of Supabase session
        const userId = user?.id;
        console.log('🔄 Loading dashboard data for user:', userId);

        if (!userId) {
          console.log('⚠️ No user ID found, skipping dashboard data fetch');
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        // Wrap each fetch in a timeout promise
        const fetchWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
          return Promise.race([promise, timeout]);
        };

        // Fetch degrees with timeout
        const degreesData = await fetchWithTimeout(fetchUserDegrees(userId), 2000) || [];
        console.log('📚 Degrees fetched:', degreesData);
        setDegrees(degreesData);

        // Auto-select degree if only one exists
        const initialDegree = degreesData.length === 1 ? degreesData[0].id : 'all';
        setSelectedDegree(initialDegree);

        // Fetch stats, subjects, and resume point with timeout
        const [statsData, subjectsData, resumeData] = await Promise.all([
          fetchWithTimeout(fetchDashboardStats(userId, initialDegree), 2000),
          fetchWithTimeout(fetchAccessibleSubjects(userId, initialDegree), 2000),
          fetchWithTimeout(fetchResumePoint(userId, initialDegree), 2000),
        ]);

        console.log('📊 Stats:', statsData);
        console.log('📖 Subjects:', subjectsData);
        console.log('▶️ Resume point:', resumeData);

        setStats(statsData || null);
        setSubjects(subjectsData || []);
        setResumePoint(resumeData || null);

        clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        clearTimeout(timeoutId);
      } finally {
        console.log('✅ Loading complete');
        setLoading(false);
      }
    };

    try {
      console.log('🎬 About to call loadDashboardData()');
      loadDashboardData();
      console.log('🎬 loadDashboardData() called successfully');
    } catch (error) {
      console.error('💥 Error in useEffect:', error);
      setLoading(false);
    }
  }, [user]);

  // Reload data when degree selection changes
  useEffect(() => {
    if (selectedDegree === (degrees.length === 1 ? degrees[0].id : 'all')) return;

    const reloadData = async () => {
      const userId = user?.id;
      if (!userId) return;

      const [statsData, subjectsData, resumeData] = await Promise.all([
        fetchDashboardStats(userId, selectedDegree),
        fetchAccessibleSubjects(userId, selectedDegree),
        fetchResumePoint(userId, selectedDegree),
      ]);

      setStats(statsData);
      setSubjects(subjectsData);
      setResumePoint(resumeData);
    };

    reloadData();
  }, [selectedDegree, degrees]);

  const handleResume = () => {
    if (resumePoint) {
      onNavigate(`/learn/${resumePoint.topic_id}?t=${resumePoint.video_timestamp}`);
    } else if (onResumeCourse) {
      onResumeCourse();
    }
  };

  const handleContinueSubject = (subjectId: string) => {
    console.log('🎯 Opening subject:', subjectId);
    onNavigate(`/subject/${subjectId}`);
  };

  console.log('🔍 Checking loading state before render:', loading);

  if (loading) {
    console.log('⏸️ Still loading - showing skeleton');
    return <DashboardSkeleton />;
  }

  console.log('✅ Loading complete - rendering dashboard');
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-7xl animate-in fade-in duration-500">
      {/* Back to Courses Button */}
      <div className="mb-4 md:mb-6">
        <Button
          variant="outline"
          onClick={() => onNavigate('courses')}
          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold text-xs md:text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10">

          {/* Header Section with Smart Context Switcher */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-6">
               <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-background shadow-sm">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-base md:text-xl font-bold">{initials}</AvatarFallback>
               </Avatar>
               <div>
                  <h1 className="text-xl md:text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                     <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                     <span className="text-xs md:text-sm">Leepo Learn Dashboard</span>
                  </div>
               </div>
            </div>

            {/* Conditional Degree Selector - Only show if multiple degrees */}
            {degrees.length > 1 && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                <label htmlFor="degree-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Degree:
                </label>
                <select
                  id="degree-select"
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full md:w-auto px-3 md:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Degrees</option>
                  {degrees.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                      {degree.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Static Header if only one degree */}
            {degrees.length === 1 && (
              <div className="text-left md:text-right">
                <p className="text-xs md:text-sm text-muted-foreground">Current Degree</p>
                <h2 className="text-lg md:text-xl font-bold">{degrees[0].title}</h2>
              </div>
            )}
          </div>

          {/* Continue Learning Section */}
          <section>
            <ContinueLearning
              userId={user?.id || ''}
              onResume={(subjectId, chapterId, topicId) => {
                console.log('📍 Resuming to:', { subjectId, chapterId, topicId });
                console.log('📍 onResumeToTopic exists?', typeof onResumeToTopic);
                if (onResumeToTopic) {
                  console.log('✅ Calling onResumeToTopic');
                  onResumeToTopic(subjectId, chapterId, topicId);
                } else {
                  console.log('⚠️ onResumeToTopic not defined, using fallback');
                  // Fallback to just navigating to courses
                  onNavigate('courses');
                }
              }}
            />
          </section>

          {/* Accessible Subjects Section */}
          <section>
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              Accessible Subjects
            </h2>

            {subjects.length === 0 ? (
              <Card className="p-8 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-muted-foreground font-medium">
                  No subjects available. Start exploring courses to begin your learning journey!
                </p>
                <Button
                  className="mt-4 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold"
                  onClick={() => onNavigate('courses')}
                >
                  Browse Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <Card
                    key={subject.subject_id}
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer group bg-gradient-to-br from-blue-50 to-purple-50"
                    onClick={() => handleContinueSubject(subject.subject_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-3">
                        <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-black">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-black text-sm text-center line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                        {subject.subject_title}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recommended Section */}
          <section>
             <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                Recommended for you
             </h2>
             <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="hover:shadow-md transition-all hover:border-blue-300 cursor-pointer group">
                    <CardContent className="p-4 md:p-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-100 transition-colors">
                            <span className="text-xl md:text-2xl">⚡</span>
                        </div>
                        <h3 className="font-bold text-base md:text-lg group-hover:text-blue-600 transition-colors">Circuit Theory I</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                            Master the basics of electrical circuits, Ohm's law, and Kirchhoff's laws. A must for electrical engineers.
                        </p>
                        <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3 text-xs text-muted-foreground font-medium">
                            <span className="bg-secondary px-2 py-1 rounded-md">Beginner</span>
                            <span>•</span>
                            <span>45h</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all hover:border-orange-300 cursor-pointer group">
                    <CardContent className="p-4 md:p-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-orange-50 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-orange-100 transition-colors">
                            <span className="text-xl md:text-2xl">🏗️</span>
                        </div>
                        <h3 className="font-bold text-base md:text-lg group-hover:text-orange-600 transition-colors">Fluid Mechanics</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                            Understanding fluid statics and dynamics. Essential for civil and mechanical engineering paths.
                        </p>
                        <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3 text-xs text-muted-foreground font-medium">
                            <span className="bg-secondary px-2 py-1 rounded-md">Intermediate</span>
                            <span>•</span>
                            <span>32h</span>
                        </div>
                    </CardContent>
                </Card>
             </div>
          </section>

          {/* Certifications */}
          <section>
             <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2">
                <Award className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                Available Certifications
             </h2>
             <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-2 md:border-4 border-white shadow-sm shrink-0">
                        <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-base md:text-lg">Professional Engineer Prep</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Get ready for your licensure exam with our comprehensive track.</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full md:w-auto text-sm">View Details</Button>
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
           {/* Streak Card */}
           <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-4 md:p-6">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-orange-800">Current Streak</span>
                    <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500 fill-orange-500" />
                 </div>
                 <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">{streak}</span>
                    <span className="text-base md:text-lg text-muted-foreground font-medium mb-1">{streak === 1 ? 'day' : 'days'}</span>
                 </div>
                 <div className="flex items-center justify-between mt-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                       {streak === 0
                         ? "Start your learning journey today!"
                         : "Keep it up! Stay active daily."}
                    </p>
                    <p className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded">
                       Max: {maxStreak}
                    </p>
                 </div>
              </CardContent>
           </Card>

           {/* League Card */}
           <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4 md:p-6">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-purple-800">Quartz League</span>
                    <Trophy className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                 </div>
                 <div className="flex items-end gap-2">
                    <span className="text-base md:text-lg text-muted-foreground font-medium mb-1">Ranked</span>
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">#42</span>
                 </div>
                 <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    You're in the top 15% of your class. Keep it up to get promoted!
                 </p>
                 <Button variant="link" className="px-0 text-purple-600 h-auto mt-2 text-xs md:text-sm">
                    View Leaderboard <ArrowRight className="h-3 w-3 ml-1" />
                 </Button>
              </CardContent>
           </Card>

           {/* Mobile App Promo */}
           <Card
             className="bg-gray-900 text-white overflow-hidden relative cursor-pointer hover:bg-gray-800 transition-colors"
             onClick={() => setIsMobileAppModalOpen(true)}
           >
              <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <CardContent className="p-4 md:p-6 relative z-10">
                 <div className="flex justify-between items-start gap-3">
                     <div className="flex-1">
                        <h3 className="font-bold text-base md:text-lg mb-1">Learn on the go!</h3>
                        <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
                            Download our mobile app to watch lectures and solve problems anywhere.
                        </p>
                        <div className="flex gap-2">
                           <Button
                             size="sm"
                             variant="secondary"
                             className="h-7 md:h-8 text-xs"
                             onClick={(e) => {
                               e.stopPropagation();
                               setIsMobileAppModalOpen(true);
                             }}
                           >
                               App Store
                           </Button>
                           <Button
                             size="sm"
                             variant="secondary"
                             className="h-7 md:h-8 text-xs"
                             onClick={(e) => {
                               e.stopPropagation();
                               setIsMobileAppModalOpen(true);
                             }}
                           >
                               Google Play
                           </Button>
                        </div>
                     </div>
                     <Smartphone className="h-10 w-10 md:h-12 md:w-12 text-gray-700 opacity-50 shrink-0" />
                 </div>
              </CardContent>
           </Card>

           {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Card className="bg-purple-50/50 border-none">
                    <CardContent className="p-3 md:p-4 text-center">
                        <div className="text-xl md:text-2xl font-bold text-purple-600">{formatXP(xp)}</div>
                        <div className="text-xs text-muted-foreground font-medium">Total XP</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 border-none">
                    <CardContent className="p-3 md:p-4 text-center">
                        <div className="text-xl md:text-2xl font-bold text-green-600">{avgScore > 0 ? `${avgScore}%` : 'N/A'}</div>
                        <div className="text-xs text-muted-foreground font-medium">Avg Score</div>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>

      {/* Mobile App Modal */}
      <MobileAppModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          <div>
            <Skeleton className="h-6 w-32 mb-5" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-48 mb-5" />
            <Skeleton className="h-32" />
          </div>

          <div>
            <Skeleton className="h-6 w-48 mb-5" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
