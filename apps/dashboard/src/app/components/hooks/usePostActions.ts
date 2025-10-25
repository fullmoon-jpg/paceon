// src/components/ActivityFeed/hooks/usePostActions.ts
import { useState, useCallback, useRef } from 'react';
import { Post } from '../types';

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
  posts: Post[],
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
  likedPosts: Set<string>,
  setLikedPosts: React.Dispatch<React.SetStateAction<Set<string>>>,
  savedPosts: Set<string>,
  setSavedPosts: React.Dispatch<React.SetStateAction<Set<string>>>
): UsePostActionsReturn => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [liking, setLiking] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());

  // ✅ CRITICAL: Use useRef for SYNCHRONOUS blocking
  const processingLikesRef = useRef<Set<string>>(new Set());
  const processingSavesRef = useRef<Set<string>>(new Set());

  const handleLike = useCallback(async (postId: string) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 LIKE CLICKED for postId:', postId);
    
    // ✅ CRITICAL: Check ref FIRST (synchronous)
    if (processingLikesRef.current.has(postId)) {
      console.log('🛑 BLOCKED by processingLikesRef');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // ✅ Determine action BEFORE any state changes
    const isCurrentlyLiked = likedPosts.has(postId);
    const currentPost = posts.find(p => p._id === postId);
    
    if (!currentPost) {
      console.error('❌ Post not found in local state');
      return;
    }

    const originalLikesCount = currentPost.likesCount;
    const action = isCurrentlyLiked ? 'UNLIKE' : 'LIKE';
    
    console.log('📊 Current State BEFORE:');
    console.log('  - isCurrentlyLiked:', isCurrentlyLiked);
    console.log('  - originalLikesCount:', originalLikesCount);
    console.log('  - action:', action);
    console.log('  - processingLikesRef:', Array.from(processingLikesRef.current));

    // ✅ Add to ref IMMEDIATELY (synchronous)
    processingLikesRef.current.add(postId);
    console.log('✅ Added to processingLikesRef:', Array.from(processingLikesRef.current));

    // Update visual state
    setLiking(prev => {
      const newSet = new Set(prev);
      newSet.add(postId);
      return newSet;
    });

    try {
      // ✅ Calculate new state based on CURRENT action
      const newLikedPosts = new Set(likedPosts);
      let newLikesCount: number;

      if (action === 'UNLIKE') {
        newLikedPosts.delete(postId);
        newLikesCount = Math.max(0, originalLikesCount - 1);
        console.log('➖ UNLIKE: New count should be:', newLikesCount);
      } else {
        newLikedPosts.add(postId);
        newLikesCount = originalLikesCount + 1;
        console.log('➕ LIKE: New count should be:', newLikesCount);
      }

      // ✅ Optimistic update
      console.log('🔄 Applying optimistic update...');
      setLikedPosts(newLikedPosts);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId
            ? { ...post, likesCount: newLikesCount }
            : post
        )
      );

      console.log('✅ Optimistic update applied');
      console.log('📤 Sending API request with action:', action);

      // ✅ API call with EXPLICIT action
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUserId,
          action: action.toLowerCase() // Send explicit action
        }),
      });

      console.log('📥 API Response status:', response.status);
      const data = await response.json();
      console.log('📥 API Response data:', data);

      if (!response.ok || !data.success) {
        console.error('❌ API Error:', data.error);
        
        // ❌ REVERT on error
        console.log('🔙 Reverting to original state...');
        setLikedPosts(likedPosts); // Revert to original
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? { ...post, likesCount: originalLikesCount }
              : post
          )
        );

        if (response.status === 429) {
          console.warn('⏸️ Rate limited');
          return;
        }

        throw new Error(data.error || 'Failed to like post');
      }

      // ✅ Validate server response matches expected action
      const expectedIsLiked = action === 'LIKE';
      if (data.data.isLiked !== expectedIsLiked) {
        console.warn('⚠️ Server state mismatch!');
        console.warn('  Expected isLiked:', expectedIsLiked);
        console.warn('  Server isLiked:', data.data.isLiked);
        console.warn('  Syncing with server...');
      }

      // ✅ Sync with server (trust server as source of truth)
      console.log('✅ Success! Server response:');
      console.log('  - isLiked:', data.data.isLiked);
      console.log('  - likesCount from server:', data.data.likesCount);

      // Update state based on server response
      const serverLikedPosts = new Set(likedPosts);
      if (data.data.isLiked) {
        serverLikedPosts.add(postId);
      } else {
        serverLikedPosts.delete(postId);
      }
      setLikedPosts(serverLikedPosts);

      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            console.log('🔄 Syncing with server count:', data.data.likesCount);
            return { ...post, likesCount: data.data.likesCount };
          }
          return post;
        })
      );

      console.log('✅ LIKE ACTION COMPLETED SUCCESSFULLY');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Request aborted');
        return;
      }
      
      console.error('💥 ERROR in handleLike:', error);
    } finally {
      // ✅ CRITICAL: Remove from ref FIRST
      processingLikesRef.current.delete(postId);
      console.log('➖ Removed from processingLikesRef:', Array.from(processingLikesRef.current));
      
      // Then update visual state after delay
      setTimeout(() => {
        setLiking(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }, 500);
    }
  }, [currentUserId, likedPosts, posts, setPosts, setLikedPosts, liking]);

  const handleSavePost = useCallback(async (postId: string) => {
    // ✅ Check ref FIRST
    if (processingSavesRef.current.has(postId)) {
      console.log('🛑 Save blocked by ref');
      return;
    }

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
    } catch (error: any) {
      console.error('Error saving post:', error);
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
  }, [currentUserId, savedPosts, setSavedPosts, saving]);

  const handleCreatePost = useCallback(async (postData: any) => {
    setCreating(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, ...postData }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create post');
      }

      setPosts(prev => [data.data, ...prev]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post');
      throw error;
    } finally {
      setCreating(false);
    }
  }, [currentUserId, setPosts]);

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
    } catch (error: any) {
      console.error('Error updating post:', error);
      alert(error.message || 'Failed to update post');
      throw error;
    } finally {
      setUpdating(null);
    }
  }, [currentUserId, posts, setPosts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    setDeleting(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
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
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post');
    } finally {
      setDeleting(null);
    }
  }, [currentUserId, posts, setPosts, setLikedPosts, setSavedPosts]);

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