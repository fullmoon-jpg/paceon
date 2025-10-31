// src/components/ActivityFeed/PostCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Bookmark,
  MoreVertical,
  MapPin,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Post, Comment } from "../types";
import { getInitials } from "@/lib/utils/helpers";
import { SPORT_COLORS } from "@/lib/utils/constants";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  currentUserName: string;
  avatar_url?: string;
  isAdmin: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isDeleting: boolean;
  isLiking: boolean;
  isSaving: boolean;
  onLike: () => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onViewProfile: (profile: { userId: string; userName: string; userAvatar?: string }) => void;
  comments: Comment[];
  activeCommentPost: string | null;
  commentText: string;
  loadingComments: boolean;
  editingComment: Comment | null;
  deletingComment: string | null;
  setCommentText: (text: string) => void;
  setEditingComment: (comment: Comment | null) => void;
  setEditCommentText: (text: string) => void;
  fetchComments: (postId: string) => void;
  handleComment: (postId: string) => void;
  handleDeleteComment: (commentId: string, postId: string) => void;
  setActiveCommentPost: (postId: string | null) => void;
}

export default function PostCard({
  post,
  currentUserId,
  currentUserName,
  avatar_url,
  isAdmin,
  isLiked,
  isSaved,
  isDeleting,
  isLiking,
  isSaving,
  onLike,
  onSave,
  onEdit,
  onDelete,
  onShare,
  onViewProfile,
  comments,
  activeCommentPost,
  commentText,
  loadingComments,
  editingComment,
  deletingComment,
  setCommentText,
  setEditingComment,
  setEditCommentText,
  fetchComments,
  handleComment,
  handleDeleteComment,
  setActiveCommentPost,
}: PostCardProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [localLiking, setLocalLiking] = useState(false);
  const router = useRouter();

  const handleViewPost = () => {
    router.push(`/activityfeed/post/${post._id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (localLiking || isLiking) return;
    
    setLocalLiking(true);
    onLike();
    
    setTimeout(() => {
      setLocalLiking(false);
    }, 2000);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaving) return;
    onSave();
  };

  const canEditPost = post.userId === currentUserId || isAdmin;
  const canDeletePost = post.userId === currentUserId || isAdmin;

  const canEditComment = (comment: Comment) => {
    return comment.userId === currentUserId || isAdmin;
  };

  const canDeleteComment = (comment: Comment) => {
    return comment.userId === currentUserId || isAdmin;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
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
              <button
                onClick={() => onViewProfile({
                  userId: post.user?.id || post.userId,
                  userName: post.user?.full_name || 'Unknown User',
                  userAvatar: post.user?.avatar_url,
                })}
                className="font-bold text-gray-800 dark:text-white hover:underline cursor-pointer text-left"
              >
                {post.user?.full_name || 'Unknown User'}
              </button>
              {post.sport && (
                <span className={`${SPORT_COLORS[post.sport]} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase`}>
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
        
        {/* Post Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewPost}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="View post"
          >
            <ExternalLink size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          {(canEditPost || canDeletePost) && (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              {openDropdown === post._id && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20 min-w-[150px]">
                    {canEditPost && post.userId === currentUserId && (
                      <button
                        onClick={() => {
                          onEdit();
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Edit2 size={16} />
                        Edit Post
                      </button>
                    )}
                    {canDeletePost && (
                      <button
                        onClick={() => {
                          onDelete();
                          setOpenDropdown(null);
                        }}
                        disabled={isDeleting}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            {isAdmin && post.userId !== currentUserId ? 'Delete (Admin)' : 'Delete Post'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
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
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
        <button
          onClick={onLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
            isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
          } ${
            isLiking 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={isLiking ? 'Processing...' : isLiked ? 'Unlike' : 'Like'}
        >
          {isLiking ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          )}
          <span className="font-medium">
            {isLiking ? 'Loading...' : 'Like'}
          </span>
        </button>

        <button
          onClick={() => fetchComments(post._id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <MessageCircle size={20} />
          <span className="font-medium">Comment</span>
        </button>

        <button 
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <Share2 size={20} />
          <span className="font-medium">Share</span>
        </button>

        <button 
          onClick={onSave}
          disabled={isSaving}
          className={`p-2 rounded-lg transition-colors relative ${
            isSaved ? 'text-[#15b392] dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
          } ${
            isSaving 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={
            isSaving 
              ? 'Processing...' 
              : isSaved 
                ? 'Unsave post' 
                : 'Save post'
          }
        >
          {isSaving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Bookmark size={20} className={isSaved ? 'fill-[#15b392] dark:fill-green-400' : ''} />
          )}
        </button>
      </div>

      {/* Comments Section */}
      {activeCommentPost === post._id && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          {loadingComments ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#15b392]" />
            </div>
          ) : (
            <>
              {/* Existing Comments */}
              {comments.length > 0 && (
                <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
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
                            <button
                              onClick={() => onViewProfile({
                                userId: comment.user?.id || comment.userId,
                                userName: comment.user?.full_name || 'Unknown User',
                                userAvatar: comment.user?.avatar_url,
                              })}
                              className="font-semibold text-sm text-gray-800 dark:text-white hover:underline cursor-pointer"
                            >
                              {comment.user?.full_name || 'Unknown User'}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(comment.createdAt), "MMM dd 'at' HH:mm")}
                              </span>
                              {(canEditComment(comment) || canDeleteComment(comment)) && (
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenDropdown(openDropdown === comment._id ? null : comment._id)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-500 rounded"
                                  >
                                    <MoreVertical size={14} className="text-gray-500 dark:text-gray-400" />
                                  </button>
                                  
                                  {openDropdown === comment._id && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setOpenDropdown(null)}
                                      />
                                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20 min-w-[120px]">
                                        {canEditComment(comment) && comment.userId === currentUserId && (
                                          <button
                                            onClick={() => {
                                              setEditingComment(comment);
                                              setEditCommentText(comment.content);
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                          >
                                            <Edit2 size={14} />
                                            Edit
                                          </button>
                                        )}
                                        {canDeleteComment(comment) && (
                                          <button
                                            onClick={() => {
                                              handleDeleteComment(comment._id, post._id);
                                              setOpenDropdown(null);
                                            }}
                                            disabled={deletingComment === comment._id}
                                            className="w-full px-3 py-1.5 text-left hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 disabled:opacity-50"
                                          >
                                            {deletingComment === comment._id ? (
                                              <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Deleting...
                                              </>
                                            ) : (
                                              <>
                                                <Trash2 size={14} />
                                                {isAdmin && comment.userId !== currentUserId ? 'Delete (Admin)' : 'Delete'}
                                              </>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-200">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="p-4 flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                  {avatar_url ? (
                    <img src={avatar_url} alt={currentUserName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(currentUserName)
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-[#15b392] text-white rounded-full hover:bg-[#2a6435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
