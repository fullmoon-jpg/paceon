// src/components/ActivityFeed/hooks/usePostData.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '../types';
import { POLLING_INTERVAL, REQUEST_TIMEOUT, POSTS_PER_PAGE } from '../../../lib/utils/constants';

interface UsePostsDataReturn {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  newPostsCount: number;
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  fetchPosts: (pageNum?: number) => Promise<void>;
  loadMorePosts: () => void;
  loadNewPosts: () => Promise<void>;
  setLikedPosts: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSavedPosts: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const usePostsData = (
  currentUserId: string,
  activeTab: 'all' | 'yours' | 'saved'
): UsePostsDataReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const lastCheckRef = useRef<Date>(new Date());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLikedPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/like?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setLikedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (error) {
      // Silent fail for liked posts
    }
  }, [currentUserId]);

  const fetchSavedPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setSavedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (error) {
      // Silent fail for saved posts
    }
  }, [currentUserId]);

  const fetchSavedPostsDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        setPosts([]);
        setHasMore(false);
        return;
      }

      const postIds = data.data.map((sp: any) => sp.postId);
      
      const postPromises = postIds.map(async (id: string) => {
        try {
          const res = await fetch(`/api/posts/${id}`);
          const postData = await res.json();
          return postData;
        } catch (error) {
          return { success: false };
        }
      });
      
      const postsData = await Promise.all(postPromises);
      
      const validPosts = postsData
        .filter(p => p.success && p.data)
        .map(p => {
          const post = p.data;
          
          if (!post.user || !post.user.id) {
            post.user = {
              id: post.userId?.toString() || 'unknown',
              full_name: 'Unknown User',
              avatar_url: null
            };
          }
          
          return post;
        });
      
      setPosts(validPosts);
      setHasMore(false);
      
    } catch (error) {
      setPosts([]);
      setHasMore(false);
    }
  }, [currentUserId]);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = `/api/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`;
      
      if (activeTab === 'yours') {
        url += `&userId=${currentUserId}`;
      } else if (activeTab === 'saved') {
        if (pageNum === 1) {
          await fetchSavedPostsDetails();
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.data);
          lastCheckRef.current = new Date();
          setNewPostsCount(0);
        } else {
          setPosts(prev => [...prev, ...data.data]);
        }
        
        if (typeof data.hasMore === 'boolean') {
          setHasMore(data.hasMore);
        } else if (data.pagination?.hasMore !== undefined) {
          setHasMore(data.pagination.hasMore);
        } else {
          setHasMore(data.data.length >= POSTS_PER_PAGE);
        }
        
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, currentUserId, fetchSavedPostsDetails]);

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loadingMore, hasMore, page, fetchPosts]);

  const loadNewPosts = useCallback(async () => {
    setLoadingMore(true);
    try {
      let url = `/api/posts?page=1&limit=${POSTS_PER_PAGE}`;
      
      if (activeTab === 'yours') {
        url += `&userId=${currentUserId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setNewPostsCount(0);
        lastCheckRef.current = new Date();
        
        if (typeof data.hasMore === 'boolean') {
          setHasMore(data.hasMore);
        } else {
          setHasMore(data.data.length >= POSTS_PER_PAGE);
        }
      }
    } catch (error) {
      // Silent fail for polling
    } finally {
      setLoadingMore(false);
    }
  }, [activeTab, currentUserId]);

  const startPolling = useCallback(() => {
    lastCheckRef.current = new Date();

    pollingIntervalRef.current = setInterval(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(
          `/api/posts/recent?since=${lastCheckRef.current.toISOString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (data.success && data.data?.length > 0) {
          setNewPostsCount(prev => prev + data.data.length);
          lastCheckRef.current = new Date();
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          // Silent fail for polling errors
        }
      } finally {
        clearTimeout(timeout);
      }
    }, POLLING_INTERVAL);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
    fetchLikedPosts();
  }, [activeTab, fetchPosts, fetchSavedPosts, fetchLikedPosts]);

  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'yours') {
      startPolling();
      return () => stopPolling();
    }
  }, [activeTab, startPolling, stopPolling]);

  return {
    posts,
    setPosts,
    loading,
    error,
    page,
    hasMore,
    loadingMore,
    newPostsCount,
    likedPosts,
    savedPosts,
    fetchPosts,
    loadMorePosts,
    loadNewPosts,
    setLikedPosts,
    setSavedPosts,
  };
};
