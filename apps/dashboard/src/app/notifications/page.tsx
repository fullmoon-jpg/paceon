// apps/dashboard/src/app/notifications/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Bell, Users, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useRealtimeNotifications";

type FilterType = "all" | "social" | "system";

const NotificationsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications(user?.id || null);

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === "all") return true;
      return notif.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  const counts = useMemo(() => {
    return {
      unread: unreadCount,
      socialUnread: notifications.filter((n) => n.type === "social" && !n.is_read).length,
      systemUnread: notifications.filter((n) => n.type === "system" && !n.is_read).length,
    };
  }, [notifications, unreadCount]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const getNotificationIcon = (notif: typeof notifications[0]) => {
    if (notif.type === "social" && notif.actor?.avatar_url) {
      return (
        <img
          src={notif.actor.avatar_url}
          alt={notif.actor.full_name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
        />
      );
    }

    if (notif.type === "social") {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#15b392] to-[#2a6435] flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15b392] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign in to view notifications
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            You need to be logged in to see your notifications
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="px-6 py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                {!isConnected && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                    Reconnecting...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshNotifications}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {counts.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[#15b392] hover:text-[#129176] font-semibold text-xs sm:text-sm transition-colors duration-200"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-4 sm:space-x-8 border-b border-gray-200 dark:border-gray-700 -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative whitespace-nowrap text-sm sm:text-base ${
                  activeFilter === "all"
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                All
                {counts.unread > 0 && <span className="ml-1 text-[#15b392]">({counts.unread})</span>}
              </button>
              <button
                onClick={() => setActiveFilter("social")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative whitespace-nowrap text-sm sm:text-base ${
                  activeFilter === "social"
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Social
                {counts.socialUnread > 0 && (
                  <span className="ml-1 text-[#15b392]">({counts.socialUnread})</span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter("system")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative whitespace-nowrap text-sm sm:text-base ${
                  activeFilter === "system"
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                System
                {counts.systemUnread > 0 && (
                  <span className="ml-1 text-[#15b392]">({counts.systemUnread})</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer ${
                  !notif.is_read ? "border-l-4 border-l-[#15b392]" : ""
                }`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="px-4 py-3 sm:py-4 flex items-start space-x-3">
                  {getNotificationIcon(notif)}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !notif.is_read
                          ? "font-semibold text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notif.created_at)}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-[#15b392] rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 sm:py-16 text-center">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeFilter === "all"
                  ? "When you get notifications, they'll show up here"
                  : `You don't have any ${activeFilter} notifications`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
