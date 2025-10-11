// ============================================
// src/hooks/useNotifications.ts (OPTIMIZED)
// ============================================
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../../../packages/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Notification {
  id: string;
  user_id: string;
  type: "system" | "social";
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
  actor_id: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// ✅ PERBAIKAN 1: Cache global di luar component
const notificationsCache = new Map<string, {
  data: Notification[];
  unreadCount: number;
  timestamp: number;
}>();

const CACHE_DURATION = 30000; // 30 detik
const activeChannels = new Map<string, RealtimeChannel>();

export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false); // ✅ Prevent concurrent fetches

  // ✅ PERBAIKAN 2: Check cache first
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // ✅ Prevent concurrent requests
    if (isFetchingRef.current) {
      console.log("⏳ Fetch already in progress, skipping...");
      return;
    }

    // ✅ Check cache
    const cached = notificationsCache.get(userId);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log("📦 Using cached notifications");
      setNotifications(cached.data);
      setUnreadCount(cached.unreadCount);
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      console.log("🔄 Fetching fresh notifications...");
      
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          actor:actor_id (
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Supabase fetch error:", error.message, error.details);
        throw error;
      }

      const notifData = data || [];
      const unreadCountData = notifData.filter((n) => !n.is_read).length;

      // ✅ Update cache
      notificationsCache.set(userId, {
        data: notifData,
        unreadCount: unreadCountData,
        timestamp: now,
      });

      setNotifications(notifData);
      setUnreadCount(unreadCountData);

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  // ✅ PERBAIKAN 3: Reuse existing channel
  const setupRealtime = useCallback((uid: string) => {
    // Check if channel already exists
    const existingChannel = activeChannels.get(uid);
    if (existingChannel) {
      console.log("♻️ Reusing existing realtime channel");
      return existingChannel;
    }

    console.log("🔌 Creating new realtime channel");
    
    const channel = supabase
      .channel(`notifications:${uid}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        },
        async (payload) => {
          console.log("🔔 New notification:", payload.new);

          let newNotif = payload.new as Notification;

          // fetch actor manual
          if (newNotif.actor_id) {
            const { data: actor } = await supabase
              .from("users_profile")
              .select("id, full_name, avatar_url")
              .eq("id", newNotif.actor_id)
              .single();

            if (actor) {
              newNotif = { ...newNotif, actor };
            }
          }

          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // ✅ Invalidate cache
          notificationsCache.delete(uid);

          showBrowserNotification(newNotif);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const updated = payload.new as Notification;

          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );

          if (updated.is_read && !payload.old?.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          // ✅ Invalidate cache
          notificationsCache.delete(uid);
        }
      )
      .subscribe((status) => {
        console.log("🔌 Notifications realtime status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    // Store in global map
    activeChannels.set(uid, channel);
    return channel;
  }, []);

  // ✅ PERBAIKAN 4: Proper cleanup
  const cleanupRealtime = useCallback((uid: string) => {
    const channel = activeChannels.get(uid);
    if (channel) {
      console.log("🧹 Cleaning up realtime channel");
      supabase.removeChannel(channel);
      activeChannels.delete(uid);
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // ✅ Fetch with cache check
    fetchNotifications();

    // ✅ Setup realtime (reuse if exists)
    setupRealtime(userId);

    // ✅ Reduced refresh interval (60s instead of 30s)
    refreshTimer.current = setInterval(() => {
      fetchNotifications(true); // Force refresh every 60s
    }, 60000);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
      // ✅ Don't cleanup realtime on unmount, keep it alive
      // cleanupRealtime(userId);
    };
  }, [userId, fetchNotifications, setupRealtime]);

  // ✅ Cleanup on userId change only
  useEffect(() => {
    return () => {
      if (userId) {
        // Only cleanup when user changes (logout)
        const prevUserId = userId;
        setTimeout(() => {
          if (!document.querySelector('[data-user-id="' + prevUserId + '"]')) {
            cleanupRealtime(prevUserId);
          }
        }, 5000);
      }
    };
  }, [userId, cleanupRealtime]);

  const showBrowserNotification = (notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/images/logo-paceon.png",
        badge: "/images/logo-paceon.png",
        tag: notification.id,
      });
    }
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    // ✅ Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;

      // ✅ Invalidate cache
      notificationsCache.delete(userId);

    } catch (error) {
      console.error("Error marking notification as read:", error);
      // ✅ Rollback on error
      await fetchNotifications(true);
    }
  }, [userId, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    // ✅ Optimistic update
    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;

      // ✅ Invalidate cache
      notificationsCache.delete(userId);

    } catch (error) {
      console.error("Error marking all as read:", error);
      // ✅ Rollback on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  }, [userId, notifications, unreadCount]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}

// ✅ BONUS: Export untuk clear cache manual (kalo perlu)
export function clearNotificationsCache(userId?: string) {
  if (userId) {
    notificationsCache.delete(userId);
  } else {
    notificationsCache.clear();
  }
}