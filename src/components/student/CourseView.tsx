import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Node } from "../../utils/sharedData";
import { formatTimeAgo } from "../../utils/timeUtils";
import { ContinueLearningData } from "../../utils/continueLearning";
import { awardXPForCompletion } from "../../utils/streakAndXP";
import * as db from "../../utils/supabase/database";
import { useIsMobile } from "../ui/use-mobile";
import { buildCoursePath } from "../../utils/slugify";
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
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  PauseCircle,
  FileText,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Image as ImageIcon,
  Download,
  Maximize,
  Volume2,
  VolumeX,
  Bold,
  Italic,
  Underline,
  List,
  Heading,
  Highlighter,
  Type,
  Link as LinkIcon,
  ZoomIn,
  ChevronRight,
  Camera,
  Clock,
  Code,
  Calculator,
  LayoutTemplate,
  Minimize2,
  Gamepad2,
  Headphones,
  ClipboardList,
  XCircle,
  Sparkles,
  Trash2,
  Video,
  Music2,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { PaymentModal, PurchasedAccess } from "./PaymentModal";
import { XPParticles } from "./XPParticles";

// Helper function to detect if URL is an iframe embed URL
const isIframeUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.includes('iframe') ||
         url.includes('embed') ||
         url.includes('player') ||
         url.includes('mediadelivery.net/play');
};

// Mock Data Structure
const courseData = {
  id: "sub-1",
  title: "Engineering Mathematics I",
  degree: "Computer Science Engineering",
  year: "1st Year",
  price: 49.99,
  chapters: [
    {
      id: "chap-1",
      title: "Matrices",
      description: "Eigenvalues, Eigenvectors, and Diagonalization",
      topicsCount: 5,
      completedCount: 2,
      assessment: {
          id: "quiz-1",
          passingScore: 60,
          questions: [
              { id: "q1", text: "What is the determinant of a 2x2 identity matrix?", options: ["0", "1", "2", "-1"], correctAnswer: 1 },
              { id: "q2", text: "Eigenvalues are found by solving which equation?", options: ["Ax = b", "|A - λI| = 0", "Ax = 0", "A + I = 0"], correctAnswer: 1 },
              { id: "q3", text: "If A is a symmetric matrix, then its eigenvalues are always:", options: ["Complex", "Real", "Zero", "Negative"], correctAnswer: 1 },
              { id: "q4", text: "The product of eigenvalues of a matrix is equal to its:", options: ["Trace", "Determinant", "Rank", "Inverse"], correctAnswer: 1 },
              { id: "q5", text: "Which matrix property is preserved under similarity transformation?", options: ["Eigenvectors", "Rows", "Trace", "Columns"], correctAnswer: 2 }
          ]
      },
      topics: [
        { 
          id: "t-1", 
          title: "Intro to Matrices", 
          duration: "10:20", 
          isPremium: false, 
          isCompleted: true, 
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          infographicUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000",
          videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          interactiveContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrix Interactive</title>
    <style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f9ff; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 600px; width: 90%; }
        h1 { color: #2563eb; margin-bottom: 1rem; }
        .matrix-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 2rem 0; }
        input { width: 60px; height: 60px; text-align: center; font-size: 1.5rem; border: 2px solid #e2e8f0; border-radius: 0.5rem; }
        button { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #1d4ed8; }
        #result { margin-top: 1.5rem; font-weight: bold; color: #166534; min-height: 1.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Matrix Determinant Calculator</h1>
        <p>Enter values for a 2x2 Matrix to calculate its determinant.</p>
        <div class="matrix-grid">
            <input type="number" id="a" placeholder="a" value="1">
            <input type="number" id="b" placeholder="b" value="2">
            <input type="number" id="c" placeholder="c" value="3">
            <input type="number" id="d" placeholder="d" value="4">
        </div>
        <button onclick="calculate()">Calculate Determinant (ad - bc)</button>
        <div id="result">Determinant: -2</div>
    </div>
    <script>
        function calculate() {
            const a = document.getElementById('a').value;
            const b = document.getElementById('b').value;
            const c = document.getElementById('c').value;
            const d = document.getElementById('d').value;
            const det = (a * d) - (b * c);
            document.getElementById('result').innerText = 'Determinant: ' + det;
        }
    </script>
</body>
</html>`
        },
        { 
          id: "t-2", 
          title: "Rank of a Matrix", 
          duration: "15:00", 
          isPremium: false, 
          isCompleted: true, 
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          infographicUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000",
          videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        },
        { 
          id: "t-3", 
          title: "Eigenvalues", 
          duration: "20:00", 
          isPremium: true, 
          isCompleted: false, 
          pdfUrl: "#",
          infographicUrl: "#",
          videoUrl: ""
        },
        { 
          id: "t-4", 
          title: "Cayley-Hamilton Theorem", 
          duration: "18:30", 
          isPremium: true, 
          isCompleted: false, 
          pdfUrl: "#",
          infographicUrl: "#",
          videoUrl: ""
        },
        { 
          id: "t-5", 
          title: "Diagonalization", 
          duration: "22:10", 
          isPremium: true, 
          isCompleted: false, 
          pdfUrl: "#",
          infographicUrl: "#",
          videoUrl: ""
        },
      ]
    },
    {
      id: "chap-2",
      title: "Calculus",
      description: "Limits, Continuity, and Derivatives",
      topicsCount: 8,
      completedCount: 0,
      topics: []
    },
    {
      id: "chap-3",
      title: "Differential Equations",
      description: "First order and higher order equations",
      topicsCount: 6,
      completedCount: 0,
      topics: []
    }
  ]
};

export function CourseView({
  subjectNode,
  degreeNode,
  yearNode,
  onNavigate,
  continueLearning,
  userId,
  onXPUpdate,
  autoSelectChapterId,
  autoSelectTopicId
}: {
  subjectNode?: Node | null,
  degreeNode?: Node | null,
  yearNode?: Node | null,
  onNavigate?: (path: string) => void,
  userId?: string,
  continueLearning?: ContinueLearningData,
  onXPUpdate?: () => void,
  autoSelectChapterId?: string,
  autoSelectTopicId?: string
}) {
  const isMobile = useIsMobile();
  const params = useParams<{ degreeSlug?: string; subjectSlug?: string; chapterSlug?: string; topicSlug?: string }>();
  const navigate = useNavigate();
  const chapters = subjectNode?.children || [];
  const [selectedChapter, setSelectedChapter] = useState<Node | null>(null);
  const [activeTopic, setActiveTopic] = useState<Node | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);



  // Completion State
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Chapter progress from cache
  const [chapterProgressMap, setChapterProgressMap] = useState<Map<string, number>>(new Map());

  // Load completed topics and chapter progress from database
  useEffect(() => {
    async function loadUserProgress() {
      if (!userId) {
        console.warn('⚠️ No userId provided to CourseView - cannot load progress');
        return;
      }

      try {
        // Load completed topics
        const progressData = await db.getUserProgress(userId);
        const completedIds = new Set(
          progressData
            .filter(p => p.is_completed)
            .map(p => p.node_id)
        );
        setCompletedTopicIds(completedIds);

        // Load chapter progress from cache
        if (subjectNode?.children && subjectNode.children.length > 0) {
          const chapterIds = subjectNode.children.map(c => c.id);
          const progressMap = await db.getChapterProgress(userId, chapterIds);
          setChapterProgressMap(progressMap);
        }
      } catch (error) {
        console.error('❌ Error loading user progress:', error);
      }
    }

    loadUserProgress();
  }, [userId, subjectNode]);

  // XP State - load from database
  const [xp, setXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(0);

  // Load user XP from database on mount
  useEffect(() => {
    async function loadUserXP() {
      if (!userId) return;

      try {
        // First, sync XP for any completed topics that don't have XP awarded yet
        const syncedXP = await db.syncXPForCompletedTopics(userId);
        if (syncedXP > 0) {
          // Refresh parent stats if XP was synced
          if (onXPUpdate) {
            onXPUpdate();
          }
        }

        // Then load current XP
        const stats = await db.getUserStats(userId);
        const currentXP = stats.total_xp || 0;
        setXP(currentXP);
      } catch (error) {
        console.error('❌ Error loading user XP:', error);
      }
    }

    loadUserXP();
  }, [userId, onXPUpdate]);

  const handleMarkComplete = async (topicId: string) => {
      const newSet = new Set(completedTopicIds);
      if (newSet.has(topicId)) return; // Already completed

      newSet.add(topicId);
      setCompletedTopicIds(newSet);

      // Find which chapter this topic belongs to
      const parentChapter = chapters.find(chapter =>
        chapter.children?.some(topic => topic.id === topicId) ||
        (selectedChapter && selectedChapter.id === chapter.id)
      ) || selectedChapter;

      // INSTANT UPDATE: Optimistically update chapter progress
      if (parentChapter && subjectNode?.children) {
        const totalTopics = parentChapter.metadata?.topicCount || 4;
        const newCompletedCount = Array.from(newSet).filter(id => {
          // Check if this topic belongs to the current chapter
          return parentChapter.children?.some(t => t.id === id);
        }).length;
        const newProgress = Math.round((newCompletedCount / totalTopics) * 100);

        // Update map immediately for instant UI feedback
        const updatedMap = new Map(chapterProgressMap);
        updatedMap.set(parentChapter.id, newProgress);
        setChapterProgressMap(updatedMap);
      }

      // Award XP and save to database
      if (userId) {
        try {
          // This function will:
          // 1. Award 50 XP for topic completion
          // 2. Save XP to database (user_stats table)
          // 3. Mark topic as completed (user_progress table)
          const xpEarned = await awardXPForCompletion(userId, topicId, 'TOPIC');

          // Update local state to show XP animation
          setXP(prev => prev + xpEarned);
          setXPAmount(xpEarned);
          setShowXP(true);

          // Refresh user stats in parent components (nav + dashboard)
          if (onXPUpdate) {
            onXPUpdate();
          }

          // Sync with database cache after a small delay (let trigger complete)
          setTimeout(async () => {
            if (subjectNode?.children && subjectNode.children.length > 0) {
              const chapterIds = subjectNode.children.map(c => c.id);
              const progressMap = await db.getChapterProgress(userId, chapterIds);
              setChapterProgressMap(progressMap);
            }
          }, 300); // 300ms delay for database trigger to complete
        } catch (error) {
          console.error('❌ Error awarding XP:', error);
        }
      } else {
        console.warn('⚠️ Cannot save progress - no userId');

        // Still show XP animation locally
        const amount = 50;
        setXP(prev => prev + amount);
        setXPAmount(amount);
        setShowXP(true);
      }

      // Check for chapter completion
      if (selectedChapter) {
          const allTopicsInChapter = selectedChapter.children || [];
          const allCompleted = allTopicsInChapter.every(t => newSet.has(t.id));
          if (allCompleted) {
              setShowCompletionScreen(true);
          }
      }
  };

  // Media Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([1]);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState("1");
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  // Audio Player State
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Modal State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isInfographicOpen, setIsInfographicOpen] = useState(false);

  // Theatre Mode State
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState(0);

  // Auto-enter theatre mode on mobile when topic is selected
  useEffect(() => {
    if (isMobile && activeTopic && !isTheatreMode) {
      setIsTheatreMode(true);
    }
  }, [activeTopic, isMobile]);

  // Auto-expand chapter and select topic from continue learning data
  useEffect(() => {
    if (continueLearning && chapters.length > 0) {
      // Find the chapter by ID
      const chapter = chapters.find(ch => ch.id === continueLearning.chapterId);
      if (chapter) {
        // Use handleChapterClick to properly fetch topics
        handleChapterClick(chapter).then(() => {
          // After topics are loaded, restore the saved state
          if (continueLearning.videoTimestamp > 0) {
            setSavedTimestamp(continueLearning.videoTimestamp);
          }
        }).catch((err) => {
          console.error('Error loading continue learning chapter:', err);
        });
      }
    }
  }, [continueLearning, chapters]);

  // Sync state with URL parameters (for chapter/topic selection via URL)
  useEffect(() => {
    const syncWithURL = async () => {
      // Skip if auto-navigate is active (it handles its own selection)
      if (autoSelectChapterId && autoSelectTopicId) return;

      // Skip if no chapters loaded yet
      if (chapters.length === 0) return;

      const { chapterSlug, topicSlug } = params;

      // If we have a chapter slug in URL, find and select it
      if (chapterSlug) {
        const chapter = chapters.find(ch => ch.slug === chapterSlug);
        if (chapter && (!selectedChapter || selectedChapter.slug !== chapterSlug)) {
          // Load the chapter (which will also set first topic)
          await handleChapterClick(chapter);

          // If we also have a topic slug, select it after chapter loads
          if (topicSlug && chapter.children) {
            const topic = chapter.children.find(t => t.slug === topicSlug);
            if (topic) {
              setActiveTopic(topic);
            }
          }
        }
      } else if (selectedChapter) {
        // No chapter in URL but we have one selected - clear it
        setSelectedChapter(null);
        setActiveTopic(null);
      }
    };

    syncWithURL();
  }, [params.chapterSlug, params.topicSlug, chapters.length]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('theatre-mode-change', { detail: { active: isTheatreMode } }));
  }, [isTheatreMode]);

  useEffect(() => {
    const handleExit = () => {
      // Save current timestamp before exiting theatre mode
      const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        setSavedTimestamp(media.currentTime);
      }
      setIsTheatreMode(false);
    };
    window.addEventListener('exit-theatre-mode', handleExit);
    return () => window.removeEventListener('exit-theatre-mode', handleExit);
  }, [mediaMode]);

  // Restore timestamp when switching between theatre mode and standard mode
  useEffect(() => {
    if (savedTimestamp > 0) {
      const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        // Wait for media to be loaded before setting time
        const setTime = () => {
          if (media.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            media.currentTime = savedTimestamp;
            setSavedTimestamp(0); // Reset after restoring
          } else {
            media.addEventListener('loadedmetadata', () => {
              media.currentTime = savedTimestamp;
              setSavedTimestamp(0);
            }, { once: true });
          }
        };
        // Small delay to ensure the video element is fully rendered
        setTimeout(setTime, 100);
      }
    }
  }, [isTheatreMode, savedTimestamp, mediaMode]);

  // Interactive Mode State
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  // Notes State
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState<{id: string, timestamp: number, content: string, imageUrl?: string}[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Infographic State
  const infographicRef = useRef<HTMLImageElement>(null);

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAssessmentClick = () => {
      if (!selectedChapter) return;
      const allTopicsCompleted = (selectedChapter.children || []).every(t => completedTopicIds.has(t.id));
      if (allTopicsCompleted) {
          setIsQuizOpen(true);
      }
  };

  const handleQuizAnswer = (questionId: string, optionIndex: number) => {
      setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = () => {
      if (!selectedChapter?.assessment) return;
      let score = 0;
      selectedChapter.assessment.questions.forEach(q => {
          if (quizAnswers[q.id] === q.correctAnswer) {
              score++;
          }
      });
      setQuizScore(score);
      setQuizCompleted(true);
  };

  const resetQuiz = () => {
      setIsQuizOpen(false);
      setCurrentQuestionIndex(0);
      setQuizAnswers({});
      setQuizScore(null);
      setQuizCompleted(false);
  }

  const retakeQuiz = () => {
      setCurrentQuestionIndex(0);
      setQuizAnswers({});
      setQuizScore(null);
      setQuizCompleted(false);
  }

  const toggleInfographicFullscreen = () => {
    const img = infographicRef.current;
    if (img) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
      } else {
        img.requestFullscreen().catch(err => {
            console.warn("Fullscreen failed, opening in new tab:", err);
            window.open(img.src, '_blank');
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToTime = (seconds: number) => {
    const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = seconds;
      if (!isPlaying) {
         media.play();
         setIsPlaying(true);
      }
    }
  };

  const captureScreenshot = () => {
    // Only captures video
    if (videoRef.current && mediaMode === 'video') {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
         const dataUrl = canvas.toDataURL("image/png");
         const currentTime = videoRef.current.currentTime;
         setSavedNotes(prev => [{
            id: Date.now().toString(),
            timestamp: currentTime,
            content: "Screenshot captured at " + formatTime(currentTime),
            imageUrl: dataUrl
         }, ...prev]);
      }
    }
  };

  const addCurrentTimestamp = () => {
     const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
     if (media) {
        const time = formatTime(media.currentTime);
        setNotes(prev => prev + ` **[${time}]** `);
        setTimeout(() => textareaRef.current?.focus(), 0);
     }
  };

  const saveNote = async () => {
     if (!notes.trim() || !userId || !activeTopic) return;

     const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
     const currentTime = media?.currentTime || 0;

     try {
       // Save to database
       const savedNote = await db.createUserNote(
         userId,
         activeTopic.id,
         notes.trim(),
         currentTime
       );

       if (savedNote) {
         // Add to local state
         setSavedNotes(prev => [{
           id: savedNote.id,
           timestamp: savedNote.media_timestamp,
           content: savedNote.content,
           imageUrl: savedNote.screenshot_url,
         }, ...prev]);

         setNotes("");
       }
     } catch (error) {
       console.error('❌ Error saving note:', error);
       // You could add a toast notification here
     }
  };

  const deleteNoteHandler = async (noteId: string) => {
    try {
      // Delete from database
      const success = await db.deleteUserNote(noteId);

      if (success) {
        // Remove from local state
        setSavedNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('❌ Error deleting note:', error);
    }
  };

  const insertFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = text;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        newCursorPos = start + 2 + selectedText.length + 2; 
        break;
      case 'italic':
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        newCursorPos = start + 1 + selectedText.length + 1;
        break;
      case 'underline':
        newText = text.substring(0, start) + `<u>${selectedText}</u>` + text.substring(end);
        newCursorPos = start + 3 + selectedText.length + 4;
        break;
      case 'heading':
        newText = text.substring(0, start) + `\n### ${selectedText}` + text.substring(end);
        newCursorPos = start + 5 + selectedText.length;
        break;
      case 'list':
        newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
        newCursorPos = start + 3 + selectedText.length;
        break;
      case 'code':
        newText = text.substring(0, start) + `\n\`\`\`\n${selectedText}\n\`\`\`` + text.substring(end);
        newCursorPos = start + 5 + selectedText.length;
        break;
      case 'math':
        newText = text.substring(0, start) + `$${selectedText}$` + text.substring(end);
        newCursorPos = start + 1 + selectedText.length + 1;
        break;
    }
    
    setNotes(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Reset video state when topic changes
  useEffect(() => {
    if (activeTopic) {
      setIsPlaying(false);
      setIsInteractiveMode(false); // Reset interactive mode
      setPlaybackRate("1");

      // Determine initial media mode
      if (activeTopic.videoUrl) {
        setMediaMode('video');
      } else if (activeTopic.audioUrl) {
        setMediaMode('audio');
      }

      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.playbackRate = 1;
      }
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.playbackRate = 1;
      }
    }
  }, [activeTopic]);

  // Load notes from database when topic changes
  useEffect(() => {
    async function loadNotes() {
      if (!activeTopic || !userId) {
        setSavedNotes([]);
        return;
      }

      setIsLoadingNotes(true);
      try {
        const dbNotes = await db.getUserNotesForTopic(userId, activeTopic.id);

        // Transform database notes to match the UI format
        const formattedNotes = dbNotes.map(note => ({
          id: note.id,
          timestamp: note.media_timestamp,
          content: note.content,
          imageUrl: note.screenshot_url,
        }));

        setSavedNotes(formattedNotes);
      } catch (error) {
        console.error('❌ Error loading notes:', error);
        setSavedNotes([]);
      } finally {
        setIsLoadingNotes(false);
      }
    }

    loadNotes();
  }, [activeTopic, userId]);

  // Reload media when language changes
  useEffect(() => {
    if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.load();
        // Attempt to restore state
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.load();
        audioRef.current.currentTime = currentTime;
        if (wasPlaying) audioRef.current.play().catch(() => {});
    }
  }, [language]);

  // Audio time update listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
      setAudioProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Media Session API for background playback (mobile)
  useEffect(() => {
    if ('mediaSession' in navigator && activeTopic && mediaMode === 'audio') {
      const audioUrl = language === 'hi' && activeTopic.audioUrlHindi
        ? activeTopic.audioUrlHindi
        : activeTopic.audioUrl;

      if (audioUrl) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeTopic.title,
          artist: selectedChapter.title,
          album: 'Course Audio',
          artwork: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play();
          setIsPlaying(true);
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
          }
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
          }
        });
      }
    }
  }, [activeTopic, mediaMode, language, selectedChapter]);

  const togglePlay = () => {
    const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.volume = value[0];
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isMuted) {
        media.volume = volume[0];
        setIsMuted(false);
      } else {
        media.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSpeedChange = (value: string) => {
    setPlaybackRate(value);
    const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.playbackRate = parseFloat(value);
    }
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    const video = videoRef.current;

    if (!container || !video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error("Exit fullscreen error:", err));
    } else {
      // Try container first
      container.requestFullscreen().catch((err) => {
        console.warn("Container fullscreen failed, trying video fallback:", err);
        // Fallback to video element which might have different permissions
        if (video.requestFullscreen) {
          video.requestFullscreen().catch((e) => console.error("Video fullscreen error:", e));
        } else if ((video as any).webkitEnterFullscreen) {
          // iOS Safari fallback
          (video as any).webkitEnterFullscreen();
        }
      });
    }
  };

  const getNextTopicName = () => {
    if (!selectedChapter || !activeTopic) return "";
    const topics = selectedChapter.children || [];
    const topicIndex = topics.findIndex(t => t.id === activeTopic.id);
    if (topicIndex < topics.length - 1) {
      return topics[topicIndex + 1].title;
    }
    const chapterIndex = courseData.chapters.findIndex(c => c.id === selectedChapter.id);
    if (chapterIndex < courseData.chapters.length - 1) {
      const nextChapter = courseData.chapters[chapterIndex + 1];
      const nextChapterTopics = nextChapter.children || [];
      if (nextChapterTopics.length > 0) return nextChapterTopics[0].title;
    }
    return "Course Completed";
  };

  const handleContinueNext = () => {
      if (!selectedChapter || !activeTopic) return;
      const topics = selectedChapter.children || [];
      const topicIndex = topics.findIndex(t => t.id === activeTopic.id);

      if (topicIndex < topics.length - 1) {
          const next = topics[topicIndex + 1];
          if (next.isPremium && !isSubscribed) {
              setShowPaymentModal(true);
              return;
          }
          setActiveTopic(next);
          setIsVideoCompleted(false);
          setNotes("");
      } else {
          const chapterIndex = courseData.chapters.findIndex(c => c.id === selectedChapter.id);
          if (chapterIndex < courseData.chapters.length - 1) {
              const nextChapter = courseData.chapters[chapterIndex + 1];
              const nextChapterTopics = nextChapter.children || [];
              if (nextChapterTopics.length > 0) {
                 const next = nextChapterTopics[0];
                 if (next.isPremium && !isSubscribed) {
                     setShowPaymentModal(true);
                     return;
                 }
                 setSelectedChapter(nextChapter);
                 setActiveTopic(next);
                 setIsVideoCompleted(false);
                 setNotes("");
              }
          } else {
              setShowCompletionScreen(true);
          }
      }
  };

  const handleChapterClick = async (chapter: Node) => {
    setIsLoadingTopics(true);
    try {
      // Fetch topics for this chapter on-demand
      const topics = await db.fetchTopicsForChapter(chapter.id);

      // Update chapter with loaded topics
      const updatedChapter = { ...chapter, children: topics };

      setSelectedChapter(updatedChapter);

      // Set first unlocked topic as active
      const firstUnlock = topics.find(t => !t.isPremium || isSubscribed) || topics[0];
      setActiveTopic(firstUnlock);

      // Navigate to hierarchical URL: /courses/:degreeSlug/:subjectSlug/:chapterSlug
      if (degreeNode?.slug && subjectNode?.slug && chapter.slug) {
        const path = buildCoursePath(degreeNode.slug, subjectNode.slug, chapter.slug);
        navigate(path);
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      // Fallback: use chapter as-is if it already has children
      setSelectedChapter(chapter);
      const firstUnlock = (chapter.children || []).find(t => !t.isPremium || isSubscribed) || chapter.children?.[0] || null;
      setActiveTopic(firstUnlock);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTopicClick = async (topic: Node) => {
      if (topic.isPremium && !isSubscribed) {
          setShowPaymentModal(true);
      } else {
          setActiveTopic(topic);

          // Track learning position when topic is accessed
          if (userId && topic.id) {
            await db.updateUserLearningPosition(userId, topic.id);
          }

          // Navigate to hierarchical URL: /courses/:degreeSlug/:subjectSlug/:chapterSlug/:topicSlug
          if (degreeNode?.slug && subjectNode?.slug && selectedChapter?.slug && topic.slug) {
            const path = buildCoursePath(degreeNode.slug, subjectNode.slug, selectedChapter.slug, topic.slug);
            navigate(path);
          }
      }
  };

  // Auto-select chapter and topic when provided
  useEffect(() => {
    if (!autoSelectChapterId || !autoSelectTopicId || !chapters.length) return;

    // Find and select the chapter
    const chapter = chapters.find(c => c.id === autoSelectChapterId);
    if (chapter) {
      handleChapterClick(chapter);

      // Note: The topic will be auto-selected in the next useEffect after topics load
    }
  }, [autoSelectChapterId, autoSelectTopicId, chapters.length]);

  // Auto-select topic after chapter loads its topics
  useEffect(() => {
    if (!autoSelectTopicId || !selectedChapter || !selectedChapter.children?.length) return;

    // Find the specific topic
    const topic = selectedChapter.children.find(t => t.id === autoSelectTopicId);
    if (topic) {
      setActiveTopic(topic);

      // Track learning position
      if (userId && topic.id) {
        db.updateUserLearningPosition(userId, topic.id);
      }

      // Scroll to the topic view
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [autoSelectTopicId, selectedChapter?.children?.length, userId]);

  const handlePaymentSuccess = (purchasedAccess: PurchasedAccess) => {
      setIsSubscribed(true);
      setShowPaymentModal(false);
      // Subscription is saved to database in PaymentModal component
      // Premium content is now unlocked for this session
  };

  if (!selectedChapter) {
      return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {onNavigate && (
                    <Button variant="outline" size="sm" onClick={() => onNavigate('subject')} className="mr-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] font-bold">
                         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                        {subjectNode?.title || "Course Chapters"}
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">Select a chapter to start learning.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {chapters.map((chapter) => {
                    // Use cached progress from database (fast!)
                    const progress = chapterProgressMap.get(chapter.id) || 0;
                    const isStarted = progress > 0;
                    const isCompleted = progress >= 100;

                    return (
                    <Card
                        key={chapter.id}
                        data-chapter-id={chapter.id}
                        className="group cursor-pointer bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                        onClick={() => handleChapterClick(chapter)}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-2 border-black font-bold">
                                    {chapter.metadata?.topicCount || chapter.children?.length || 0} Topics
                                </Badge>
                                {isStarted && !isCompleted && chapter.lastAccessed && (
                                    <div title="Last accessed time" className="flex items-center gap-1 text-xs font-bold text-slate-500 border-2 border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                                        <Clock className="h-3 w-3" />
                                        {formatTimeAgo(chapter.lastAccessed)}
                                    </div>
                                )}
                            </div>
                            <CardTitle className="group-hover:text-indigo-600 transition-colors font-black text-xl flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    {chapter.title}
                                </div>
                                {chapter.iconUrl && <img src={chapter.iconUrl} alt="icon" className="h-8 w-8 object-contain" />}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-slate-600 font-medium mt-2">
                                {chapter.description || `Click to view ${chapter.metadata?.topicCount || 0} topics in this chapter.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600 font-semibold">Progress</span>
                                  <span className="font-bold">
                                    {progress}%
                                  </span>
                                </div>
                                <Progress value={progress} className="h-3 border border-black bg-gray-100 [&>div]:bg-indigo-500" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className={`w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold ${
                                isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200" : 
                                isStarted ? "bg-indigo-600 text-white hover:bg-indigo-700" : 
                                "bg-white text-black group-hover:bg-black group-hover:text-white"
                            }`}>
                                {isCompleted ? "Completed" : isStarted ? "Continue Learning" : "Start Chapter"}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                    );
                })}
            </div>
        </div>
      );
  }

  if (selectedChapter) {
    
    if (showCompletionScreen) {
        return (
            <div className="container mx-auto p-6 h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">You’ve completed lessons for {selectedChapter.title}!</h1>
                    <p className="text-muted-foreground text-lg">Great work! You've finished all topics in this section.</p>
                </div>
                
                <div className="w-full max-w-md rounded-xl overflow-hidden">
                    <svg viewBox="0 0 400 300" className="w-full h-auto">
                      {/* Background */}
                      <rect width="400" height="300" fill="#f0f9ff"/>

                      {/* Confetti */}
                      <circle cx="50" cy="40" r="4" fill="#fbbf24"/>
                      <circle cx="350" cy="60" r="5" fill="#ec4899"/>
                      <circle cx="80" cy="100" r="3" fill="#8b5cf6"/>
                      <circle cx="320" cy="120" r="4" fill="#10b981"/>
                      <rect x="100" y="30" width="6" height="6" fill="#ef4444" transform="rotate(45 103 33)"/>
                      <rect x="300" y="50" width="7" height="7" fill="#3b82f6" transform="rotate(45 303.5 53.5)"/>
                      <rect x="60" y="140" width="5" height="5" fill="#f59e0b" transform="rotate(45 62.5 142.5)"/>
                      <rect x="340" y="160" width="6" height="6" fill="#06b6d4" transform="rotate(45 343 163)"/>

                      {/* Stars */}
                      <path d="M 200 20 L 205 35 L 220 35 L 208 45 L 213 60 L 200 50 L 187 60 L 192 45 L 180 35 L 195 35 Z" fill="#fbbf24"/>
                      <path d="M 90 70 L 93 78 L 102 78 L 95 83 L 98 92 L 90 87 L 82 92 L 85 83 L 78 78 L 87 78 Z" fill="#a855f7"/>
                      <path d="M 310 90 L 313 98 L 322 98 L 315 103 L 318 112 L 310 107 L 302 112 L 305 103 L 298 98 L 307 98 Z" fill="#ec4899"/>

                      {/* Trophy */}
                      <g transform="translate(170, 100)">
                        <ellipse cx="30" cy="75" rx="25" ry="8" fill="#d1d5db"/>
                        <rect x="26" y="60" width="8" height="15" fill="#fbbf24"/>
                        <path d="M 15 25 Q 15 15 20 15 L 40 15 Q 45 15 45 25 L 42 50 Q 42 60 30 60 Q 18 60 18 50 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
                        <ellipse cx="30" cy="25" rx="12" ry="6" fill="#fcd34d"/>
                        <path d="M 10 25 Q 5 25 5 30 Q 5 35 10 35 L 15 35 L 15 25 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
                        <path d="M 50 25 Q 55 25 55 30 Q 55 35 50 35 L 45 35 L 45 25 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
                        <circle cx="30" cy="35" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                        <text x="30" y="40" fontSize="12" fontWeight="bold" fill="#f59e0b" textAnchor="middle">★</text>
                      </g>

                      {/* Celebrating Characters */}
                      {/* Left Character */}
                      <g transform="translate(60, 160)">
                        <circle cx="25" cy="25" r="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                        <circle cx="18" cy="22" r="3" fill="#000"/>
                        <circle cx="32" cy="22" r="3" fill="#000"/>
                        <path d="M 18 32 Q 25 37 32 32" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <rect x="15" y="45" width="20" height="35" rx="5" fill="#3b82f6"/>
                        <rect x="10" y="50" width="8" height="25" rx="4" fill="#3b82f6"/>
                        <rect x="37" y="50" width="8" height="25" rx="4" fill="#3b82f6"/>
                        <rect x="15" y="80" width="8" height="20" rx="4" fill="#1e40af"/>
                        <rect x="27" y="80" width="8" height="20" rx="4" fill="#1e40af"/>
                        {/* Raised arm */}
                        <rect x="37" y="35" width="8" height="20" rx="4" fill="#3b82f6" transform="rotate(-45 41 45)"/>
                        <circle cx="48" cy="30" r="4" fill="#fbbf24"/>
                      </g>

                      {/* Right Character */}
                      <g transform="translate(280, 160)">
                        <circle cx="25" cy="25" r="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                        <circle cx="18" cy="22" r="3" fill="#000"/>
                        <circle cx="32" cy="22" r="3" fill="#000"/>
                        <path d="M 18 32 Q 25 37 32 32" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <rect x="15" y="45" width="20" height="35" rx="5" fill="#ec4899"/>
                        <rect x="10" y="50" width="8" height="25" rx="4" fill="#ec4899"/>
                        <rect x="37" y="50" width="8" height="25" rx="4" fill="#ec4899"/>
                        <rect x="15" y="80" width="8" height="20" rx="4" fill="#be185d"/>
                        <rect x="27" y="80" width="8" height="20" rx="4" fill="#be185d"/>
                        {/* Raised arm */}
                        <rect x="5" y="35" width="8" height="20" rx="4" fill="#ec4899" transform="rotate(45 9 45)"/>
                        <circle cx="2" cy="30" r="4" fill="#10b981"/>
                      </g>

                      {/* Floating particles */}
                      <circle cx="130" cy="80" r="3" fill="#fbbf24" opacity="0.6"/>
                      <circle cx="270" cy="90" r="2.5" fill="#a855f7" opacity="0.6"/>
                      <circle cx="150" cy="200" r="2" fill="#10b981" opacity="0.6"/>
                      <circle cx="250" cy="210" r="3" fill="#3b82f6" opacity="0.6"/>
                    </svg>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setShowCompletionScreen(false)}>
                        Review Lessons
                    </Button>
                    <Button size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
                        setShowCompletionScreen(false);
                        setSelectedChapter(null);
                        setActiveTopic(null);
                        // Navigate back to subject view
                        if (degreeNode?.slug && subjectNode?.slug) {
                          navigate(buildCoursePath(degreeNode.slug, subjectNode.slug));
                        }
                    }}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    if (isInteractiveMode && activeTopic?.interactiveContent) {
       return (
        <div className="fixed inset-0 top-16 z-[9999] bg-background flex flex-col">
           {/* Control Bar Below Header - Contains Exit Button */}
           <div className="w-full bg-gradient-to-r from-red-600 to-red-700 border-b-4 border-red-800 shadow-lg px-6 py-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <div className="h-3 w-3 rounded-full bg-red-300 animate-pulse"></div>
               <h2 className="text-white font-black text-xl flex items-center gap-2">
                 <Gamepad2 className="h-6 w-6" />
                 Interactive Playground Mode
               </h2>
               <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-bold">
                 {activeTopic.title}
               </Badge>
             </div>

             <div className="flex items-center gap-3">
               {/* Close Button */}
               <Button
                 onClick={() => setIsInteractiveMode(false)}
                 className="bg-white hover:bg-red-50 text-red-600 border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black text-lg px-6 py-6 rounded-xl"
                 size="lg"
               >
                 <XCircle className="mr-2 h-6 w-6" /> Exit Playground
               </Button>
             </div>
           </div>

           {/* Interactive Content */}
           <div className="flex-1 bg-black overflow-hidden">
             <iframe
               srcDoc={activeTopic.interactiveContent}
               className="w-full h-full border-0"
               title="Interactive Content"
               sandbox="allow-scripts allow-same-origin"
             />
           </div>
        </div>
       )
    }

    if (isTheatreMode) {
      return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300">
          {showXP && <XPParticles amount={xpAmount} onComplete={() => setShowXP(false)} />}
          <div className="h-14 border-b flex items-center justify-between px-6 bg-card shrink-0 shadow-sm z-20">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
                // Save current timestamp before exiting theatre mode
                const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
                if (media) {
                  setSavedTimestamp(media.currentTime);
                }
                setIsTheatreMode(false);
                // On mobile, also clear active topic to return to topic list
                if (isMobile) {
                  setActiveTopic(null);
                }
              }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {isMobile ? 'Back to Topics' : 'Exit Theatre Mode'}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <span className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /> {activeTopic?.title || selectedChapter.title}</span>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  // Save current timestamp before exiting theatre mode
                  const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
                  if (media) {
                    setSavedTimestamp(media.currentTime);
                  }
                  setIsTheatreMode(false);
                  // On mobile, also clear active topic to return to topic list
                  if (isMobile) {
                    setActiveTopic(null);
                  }
                }}>
                  <Minimize2 className="mr-2 h-4 w-4" /> Standard View
                </Button>
             </div>
          </div>

          <div className={`flex-1 flex ${isMobile ? 'flex-col' : ''} overflow-hidden`}>
            <div className={`${isMobile ? 'w-full shrink-0' : 'w-[70%]'} flex flex-col ${isMobile ? '' : 'h-full overflow-y-auto bg-black/5'} scrollbar-thin`}>
               <div className={`w-full bg-black ${isMobile ? '' : 'sticky top-0'} z-10 shadow-xl aspect-video shrink-0`}>
                 {/* Mode Toggles */}
                 {activeTopic?.videoUrl && activeTopic?.audioUrl && (
                       <div className="absolute top-4 right-4 z-30 flex gap-2">
                           <Button 
                             size="sm" 
                             variant={mediaMode === 'video' ? 'secondary' : 'ghost'} 
                             className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'video' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                             onClick={(e) => {
                                 e.stopPropagation();
                                 setIsPlaying(false);
                                 setMediaMode('video');
                             }}
                           >
                               Video
                           </Button>
                           <Button 
                             size="sm" 
                             variant={mediaMode === 'audio' ? 'secondary' : 'ghost'} 
                             className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'audio' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                             onClick={(e) => {
                                 e.stopPropagation();
                                 setIsPlaying(false);
                                 setMediaMode('audio');
                             }}
                           >
                               Audio
                           </Button>
                       </div>
                 )}

                 {mediaMode === 'video' ? (
                   activeTopic?.videoUrl ? (
                    <div ref={playerContainerRef} className="relative w-full h-full group bg-black">
                      {isIframeUrl(language === 'hi' && activeTopic.videoUrlHindi ? activeTopic.videoUrlHindi : activeTopic.videoUrl) ? (
                        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                          <iframe
                            src={language === 'hi' && activeTopic.videoUrlHindi ? activeTopic.videoUrlHindi : activeTopic.videoUrl}
                            className="absolute"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen
                            style={{
                              border: 'none',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '234%',
                              height: '200%',
                              minWidth: '234%',
                              minHeight: '200%'
                            }}
                          />
                        </div>
                      ) : (
                        <video
                          ref={videoRef}
                          src={language === 'hi' && activeTopic.videoUrlHindi ? activeTopic.videoUrlHindi : activeTopic.videoUrl}
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                          controls={!isVideoCompleted}
                          playsInline
                          onEnded={() => {
                              setIsPlaying(false);
                              setIsVideoCompleted(true);
                              if (activeTopic && !completedTopicIds.has(activeTopic.id)) {
                                  handleMarkComplete(activeTopic.id);
                              }
                          }}
                          onPlay={() => {
                              setIsPlaying(true);
                              setIsVideoCompleted(false);
                          }}
                          onPause={() => setIsPlaying(false)}
                        />
                      )}

                      {/* Next Topic Overlay */}
                      {isVideoCompleted && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                              <Card className="w-full max-w-md bg-[#fffdf5] border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                                  <CardHeader className="text-center pb-2">
                                      <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Up Next</div>
                                      <CardTitle className="text-2xl font-black">{getNextTopicName()}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="flex justify-center pb-6">
                                      <Button 
                                          size="lg" 
                                          onClick={handleContinueNext}
                                          className="bg-black text-white hover:bg-slate-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold text-lg px-8 py-6 h-auto gap-3"
                                      >
                                          <PlayCircle className="h-6 w-6" />
                                          Continue
                                      </Button>
                                  </CardContent>
                                  <CardFooter className="justify-center pt-0 pb-4">
                                      <Button variant="ghost" size="sm" onClick={() => {
                                          setIsVideoCompleted(false);
                                          if (videoRef.current) {
                                              videoRef.current.currentTime = 0;
                                              videoRef.current.play();
                                          }
                                      }} className="text-muted-foreground hover:text-black">
                                          Replay Video
                                      </Button>
                                  </CardFooter>
                              </Card>
                          </div>
                      )}
                      
                      {/* Top Left Actions */}
                      <div className={`absolute top-4 left-4 z-30 flex gap-2 transition-opacity ${isVideoCompleted ? 'opacity-0 pointer-events-none' : isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {activeTopic.interactiveContent && (
                            <Button variant="secondary" size="sm" onClick={() => setIsInteractiveMode(true)} className="backdrop-blur-md bg-black/40 text-blue-400 hover:bg-black/60 hover:text-blue-300 border-0 h-8">
                              <Gamepad2 className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                              {!isMobile && ' Practice'}
                            </Button>
                          )}

                          <Button variant="secondary" size="sm" onClick={captureScreenshot} className="backdrop-blur-md bg-black/40 text-white hover:bg-black/60 border-0 h-8">
                            <Camera className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                            {!isMobile && ' Snap'}
                          </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">No Video</div>
                  )
                 ) : (
                     // Audio Mode (Theatre)
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative">
                        {activeTopic?.audioUrl ? (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 z-0" />

                                {/* Audio Visualizer */}
                                <div className="z-10 flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
                                    <div className="relative">
                                        {/* Pulsing background */}
                                        <div className={`h-40 w-40 rounded-full bg-primary/20 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                                            <Headphones className="h-20 w-20 text-primary" />
                                        </div>

                                        {/* Animated audio bars */}
                                        {isPlaying && (
                                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-end gap-1.5 h-16">
                                                {[...Array(7)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-2 bg-primary rounded-full"
                                                        style={{
                                                            height: '100%',
                                                            animation: `audioBar ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                                                            animationDelay: `${i * 0.1}s`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center mt-8">
                                        <h3 className="font-semibold text-white text-2xl drop-shadow-md">{activeTopic.title}</h3>
                                        <p className="text-zinc-400 text-lg">Audio Lesson</p>
                                    </div>
                                </div>

                                <audio
                                    ref={audioRef}
                                    src={language === 'hi' && activeTopic.audioUrlHindi ? activeTopic.audioUrlHindi : activeTopic.audioUrl}
                                    onEnded={() => setIsPlaying(false)}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />

                                {/* Audio Controls */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20">
                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <Slider
                                            value={[audioCurrentTime]}
                                            max={audioDuration || 100}
                                            step={0.1}
                                            onValueChange={(value) => {
                                                if (audioRef.current) {
                                                    audioRef.current.currentTime = value[0];
                                                    setAudioCurrentTime(value[0]);
                                                }
                                            }}
                                            className="w-full cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                            <span>{formatTime(audioCurrentTime)}</span>
                                            <span>{formatTime(audioDuration)}</span>
                                        </div>
                                    </div>

                                    {/* Playback Controls */}
                                    <div className="flex items-center gap-3 md:gap-6 text-white">
                                        <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 shrink-0">
                                            {isPlaying ? <PauseCircle className="h-8 w-8" /> : <PlayCircle className="h-8 w-8" />}
                                        </Button>
                                        <div className="flex items-center gap-2 flex-1">
                                            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 shrink-0">
                                                {isMuted ? <VolumeX className="h-5 w-5 md:h-6 md:w-6" /> : <Volume2 className="h-5 w-5 md:h-6 md:w-6" />}
                                            </Button>
                                            <Slider value={isMuted ? [0] : volume} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-24 md:w-32" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-zinc-500">Audio source unavailable</div>
                        )}
                    </div>
                 )}
               </div>

               <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                  <div className="space-y-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{activeTopic?.title}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                             <Badge variant="secondary" className="font-normal">
                                Chapter: {selectedChapter.title}
                             </Badge>
                             <span>•</span>
                             <span>{activeTopic?.duration}</span>
                        </div>
                    </div>
                    
                    {selectedChapter.description && (
                        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                            {selectedChapter.description}
                        </p>
                    )}
                  </div>
               </div>
            </div>

            <div className={`${isMobile ? 'w-full border-t flex-1 overflow-y-auto' : 'w-[30%] border-l h-full'} bg-background shadow-2xl flex flex-col z-20 relative`}>
                <div className={`flex-1 flex flex-col p-4 space-y-4 ${isMobile ? '' : 'h-full overflow-hidden'}`}>
                  <div className="flex items-center justify-between shrink-0">
                      <h3 className="text-lg font-bold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Smart Notes</h3>
                      <div className="flex gap-1">
                         <Button variant="ghost" size="sm" onClick={addCurrentTimestamp}><Clock className="h-4 w-4 mr-1" /> Timestamp</Button>
                         <Button variant="ghost" size="icon" onClick={captureScreenshot}><Camera className="h-4 w-4" /></Button>
                      </div>
                  </div>

                  {/* Action Buttons - Visible in theatre mode */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FileText className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                          {!isMobile && ' View PDF'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`${isMobile ? 'fixed inset-x-0 top-16 bottom-0 w-screen h-[calc(100vh-4rem)] max-w-none rounded-none m-0 translate-x-0 translate-y-0' : 'max-w-4xl h-[80vh]'} flex flex-col`}>
                        <DialogHeader>
                          <DialogTitle>{activeTopic.title} - PDF</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 bg-muted rounded-md overflow-hidden relative">
                          <iframe
                            src={activeTopic.pdfUrl}
                            className="w-full h-full"
                            title="PDF Viewer"
                          />
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button variant="default" asChild>
                            <a href={activeTopic.pdfUrl} download target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> Download PDF
                            </a>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Video/Audio Toggle Button */}
                    {((language === 'hi' && activeTopic.videoUrlHindi && activeTopic.audioUrlHindi) ||
                      (language === 'en' && activeTopic.videoUrl && activeTopic.audioUrl)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsPlaying(false);
                          setMediaMode(mediaMode === 'video' ? 'audio' : 'video');
                        }}
                      >
                        {mediaMode === 'video' ? (
                          <>
                            <Music2 className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                            {!isMobile && ' Audio'}
                          </>
                        ) : (
                          <>
                            <Video className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                            {!isMobile && ' Video'}
                          </>
                        )}
                      </Button>
                    )}

                    <Dialog open={isInfographicOpen} onOpenChange={setIsInfographicOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ImageIcon className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                          {!isMobile && ' Infographic'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`${isMobile ? 'fixed inset-x-0 top-16 bottom-0 w-screen h-[calc(100vh-4rem)] max-w-none rounded-none m-0 translate-x-0 translate-y-0' : 'max-w-4xl max-h-[90vh]'} flex flex-col`}>
                        <DialogHeader>
                          <DialogTitle>{activeTopic.title} - Infographic</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto bg-muted/20 rounded-md flex items-center justify-center p-4">
                          <img
                            ref={infographicRef}
                            src={activeTopic.infographicUrl}
                            alt="Infographic"
                            className="max-w-full h-auto object-contain shadow-md rounded"
                          />
                        </div>
                        <div className="flex justify-end pt-2 gap-2">
                          <Button variant="outline" onClick={toggleInfographicFullscreen}>
                            <ZoomIn className="mr-2 h-4 w-4" /> View Larger
                          </Button>
                          <Button variant="default" asChild>
                            <a href={activeTopic.infographicUrl} download target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> Download Image
                            </a>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {activeTopic.interactiveContent && (
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsInteractiveMode(true)}>
                        <Gamepad2 className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                        {!isMobile && ' Practice'}
                      </Button>
                    )}

                    <Button
                      variant={completedTopicIds.has(activeTopic.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMarkComplete(activeTopic.id)}
                      className={completedTopicIds.has(activeTopic.id) ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {completedTopicIds.has(activeTopic.id) ? (
                        <>
                          <CheckCircle className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                          {!isMobile && ' Completed'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                          {!isMobile && ' Mark Complete'}
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />
                  <div className="relative shrink-0">
                       <Textarea 
                         value={notes}
                         onChange={(e) => setNotes(e.target.value)}
                         placeholder="Type notes... (Alt+N)"
                         className="min-h-[150px] resize-none"
                         onKeyDown={(e) => { if (e.altKey && e.key === 'n') { e.preventDefault(); addCurrentTimestamp(); } }}
                       />
                       <Button size="sm" className="absolute bottom-2 right-2" onClick={saveNote}>Save</Button>
                  </div>
                  
                  <div className="flex-1 flex flex-col min-h-0">
                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground">SAVED NOTES</h4>
                    <ScrollArea className="flex-1 h-full">
                        <div className="space-y-3 pr-3">
                             {savedNotes.map(note => {
                               const createdTime = parseInt(note.id);
                               const dateDisplay = !isNaN(createdTime) && createdTime > 1600000000000 
                                 ? new Date(createdTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                                 : null;

                               return (
                               <div key={note.id} className="border rounded p-3 text-sm bg-muted/30 hover:bg-muted transition-colors group relative">
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                     <div className="flex flex-col gap-0.5 min-w-0">
                                         <Button variant="link" className="p-0 h-auto text-primary font-mono text-xs justify-start" onClick={() => jumpToTime(note.timestamp)}>
                                            <Clock className="h-3 w-3 mr-1" /> {formatTime(note.timestamp)}
                                         </Button>
                                         {dateDisplay && <span className="text-[10px] text-muted-foreground truncate">{dateDisplay}</span>}
                                     </div>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNoteHandler(note.id);
                                        }}
                                        title="Delete Note"
                                     >
                                        <XCircle className="h-4 w-4" />
                                     </Button>
                                  </div>
                                  <div className="whitespace-pre-wrap mt-1">{note.content}</div>
                                  {note.imageUrl && <img src={note.imageUrl} className="mt-2 rounded border w-full bg-black" alt="snap" />}
                               </div>
                             )})}
                             {savedNotes.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No notes saved yet. Add notes while watching!
                                </div>
                             )}
                        </div>
                    </ScrollArea>
                  </div>
                </div>
            </div>
          </div>
        </div>
      );
    }

    // Standard Layout
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 h-[calc(100vh-64px)] flex flex-col relative">
        {showXP && <XPParticles amount={xpAmount} onComplete={() => setShowXP(false)} />}
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedChapter(null);
                setActiveTopic(null);
                // Navigate back to subject view
                if (degreeNode?.slug && subjectNode?.slug) {
                  navigate(buildCoursePath(degreeNode.slug, subjectNode.slug));
                }
              }} className="-ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
              </Button>
            )}
            {yearNode && (
              <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                degreeTitle={degreeNode?.title || courseData.degree}
                yearNode={yearNode}
              />
            )}
            <div className="h-4 w-px bg-border hidden md:block" />
            <h2 className="font-semibold text-lg hidden md:block">{selectedChapter.title}</h2>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full font-bold border-2 border-yellow-400 shadow-[2px_2px_0px_0px_rgba(250,204,21,1)] animate-in fade-in slide-in-from-top-4">
              <Sparkles className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{xp} XP</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 overflow-hidden">
          {/* Left: Topic List */}
          <Card className="flex flex-col h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:col-span-1 order-2 lg:order-1 rounded-xl bg-white overflow-hidden">
            <CardHeader className="pb-3 px-4 pt-4 border-b-2 border-black bg-slate-50">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <List className="h-5 w-5" />
                Course Content
              </CardTitle>
              <CardDescription className="font-bold text-slate-600">{(selectedChapter.children || []).length} Topics</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3 pb-4">
                {(selectedChapter.children || []).map((topic: Node) => {
                  const isLocked = topic.isPremium && !isSubscribed;
                  const isActive = activeTopic?.id === topic.id;
                  const isCompleted = completedTopicIds.has(topic.id);
                  
                  return (
                    <div 
                      key={topic.id}
                      className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all cursor-pointer border-2
                        ${isActive ? 'bg-blue-100 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:border-black hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                        ${isLocked ? 'opacity-60 grayscale hover:shadow-none hover:border-transparent hover:bg-transparent' : ''}
                      `}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 fill-green-100" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                        ) : (
                          <PlayCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 fill-blue-100' : 'text-slate-500'}`} />
                        )}
                        {topic.iconUrl && <img src={topic.iconUrl} alt="icon" className="h-6 w-6 object-contain" />}
                        <div className="line-clamp-1">{topic.title}</div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{topic.duration || "10:00"}</span>
                    </div>
                  );
                })}

                {/* Assessment Item */}
                {selectedChapter.assessment && selectedChapter.assessment.questions && (() => {
                    const allTopicsCompleted = (selectedChapter.children || []).every(t => completedTopicIds.has(t.id));
                    const isLocked = !allTopicsCompleted;
                    const assessment = selectedChapter.assessment!;
                    
                    return (
                        <>
                        <Separator className="bg-black/20 my-2" />
                        <div 
                          className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all cursor-pointer mt-2 border-2
                            ${!isLocked && !quizCompleted ? 'border-transparent hover:border-black hover:bg-indigo-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}
                            ${quizCompleted ? 'bg-green-100 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}
                            ${isLocked ? 'opacity-60 grayscale hover:shadow-none hover:border-transparent hover:bg-transparent' : ''}
                          `}
                          onClick={handleAssessmentClick}
                        >
                          <div className="flex items-center gap-3">
                            {quizCompleted ? (
                               <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 fill-green-100" />
                            ) : isLocked ? (
                               <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                            ) : (
                               <ClipboardList className="h-4 w-4 text-indigo-600 shrink-0" />
                            )}
                            <div className="line-clamp-1">Chapter Assessment</div>
                          </div>
                          {quizCompleted ? (
                              <span className="font-bold text-green-700">{quizScore}/{assessment.questions.length}</span>
                          ) : (
                              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{assessment.questions.length} Questions</span>
                          )}
                        </div>
                        </>
                    )
                })()}
              </div>
            </ScrollArea>
          </Card>

          {/* Right: Content Player & Details (hidden on mobile - theatre mode shows instead) */}
          {!isMobile && (
            <div className="lg:col-span-2 flex flex-col h-full space-y-4 md:space-y-6 overflow-auto order-1 lg:order-2">
              {activeTopic ? (
              <div className="space-y-4 md:space-y-6">
                {/* Custom Video Player */}
                <div
                  ref={playerContainerRef}
                  className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-lg"
                >
                   {/* Mode Toggles */}
                   <div className="absolute top-4 right-4 z-30 flex gap-2 transition-opacity">
                       <div className="flex bg-black/40 backdrop-blur-md rounded-md p-0.5 gap-0.5 items-center border border-white/10">
                           <Button
                               size="sm"
                               variant={language === 'en' ? 'secondary' : 'ghost'}
                               className={`h-7 text-[10px] px-2 ${language !== 'en' ? 'text-white hover:bg-white/20' : 'bg-white text-black'}`}
                               onClick={(e) => { e.stopPropagation(); setLanguage('en'); }}
                           >
                               EN
                           </Button>
                           <Button
                               size="sm"
                               variant={language === 'hi' ? 'secondary' : 'ghost'}
                               className={`h-7 text-[10px] px-2 ${language !== 'hi' ? 'text-white hover:bg-white/20' : 'bg-white text-black'}`}
                               onClick={(e) => { e.stopPropagation(); setLanguage('hi'); }}
                           >
                               HI
                           </Button>
                       </div>
                       {(language === 'hi' ? (activeTopic.videoUrlHindi && activeTopic.audioUrlHindi) : (activeTopic.videoUrl && activeTopic.audioUrl)) && (
                         <>
                           <Button 
                             size="sm" 
                             variant={mediaMode === 'video' ? 'secondary' : 'ghost'} 
                             className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'video' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                             onClick={(e) => {
                                 e.stopPropagation();
                                 setIsPlaying(false);
                                 setMediaMode('video');
                             }}
                           >
                               Video
                           </Button>
                           <Button 
                             size="sm" 
                             variant={mediaMode === 'audio' ? 'secondary' : 'ghost'} 
                             className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'audio' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                             onClick={(e) => {
                                 e.stopPropagation();
                                 setIsPlaying(false);
                                 setMediaMode('audio');
                             }}
                           >
                               Audio
                           </Button>
                         </>
                       )}
                       
                        {/* Theatre Mode button moved to bottom right */}
                   </div>

                   {/* Top Right Actions */}
                   <div className="absolute top-4 right-4 z-30 flex gap-2">
                        {activeTopic.videoUrl && activeTopic.audioUrl && (
                           <>
                               <Button 
                                 size="sm" 
                                 variant={mediaMode === 'video' ? 'secondary' : 'ghost'} 
                                 className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'video' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     setIsPlaying(false);
                                     setMediaMode('video');
                                 }}
                               >
                                   Video
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant={mediaMode === 'audio' ? 'secondary' : 'ghost'} 
                                 className={`h-8 text-xs backdrop-blur-md ${mediaMode !== 'audio' ? 'bg-black/40 text-white hover:bg-black/60' : ''}`}
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     setIsPlaying(false);
                                     setMediaMode('audio');
                                 }}
                               >
                                   Audio
                               </Button>
                           </>
                        )}
                        
                        {!isMobile && (
                          <Button
                             size="sm"
                             variant="secondary"
                             className="h-8 backdrop-blur-md bg-black/60 text-white hover:bg-black/80 border-0 shadow-sm"
                             onClick={() => {
                               // Save current timestamp before entering theatre mode
                               const media = mediaMode === 'video' ? videoRef.current : audioRef.current;
                               if (media) {
                                 setSavedTimestamp(media.currentTime);
                               }
                               setIsTheatreMode(true);
                             }}
                          >
                            <LayoutTemplate className="mr-2 h-3.5 w-3.5" /> Theatre Mode
                          </Button>
                        )}
                   </div>

                   {/* Left Actions */}
                   <div className="absolute top-4 left-4 z-30 flex gap-2 transition-opacity">
                        <Select value={playbackRate} onValueChange={handleSpeedChange}>
                            <SelectTrigger className="w-[70px] h-8 backdrop-blur-md bg-black/40 text-white border-0 hover:bg-black/60 focus:ring-0 focus:ring-offset-0 text-xs">
                              <SelectValue placeholder="1x" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5">0.5x</SelectItem>
                              <SelectItem value="1">1x</SelectItem>
                              <SelectItem value="1.25">1.25x</SelectItem>
                              <SelectItem value="1.5">1.5x</SelectItem>
                              <SelectItem value="2">2x</SelectItem>
                            </SelectContent>
                        </Select>

                        {activeTopic.interactiveContent && (
                            <Button variant="secondary" size="icon" onClick={() => setIsInteractiveMode(true)} className="h-8 w-8 backdrop-blur-md bg-black/40 text-blue-400 hover:bg-black/60 hover:text-blue-300 border-0">
                              <Gamepad2 className="h-4 w-4" />
                            </Button>
                          )}

                          <Button variant="secondary" size="icon" onClick={captureScreenshot} className="h-8 w-8 backdrop-blur-md bg-black/40 text-white hover:bg-black/60 border-0">
                            <Camera className="h-4 w-4" />
                          </Button>
                   </div>

                   {mediaMode === 'video' ? (
                       activeTopic.videoUrl ? (
                         <>
                           {isIframeUrl(activeTopic.videoUrl) ? (
                             <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                               <iframe
                                 src={activeTopic.videoUrl}
                                 className="absolute"
                                 allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                 allowFullScreen
                                 style={{
                                   border: 'none',
                                   position: 'absolute',
                                   top: '50%',
                                   left: '50%',
                                   transform: 'translate(-50%, -50%)',
                                   width: '234%',
                                   height: '200%',
                                   minWidth: '234%',
                                   minHeight: '200%'
                                 }}
                               />
                             </div>
                           ) : (
                             <video
                               ref={videoRef}
                               src={activeTopic.videoUrl}
                               className="w-full h-full object-cover"
                               crossOrigin="anonymous"
                               controls
                               playsInline
                               onEnded={() => setIsPlaying(false)}
                               onPlay={() => setIsPlaying(true)}
                               onPause={() => setIsPlaying(false)}
                             />
                           )}
                           {/* Floating Theatre Mode Button removed to prevent overlap */}
                         </>
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                           <p>Video source unavailable</p>
                         </div>
                       )
                   ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative">
                           {activeTopic.audioUrl ? (
                               <>
                                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 z-0" />

                                   {/* Audio Visualizer */}
                                   <div className="z-10 flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500">
                                       <div className="relative">
                                           {/* Pulsing background */}
                                           <div className={`h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                                               <Headphones className="h-12 w-12 text-primary" />
                                           </div>

                                           {/* Animated audio bars */}
                                           {isPlaying && (
                                               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-end gap-1 h-12">
                                                   {[...Array(5)].map((_, i) => (
                                                       <div
                                                           key={i}
                                                           className="w-1.5 bg-primary rounded-full"
                                                           style={{
                                                               height: '100%',
                                                               animation: `audioBar ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                                                               animationDelay: `${i * 0.1}s`,
                                                           }}
                                                       />
                                                   ))}
                                               </div>
                                           )}
                                       </div>

                                       <div className="text-center mt-4">
                                           <h3 className="font-semibold text-white text-lg drop-shadow-md">{activeTopic.title}</h3>
                                           <p className="text-zinc-400 text-sm">Audio Lesson</p>
                                       </div>
                                   </div>

                                   <audio
                                       ref={audioRef}
                                       src={activeTopic.audioUrl}
                                       onEnded={() => setIsPlaying(false)}
                                       onPlay={() => setIsPlaying(true)}
                                       onPause={() => setIsPlaying(false)}
                                   />

                                   {/* Audio Controls (Compact) */}
                                   <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20">
                                       {/* Progress Bar */}
                                       <div className="mb-2">
                                           <Slider
                                               value={[audioCurrentTime]}
                                               max={audioDuration || 100}
                                               step={0.1}
                                               onValueChange={(value) => {
                                                   if (audioRef.current) {
                                                       audioRef.current.currentTime = value[0];
                                                       setAudioCurrentTime(value[0]);
                                                   }
                                               }}
                                               className="w-full cursor-pointer"
                                           />
                                           <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                                               <span>{formatTime(audioCurrentTime)}</span>
                                               <span>{formatTime(audioDuration)}</span>
                                           </div>
                                       </div>

                                       {/* Playback Controls */}
                                       <div className="flex items-center gap-2 text-white">
                                           <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8 shrink-0">
                                               {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                                           </Button>
                                           <div className="flex items-center gap-1 flex-1">
                                               <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-8 w-8 shrink-0">
                                                   {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                               </Button>
                                               <Slider value={isMuted ? [0] : volume} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-20" />
                                           </div>
                                       </div>
                                   </div>
                               </>
                           ) : (
                               <div className="text-zinc-500">Audio source unavailable</div>
                           )}
                       </div>
                   )}
                   
                   {/* Custom Controls Overlay Removed since we use native controls */}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                   <div className="flex gap-3">
                     <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
                       <DialogTrigger asChild>
                         <Button variant="outline">
                           <FileText className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                           {!isMobile && ' View PDF'}
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                         <DialogHeader>
                           <DialogTitle>{activeTopic.title} - PDF</DialogTitle>
                         </DialogHeader>
                         <div className="flex-1 bg-muted rounded-md overflow-hidden relative">
                            <iframe 
                              src={activeTopic.pdfUrl} 
                              className="w-full h-full"
                              title="PDF Viewer"
                            />
                         </div>
                         <div className="flex justify-end pt-2">
                           <Button variant="default" asChild>
                             <a href={activeTopic.pdfUrl} download target="_blank" rel="noopener noreferrer">
                               <Download className="mr-2 h-4 w-4" /> Download PDF
                             </a>
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>

                     {/* Video/Audio Toggle Button */}
                     {((language === 'hi' && activeTopic.videoUrlHindi && activeTopic.audioUrlHindi) ||
                       (language === 'en' && activeTopic.videoUrl && activeTopic.audioUrl)) && (
                       <Button
                         variant="outline"
                         onClick={() => {
                           setIsPlaying(false);
                           setMediaMode(mediaMode === 'video' ? 'audio' : 'video');
                         }}
                       >
                         {mediaMode === 'video' ? (
                           <>
                             <Music2 className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                             {!isMobile && ' Audio'}
                           </>
                         ) : (
                           <>
                             <Video className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                             {!isMobile && ' Video'}
                           </>
                         )}
                       </Button>
                     )}

                     <Dialog open={isInfographicOpen} onOpenChange={setIsInfographicOpen}>
                       <DialogTrigger asChild>
                         <Button variant="outline">
                           <ImageIcon className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                           {!isMobile && ' Infographic'}
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                         <DialogHeader>
                           <DialogTitle>{activeTopic.title} - Infographic</DialogTitle>
                         </DialogHeader>
                         <div className="flex-1 overflow-auto bg-muted/20 rounded-md flex items-center justify-center p-4">
                           <img 
                             ref={infographicRef}
                             src={activeTopic.infographicUrl} 
                             alt="Infographic" 
                             className="max-w-full h-auto object-contain shadow-md rounded"
                           />
                         </div>
                         <div className="flex justify-end pt-2 gap-2">
                           <Button variant="outline" onClick={toggleInfographicFullscreen}>
                             <ZoomIn className="mr-2 h-4 w-4" /> View Larger
                           </Button>
                           <Button variant="default" asChild>
                             <a href={activeTopic.infographicUrl} download target="_blank" rel="noopener noreferrer">
                               <Download className="mr-2 h-4 w-4" /> Download Image
                             </a>
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>

                     {/* Assessment Dialog */}
                     <Dialog open={isQuizOpen} onOpenChange={(open) => !open && resetQuiz()}>
                       <DialogContent className="max-w-2xl">
                         <DialogHeader>
                           <DialogTitle>Assessment: {selectedChapter.title}</DialogTitle>
                         </DialogHeader>
                         
                         {(selectedChapter as any).assessment && (
                             <div className="py-4">
                                {quizCompleted ? (
                                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                        {(() => {
                                            const totalQuestions = (selectedChapter as any).assessment.questions.length;
                                            const score = quizScore || 0;
                                            const percentage = (score / totalQuestions) * 100;
                                            const isPassed = percentage > 60;
                                            
                                            return (
                                                <>
                                                    <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        {isPassed ? (
                                                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-10 w-10 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-2xl font-bold">{isPassed ? "Assessment Passed!" : "Assessment Failed"}</h3>
                                                        <p className="text-muted-foreground">You scored {score} out of {totalQuestions} ({Math.round(percentage)}%)</p>
                                                        {!isPassed && <p className="text-sm text-red-500 mt-1">You need more than 60% to pass.</p>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!isPassed && (
                                                            <Button onClick={retakeQuiz} variant="destructive" className="w-full sm:w-auto">
                                                                Retake Assessment
                                                            </Button>
                                                        )}
                                                        <Button onClick={resetQuiz} variant={!isPassed ? "outline" : "default"} className="w-full sm:w-auto">
                                                            Close
                                                        </Button>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <span>Question {currentQuestionIndex + 1} of {(selectedChapter as any).assessment.questions.length}</span>
                                            <Progress value={((currentQuestionIndex + 1) / (selectedChapter as any).assessment.questions.length) * 100} className="w-1/2 h-2" />
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">{(selectedChapter as any).assessment.questions[currentQuestionIndex].text}</h3>
                                            <div className="space-y-2">
                                                {(selectedChapter as any).assessment.questions[currentQuestionIndex].options.map((option: string, idx: number) => (
                                                    <div 
                                                        key={idx}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${quizAnswers[(selectedChapter as any).assessment.questions[currentQuestionIndex].id] === idx ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-muted'}`}
                                                        onClick={() => handleQuizAnswer((selectedChapter as any).assessment.questions[currentQuestionIndex].id, idx)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${quizAnswers[(selectedChapter as any).assessment.questions[currentQuestionIndex].id] === idx ? 'border-indigo-600' : 'border-gray-400'}`}>
                                                                {quizAnswers[(selectedChapter as any).assessment.questions[currentQuestionIndex].id] === idx && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                                                            </div>
                                                            {option}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between pt-4">
                                            <Button 
                                                variant="outline" 
                                                disabled={currentQuestionIndex === 0}
                                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                            >
                                                Previous
                                            </Button>
                                            
                                            {currentQuestionIndex === (selectedChapter as any).assessment.questions.length - 1 ? (
                                                <Button onClick={submitQuiz} disabled={quizAnswers[(selectedChapter as any).assessment.questions[currentQuestionIndex].id] === undefined}>
                                                    Submit Assessment
                                                </Button>
                                            ) : (
                                                <Button 
                                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                                    disabled={quizAnswers[(selectedChapter as any).assessment.questions[currentQuestionIndex].id] === undefined}
                                                >
                                                    Next Question
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                         )}
                       </DialogContent>
                     </Dialog>

                     {activeTopic.interactiveContent && (
                       <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsInteractiveMode(true)}>
                          <Gamepad2 className="mr-2 h-4 w-4" /> Interactive Practice
                       </Button>
                     )}

                     <Button 
                        variant={completedTopicIds.has(activeTopic.id) ? "secondary" : "default"}
                        onClick={() => handleMarkComplete(activeTopic.id)}
                        disabled={completedTopicIds.has(activeTopic.id)}
                     >
                       {completedTopicIds.has(activeTopic.id) ? (
                         <>
                           <CheckCircle2 className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                           {!isMobile && ' Completed'}
                         </>
                       ) : (
                         <>
                           <CheckCircle className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                           {!isMobile && ' Mark Complete'}
                         </>
                       )}
                     </Button>
                   </div>
                   <Badge variant="outline" className="text-sm px-3 py-1">
                     Chapter: {selectedChapter.title}
                   </Badge>
                </div>

                {/* Desktop: Pro Notes Panel (hidden on mobile) */}
                {!isMobile && (
                  <>
                    <Separator />

                    {/* Pro Notes Panel */}
                    <Card className="flex flex-col min-h-[500px]">
                  <CardHeader className="pb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Pro Notes
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                         {savedNotes.length} Saved
                      </Badge>
                    </div>
                    <CardDescription>
                      Smart notes with timestamps & screenshots.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                     {/* Editor Tools */}
                     <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/40 overflow-x-auto">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={addCurrentTimestamp} title="Add Timestamp (Alt+T)">
                           <Clock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600" onClick={captureScreenshot} title="Snap Screenshot">
                           <Camera className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('bold')}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('italic')}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('heading')}><Heading className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('code')}><Code className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('list')}><List className="h-4 w-4" /></Button>
                     </div>

                     {/* Editor */}
                     <div className="relative">
                       <Textarea 
                         ref={textareaRef}
                         value={notes}
                         onChange={(e) => setNotes(e.target.value)}
                         placeholder="Type your notes here... (Alt+N to timestamp)"
                         className="min-h-[120px] font-mono text-sm resize-y"
                         onKeyDown={(e) => {
                           if (e.altKey && e.key === 'n') {
                              e.preventDefault();
                              addCurrentTimestamp();
                           }
                         }}
                       />
                       <Button size="sm" className="absolute bottom-2 right-2 h-7" onClick={saveNote}>Save Note</Button>
                     </div>

                     {/* Saved Notes List */}
                     <div className="flex-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2">Your Saved Notes</h4>
                        <ScrollArea className="h-[300px] pr-4 border rounded-md p-2">
                          <div className="space-y-3">
                             {savedNotes.map(note => (
                               <div key={note.id} className="group border-b last:border-0 pb-3 last:pb-0 text-sm space-y-2">
                                  <div className="flex items-center justify-between">
                                     <Button variant="link" className="p-0 h-auto text-primary font-mono text-xs flex items-center gap-1" onClick={() => jumpToTime(note.timestamp)}>
                                        <PlayCircle className="h-3 w-3" />
                                        {formatTime(note.timestamp)}
                                     </Button>
                                     <span className="text-xs text-muted-foreground">
                                       {new Date(parseInt(note.id)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </span>
                                  </div>
                                  <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                                     {note.content}
                                  </div>
                                  {note.imageUrl && (
                                    <div className="relative rounded-md overflow-hidden border cursor-pointer mt-2 group/img" onClick={() => {
                                       const w = window.open("");
                                       if(w) { w.document.write('<img src="'+note.imageUrl+'" style="max-width:100%"/>'); }
                                    }}>
                                       <img src={note.imageUrl} alt="Screenshot" className="w-full object-cover max-h-[200px]" />
                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                          <ZoomIn className="h-6 w-6" />
                                       </div>
                                    </div>
                                  )}
                               </div>
                             ))}
                             {savedNotes.length === 0 && (
                               <div className="text-center py-8 text-muted-foreground text-xs">
                                 No notes yet. use the tools above!
                               </div>
                             )}
                          </div>
                        </ScrollArea>
                     </div>
                  </CardContent>
                </Card>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted">
                  <PlayCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-foreground">Select a Topic</h3>
                  <p>Choose a topic from the list to start learning.</p>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    );
  }

  // Default Grid View
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* XP Animation */}
      {showXP && <XPParticles amount={xpAmount} onComplete={() => setShowXP(false)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 gap-4">
        <div>
          

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{courseData.title}</h1>
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
          <div className="text-sm font-medium">Course Progress</div>
          <Progress value={33} className="w-full md:w-[200px] mt-2" />
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 pb-8">
        {chapters.map((chapter) => (
          <Card
            key={chapter.id}
            data-chapter-id={chapter.id}
            className="group cursor-pointer bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
            onClick={() => handleChapterClick(chapter)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                 <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-2 border-black font-bold rounded-md hover:bg-blue-200">
                   {chapter.metadata?.topicCount || chapter.children?.length || 0} Topics
                 </Badge>
                 {/* Completion check can be added later with user progress data */}
              </div>
              <CardTitle className="font-black text-xl leading-tight group-hover:text-blue-700 transition-colors">{chapter.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-slate-600 font-medium mt-1">{chapter.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
               <div className="space-y-2">
                   <div className="flex justify-between text-sm font-bold">
                     <span>Topics</span>
                     <span>{chapter.metadata?.topicCount || chapter.children?.length || 0} Total</span>
                   </div>
                   {/* Progress tracking can be added with user progress data */}
                   <div className="h-4 w-full bg-gray-100 border-2 border-black rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: '0%' }}
                      />
                   </div>
               </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button 
                className={`w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-bold ${chapter.completedCount > 0 ? "bg-green-400 hover:bg-green-500 text-black" : "bg-black hover:bg-gray-800 text-white"}`}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleChapterClick(chapter);
                }}
              >
                {chapter.completedCount > 0 ? "Continue Learning" : (
                    (chapter.children || []).some(t => t.isPremium) && !isSubscribed ?
                    <><PlayCircle className="mr-2 h-4 w-4" /> Start Chapter <span className="text-xs ml-2 opacity-75">(Contains Premium)</span></> :
                    <><PlayCircle className="mr-2 h-4 w-4" /> Start Chapter</>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {yearNode && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          degreeTitle={degreeNode?.title || courseData.degree}
          yearNode={yearNode}
        />
      )}
    </div>
  );
}
