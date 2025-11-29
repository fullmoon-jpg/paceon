// src/app/activityfeed/post/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MapPin, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Post {
  _id: string;
  userId: string;
  user: User;
  content: string;
  mediaUrls: string[];
  mediaType?: 'image' | 'video';
  location?: string;
  sport?: 'tennis' | 'padel' | 'badminton' | 'other';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sportColors: Record<string, string> = {
    tennis: "bg-blue-500",
    padel: "bg-green-500",
    badminton: "bg-orange-500",
    other: "bg-gray-500"
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPost();
    }
  }, [params.id, authLoading]);

  useEffect(() => {
    if (currentUser && post) {
      checkLikeStatus();
      checkSaveStatus();
    }
  }, [currentUser, post?._id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
        fetchComments();
      } else {
        setError(data.error || 'Post not found');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load post';
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data || []);
        
        if (post) {
          setPost({ ...post, commentsCount: data.data.length });
        }
      }
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: commentText.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCommentText('');
        fetchComments();
      } else {
        showToast('error', data.error || 'Failed to post comment');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to post comment';
      showToast('error', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setDeletingComment(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });

      const data = await response.json();

      if (data.success) {
        fetchComments();
      } else {
        showToast('error', data.error || 'Failed to delete comment');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete comment';
      showToast('error', error);
    } finally {
      setDeletingComment(null);
    }
  };

  const checkLikeStatus = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/posts/${params.id}/like-status?userId=${currentUser.id}`);
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.data.isLiked);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const checkSaveStatus = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/saved-posts/check?userId=${currentUser.id}&postId=${params.id}`);
      const data = await response.json();
      if (data.success) {
        setIsSaved(data.data.isSaved);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleLike = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = post?.likesCount || 0;

    setIsLiked(!isLiked);
    if (post) {
      setPost({
        ...post,
        likesCount: isLiked ? previousCount - 1 : previousCount + 1,
      });
    }

    try {
      const response = await fetch(`/api/posts/${params.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action: isLiked ? 'unlike' : 'like',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLiked(data.data.isLiked);
        if (post) {
          setPost({ ...post, likesCount: data.data.likesCount });
        }
      } else {
        setIsLiked(previousLiked);
        if (post) {
          setPost({ ...post, likesCount: previousCount });
        }
        showToast('error', data.error || 'Failed to like post');
      }
    } catch (err) {
      setIsLiked(previousLiked);
      if (post) {
        setPost({ ...post, likesCount: previousCount });
      }
      const error = err instanceof Error ? err.message : 'Failed to like post';
      showToast('error', error);
    } finally {
      setTimeout(() => setIsLiking(false), 500);
    }
  };

  const handleSave = async () => {
    if (!currentUser || isSaving) return;

    setIsSaving(true);
    const previousSaved = isSaved;

    setIsSaved(!isSaved);

    try {
      const response = await fetch(`/api/saved-posts`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          postId: params.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setIsSaved(previousSaved);
        showToast('error', data.error || 'Failed to save post');
      }
    } catch (err) {
      setIsSaved(previousSaved);
      const error = err instanceof Error ? err.message : 'Failed to save post';
      showToast('error', error);
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#15b392]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <AlertCircle size={24} />
            <h3 className="font-bold text-lg">Error</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/activityfeed')}
            className="w-full py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-[#242837]">
      {/* Header */}
      <div className="text-black dark:text-white p-6 sticky top-0 z-10 bg-transparent">
        <div className="max-w-4xl mx-auto flex items-center px-4 gap-4">
          <button
            onClick={() => router.push('/activityfeed')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {post.user?.avatar_url ? (
                  <img 
                    src={post.user.avatar_url} 
                    alt={post.user.full_name || 'User'} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  getInitials(post.user?.full_name || 'User')
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {post.user?.full_name || 'Unknown User'}
                  </h3>
                  {post.sport && (
                    <span className={`${sportColors[post.sport]} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase`}>
                      {post.sport}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{format(new Date(post.createdAt), "MMM dd 'at' HH:mm")}</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-lg">{post.content}</p>
          </div>

          {/* Post Images */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className={`grid ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
              {post.mediaUrls.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              ))}
            </div>
          )}

          {/* Post Stats */}
          <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <Heart size={16} className="text-red-500 fill-red-500" />
              {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
            </span>
            <div className="flex gap-4">
              <span>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
              <span>{post.sharesCount} {post.sharesCount === 1 ? 'share' : 'shares'}</span>
            </div>
          </div>

          {/* Post Actions */}
          {currentUser ? (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {isLiking ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
                )}
                <span className="font-medium">Like</span>
              </button>
              
              <button 
                onClick={() => document.getElementById('comment-input')?.focus()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Comment</span>
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('success', 'Link copied!');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              >
                <Share2 size={20} />
                <span className="font-medium">Share</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved ? 'text-[#15b392] dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Bookmark size={20} className={isSaved ? 'fill-[#15b392] dark:fill-green-400' : ''} />
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3">Sign in to interact with this post</p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="px-4 py-3">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                Comments ({comments.length})
              </h3>

              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#15b392]" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                        {comment.user?.avatar_url ? (
                          <img 
                            src={comment.user.avatar_url} 
                            alt={comment.user.full_name || 'User'} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          getInitials(comment.user?.full_name || 'User')
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-gray-800 dark:text-white">
                              {comment.user?.full_name || 'Unknown User'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(comment.createdAt), "MMM dd 'at' HH:mm")}
                              </span>
                              {currentUser && (comment.userId === currentUser.id) && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  disabled={deletingComment === comment._id}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-600 disabled:opacity-50"
                                >
                                  {deletingComment === comment._id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-200">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}

              {/* Comment Input */}
              {currentUser ? (
                <div className="flex gap-3 mt-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                    {currentUser.user_metadata?.avatar_url ? (
                      <img 
                        src={currentUser.user_metadata.avatar_url} 
                        alt="You" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      getInitials(currentUser.user_metadata?.full_name || 'You')
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      id="comment-input"
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                      disabled={submittingComment}
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="px-4 py-2 bg-[#15b392] text-white rounded-full hover:bg-[#2a6435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Sign in to comment</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
