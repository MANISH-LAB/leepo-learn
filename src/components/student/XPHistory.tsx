import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Trophy, Loader2, ChevronLeft, ChevronRight, Sparkles, Award } from "lucide-react";
import { fetchUserXPHistory, XPHistoryItem } from "../../utils/supabase/database";

interface XPHistoryProps {
  userId: string;
}

export function XPHistory({ userId }: XPHistoryProps) {
  const [history, setHistory] = useState<XPHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadHistory();
  }, [currentPage, userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await fetchUserXPHistory(userId, currentPage, itemsPerPage);
      setHistory(result.items);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Error loading XP history:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const totalXP = totalItems * 50; // 50 XP per completed video

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section with Gradient */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Trophy className="h-10 w-10 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-300 mb-2">XP History</h1>
                  <p className="text-black dark:text-gray-300 text-lg">Track your learning journey and achievements</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-4 border border-purple-200 dark:border-white/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-black dark:text-gray-300 text-sm font-medium">Total XP Earned</p>
                      <p className="text-purple-700 dark:text-purple-200 text-2xl font-bold">{totalXP.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-4 border border-purple-200 dark:border-white/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-black dark:text-gray-300 text-sm font-medium">Videos Completed</p>
                      <p className="text-purple-700 dark:text-purple-200 text-2xl font-bold">{totalItems}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-4 border border-purple-200 dark:border-white/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-black dark:text-gray-300 text-sm font-medium">Average XP/Video</p>
                      <p className="text-purple-700 dark:text-purple-200 text-2xl font-bold">50</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Completion History
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-2xl opacity-50"></div>
                <Trophy className="relative h-20 w-20 mx-auto mb-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No XP earned yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Complete videos to start earning XP and tracking your progress!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="w-[35%] font-semibold">Video Title</TableHead>
                      <TableHead className="font-semibold">Chapter</TableHead>
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="text-center font-semibold">XP</TableHead>
                      <TableHead className="text-right font-semibold">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </span>
                            {item.video_title}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                          {item.chapter_title}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                          {item.subject_title}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full text-sm font-bold shadow-md">
                            <Sparkles className="h-3 w-3" />
                            +{item.xp_earned}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.completed_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Showing page <span className="text-purple-600 dark:text-purple-400 font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
