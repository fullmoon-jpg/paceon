import { useEffect, useRef, useState } from 'react';
import { supabase } from '@paceon/lib/supabase';

interface Post {
  _id: string;
  userId: string;
  content: string;
  [key: string]: unknown;
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

interface BroadcastPayload<T> {
  payload: T;
}

// Fix: Use type alias instead of empty interface extending Post
type NewPostPayload = Post;

interface UpdatePostPayload {
  postId: string;
  updates: Partial<Post>;
}

interface DeletePostPayload {
  postId: string;
}

interface NewLikePayload {
  postId: string;
  likesCount: number;
}

interface NewCommentPayload {
  postId: string;
  commentsCount: number;
}

type HandlerRefs = {
  onNewPost?: (post: Post) => void;
  onUpdatePost?: (postId: string, updates: Partial<Post>) => void;
  onDeletePost?: (postId: string) => void;
  onNewLike?: (postId: string, likesCount: number) => void;
  onNewComment?: (postId: string, commentsCount: number) => void;
};

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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(true);
  const handlersRef = useRef<HandlerRefs>({
    onNewPost,
    onUpdatePost,
    onDeletePost,
    onNewLike,
    onNewComment,
  });

  useEffect(() => {
    handlersRef.current = { onNewPost, onUpdatePost, onDeletePost, onNewLike, onNewComment };
  }, [onNewPost, onUpdatePost, onDeletePost, onNewLike, onNewComment]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || !currentUserId) {
      setIsConnected(false);
      return;
    }

    const channel = supabase.channel('feed-updates');

    channel
      .on('broadcast', { event: 'new_post' }, (payload: BroadcastPayload<NewPostPayload>) => {
        if (mountedRef.current && payload.payload) {
          handlersRef.current.onNewPost?.(payload.payload);
        }
      })
      .on('broadcast', { event: 'update_post' }, (payload: BroadcastPayload<UpdatePostPayload>) => {
        if (mountedRef.current && payload.payload) {
          const { postId, updates } = payload.payload;
          handlersRef.current.onUpdatePost?.(postId, updates);
        }
      })
      .on('broadcast', { event: 'delete_post' }, (payload: BroadcastPayload<DeletePostPayload>) => {
        if (mountedRef.current && payload.payload) {
          handlersRef.current.onDeletePost?.(payload.payload.postId);
        }
      })
      .on('broadcast', { event: 'new_like' }, (payload: BroadcastPayload<NewLikePayload>) => {
        if (mountedRef.current && payload.payload) {
          const { postId, likesCount } = payload.payload;
          handlersRef.current.onNewLike?.(postId, likesCount);
        }
      })
      .on('broadcast', { event: 'new_comment' }, (payload: BroadcastPayload<NewCommentPayload>) => {
        if (mountedRef.current && payload.payload) {
          const { postId, commentsCount } = payload.payload;
          handlersRef.current.onNewComment?.(postId, commentsCount);
        }
      })
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
  }, [enabled, currentUserId]);

  return { isConnected };
}