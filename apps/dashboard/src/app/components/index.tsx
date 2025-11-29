"use client";

import { useState } from "react";
import {
  Loader2,
  AlertCircle,
  ArrowUp,
  Bookmark,
  ImageIcon,
} from "lucide-react";
import { ActivityFeedProps, Post } from "./types";
import { usePostsData } from "./hooks/usePostData";
import { usePostActions } from "./hooks/usePostActions";
import { useComments } from "./hooks/useComments";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import { getInitials } from "../../lib/utils/helpers";
import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";
import EditPostModal from "./components/EditPostModal";
import EditCommentModal from "./components/EditCommentModal";
import ShareModal from "./components/ShareModal";
import ProfileModal from "./components/ProfileModal";
import { useToast } from "@/contexts/ToastContext";

// Realtime Post interface for WebSocket events
interface RealtimePost {
  _id: string;
  userId: string;
  content: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  mediaUrls?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Skeleton Post Component
function SkeletonPost() {
  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 border border-gray-200 dark:border-[#3d4459] animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5" />
      </div>
      <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
      <div className="flex gap-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}

export default function ActivityFeed({
  currentUserId,
  currentUserName,
  avatar_url,
  currentUserPosition,
  currentUserCompany,
  currentUserRole = "user",
  activeTab,
}: ActivityFeedProps) {
  const { showToast } = useToast();

  const isAdmin = currentUserRole === "admin";

  const {
    posts,
    setPosts,
    loading,
    error,
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
  } = usePostsData(currentUserId, activeTab);

  const {
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
  } = usePostActions(
    currentUserId,
    isAdmin,
    posts,
    setPosts,
    likedPosts,
    setLikedPosts,
    savedPosts,
    setSavedPosts
  );

  const {
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
    fetchComments,
    handleComment,
    handleEditComment,
    handleDeleteComment,
    setActiveCommentPost,
  } = useComments(currentUserId, isAdmin, posts, setPosts);

  // Realtime feed with proper typing
  const { isConnected: feedConnected } = useRealtimeFeed({
    enabled: activeTab === "all",
    currentUserId,
    onNewPost: ((post: RealtimePost) => {
      if (post.userId !== currentUserId) {
        const transformedPost: Post = {
          ...post,
          user: post.user || { 
            id: post.userId, 
            full_name: 'Unknown User', 
            avatar_url: undefined 
          },
          mediaUrls: post.mediaUrls || [],
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
          sharesCount: post.sharesCount || 0,
        };
        
        setPosts((prev) => {
          const exists = prev.some((p) => p._id === post._id);
          if (exists) return prev;
          return [transformedPost, ...prev];
        });
        showToast("info", "New post available");
      }
    }) as (post: unknown) => void,
    onUpdatePost: ((postId: string, updates: Partial<RealtimePost>) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
      );
    }) as (postId: string, updates: unknown) => void,
    onDeletePost: (postId: string) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    },
  });

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<{
    userId: string;
    userName: string;
    userAvatar?: string;
    userPosition?: string;
    userCompany?: string;
    userRole?: string;
  } | null>(null);

  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const handleCreatePostWithRefresh = async (
    postData: Parameters<typeof handleCreatePost>[0]
  ) => {
    await handleCreatePost(postData);
    setProfileRefreshKey((prev) => prev + 1);
  };

  const handleDeletePostWithRefresh = async (postId: string) => {
    await handleDeletePost(postId);
    setProfileRefreshKey((prev) => prev + 1);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonPost key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 border border-gray-200 dark:border-[#3d4459]">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
          <AlertCircle size={24} />
          <h3 className="font-bold text-lg">Error</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-4 w-full py-2 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg transition-colors font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* New Posts Banner */}
      {newPostsCount > 0 && (activeTab === "all" || activeTab === "yours") && (
        <div className="mb-4">
          <button
            onClick={loadNewPosts}
            disabled={loadingMore}
            className="w-full py-3 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp size={20} />
            {loadingMore
              ? "Loading..."
              : `Load ${newPostsCount} New Post${
                  newPostsCount > 1 ? "s" : ""
                }`}
          </button>
        </div>
      )}

      {/* Create Post Button */}
      {activeTab !== "saved" && (
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-4 mb-6 border border-gray-200 dark:border-[#3d4459]">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full flex items-center gap-3 p-3 bg-[#F4F4EF] dark:bg-[#242837] hover:bg-[#e7e7df] dark:hover:bg-[#3d4459] rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {avatar_url ? (
                <img
                  src={avatar_url}
                  alt={currentUserName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(currentUserName)
              )}
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              What&apos;s on your mind?
            </span>
          </button>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-[#3d4459]">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] rounded-lg transition-colors"
            >
              <ImageIcon
                size={20}
                className="text-[#21C36E] dark:text-[#21C36E]"
              />
              <span className="text-sm font-medium text-[#3F3E3D] dark:text-gray-300">
                Photo
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !loading && (
          <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-[#3d4459]">
            <Bookmark
              size={48}
              className="mx-auto mb-4 text-gray-400 dark:text-gray-500"
            />
            <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white mb-2">
              {activeTab === "saved" && "No Saved Posts"}
              {activeTab === "yours" && "No Posts Yet"}
              {activeTab === "all" && "No Posts"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "saved" && "Posts you save will appear here"}
              {activeTab === "yours" &&
                "Create your first post to get started"}
              {activeTab === "all" && "Be the first to create a post"}
            </p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            avatar_url={avatar_url}
            isAdmin={isAdmin}
            isLiked={likedPosts.has(post._id)}
            isSaved={savedPosts.has(post._id)}
            isDeleting={deleting === post._id}
            isLiking={liking.has(post._id)}
            isSaving={saving.has(post._id)}
            onLike={() => handleLike(post._id)}
            onSave={() => handleSavePost(post._id)}
            onEdit={() => setEditingPost(post)}
            onDelete={() => handleDeletePostWithRefresh(post._id)}
            onShare={() => setSharePostId(post._id)}
            onViewProfile={setViewingProfile}
            comments={comments[post._id] || []}
            activeCommentPost={activeCommentPost}
            commentText={commentText}
            loadingComments={loadingComments[post._id] || false}
            editingComment={editingComment}
            deletingComment={deletingComment}
            setCommentText={setCommentText}
            setEditingComment={setEditingComment}
            setEditCommentText={setEditCommentText}
            fetchComments={fetchComments}
            handleComment={handleComment}
            handleDeleteComment={handleDeleteComment}
            setActiveCommentPost={setActiveCommentPost}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && activeTab !== "saved" && (
        <div className="text-center mt-6">
          <button
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 py-3 bg-white dark:bg-[#2d3548] text-[#3F3E3D] dark:text-gray-300 rounded-lg font-medium hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 mx-auto border border-gray-200 dark:border-[#3d4459]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
          You&apos;ve reached the end
        </div>
      )}

      {/* Modals */}
      {showCreatePost && (
        <CreatePostModal
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          avatar_url={avatar_url}
          currentUserPosition={currentUserPosition}
          currentUserCompany={currentUserCompany}
          onCreate={handleCreatePostWithRefresh}
          onClose={() => setShowCreatePost(false)}
          creating={creating}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onUpdate={handleEditPost}
          onClose={() => setEditingPost(null)}
          updating={typeof updating === 'string' && updating === editingPost._id}
        />
      )}

      {editingComment && (
        <EditCommentModal
          comment={editingComment}
          onUpdate={async (commentId, content) => {
            await handleEditComment(commentId, content);
            setEditingComment(null);
          }}
          onClose={() => setEditingComment(null)}
          updating={typeof updatingComment === 'string' && updatingComment === editingComment._id}
        />
      )}

      {sharePostId && (
        <ShareModal
          postId={sharePostId}
          onClose={() => setSharePostId(null)}
        />
      )}

      {viewingProfile && (
        <ProfileModal
          isOpen={true}
          onClose={() => setViewingProfile(null)}
          userId={viewingProfile.userId}
          userName={viewingProfile.userName}
          userAvatar={viewingProfile.userAvatar}
          userPosition={viewingProfile.userPosition}
          userCompany={viewingProfile.userCompany}
          userRole={viewingProfile.userRole}
          key={`profile-${viewingProfile.userId}-${profileRefreshKey}`}
        />
      )}
    </>
  );
}