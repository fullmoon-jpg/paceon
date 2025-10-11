// src/components/ActivityFeed.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ProfileModal from "./ProfileModal";
import { 
  Heart,
  MessageCircle,
  Share2,
  Send,
  Bookmark,
  MoreVertical,
  Image as ImageIcon,
  Video,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2,
  Copy,
  Check,
  ArrowUp
} from "lucide-react";

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  skill_level?: string;
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
  postId: string;
  userId: string;
  user: User;
  content: string;
  likesCount: number;
  createdAt: string;
}

interface ActivityFeedProps {
  currentUserId: string;
  currentUserName: string;
  currentUserSkillLevel?: string;
  currentUserRole?: string;
  activeTab: 'all' | 'yours' | 'saved';
}

export default function ActivityFeed({ 
  currentUserId, 
  currentUserName,
  currentUserSkillLevel = "Intermediate",
  currentUserRole = "user",
  activeTab
}: ActivityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);

  // Create post modal
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Edit post modal
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSport, setEditSport] = useState("");
  const [updating, setUpdating] = useState(false);
  
  // Comments
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  
  // Edit comment
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState(false);
  
  // Likes & Saved
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  
  // Deleting
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  
  // Dropdown menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Share modal
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Profile modal for viewing other users
  const [viewingProfile, setViewingProfile] = useState<{
    userId: string;
    userName: string;
    userAvatar?: string;
  } | null>(null);

  // Realtime feed
  const lastCheckRef = useRef<Date>(new Date());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sportColors: Record<string, string> = {
    tennis: "bg-blue-500",
    padel: "bg-green-500",
    badminton: "bg-orange-500",
    other: "bg-gray-500"
  };

  const isAdmin = currentUserRole === 'admin';

  useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
    fetchLikedPosts();
  }, [activeTab]);

  // Setup realtime polling
  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'yours') {
      startPolling();
      return () => stopPolling();
    }
  }, [activeTab]);

  const startPolling = () => {
    lastCheckRef.current = new Date();

    pollingIntervalRef.current = setInterval(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // timeout 5s

      try {
        const response = await fetch(
          `/api/posts/recent?since=${lastCheckRef.current.toISOString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (data.success) {
          if (data.data.length > 0) {
            setNewPostsCount(prev => prev + data.data.length);
          }
          // update timestamp tiap kali polling, gak cuma kalau ada data
          lastCheckRef.current = new Date();
        }
      } catch (error) {
        if ((error as any).name === "AbortError") {
          console.warn("Polling request timed out");
        } else {
          console.error("Error polling for new posts:", error);
        }
      } finally {
        clearTimeout(timeout);
      }
    }, 10000); // Poll every 10 detik
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const loadNewPosts = async () => {
    setLoadingMore(true);
    try {
      let url = `/api/posts?page=1&limit=10`;
      
      if (activeTab === 'yours') {
        url += `&userId=${currentUserId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setNewPostsCount(0);
        lastCheckRef.current = new Date();
      }
    } catch (err) {
      console.error('Error loading new posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Fetch liked posts
  const fetchLikedPosts = async () => {
    try {
      const response = await fetch(`/api/posts/like?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setLikedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (err) {
      console.error('Error fetching liked posts:', err);
    }
  };

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = `/api/posts?page=${pageNum}&limit=10`;
      
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
        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSavedPostsDetails = async () => {
    try {
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const postIds = data.data.map((sp: any) => sp.postId);
        const postPromises = postIds.map((id: string) => 
          fetch(`/api/posts/${id}`).then(res => res.json())
        );
        
        const postsData = await Promise.all(postPromises);
        const validPosts = postsData
          .filter(p => p.success)
          .map(p => p.data);
        
        setPosts(validPosts);
        setHasMore(false);
      } else {
        setPosts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching saved posts details:', err);
    }
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch(`/api/saved-posts?userId=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setSavedPosts(new Set(data.data.map((p: any) => p.postId)));
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      const isSaved = savedPosts.has(postId);
      const response = await fetch('/api/saved-posts', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedPosts(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleSharePost = (postId: string) => {
    setSharePostId(postId);
    setCopySuccess(false);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/activityfeed/post/${sharePostId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviewImages([...previewImages, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages([...selectedImages, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // Upload images to Supabase Storage
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUserId);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', data.error);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return uploadedUrls;
  };

  // Create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setCreating(true);
    try {
      let mediaUrls: string[] = [];

      // Upload images first if any
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        mediaUrls = await uploadImages(selectedImages);
        setUploadingImages(false);

        if (mediaUrls.length !== selectedImages.length) {
          alert('Some images failed to upload. Please try again.');
          setCreating(false);
          return;
        }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          content: newPostContent,
          mediaUrls: mediaUrls,
          mediaType: mediaUrls.length > 0 ? 'image' : undefined,
          location: location || undefined,
          sport: sport || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts([data.data, ...posts]);
        setNewPostsCount(0);
        setNewPostContent("");
        setSelectedImages([]);
        setPreviewImages([]);
        setLocation("");
        setSport("");
        setShowCreatePost(false);
      } else {
        alert('Failed to create post: ' + data.error);
      }
    } catch (err: any) {
      alert('Error creating post: ' + err.message);
    } finally {
      setCreating(false);
      setUploadingImages(false);
    }
  };

  // Edit post
  const handleEditPost = async () => {
    if (!editingPost || !editPostContent.trim()) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/posts/${editingPost._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editPostContent,
          location: editLocation || undefined,
          sport: editSport || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.map(p => 
          p._id === editingPost._id ? { ...p, ...data.data } : p
        ));
        setEditingPost(null);
        setEditPostContent("");
        setEditLocation("");
        setEditSport("");
      } else {
        alert('Failed to update post: ' + data.error);
      }
    } catch (err: any) {
      alert('Error updating post: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeletingPost(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
      } else {
        alert('Failed to delete post: ' + data.error);
      }
    } catch (err: any) {
      alert('Error deleting post: ' + err.message);
    } finally {
      setDeletingPost(null);
      setOpenDropdown(null);
    }
  };

  // Like/Unlike post
  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likesCount: data.data.likesCount }
            : post
        ));

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (data.data.isLiked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Fetch comments
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
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Add comment
  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;

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
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Edit comment
  const handleEditComment = async () => {
    if (!editingComment || !editCommentText.trim()) return;

    setUpdatingComment(true);
    try {
      const response = await fetch(`/api/comments/${editingComment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editCommentText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [editingComment.postId]: prev[editingComment.postId].map(c =>
            c._id === editingComment._id ? { ...c, content: editCommentText } : c
          )
        }));
        setEditingComment(null);
        setEditCommentText("");
      } else {
        alert('Failed to update comment: ' + data.error);
      }
    } catch (err: any) {
      alert('Error updating comment: ' + err.message);
    } finally {
      setUpdatingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setDeletingComment(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
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
      } else {
        alert('Failed to delete comment: ' + data.error);
      }
    } catch (err: any) {
      alert('Error deleting comment: ' + err.message);
    } finally {
      setDeletingComment(null);
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

  const canEditPost = (post: Post) => {
    return post.userId === currentUserId || isAdmin;
  };

  const canDeletePost = (post: Post) => {
    return post.userId === currentUserId || isAdmin;
  };

  const canEditComment = (comment: Comment) => {
    return comment.userId === currentUserId || isAdmin;
  };

  const canDeleteComment = (comment: Comment) => {
    return comment.userId === currentUserId || isAdmin;
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
          onClick={() => {
            setError(null);
            fetchPosts();
          }}
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {getInitials(currentUserName)}
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
          <div key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.user.avatar_url ? (
                    <img src={post.user.avatar_url} alt={post.user.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(post.user.full_name)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProfile ({
                        userId: post.user.id,
                        userName: post.user.full_name,
                        userAvatar: post.user.avatar_url,
                      })}
                      className="font-bold text-gray-800">
                      <h3 className="font-bold text-gray-800">{post.user.full_name}</h3>
                    </button>
                    {post.sport && (
                      <span className={`${sportColors[post.sport]} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase`}>
                        {post.sport}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
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
              {(canEditPost(post) || canDeletePost(post)) && (
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                  
                  {openDropdown === post._id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
                        {canEditPost(post) && post.userId === currentUserId && (
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setEditPostContent(post.content);
                              setEditLocation(post.location || "");
                              setEditSport(post.sport || "");
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Edit2 size={16} />
                            Edit Post
                          </button>
                        )}
                        {canDeletePost(post) && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deletingPost === post._id}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                          >
                            {deletingPost === post._id ? (
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

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Images */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className={`grid ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                {post.mediaUrls.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Heart size={16} className="text-red-500 fill-red-500" />
                {post.likesCount} likes
              </span>
              <div className="flex gap-4">
                <span>{post.commentsCount} comments</span>
                <span>{post.sharesCount} shares</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-around">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  likedPosts.has(post._id) ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <Heart size={20} className={likedPosts.has(post._id) ? 'fill-red-500' : ''} />
                <span className="font-medium">Like</span>
              </button>
              <button
                onClick={() => fetchComments(post._id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Comment</span>
              </button>
              <button 
                onClick={() => handleSharePost(post._id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Share2 size={20} />
                <span className="font-medium">Share</span>
              </button>
              <button 
                onClick={() => handleSavePost(post._id)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  savedPosts.has(post._id) ? 'text-[#15b392]' : 'text-gray-600'
                }`}
                title={savedPosts.has(post._id) ? 'Unsave post' : 'Save post'}
              >
                <Bookmark size={20} className={savedPosts.has(post._id) ? 'fill-[#15b392]' : ''} />
              </button>
            </div>

            {/* Comments Section */}
            {activeCommentPost === post._id && (
              <div className="border-t border-gray-200 bg-gray-50">
                {loadingComments[post._id] ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#15b392]" />
                  </div>
                ) : (
                  <>
                    {/* Existing Comments */}
                    {comments[post._id] && comments[post._id].length > 0 && (
                      <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
                        {comments[post._id].map((comment) => (
                          <div key={comment._id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {comment.user.avatar_url ? (
                                <img src={comment.user.avatar_url} alt={comment.user.full_name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(comment.user.full_name)
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <button
                                    onClick={() => setViewingProfile({
                                      userId: comment.user.id,
                                      userName: comment.user.full_name,
                                      userAvatar: comment.user.avatar_url,
                                    })}>
                                    <span className="font-semibold text-sm text-gray-800">{comment.user.full_name}</span>
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), "MMM dd 'at' HH:mm")}</span>
                                    {(canEditComment(comment) || canDeleteComment(comment)) && (
                                      <div className="relative">
                                        <button
                                          onClick={() => setOpenDropdown(openDropdown === comment._id ? null : comment._id)}
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <MoreVertical size={14} className="text-gray-500" />
                                        </button>
                                        
                                        {openDropdown === comment._id && (
                                          <>
                                            <div 
                                              className="fixed inset-0 z-10" 
                                              onClick={() => setOpenDropdown(null)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                                              {canEditComment(comment) && comment.userId === currentUserId && (
                                                <button
                                                  onClick={() => {
                                                    setEditingComment(comment);
                                                    setEditCommentText(comment.content);
                                                    setOpenDropdown(null);
                                                  }}
                                                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                                                >
                                                  <Edit2 size={14} />
                                                  Edit
                                                </button>
                                              )}
                                              {canDeleteComment(comment) && (
                                                <button
                                                  onClick={() => handleDeleteComment(comment._id, post._id)}
                                                  disabled={deletingComment === comment._id}
                                                  className="w-full px-3 py-1.5 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 disabled:opacity-50"
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
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="p-4 flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {getInitials(currentUserName)}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent text-sm"
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
        ))}
      </div>

      {/* Load More - Hide for saved posts tab */}
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

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Create Post</h3>
              <button
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPostContent("");
                  setSelectedImages([]);
                  setLocation("");
                  setSport("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials(currentUserName)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{currentUserName}</h4>
                  <p className="text-sm text-gray-500">{currentUserSkillLevel}</p>
                </div>
              </div>

              <textarea
                placeholder="What's happening in your sports journey?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full min-h-32 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent resize-none text-gray-800 mb-3"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] text-sm"
                />
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] text-sm"
                >
                  <option value="">Select Sport</option>
                  <option value="tennis">Tennis</option>
                  <option value="padel">Padel</option>
                  <option value="badminton">Badminton</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Selected ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-4 border border-gray-200 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add to your post</p>
                <div className="flex gap-2">
                  {/* Tombol buat buka file picker */}
                  <button
                    onClick={() => document.getElementById("image-upload-input")?.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <ImageIcon size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Photo</span>
                  </button>

                  {/* Input tersembunyi buat upload gambar */}
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || creating}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Edit Post</h3>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setEditPostContent("");
                  setEditLocation("");
                  setEditSport("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold">
                  {editingPost.user.avatar_url ? (
                    <img src={editingPost.user.avatar_url} alt={editingPost.user.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(editingPost.user.full_name)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{editingPost.user.full_name}</h4>
                </div>
              </div>

              <textarea
                placeholder="What's happening in your sports journey?"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                className="w-full min-h-32 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent resize-none text-gray-800 mb-3"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] text-sm"
                />
                <select
                  value={editSport}
                  onChange={(e) => setEditSport(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] text-sm"
                >
                  <option value="">Select Sport</option>
                  <option value="tennis">Tennis</option>
                  <option value="padel">Padel</option>
                  <option value="badminton">Badminton</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleEditPost}
                disabled={!editPostContent.trim() || updating}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingComment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Edit Comment</h3>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditCommentText("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <textarea
                placeholder="Write your comment..."
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                className="w-full min-h-24 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent resize-none text-gray-800 mb-3"
              />

              <button
                onClick={handleEditComment}
                disabled={!editCommentText.trim() || updatingComment}
                className="w-full py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingComment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Comment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Post Modal */}
      {sharePostId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Share Post</h3>
              <button
                onClick={() => {
                  setSharePostId(null);
                  setCopySuccess(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Share this post with others</p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={`${window.location.origin}/activity-feed/post/${sharePostId}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors font-medium text-sm flex items-center gap-2"
                >
                  {copySuccess ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {copySuccess && (
                <div className="text-sm text-green-600 text-center bg-green-50 py-2 rounded-lg">
                  ✓ Link copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Profile Modal for viewing other users */}
      {viewingProfile && (
        <ProfileModal
          isOpen={true}
          onClose={() => setViewingProfile(null)}
          userId={viewingProfile.userId}
          userName={viewingProfile.userName}
          userAvatar={viewingProfile.userAvatar}
        /> 
      )}
    </>
  );
}