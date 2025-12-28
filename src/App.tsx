import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { EnrollmentWizard } from "./components/auth/EnrollmentWizard";
import { HeaderProfile } from "./components/layout/HeaderProfile";
import { StudentStats } from "./components/layout/StudentStats";
import { MobileNav } from "./components/layout/MobileNav";
import { LandingPage } from "./components/layout/LandingPage";
import { Footer } from "./components/layout/Footer";
import { ProfileSettings } from "./components/settings/ProfileSettings";
import { NotificationsPanel } from "./components/layout/NotificationsPanel";
import { PaymentModal, PurchasedAccess } from "./components/student/PaymentModal";
import { AboutUs } from "./components/pages/AboutUs";
import { ContactUs } from "./components/pages/ContactUs";
import { Pricing } from "./components/pages/Pricing";
import { PrivacyPolicy } from "./components/pages/PrivacyPolicy";
import { TermsConditions } from "./components/pages/TermsConditions";
import { RefundPolicy } from "./components/pages/RefundPolicy";
import { Button } from "./components/ui/button";
import { Shield, GraduationCap, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Node, initialTree } from "./utils/sharedData";
import * as db from "./utils/supabase/database";
import { supabase } from "./utils/supabase/client";
import { updateDailyActivity, getCurrentUserStats } from "./utils/streakAndXP";
import { getContinueLearningData, ContinueLearningData } from "./utils/continueLearning";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState(1);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [inTheatreMode, setInTheatreMode] = useState(false);
  const [courseData, setCourseData] = useState<Node[]>(initialTree);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userStats, setUserStats] = useState({ streak: 0, xp: 0, maxStreak: 0, avgScore: 0 });
  const [continueLearningData, setContinueLearningData] = useState<ContinueLearningData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedYearForPayment, setSelectedYearForPayment] = useState<Node | null>(null);

  // Function to refresh user stats from database (memoized to prevent unnecessary re-renders)
  const refreshUserStats = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ refreshUserStats called but no user.id');
      return;
    }

    try {
      console.log('🔄 Refreshing user stats from database...');
      console.log('📞 Calling getCurrentUserStats...');
      const stats = await getCurrentUserStats(user.id);
      console.log('✅ Got stats from getCurrentUserStats:', stats);

      console.log('📞 Calling getAverageScore...');
      const avgScore = await db.getAverageScore(user.id);
      console.log('✅ Got avgScore:', avgScore);

      console.log('📝 About to call setUserStats with:', {
        streak: stats.streak,
        xp: stats.xp,
        maxStreak: stats.maxStreak,
        avgScore
      });

      setUserStats({
        streak: stats.streak,
        xp: stats.xp,
        maxStreak: stats.maxStreak,
        avgScore
      });

      console.log('✅ Stats refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing user stats:', error);
      console.error('❌ Error stack:', error.stack);
    }
  }, [user?.id]);

  // Auto-refresh user stats when user changes (login/logout)
  useEffect(() => {
    console.log('🔍 useEffect triggered! User state:', user);
    console.log('🔍 User ID:', user?.id);

    if (user?.id) {
      console.log('👤 User detected, auto-refreshing stats...');
      console.log('📊 Current userStats state:', userStats);
      refreshUserStats();
    } else {
      console.log('👤 No user detected, resetting stats to 0...');
      setUserStats({ streak: 0, xp: 0, maxStreak: 0, avgScore: 0 });
    }
  }, [user?.id, refreshUserStats]);

  // Show all courses to everyone - isPremium flag controls content access, not visibility
  // Admin can use isActive to hide courses during development, but by default show all
  const studentCourseData = courseData;

  // Load course data - full hierarchy for admin, degrees only for others
  useEffect(() => {
    async function loadCourseData() {
      try {
        console.log("🚀 Starting to load course data...");

        const startTime = Date.now();

        // Check if current route is admin or if user is admin
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath === '/admin';
        const isAdminUser = user?.email === 'manishkalyan141@gmail.com';

        let courseDataToLoad;
        if (isAdminRoute || isAdminUser) {
          // Load full hierarchy for admin
          console.log("👨‍💼 Admin access detected - loading full hierarchy");
          courseDataToLoad = await db.fetchCourseHierarchy();
        } else {
          // Load only degrees for students (lazy load rest)
          console.log("👨‍🎓 Student view - loading degrees only");
          courseDataToLoad = await db.fetchDegrees();
        }

        const loadTime = Date.now() - startTime;

        console.log(`⏱️ Course data loaded in ${loadTime}ms`);
        console.log(`📦 Received data:`, courseDataToLoad);

        if (courseDataToLoad && courseDataToLoad.length > 0) {
          console.log(`✅ Setting ${courseDataToLoad.length} root nodes to state`);
          setCourseData(courseDataToLoad);
          console.log("✅ State updated successfully");
        } else {
          console.warn("⚠️ No data returned - using fallback");
          setCourseData(initialTree);
        }
      } catch (error: any) {
        console.error("❌ CRITICAL ERROR loading course data:", error);
        console.error("❌ Error stack:", error?.stack);
        setCourseData(initialTree);
      } finally {
        console.log("🏁 Setting isLoadingData to false");
        setIsLoadingData(false);
      }
    }

    loadCourseData();
  }, [user?.email, location.pathname]); // Re-run when user or route changes

  // Check for existing auth session
  useEffect(() => {
    async function checkSession() {
      console.log("🔐 Checking for auth session...");
      console.log("🔐 Current URL:", window.location.href);
      console.log("🔐 Hash fragment:", window.location.hash);

      // Check if there's an OAuth callback in the hash
      const hasAuthCallback = window.location.hash.includes('access_token');
      console.log("🔐 Has OAuth callback?", hasAuthCallback);

      if (hasAuthCallback) {
        console.log("⏳ OAuth callback detected! Manually processing tokens from hash...");

        // Extract tokens from hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        console.log("🔑 Access token found:", access_token ? "YES" : "NO");
        console.log("🔑 Refresh token found:", refresh_token ? "YES" : "NO");

        if (access_token && refresh_token) {
          console.log("📝 Decoding JWT and setting user directly...");

          try {
            // Decode JWT to get user data (JWT is base64 encoded, payload is the middle part)
            const base64Url = access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            console.log("🔓 JWT payload:", payload);

            const userId = payload.sub;
            const email = payload.email;
            const userMetadata = payload.user_metadata || {};

            console.log("👤 User ID:", userId);
            console.log("📧 Email:", email);
            console.log("📋 Metadata:", userMetadata);

            // Clean up hash immediately
            window.history.replaceState(null, '', window.location.pathname);

            // Manually save session to localStorage (Supabase setSession hangs)
            console.log("💾 Manually saving session to localStorage...");
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
            const storageKey = `sb-${projectRef}-auth-token`;

            const sessionData = {
              access_token,
              refresh_token,
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: 'bearer',
              user: {
                id: userId,
                email: email,
                user_metadata: userMetadata,
                aud: 'authenticated',
                role: 'authenticated'
              }
            };

            try {
              localStorage.setItem(storageKey, JSON.stringify(sessionData));
              console.log("✅ Session saved to localStorage:", storageKey);
            } catch (e) {
              console.error("❌ Failed to save session to localStorage:", e);
            }

            // Fetch user profile and set user state using direct fetch (Supabase client is hanging)
            console.log("🔍 Fetching user profile from database with direct fetch...");
            const headers = {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${access_token}`,
            };

            const profileResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
              { headers }
            );

            const profiles = await profileResponse.json();
            const profile = profiles && profiles.length > 0 ? profiles[0] : null;
            console.log("📝 Profile data:", profile);

            if (profile && profile.full_name && profile.college) {
              // Profile is complete
              console.log("✅ Profile complete - setting user state");
              setUser({
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                avatar: profile.avatar_url,
                college: profile.college,
                degree: profile.degree,
                year: profile.current_year,
                passingYear: profile.passing_year,
                role: profile.role,
              });
              setNeedsOnboarding(false);

              // Load user stats
              const stats = await getCurrentUserStats(userId);
              const avgScore = await db.getAverageScore(userId);
              setUserStats({ streak: stats.streak, xp: stats.xp, avgScore });

              // Load continue learning
              const continueData = await getContinueLearningData(userId);
              setContinueLearningData(continueData);

              navigate('/courses', { replace: true });
            } else if (profile) {
              // Profile incomplete
              console.log("⚠️ Profile incomplete - needs onboarding");
              setUser({
                id: profile.id,
                email: profile.email || email,
                avatar: profile.avatar_url || userMetadata.avatar_url,
                role: profile.role,
                name: userMetadata.full_name || userMetadata.name,
              });
              setNeedsOnboarding(true);
              setIsEnrollOpen(true);
            } else {
              // No profile - create new
              console.log("⚠️ No profile - needs onboarding");
              setUser({
                id: userId,
                email: email,
                avatar: userMetadata.avatar_url,
                name: userMetadata.full_name || userMetadata.name,
              });
              setNeedsOnboarding(true);
              setIsEnrollOpen(true);
            }
          } catch (err) {
            console.error("❌ Error processing OAuth:", err);
          }
        }
        return;
      }

      // Only check for existing session if there's NO OAuth callback
      console.log("🔐 No OAuth callback, checking for existing session...");

      // Try to get session from Supabase with timeout, then fallback to localStorage
      let session = null;
      try {
        // Add timeout to getSession to avoid hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 2000)
        );

        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log("🔐 getSession() call completed");

        if (error) {
          console.error("❌ Error getting session:", error);
        } else {
          session = data?.session;
        }
      } catch (err) {
        console.warn("⚠️ getSession() timed out or failed:", err);
      }

      // Fallback: manually check localStorage if getSession didn't work
      if (!session) {
        console.log("🔍 Trying to read session from localStorage manually...");
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
        const storageKey = `sb-${projectRef}-auth-token`;

        try {
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            const parsedSession = JSON.parse(storedData);
            console.log("✅ Found session in localStorage:", parsedSession);

            // Reconstruct session object
            session = {
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token,
              user: parsedSession.user
            };
          }
        } catch (e) {
          console.error("❌ Failed to read from localStorage:", e);
        }
      }

      console.log("🔐 Session retrieved:", session ? "YES" : "NO");
      if (session?.user) {
        console.log("🔐 User email:", session.user.email);
      }

      if (session?.user) {
        console.log("✅ Session found:", session.user.email);

        // Clean up OAuth hash fragment from URL
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("🧹 Cleaning up OAuth hash from URL");
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Fetch user profile using direct fetch API
        console.log("🔍 Fetching profile from database...");
        const headers = {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        };

        const profileResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=*`,
          { headers }
        );

        const profiles = await profileResponse.json();
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        console.log("📝 Profile data:", profile);

        if (profile && profile.full_name && profile.college) {
          // Profile is complete
          console.log("Profile complete - setting user");
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            avatar: profile.avatar_url,
            college: profile.college,
            degree: profile.degree,
            year: profile.current_year,
            passingYear: profile.passing_year,
            role: profile.role,
          });
          setNeedsOnboarding(false);

          // Update daily activity and load user stats
          console.log("Updating daily activity and loading stats...");
          const activityResult = await updateDailyActivity(session.user.id);
          console.log("Daily activity updated:", activityResult);

          // Fetch updated stats
          const stats = await getCurrentUserStats(session.user.id);
          const avgScore = await db.getAverageScore(session.user.id);
          console.log("User stats loaded:", stats);
          setUserStats({
            streak: stats.streak,
            xp: stats.xp,
            avgScore
          });

          // Load continue learning data
          const continueData = await getContinueLearningData(session.user.id);
          console.log("Continue learning data loaded:", continueData);
          setContinueLearningData(continueData);

          // Don't navigate away if user is already on a valid page
          // Only navigate from landing page
          if (location.pathname === '/') {
            navigate('/courses', { replace: true });
          }
        } else if (profile) {
          // Profile exists but incomplete - needs onboarding
          console.log("Profile incomplete - showing onboarding");
          setUser({
            id: profile.id,
            email: profile.email || session.user.email,
            avatar: profile.avatar_url || session.user.user_metadata?.avatar_url,
            role: profile.role,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          });
          setNeedsOnboarding(true);
          setIsEnrollOpen(true);
        } else {
          // No profile found - create minimal user and show onboarding
          console.log("No profile found - creating minimal user");
          setUser({
            id: session.user.id,
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          });
          setNeedsOnboarding(true);
          setIsEnrollOpen(true);
        }
      }
    }

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state change event:", event);
      console.log("🔔 Session in event:", session ? session.user.email : "NO SESSION");

      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ Auth state change - SIGNED_IN:", session.user.email);

        // Clean up OAuth hash from URL immediately after sign in
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("🧹 Cleaning up OAuth hash from URL");
          window.history.replaceState(null, '', window.location.pathname);
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        console.log("Profile on auth change:", profile);

        if (profile && profile.full_name && profile.college) {
          // Profile is complete
          console.log("Profile complete on sign in");
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            avatar: profile.avatar_url,
            college: profile.college,
            degree: profile.degree,
            year: profile.current_year,
            passingYear: profile.passing_year,
            role: profile.role,
          });
          setNeedsOnboarding(false);

          // Update daily activity and load user stats
          console.log("Updating daily activity on sign in...");
          const activityResult = await updateDailyActivity(session.user.id);
          console.log("Daily activity updated:", activityResult);

          // Fetch updated stats
          const stats = await getCurrentUserStats(session.user.id);
          const avgScore = await db.getAverageScore(session.user.id);
          console.log("User stats loaded on sign in:", stats);
          setUserStats({
            streak: stats.streak,
            xp: stats.xp,
            avgScore
          });

          // Load continue learning data
          const continueData = await getContinueLearningData(session.user.id);
          console.log("Continue learning data loaded on sign in:", continueData);
          setContinueLearningData(continueData);

          // Navigate to courses after sign in, but only if not already there
          if (location.pathname !== '/courses') {
            navigate('/courses', { replace: true });
          }
        } else if (profile) {
          // Profile exists but incomplete - needs onboarding
          console.log("Profile incomplete on sign in - opening onboarding");
          setUser({
            id: profile.id,
            email: profile.email || session.user.email,
            avatar: profile.avatar_url || session.user.user_metadata?.avatar_url,
            role: profile.role,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          });
          setNeedsOnboarding(true);
          setIsEnrollOpen(true);
        } else {
          // No profile - create minimal user and show onboarding
          console.log("No profile on sign in - creating minimal user");
          setUser({
            id: session.user.id,
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          });
          setNeedsOnboarding(true);
          setIsEnrollOpen(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsOnboarding(false);
        setUserStats({ streak: 0, xp: 0, maxStreak: 0, avgScore: 0 });
        setContinueLearningData(null);
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.hash]); // Re-run when hash changes (OAuth callback)

  useEffect(() => {
    const handleTheatreChange = (e: CustomEvent) => {
      setInTheatreMode(e.detail.active);
    };
    window.addEventListener('theatre-mode-change', handleTheatreChange as EventListener);
    return () => window.removeEventListener('theatre-mode-change', handleTheatreChange as EventListener);
  }, []);

  const handleEnrollmentComplete = async (userData: any) => {
    setUser(userData);
    setIsEnrollOpen(false);

    // Reload stats after onboarding
    const stats = await db.getUserStats(userData.id);
    const avgScore = await db.getAverageScore(userData.id);
    setUserStats({
      streak: stats.streak_days || 0,
      xp: stats.total_xp || 0,
      avgScore
    });

    // Navigate to courses after onboarding
    navigate('/courses');
  };

  const handleProfileUpdate = async (userData: any) => {
    setUser(userData);
    // Reload stats
    const stats = await db.getUserStats(userData.id);
    const avgScore = await db.getAverageScore(userData.id);
    setUserStats({
      streak: stats.streak_days || 0,
      xp: stats.total_xp || 0,
      avgScore
    });
  };

  const handleUpgrade = async () => {
    if (user) {
      // User is logged in, show payment modal
      console.log("Opening payment modal for logged-in user");
      console.log("📊 Course data:", courseData);
      console.log("👤 User year:", user.year);

      // Find the user's degree based on their profile
      const degree = user.degree
        ? courseData.find(d => d.title === user.degree) || courseData[0]
        : courseData[0];

      console.log("🎓 Selected degree:", degree);

      // Try to fetch and set year data if available
      if (degree) {
        try {
          // Fetch years for this degree if not already loaded
          let years = degree.children || [];

          if (years.length === 0) {
            console.log("📅 Fetching years for degree:", degree.id);
            years = await db.fetchYearsForDegree(degree.id);
            console.log("✅ Fetched years:", years);

            // Update the degree in courseData with fetched years
            if (years.length > 0) {
              degree.children = years;
            }
          }

          if (years.length > 0) {
            console.log("📚 Available years:", years);

            // Find the matching year based on user's year
            const year = user.year
              ? years.find((y: Node) => y.title.includes(user.year)) || years[0]
              : years[0];

            console.log("📅 Selected year for payment:", year);
            setSelectedYearForPayment(year);
            console.log("✅ Set selectedYearForPayment");
          } else {
            console.warn("⚠️ No years found for this degree - proceeding without year selection");
            // Set a default year node or null
            setSelectedYearForPayment(null);
          }
        } catch (error) {
          console.error("❌ Error fetching years:", error);
          // Proceed anyway - payment modal can handle missing year
          setSelectedYearForPayment(null);
        }
      } else {
        console.warn("⚠️ No degree found - proceeding anyway");
        setSelectedYearForPayment(null);
      }

      // Always show payment modal regardless of year data
      console.log("🔓 Opening payment modal");
      setShowPaymentModal(true);
    } else {
      // User not logged in, show enrollment wizard
      console.log("User not logged in, opening enrollment");
      setEnrollmentStep(1);
      setIsEnrollOpen(true);
    }
  };

  const handlePaymentSuccess = async (purchasedAccess: PurchasedAccess) => {
    console.log("💳 Payment successful!", purchasedAccess);

    // Subscription is now saved to database in PaymentModal
    setShowPaymentModal(false);

    // Show success message
    const accessMessage = purchasedAccess.type === 'year'
      ? 'the full year'
      : purchasedAccess.type === 'years'
      ? `${purchasedAccess.yearIds.length} years`
      : `${purchasedAccess.subjectIds.length} subject${purchasedAccess.subjectIds.length > 1 ? 's' : ''}`;

    alert(`🎉 Payment successful! You now have lifetime access to ${accessMessage}. Enjoy learning!`);

    // Optionally refresh user data or redirect
    // You can add logic here to reload user subscriptions if needed
  };

  const handleLogout = async () => {
    console.log("🔓 Logout button clicked!");
    try {
      // Skip supabase.auth.signOut() as it hangs - manually clear everything instead
      console.log("🧹 Manually clearing session and storage...");

      // Clear localStorage (where Supabase stores auth tokens)
      const supabaseAuthKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
      console.log("🗑️ Clearing auth token from localStorage:", supabaseAuthKey);
      localStorage.removeItem(supabaseAuthKey);

      // Also try common Supabase storage keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          console.log("🗑️ Removing storage key:", key);
          localStorage.removeItem(key);
        }
      });

      console.log("🧹 Clearing user state...");
      setUser(null);
      setNeedsOnboarding(false);
      setUserStats({ streak: 0, xp: 0, maxStreak: 0, avgScore: 0 });
      setContinueLearningData(null);

      console.log("✅ Logout complete!");
      console.log("🏠 Navigating to home...");
      navigate('/');

      // Force page reload to clear any cached state
      setTimeout(() => {
        console.log("🔄 Reloading page to ensure clean state...");
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error("❌ Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] font-sans antialiased">
      {/* Global Navigation Bar */}
      <nav className={`border-b-2 border-black bg-white sticky top-0 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] ${inTheatreMode ? 'z-[100]' : 'z-50'}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {inTheatreMode && (
                <Button variant="ghost" size="icon" onClick={() => window.dispatchEvent(new CustomEvent('exit-theatre-mode'))} title="Exit Theatre Mode" className="hover:bg-yellow-100 hover:text-black hover:border-2 hover:border-black transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            )}
            <div className="flex items-center font-black text-xl tracking-tight cursor-pointer select-none group" onClick={() => navigate('/courses')}>
                <div className="mr-2 relative">
                    <div className="absolute inset-0 bg-black translate-x-0.5 translate-y-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {location.pathname === "/admin" ? (
                    <Shield className="relative h-6 w-6 text-red-600 fill-red-100 z-10" />
                    ) : (
                    <img src="/favicon.png" alt="Leepo Learn" className="relative h-6 w-6 z-10 object-contain" />
                    )}
                </div>
                Leepo Learn
            </div>
          </div>
          
          <div className="flex items-center gap-4">

            {/* View Toggles: Only visible for admin users (manishkalyan141@gmail.com) */}
            {user && user.email === 'manishkalyan141@gmail.com' && (
              <>
                <div className="hidden md:flex items-center border-2 border-black bg-white rounded-lg p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] gap-1">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/courses')}
                    className={`text-xs h-7 font-bold rounded-md transition-all ${location.pathname === "/courses" ? "bg-blue-100 text-blue-700 border-2 border-black" : "hover:bg-gray-100 text-slate-500 border-2 border-transparent"}`}
                    >
                    Student View
                    </Button>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className={`text-xs h-7 font-bold rounded-md transition-all ${location.pathname === "/admin" ? "bg-red-100 text-red-700 border-2 border-black" : "hover:bg-gray-100 text-slate-500 border-2 border-transparent"}`}
                    >
                    Admin View
                    </Button>
                </div>

                <div className="h-8 w-0.5 bg-black hidden md:block rotate-12 mx-2" />
              </>
            )}

            {user ? (
                <div className="flex items-center gap-1 md:gap-2">
                    {/* Stats & Notifications */}
                    <StudentStats
                      streak={userStats.streak}
                      xp={userStats.xp}
                      onUpgrade={handleUpgrade}
                    />

                    {/* Notifications */}
                    <NotificationsPanel userId={user?.id} />

                    <HeaderProfile
                        user={user}
                        onLogout={handleLogout}
                        onStudentDashboard={() => navigate('/courses?view=dashboard')}
                        onAdminDashboard={() => navigate('/admin')}
                        onProfileSettings={() => setIsProfileSettingsOpen(true)}
                    />

                    {/* Mobile Menu */}
                    <MobileNav
                        user={user}
                        currentView={location.pathname === "/admin" ? "admin" : "student"}
                        setCurrentView={(view) => navigate(view === "admin" ? "/admin" : "/courses")}
                        onLogout={handleLogout}
                        onUpgrade={handleUpgrade}
                        streak={userStats.streak}
                        xp={userStats.xp}
                    />
                </div>
            ) : (
                <Button
                  onClick={() => {
                    setEnrollmentStep(1);
                    setIsEnrollOpen(true);
                  }}
                  className="bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300 transition-all font-bold"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enroll Now
                </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-64px)] bg-[#fffdf5] relative">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
            {isLoadingData ? (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium text-muted-foreground">Loading course data...</p>
                </div>
              </div>
            ) : (
              <Routes>
                {/* Landing page route */}
                <Route
                  path="/"
                  element={
                    <LandingPage
                      onGetStarted={() => navigate('/courses')}
                      onLogin={() => setIsEnrollOpen(true)}
                    />
                  }
                />

                {/* Courses route - accessible to everyone (logged in or not) - only shows active courses */}
                <Route
                  path="/courses"
                  element={<StudentDashboard courseData={studentCourseData} user={user} streak={userStats.streak} xp={userStats.xp} maxStreak={userStats.maxStreak} avgScore={userStats.avgScore} continueLearning={continueLearningData} onXPUpdate={refreshUserStats} />}
                />

                {/* Footer Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />

                {/* Admin route - protected (only for manishkalyan141@gmail.com) */}
                <Route
                  path="/admin"
                  element={
                    user?.email === 'manishkalyan141@gmail.com' ? (
                      <AdminDashboard courseData={courseData} setCourseData={setCourseData} />
                    ) : (
                      <Navigate to="/courses" replace />
                    )
                  }
                />

                {/* Catch all - redirect to courses */}
                <Route
                  path="*"
                  element={<Navigate to="/courses" replace />}
                />
              </Routes>
            )}
        </div>
      </main>

      <EnrollmentWizard
        open={isEnrollOpen}
        onOpenChange={(open) => {
          setIsEnrollOpen(open);
          if (!open) {
            setEnrollmentStep(1); // Reset to default when closing
          }
        }}
        onComplete={handleEnrollmentComplete}
        initialStep={enrollmentStep}
      />

      <ProfileSettings
        open={isProfileSettingsOpen}
        onOpenChange={setIsProfileSettingsOpen}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        degreeTitle={courseData[0]?.title || ""}
        yearNode={selectedYearForPayment}
      />
    </div>
  );
}
