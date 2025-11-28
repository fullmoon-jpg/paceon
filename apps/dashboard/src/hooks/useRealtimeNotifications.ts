// src/hooks/useRealtimeNotifications.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@paceon/lib/supabaseclient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationActor {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface Notification {
  id: string;
  user_id: string;
  type: 'system' | 'social';
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  metadata?: Record<string, unknown>;
  actor_id?: string | null;
  actor?: NotificationActor;
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

const IS_DEV = process.env.NODE_ENV === 'development';

export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const actorCacheRef = useRef(new Map<string, NotificationActor>());

  const fetchActor = useCallback(async (actorId: string): Promise<NotificationActor> => {
    if (actorCacheRef.current.has(actorId)) {
      return actorCacheRef.current.get(actorId)!;
    }

    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('id, full_name, avatar_url')
        .eq('id', actorId)
        .single();

      if (error) throw error;

      const actor: NotificationActor = {
        id: data.id,
        full_name: data.full_name || 'Unknown User',
        avatar_url: data.avatar_url,
      };

      actorCacheRef.current.set(actorId, actor);
      return actor;
    } catch (error) {
      const fallbackActor: NotificationActor = {
        id: actorId,
        full_name: 'Unknown User',
        avatar_url: null,
      };
      return fallbackActor;
    }
  }, []);

  const showBrowserNotification = useCallback((notification: Notification) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: '/images/logo-paceon.png',
        badge: '/images/logo-paceon.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false,
      });

      setTimeout(() => notif.close(), 5000);

      notif.onclick = () => {
        window.focus();
        notif.close();
        window.location.href = '/notifications';
      };
    } catch (error) {
      // Silent fail in production
      if (IS_DEV) console.error('Browser notification error:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!mountedRef.current) return;

      // Cache actors
      data?.forEach((notif) => {
        if (notif.actor && notif.actor_id) {
          actorCacheRef.current.set(notif.actor_id, notif.actor);
        }
      });

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      if (!mountedRef.current) return;
      
      setNotifications([]);
      setUnreadCount(0);
      
      if (IS_DEV) console.error('Fetch notifications error:', error);
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Setup realtime
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (!mountedRef.current) return;

          const newNotif = payload.new as Notification;

          // Fetch actor if exists
          if (newNotif.actor_id && !newNotif.actor) {
            newNotif.actor = await fetchActor(newNotif.actor_id);
          }

          setNotifications((prev) => {
            // Prevent duplicates
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev].slice(0, 50);
          });
          
          setUnreadCount((prev) => prev + 1);
          showBrowserNotification(newNotif);
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
          if (!mountedRef.current) return;

          const updated = payload.new as Notification;
          const old = payload.old as Partial<Notification>;

          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );

          // Update unread count
          if (updated.is_read && !old?.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else if (!updated.is_read && old?.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        if (mountedRef.current) {
          setIsConnected(status === 'SUBSCRIBED');
        }
      });

    channelRef.current = channel;

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, fetchActor, showBrowserNotification, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const { error } = await supabase
          .from('notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq('id', notificationId)
          .eq('user_id', userId);

        if (error) throw error;
      } catch (error) {
        // Rollback on error
        await fetchNotifications();
      }
    },
    [userId, fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at || new Date().toISOString(),
      }))
    );
    setUnreadCount(0);

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in('id', unreadIds)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      await fetchNotifications();
    }
  }, [userId, notifications, fetchNotifications]);

  const refreshNotifications = useCallback(async () => {
    fetchingRef.current = false;
    await fetchNotifications();
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
