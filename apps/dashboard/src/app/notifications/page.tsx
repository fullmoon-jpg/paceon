// apps/dashboard/src/app/notifications/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Bell, Users, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useRealtimeNotifications";

type FilterType = "all" | "social" | "system";

// Skeleton Loading Component
function SkeletonNotification() {
  return (
    <div className="border-b border-gray-200 dark:border-[#3d4459] px-4 py-4 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

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
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#21C36E] to-[#15b392] flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    );
  };

  // Loading state with skeleton
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837]">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-[#F4F4EF] dark:bg-[#242837] border-b border-gray-200 dark:border-[#3d4459]">
            <div className="px-4 py-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse" />
              <div className="flex space-x-8 border-b border-gray-200 dark:border-[#3d4459]">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-3 animate-pulse" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-3 animate-pulse" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-3 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Notifications Skeleton */}
          <div className="bg-white dark:bg-[#2d3548]">
            {[...Array(5)].map((_, i) => (
              <SkeletonNotification key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200 dark:border-[#3d4459]">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-[#3F3E3D] dark:text-white mb-4">
            Sign in to view notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to see your notifications
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="inline-block px-6 py-3 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#242837]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#242837] border-b border-gray-200 dark:border-[#3d4459] z-10">
          <div className="px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#3F3E3D] dark:text-white">
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
                  className="p-2 hover:bg-white dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {counts.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[#FB6F7A] hover:text-[#F47A49] font-semibold text-xs sm:text-sm transition-colors duration-200"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-[#3d4459]">
              <div className="flex border-b border-gray-200 dark:border-[#3d4459]">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                    activeFilter === "all"
                      ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
                  }`}
                >
                  All
                  {counts.unread > 0 && (
                    <span className="ml-1 text-[#FB6F7A]">({counts.unread})</span>
                  )}
                  {activeFilter === "all" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveFilter("social")}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                    activeFilter === "social"
                      ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
                  }`}
                >
                  Social
                  {counts.socialUnread > 0 && (
                    <span className="ml-1 text-[#FB6F7A]">({counts.socialUnread})</span>
                  )}
                  {activeFilter === "social" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveFilter("system")}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                    activeFilter === "system"
                      ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
                  }`}
                >
                  System
                  {counts.systemUnread > 0 && (
                    <span className="ml-1 text-[#FB6F7A]">({counts.systemUnread})</span>
                  )}
                  {activeFilter === "system" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-[#2d3548] mt-4 mx-4 rounded-xl shadow-md border border-gray-200 dark:border-[#3d4459] overflow-hidden">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif, index) => (
              <div
                key={notif.id}
                className={`hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] transition-colors duration-150 cursor-pointer ${
                  index !== filteredNotifications.length - 1
                    ? "border-b border-gray-200 dark:border-[#3d4459]"
                    : ""
                } ${!notif.is_read ? "bg-[#FFF5F6] dark:bg-[#3d2d2e]" : ""}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="px-4 py-3 sm:py-4 flex items-start space-x-3">
                  {/* Indicator for unread */}
                  <div className="flex items-start gap-3 flex-1">
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-[#FB6F7A] rounded-full mt-2 flex-shrink-0" />
                    )}
                    
                    {getNotificationIcon(notif)}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !notif.is_read
                            ? "font-semibold text-[#3F3E3D] dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 sm:py-16 text-center">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-[#3F3E3D] dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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
