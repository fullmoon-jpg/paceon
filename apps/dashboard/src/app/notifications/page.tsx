"use client"
import React, { useState, useEffect } from "react";
import { Bell, Users, Settings, Check } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  type: 'system' | 'social';
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  actor_id: string | null;
  metadata: {
    actor_name?: string;
    actor_avatar?: string;
    [key: string]: any;
  };
  related_entity_type?: string;
  related_entity_id?: string;
}

const NotificationsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "social" | "system">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Updated notification:', payload);
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id ? (payload.new as Notification) : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === "all") return true;
    return notif.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const socialUnreadCount = notifications.filter(n => n.type === "social" && !n.is_read).length;
  const systemUnreadCount = notifications.filter(n => n.type === "system" && !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', userId!);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId!)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notif => ({ 
        ...notif, 
        is_read: true,
        read_at: new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const getNotificationIcon = (notif: Notification) => {
    // Social notifications with actor avatar
    if (notif.type === 'social' && notif.metadata?.actor_avatar) {
      return (
        <img 
          src={notif.metadata.actor_avatar} 
          alt="User avatar" 
          className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
        />
      );
    }
    
    // Social notifications without avatar - use default avatar
    if (notif.type === 'social') {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-white" />
        </div>
      );
    }
    
    // System notifications
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#15b392] to-[#2a6435] flex items-center justify-center flex-shrink-0">
        <Bell className="w-6 h-6 text-white" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15b392] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[#15b392] hover:text-[#129176] font-semibold text-sm transition-colors duration-200"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 -mb-px">
              <button
                onClick={() => setActiveFilter("all")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative ${
                  activeFilter === "all"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                All
                {unreadCount > 0 && (
                  <span className="ml-1 text-[#15b392]">({unreadCount})</span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter("social")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative ${
                  activeFilter === "social"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Social
                {socialUnreadCount > 0 && (
                  <span className="ml-1 text-[#15b392]">({socialUnreadCount})</span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter("system")}
                className={`pb-3 font-semibold transition-all duration-200 border-b-2 relative ${
                  activeFilter === "system"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                System
                {systemUnreadCount > 0 && (
                  <span className="ml-1 text-[#15b392]">({systemUnreadCount})</span>
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
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                  !notif.is_read ? "bg-blue-50/30" : ""
                }`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="px-4 py-4 flex items-start space-x-3">
                  {/* Avatar or System Icon */}
                  {getNotificationIcon(notif)}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">{formatTime(notif.created_at)}</span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-[#15b392] rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-16 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500 text-sm">
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