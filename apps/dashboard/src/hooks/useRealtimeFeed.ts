// src/components/ActivityFeed/hooks/useRealtimeFeed.ts
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@paceon/lib/supabase';

interface Post {
  _id: string;
  userId: string;
  content: string;
  [key: string]: any;
}

interface UseRealtimeFeedReturn {
  isConnected: boolean;
}

interface UseRealtimeFeedOptions {
  enabled: boolean;
  currentUserId: string;
  onNewPost?: (post: Post) => void;
  onUpdatePost?: (postId: string, updates: Partial<Post>) => void;
  onDeletePost?: (postId: string) => void;
  onNewLike?: (postId: string, likesCount: number) => void;
  onNewComment?: (postId: string, commentsCount: number) => void;
}

export function useRealtimeFeed({
  enabled,
  currentUserId,
  onNewPost,
  onUpdatePost,
  onDeletePost,
  onNewLike,
  onNewComment,
}: UseRealtimeFeedOptions): UseRealtimeFeedReturn {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const handlersRef = useRef({ onNewPost, onUpdatePost, onDeletePost, onNewLike, onNewComment });

  // ✅ Update handlers ref without triggering re-render
  useEffect(() => {
    handlersRef.current = { onNewPost, onUpdatePost, onDeletePost, onNewLike, onNewComment };
  }, [onNewPost, onUpdatePost, onDeletePost, onNewLike, onNewComment]);

  // ✅ Main effect - STABLE dependencies
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || !currentUserId) {
      setIsConnected(false);
      return;
    }

    console.log('🔌 Setting up realtime feed...');

    const channel = supabase.channel('feed-updates');

    channel
      .on('broadcast', { event: 'new_post' }, (payload) => {
        if (mountedRef.current && payload.payload) {
          handlersRef.current.onNewPost?.(payload.payload);
        }
      })
      .on('broadcast', { event: 'update_post' }, (payload) => {
        if (mountedRef.current && payload.payload) {
          const { postId, updates } = payload.payload;
          handlersRef.current.onUpdatePost?.(postId, updates);
        }
      })
      .on('broadcast', { event: 'delete_post' }, (payload) => {
        if (mountedRef.current && payload.payload) {
          handlersRef.current.onDeletePost?.(payload.payload.postId);
        }
      })
      .on('broadcast', { event: 'new_like' }, (payload) => {
        if (mountedRef.current && payload.payload) {
          const { postId, likesCount } = payload.payload;
          handlersRef.current.onNewLike?.(postId, likesCount);
        }
      })
      .on('broadcast', { event: 'new_comment' }, (payload) => {
        if (mountedRef.current && payload.payload) {
          const { postId, commentsCount } = payload.payload;
          handlersRef.current.onNewComment?.(postId, commentsCount);
        }
      })
      .subscribe((status) => {
        console.log('📡 Feed channel status:', status);
        if (mountedRef.current) {
          setIsConnected(status === 'SUBSCRIBED');
        }
      });

    channelRef.current = channel;

    return () => {
      mountedRef.current = false;
      console.log('🔌 Cleaning up realtime feed...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, currentUserId]); // ✅ Only these 2 dependencies

  return { isConnected };
}
