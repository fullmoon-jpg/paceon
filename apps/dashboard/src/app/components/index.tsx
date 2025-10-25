// src/components/ActivityFeed/index.tsx
"use client";

import { useState } from "react";
import { Loader2, AlertCircle, ArrowUp, Bookmark, ImageIcon, Video, MapPin } from "lucide-react";
import { ActivityFeedProps } from './types';
import { usePostsData } from './hooks/usePostData';
import { usePostActions } from './hooks/usePostActions';
import { useComments } from './hooks/useComments';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { getInitials } from '../../lib/utils/helpers';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import EditPostModal from './components/EditPostModal';
import EditCommentModal from './components/EditCommentModal';
import ShareModal from './components/ShareModal';
import ProfileModal from './components/ProfileModal';

export default function ActivityFeed({ 
  currentUserId, 
  currentUserName,
  avatar_url,
  currentUserPosition,
  currentUserCompany,
  currentUserRole = "user",
  activeTab
}: ActivityFeedProps) {
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
    liking, // ✅ Add liking state
    saving, // ✅ Add saving state
  } = usePostActions(currentUserId, posts, setPosts, likedPosts, setLikedPosts, savedPosts, setSavedPosts);

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
  } = useComments(currentUserId, posts, setPosts);

  // ✅ Realtime feed hook
  const { isConnected: feedConnected } = useRealtimeFeed({
    enabled: activeTab === 'all',
    currentUserId,
    onNewPost: (newPost) => {
      console.log('📬 New post received from broadcast');
      if (newPost.userId !== currentUserId) {
        setPosts(prev => {
          const exists = prev.some(p => p._id === newPost._id);
          if (exists) return prev;
          return [newPost, ...prev];
        });
      }
    },
    onUpdatePost: (postId, updates) => {
      console.log('✏️ Post updated from broadcast:', postId);
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, ...updates } : p
      ));
    },
    onDeletePost: (postId) => {
      console.log('🗑️ Post deleted from broadcast:', postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    },
  });

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
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
  const isAdmin = currentUserRole === 'admin';

  const handleCreatePostWithRefresh = async (postData: any) => {
    await handleCreatePost(postData);
    setProfileRefreshKey(prev => prev + 1);
  };

  const handleDeletePostWithRefresh = async (postId: string) => {
    await handleDeletePost(postId);
    setProfileRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#15b392]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <AlertCircle size={24} />
          <h3 className="font-bold text-lg">Error</h3>
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-4 w-full py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* New Posts Banner */}
      {newPostsCount > 0 && (activeTab === 'all' || activeTab === 'yours') && (
        <div className="sticky top-0 z-40 mb-4">
          <button
            onClick={loadNewPosts}
            disabled={loadingMore}
            className="w-full py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ArrowUp size={20} />
            {loadingMore ? 'Loading...' : `Load ${newPostsCount} New Post${newPostsCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Create Post Button */}
      {activeTab !== 'saved' && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {avatar_url ? (
                <img src={avatar_url} alt={currentUserName} className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUserName)
              )}
            </div>
            <span className="text-gray-500">What's on your mind?</span>
          </button>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button 
              onClick={() => setShowCreatePost(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ImageIcon size={20} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Photo</span>
            </button>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Video size={20} className="text-red-600" />
              <span className="text-sm font-medium text-gray-700">Video</span>
            </button>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MapPin size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'saved' && 'No Saved Posts'}
              {activeTab === 'yours' && 'No Posts Yet'}
              {activeTab === 'all' && 'No Posts'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'saved' && 'Posts you save will appear here'}
              {activeTab === 'yours' && 'Create your first post to get started'}
              {activeTab === 'all' && 'Be the first to create a post'}
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
            isLiking={liking.has(post._id)} // ✅ Pass liking state
            isSaving={saving.has(post._id)} // ✅ Pass saving state
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
      {hasMore && activeTab !== 'saved' && (
        <div className="text-center mt-6">
          <button
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center mt-6 text-gray-500 text-sm">
          You've reached the end
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
          updating={updating}
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
          updating={updatingComment}
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
