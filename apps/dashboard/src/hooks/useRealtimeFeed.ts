// src/hooks/useRealtimeFeed.ts
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../../packages/lib/supabase';

interface Post {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  [key: string]: any;
}

interface UseRealtimeFeedOptions {
  enabled: boolean;
  onNewPost?: (post: Post) => void;
  onPostUpdate?: (postId: string, updates: Partial<Post>) => void;
  onPostDelete?: (postId: string) => void;
}

export function useRealtimeFeed({
  enabled,
  onNewPost,
  onPostUpdate,
  onPostDelete
}: UseRealtimeFeedOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    // Start polling for new posts
    startPolling();

    return () => cleanup();
  }, [enabled]);

  const startPolling = () => {
    // Poll every 10 seconds for new posts
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/posts/recent?since=${lastCheckRef.current.toISOString()}`
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          // New posts found
          data.data.forEach((post: Post) => {
            onNewPost?.(post);
          });
          
          // Update last check time
          lastCheckRef.current = new Date();
        }
      } catch (error) {
        console.error('Error polling for new posts:', error);
      }
    }, 40000); // Poll every 10 seconds

    setIsConnected(true);
  };

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsConnected(false);
  };

  return { isConnected };
}