// src/app/activity-feed/post/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../../packages/lib/supabase';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MapPin, 
  ArrowLeft,
  Loader2,
  AlertCircle 
} from 'lucide-react';

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

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const sportColors: Record<string, string> = {
    tennis: "bg-blue-500",
    padel: "bg-green-500",
    badminton: "bg-orange-500",
    other: "bg-gray-500"
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user);
    };
    getUser();
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
      } else {
        setError(data.error || 'Post not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#15b392]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <AlertCircle size={24} />
            <h3 className="font-bold text-lg">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/activity-feed')}
            className="w-full py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/activity-feed')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {post.user.avatar_url ? (
                  <img 
                    src={post.user.avatar_url} 
                    alt={post.user.full_name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  getInitials(post.user.full_name)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{post.user.full_name}</h3>
                  {post.sport && (
                    <span className={`${sportColors[post.sport]} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase`}>
                      {post.sport}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
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
            <p className="text-gray-800 whitespace-pre-wrap text-lg">{post.content}</p>
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <Heart size={20} />
              <span className="font-medium">Like</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <MessageCircle size={20} />
              <span className="font-medium">Comment</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <Share2 size={20} />
              <span className="font-medium">Share</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <Bookmark size={20} />
            </button>
          </div>

          {!currentUser && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-3">Sign in to interact with this post</p>
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
  );
}