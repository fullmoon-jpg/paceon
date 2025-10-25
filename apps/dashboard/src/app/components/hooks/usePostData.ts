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

  // Fetch liked posts
  const fetchLikedPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/like?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setLikedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (err) {
      console.error('Error fetching liked posts:', err);
    }
  }, [currentUserId]);

  // Fetch saved posts
  const fetchSavedPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setSavedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    }
  }, [currentUserId]);

  // ✅ Fetch saved posts details with user data
  const fetchSavedPostsDetails = useCallback(async () => {
    try {
      console.log('🔄 Fetching saved posts details...');
      
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to fetch saved posts:', data.error);
        setPosts([]);
        setHasMore(false);
        return;
      }

      if (!data.data || data.data.length === 0) {
        console.log('✅ No saved posts found');
        setPosts([]);
        setHasMore(false);
        return;
      }

      const postIds = data.data.map((sp: any) => sp.postId);
      console.log('📋 Fetching details for', postIds.length, 'saved posts');
      
      // ✅ Fetch all posts in parallel
      const postPromises = postIds.map(async (id: string) => {
        try {
          const res = await fetch(`/api/posts/${id}`);
          const postData = await res.json();
          return postData;
        } catch (err) {
          console.error(`Failed to fetch post ${id}:`, err);
          return { success: false };
        }
      });
      
      const postsData = await Promise.all(postPromises);
      
      // ✅ Filter valid posts and ensure user data exists
      const validPosts = postsData
        .filter(p => {
          if (!p.success || !p.data) {
            console.warn('⚠️ Invalid post data:', p);
            return false;
          }
          return true;
        })
        .map(p => {
          const post = p.data;
          
          // ✅ Ensure user object exists with fallback
          if (!post.user || !post.user.id) {
            console.warn('⚠️ Post missing user data, adding fallback:', post._id);
            post.user = {
              id: post.userId?.toString() || 'unknown',
              full_name: 'Unknown User',
              avatar_url: null
            };
          }
          
          return post;
        });
      
      console.log('✅ Loaded', validPosts.length, 'saved posts with user data');
      setPosts(validPosts);
      setHasMore(false);
      
    } catch (err) {
      console.error('❌ Error fetching saved posts details:', err);
      setPosts([]);
      setHasMore(false);
    }
  }, [currentUserId]);

  // Fetch posts
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
        
        // ✅ Handle different response structures
        if (typeof data.hasMore === 'boolean') {
          setHasMore(data.hasMore);
        } else if (data.pagination && typeof data.pagination.hasMore === 'boolean') {
          setHasMore(data.pagination.hasMore);
        } else {
          setHasMore(data.data.length >= POSTS_PER_PAGE);
        }
        
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, currentUserId, fetchSavedPostsDetails]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loadingMore, hasMore, page, fetchPosts]);

  // Load new posts
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
    } catch (err) {
      console.error('Error loading new posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeTab, currentUserId]);

  // Polling for new posts
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

        if (data.success) {
          if (data.data && data.data.length > 0) {
            setNewPostsCount(prev => prev + data.data.length);
          }
          lastCheckRef.current = new Date();
        }
      } catch (error) {
        if ((error as any).name !== "AbortError") {
          console.error("Error polling for new posts:", error);
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

  // Effects
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
