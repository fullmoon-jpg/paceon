import { useState } from 'react';
import { Comment, Post } from '../types';
import { useToast } from '@/contexts/ToastContext';

interface UseCommentsReturn {
  comments: Record<string, Comment[]>;
  activeCommentPost: string | null;
  commentText: string;
  loadingComments: Record<string, boolean>;
  editingComment: Comment | null;
  editCommentText: string;
  updatingComment: boolean;
  deletingComment: string | null;
  setCommentText: (text: string) => void;
  setEditingComment: (comment: Comment | null) => void;
  setEditCommentText: (text: string) => void;
  setActiveCommentPost: (postId: string | null) => void;
  fetchComments: (postId: string) => Promise<void>;
  handleComment: (postId: string) => Promise<void>;
  handleEditComment: (commentId: string, content: string) => Promise<void>;
  handleDeleteComment: (commentId: string, postId: string) => Promise<void>;
}

export const useComments = (
  currentUserId: string,
  isAdmin: boolean, // ✅ Add isAdmin prop
  posts: Post[],
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
): UseCommentsReturn => {
  const { showToast } = useToast();
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const fetchComments = async (postId: string) => {
    if (comments[postId]) {
      setActiveCommentPost(activeCommentPost === postId ? null : postId);
      return;
    }

    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.data }));
        setActiveCommentPost(postId);
      } else {
        throw new Error(data.error || 'Failed to fetch comments');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
      showToast('error', errorMessage);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) {
      showToast('warning', 'Please write a comment');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          content: commentText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.data]
        }));

        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ));

        setCommentText("");
        showToast('success', 'Comment posted!');
      } else {
        throw new Error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment';
      showToast('error', errorMessage);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!content.trim()) {
      showToast('warning', 'Comment cannot be empty');
      return;
    }

    setUpdatingComment(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUserId,
          content 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => {
          const updatedComments = { ...prev };
          Object.keys(updatedComments).forEach(postId => {
            updatedComments[postId] = updatedComments[postId].map(c =>
              c._id === commentId ? { ...c, content } : c
            );
          });
          return updatedComments;
        });
        showToast('success', 'Comment updated!');
      } else {
        throw new Error(data.error || 'Failed to update comment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setDeletingComment(commentId);
    try {
      // ✅ Pass isAdmin di query parameter
      const response = await fetch(`/api/comments/${commentId}?userId=${currentUserId}&isAdmin=${isAdmin}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].filter(c => c._id !== commentId)
        }));

        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
            : post
        ));
        showToast('success', 'Comment deleted!');
      } else {
        throw new Error(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      showToast('error', errorMessage);
    } finally {
      setDeletingComment(null);
    }
  };

  return {
    comments,
    activeCommentPost,
    commentText,
    loadingComments,
    editingComment,
    editCommentText,
    updatingComment,
    deletingComment,
    setCommentText,
    setEditingComment,
    setEditCommentText,
    setActiveCommentPost,
    fetchComments,
    handleComment,
    handleEditComment,
    handleDeleteComment,
  };
};
