import { useState, useEffect } from "react";
import { Play, Book, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import * as db from "../../utils/supabase/database";

interface ContinueLearningProps {
  userId: string;
  onResume: (subjectId: string, chapterId: string, topicId: string) => void;
}

export function ContinueLearning({ userId, onResume }: ContinueLearningProps) {
  const [learningData, setLearningData] = useState<db.ContinueLearningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContinueLearning();
  }, [userId]);

  const loadContinueLearning = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await db.getContinueLearning(userId);
      setLearningData(data);
    } catch (error) {
      console.error("❌ Error loading continue learning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = () => {
    if (learningData) {
      onResume(learningData.subject_id, learningData.chapter_id, learningData.topic_id);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!learningData) {
    return (
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Book className="h-6 w-6 text-slate-400" />
            <h3 className="font-black text-lg">Continue Learning</h3>
          </div>
          <p className="text-slate-500 text-sm">
            Start exploring topics to see your progress here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px)] transition-all bg-gradient-to-br from-purple-50 via-blue-50 to-white cursor-pointer group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg border-2 border-black group-hover:bg-purple-200 transition-colors">
              <Play className="h-5 w-5 text-purple-600 fill-purple-600" />
            </div>
            <h3 className="font-black text-lg">Continue Learning</h3>
          </div>
          <Button
            onClick={handleResume}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold"
          >
            Resume
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Breadcrumb - Subject → Chapter → Topic */}
        <div className="space-y-2 mb-4">
          {/* Subject */}
          <div className="flex items-center gap-2 text-sm">
            <Book className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-indigo-700">{learningData.subject_title}</span>
          </div>

          {/* Chapter */}
          <div className="flex items-center gap-2 text-sm pl-6">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-700">{learningData.chapter_title}</span>
          </div>

          {/* Topic */}
          <div className="flex items-center gap-2 text-sm pl-12">
            <ChevronRight className="h-4 w-4 text-purple-600" />
            <span className="font-bold text-purple-900">{learningData.topic_title}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Chapter Progress</span>
            <span className="text-purple-700">
              {learningData.completed_topics}/{learningData.total_topics} topics
            </span>
          </div>
          <Progress
            value={learningData.progress_percentage}
            className="h-3 border-2 border-black bg-white"
          />
          <p className="text-xs text-slate-500 text-right">
            {learningData.progress_percentage}% complete
          </p>
        </div>

        {/* Last accessed */}
        <div className="mt-4 pt-4 border-t-2 border-slate-200">
          <p className="text-xs text-slate-500">
            Last accessed: {new Date(learningData.last_accessed).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
