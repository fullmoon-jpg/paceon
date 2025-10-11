// src/components/ProfileModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { X, Edit2, Bookmark, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Post {
  _id: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface UserStats {
  event_attended: number;
  connections: number;
  total_posts: number;
  networking_score: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  userSkillLevel?: string;
  userRole?: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  userSkillLevel = "Intermediate",
  userRole = "user"
}: ProfileModalProps) {
  const [stats, setStats] = useState<UserStats>({
    event_attended: 0,
    connections: 0,
    total_posts: 0,
    networking_score: 0
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stats langsung dari Supabase
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('event_attended, connections, total_posts, networking_score')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Stats Response:', statsData);
      
      if (statsData) {
        setStats({
          event_attended: statsData.event_attended || 0,
          connections: statsData.connections || 0,
          total_posts: statsData.total_posts || 0,
          networking_score: statsData.networking_score || 0
        });
      } else {
        console.warn('⚠️ No stats found for user:', userId);
        // Keep default values (all 0)
      }

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('❌ Stats error:', statsError);
      }

      // Fetch user posts dari API
      const postsResponse = await fetch(`/api/posts?userId=${userId}&limit=20`);
      const postsData = await postsResponse.json();
      
      if (postsData.success && postsData.data) {
        setPosts(postsData.data);
      } else {
        console.error('❌ Failed to fetch posts:', postsData.error);
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#15b392] to-[#2a6435] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#15b392] font-bold text-3xl overflow-hidden">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(userName)
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{userName || 'User'}</h2>
              <p className="text-white/90">{userSkillLevel}</p>
              {userRole === 'admin' && (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.event_attended}
            </p>
            <p className="text-sm text-gray-600">Events Attended</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users size={24} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.connections}
            </p>
            <p className="text-sm text-gray-600">Connections</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Edit2 size={24} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.total_posts}
            </p>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.networking_score.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Network Score</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 border-b-2 font-semibold transition-colors ${
                activeTab === 'posts'
                  ? 'border-[#15b392] text-[#15b392]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Posts ({stats.total_posts})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#15b392]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={fetchUserData}
                className="mt-4 px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <Edit2 size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No posts yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt="Post"
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                          <Edit2 size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{post.likesCount} likes</span>
                          <span>{post.commentsCount} comments</span>
                          <span>{format(new Date(post.createdAt), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}