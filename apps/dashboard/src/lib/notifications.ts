// src/lib/notifications.ts
import { supabaseAdmin } from '../../../../packages/lib/supabase';

export type NotificationType = 'system' | 'social';

export type NotificationCategory = 
  // System
  | 'welcome'
  | 'payment_success'
  | 'booking_success'
  | 'game_reminder'
  // Social
  | 'like'
  | 'comment'
  | 'connection_added'
  | 'post_mention';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actorId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Create notification via database function (recommended)
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { data, error } = await supabaseAdmin.rpc('create_notification', {
      p_user_id: params.userId,
      p_type: params.type,
      p_category: params.category,
      p_title: params.title,
      p_message: params.message,
      p_metadata: params.metadata || {},
      p_actor_id: params.actorId || null,
      p_related_entity_type: params.relatedEntityType || null,
      p_related_entity_id: params.relatedEntityId || null,
    });

    if (error) {
      console.error('❌ Error creating notification:', error);
      return { success: false, error };
    }

    console.log('✅ Notification created:', data);
    return { success: true, notificationId: data };
  } catch (error) {
    console.error('❌ Exception creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Fetch user notifications
 */
export async function getUserNotifications(userId: string, limit = 20, unreadOnly = false) {
  try {
    let query = supabaseAdmin
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
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return { success: false, error };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    return { success: false, error };
  }
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId: string) {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return { success: false, count: 0 };
  }
}

// ============================================
// SOCIAL NOTIFICATION HELPERS
// ============================================

export async function notifyPostLike(postAuthorId: string, actorId: string, actorName: string, postId: string) {
  // Jangan notif kalau user like post sendiri
  if (postAuthorId === actorId) return;

  return createNotification({
    userId: postAuthorId,
    type: 'social',
    category: 'like',
    title: 'New Like',
    message: `${actorName} liked your post`,
    actorId,
    relatedEntityType: 'post',
    relatedEntityId: postId,
    metadata: { postId }
  });
}

export async function notifyPostComment(postAuthorId: string, actorId: string, actorName: string, postId: string, commentText: string) {
  // Jangan notif kalau user comment post sendiri
  if (postAuthorId === actorId) return;

  return createNotification({
    userId: postAuthorId,
    type: 'social',
    category: 'comment',
    title: 'New Comment',
    message: `${actorName} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
    actorId,
    relatedEntityType: 'post',
    relatedEntityId: postId,
    metadata: { postId, commentText }
  });
}

export async function notifyNewConnection(userId: string, actorId: string, actorName: string) {
  return createNotification({
    userId,
    type: 'social',
    category: 'connection_added',
    title: 'New Connection',
    message: `${actorName} connected with you`,
    actorId,
    relatedEntityType: 'user',
    relatedEntityId: actorId,
    metadata: { connectedUserId: actorId }
  });
}

// ============================================
// SYSTEM NOTIFICATION HELPERS
// ============================================

export async function notifyWelcome(userId: string, userName: string) {
  return createNotification({
    userId,
    type: 'system',
    category: 'welcome',
    title: 'Welcome to PACE.ON! 🎉',
    message: `Hi ${userName}! We're excited to have you here. Start by completing your profile and exploring events.`,
    metadata: { userName }
  });
}

export async function notifyBookingSuccess(userId: string, eventName: string, eventId: string) {
  return createNotification({
    userId,
    type: 'system',
    category: 'booking_success',
    title: 'Event Booking Confirmed ✅',
    message: `Your booking for "${eventName}" has been confirmed!`,
    relatedEntityType: 'event',
    relatedEntityId: eventId,
    metadata: { eventName, eventId }
  });
}

export async function notifyGameReminder(userId: string, eventName: string, eventId: string, timeUntil: string) {
  return createNotification({
    userId,
    type: 'system',
    category: 'game_reminder',
    title: `Event Reminder: ${eventName}`,
    message: `Your event "${eventName}" starts ${timeUntil}. Don't forget to attend!`,
    relatedEntityType: 'event',
    relatedEntityId: eventId,
    metadata: { eventName, eventId, timeUntil }
  });
}