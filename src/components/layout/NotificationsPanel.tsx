import { useState, useEffect } from "react";
import { Bell, CheckCheck, Sparkles, Trophy, Flame, TestTube } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import * as db from "../../utils/supabase/database";
import { formatTimeAgo } from "../../utils/timeUtils";
import { toast } from "sonner";

interface NotificationsPanelProps {
  userId?: string;
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<db.UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      console.log('🔔 NotificationsPanel: Loading notifications for user:', userId);
      loadNotifications();
      loadUnreadCount();
    }
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      console.log('🔔 Fetching notifications...');
      const data = await db.getUserNotifications(userId);
      console.log('🔔 Received notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId) return;

    try {
      const count = await db.getUnreadNotificationCount(userId);
      console.log('🔔 Unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error("❌ Error loading unread count:", error);
    }
  };

  const handleCreateTestNotification = async () => {
    if (!userId) return;

    try {
      console.log('🧪 Creating test notification...');
      const success = await db.createTestNotification(userId);
      if (success) {
        toast.success('Test notification created!');
        // Reload notifications
        await loadNotifications();
        await loadUnreadCount();
      } else {
        toast.error('Failed to create test notification');
      }
    } catch (error) {
      console.error('❌ Error creating test notification:', error);
      toast.error('Error creating test notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    const success = await db.markAllNotificationsAsRead(userId);
    if (success) {
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleNotificationClick = async (notification: db.UserNotification) => {
    if (!notification.is_read) {
      const success = await db.markNotificationAsRead(notification.id);
      if (success) {
        setUnreadCount(Math.max(0, unreadCount - 1));
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      }
    }
  };

  // Refresh when dropdown opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && userId) {
      loadNotifications();
      loadUnreadCount();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case 'topic_completed':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'assessment_completed':
        return <Trophy className="h-5 w-5 text-blue-500" />;
      case 'streak':
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-8 w-8 md:h-10 md:w-10"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              className="absolute top-0 right-0 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[calc(100vw-2rem)] md:w-96 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-slate-50">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h3>
          <div className="flex gap-2">
            {notifications.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateTestNotification}
                className="text-xs font-bold hover:bg-white border-2 border-transparent hover:border-black transition-all"
              >
                <TestTube className="h-4 w-4 mr-1" />
                Test
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold hover:bg-white border-2 border-transparent hover:border-black transition-all"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-semibold">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Complete topics and assessments to earn notifications!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateTestNotification}
                className="mt-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Create Test Notification
              </Button>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-all hover:bg-yellow-50 ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-bold text-sm ${!notification.is_read ? 'text-black' : 'text-slate-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1"></div>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>

                      {/* Metadata */}
                      {notification.metadata?.xpEarned && (
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                          <Sparkles className="h-3 w-3" />
                          +{notification.metadata.xpEarned} XP
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-2">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t-2 border-black bg-slate-50 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Showing {notifications.length} most recent notifications
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
