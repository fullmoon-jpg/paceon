import { useState, useCallback, useRef } from 'react';
import { Post } from '../types';
import { useToast } from '@/contexts/ToastContext';

interface UsePostActionsReturn {
  handleLike: (postId: string) => Promise<void>;
  handleSavePost: (postId: string) => Promise<void>;
  handleCreatePost: (postData: any) => Promise<void>;
  handleEditPost: (postId: string, updates: any) => Promise<void>;
  handleDeletePost: (postId: string) => Promise<void>;
  creating: boolean;
  updating: string | null;
  deleting: string | null;
  liking: Set<string>;
  saving: Set<string>;
}

export const usePostActions = (
  currentUserId: string,
  isAdmin: boolean, // ✅ Add isAdmin
  posts: Post[],
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
  likedPosts: Set<string>,
  setLikedPosts: React.Dispatch<React.SetStateAction<Set<string>>>,
  savedPosts: Set<string>,
  setSavedPosts: React.Dispatch<React.SetStateAction<Set<string>>>
): UsePostActionsReturn => {
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [liking, setLiking] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const processingLikesRef = useRef<Set<string>>(new Set());
  const processingSavesRef = useRef<Set<string>>(new Set());

  const handleLike = useCallback(async (postId: string) => {
    if (processingLikesRef.current.has(postId)) return;

    const isCurrentlyLiked = likedPosts.has(postId);
    const currentPost = posts.find(p => p._id === postId);
    
    if (!currentPost) return;

    const originalLikesCount = currentPost.likesCount;
    const action = isCurrentlyLiked ? 'unlike' : 'like';

    processingLikesRef.current.add(postId);
    setLiking(prev => new Set(prev).add(postId));

    try {
      const newLikedPosts = new Set(likedPosts);
      let newLikesCount: number;

      if (action === 'unlike') {
        newLikedPosts.delete(postId);
        newLikesCount = Math.max(0, originalLikesCount - 1);
      } else {
        newLikedPosts.add(postId);
        newLikesCount = originalLikesCount + 1;
      }

      setLikedPosts(newLikedPosts);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? { ...post, likesCount: newLikesCount } : post
        )
      );

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUserId,
          action: action
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLikedPosts(likedPosts);
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId ? { ...post, likesCount: originalLikesCount } : post
          )
        );

        if (response.status === 429) {
          showToast('warning', 'Too many requests, please wait a moment');
          return;
        }

        throw new Error(data.error || 'Failed to like post');
      }

      const serverLikedPosts = new Set(likedPosts);
      if (data.data.isLiked) {
        serverLikedPosts.add(postId);
      } else {
        serverLikedPosts.delete(postId);
      }
      setLikedPosts(serverLikedPosts);

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likesCount: data.data.likesCount } : post
        )
      );

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
      showToast('error', errorMessage);
    } finally {
      processingLikesRef.current.delete(postId);
      setTimeout(() => {
        setLiking(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 500);
    }
  }, [currentUserId, likedPosts, posts, setPosts, setLikedPosts, showToast]);

  const handleSavePost = useCallback(async (postId: string) => {
    if (processingSavesRef.current.has(postId)) return;

    processingSavesRef.current.add(postId);
    setSaving(prev => new Set(prev).add(postId));

    try {
      const isCurrentlySaved = savedPosts.has(postId);
      const newSavedState = new Set(savedPosts);

      if (isCurrentlySaved) {
        newSavedState.delete(postId);
      } else {
        newSavedState.add(postId);
      }
      setSavedPosts(newSavedState);

      const response = await fetch(`/api/saved-posts`, {
        method: isCurrentlySaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setSavedPosts(savedPosts);
        throw new Error(data.error || 'Failed to save post');
      }

      showToast('success', isCurrentlySaved ? 'Post unsaved' : 'Post saved!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save post';
      showToast('error', errorMessage);
    } finally {
      processingSavesRef.current.delete(postId);
      setTimeout(() => {
        setSaving(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 300);
    }
  }, [currentUserId, savedPosts, setSavedPosts, showToast]);

  const handleCreatePost = useCallback(async (postData: any) => {
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('userId', currentUserId);
      formData.append('content', postData.content);
      if (postData.location) formData.append('location', postData.location);
      if (postData.sport) formData.append('sport', postData.sport);
      
      postData.mediaFiles?.forEach((file: File) => {
        formData.append('media', file);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create post');
      }

      setPosts(prev => [data.data, ...prev]);
      showToast('success', 'Post created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [currentUserId, setPosts, showToast]);

  const handleEditPost = useCallback(async (postId: string, updates: any) => {
    setUpdating(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, ...updates }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update post');
      }

      setPosts(posts.map(post =>
        post._id === postId ? { ...post, ...data.data } : post
      ));
      showToast('success', 'Post updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setUpdating(null);
    }
  }, [currentUserId, posts, setPosts, showToast]);

  const handleDeletePost = useCallback(async (postId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    setDeleting(postId);
    try {
      // ✅ Pass isAdmin status
      const response = await fetch(`/api/posts/${postId}?isAdmin=${isAdmin}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete post');
      }

      setPosts(posts.filter(post => post._id !== postId));
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      showToast('success', 'Post deleted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      showToast('error', errorMessage);
    } finally {
      setDeleting(null);
    }
  }, [currentUserId, isAdmin, posts, setPosts, setLikedPosts, setSavedPosts, showToast]);

  return {
    handleLike,
    handleSavePost,
    handleCreatePost,
    handleEditPost,
    handleDeletePost,
    creating,
    updating,
    deleting,
    liking,
    saving,
  };
};
