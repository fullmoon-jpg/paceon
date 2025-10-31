// src/components/ActivityFeed/components/ProfileModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Edit2, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@paceon/lib/supabase';

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

interface ProfileInfo {
  position?: string;
  company?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPosition?: string;
  userCompany?: string;
  userRole?: string;
}

const profileCache = new Map<string, {
  stats: UserStats;
  profileInfo: ProfileInfo;
  posts: Post[];
  timestamp: number;
}>();

const CACHE_TTL = 2 * 60 * 1000;

export function invalidateProfileCache(userId: string) {
  profileCache.delete(userId);
}

export function clearAllProfileCache() {
  profileCache.clear();
}

const PostCard = ({ post }: { post: Post }) => (
  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
    {post.mediaUrls && post.mediaUrls.length > 0 ? (
      <img
        src={post.mediaUrls[0]}
        alt="Post"
        className="w-full h-40 object-cover"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
        <Edit2 size={32} className="text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <div className="p-3">
      <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
        {post.content}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{post.likesCount} likes</span>
        <span>{post.commentsCount} comments</span>
        <span>{format(new Date(post.createdAt), 'MMM dd')}</span>
      </div>
    </div>
  </div>
);

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  bgColor 
}: { 
  icon: any; 
  value: number | string; 
  label: string; 
  bgColor: string;
}) => (
  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm">
    <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon size={24} />
    </div>
    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

export default function ProfileModal({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  userPosition,
  userCompany,
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
  const [error, setError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const initials = useMemo(() => {
    if (!userName) return '?';
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [userName]);

  const displayPosition = useMemo(
    () => profileInfo.position || userPosition,
    [profileInfo.position, userPosition]
  );
  
  const displayCompany = useMemo(
    () => profileInfo.company || userCompany,
    [profileInfo.company, userCompany]
  );

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (mountedRef.current) {
        setStats(cached.stats);
        setProfileInfo(cached.profileInfo);
        setPosts(cached.posts);
        setLoading(false);
      }
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const [statsResponse, preferencesResponse, postsResponse] = await Promise.allSettled([
        supabase
          .from('user_statistics')
          .select('event_attended, connections, total_posts, networking_score')
          .eq('user_id', userId)
          .abortSignal(abortControllerRef.current.signal)
          .single(),
        
        supabase
          .from('matchmaking_preferences')
          .select('position, company')
          .eq('user_id', userId)
          .abortSignal(abortControllerRef.current.signal)
          .maybeSingle(),
        
        fetch(`/api/posts?userId=${userId}&limit=20`, {
          signal: abortControllerRef.current.signal
        }).then(res => res.json())
      ]);

      if (!mountedRef.current) return;

      let postsData: Post[] = [];
      if (postsResponse.status === 'fulfilled' && postsResponse.value.success) {
        postsData = postsResponse.value.data || [];
      }

      let statsData: UserStats = {
        event_attended: 0,
        connections: 0,
        total_posts: postsData.length,
        networking_score: 0
      };

      if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
        const raw = statsResponse.value.data;
        statsData = {
          event_attended: raw.event_attended || 0,
          connections: raw.connections || 0,
          total_posts: raw.total_posts || postsData.length,
          networking_score: raw.networking_score || 0
        };
      }

      let preferencesData: ProfileInfo = {};
      if (preferencesResponse.status === 'fulfilled' && preferencesResponse.value.data) {
        preferencesData = {
          position: preferencesResponse.value.data.position,
          company: preferencesResponse.value.data.company
        };
      }

      setStats(statsData);
      setProfileInfo(preferencesData);
      setPosts(postsData);

      profileCache.set(userId, {
        stats: statsData,
        profileInfo: preferencesData,
        posts: postsData,
        timestamp: Date.now()
      });

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;

      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;

    if (isOpen && userId) {
      fetchUserData();
    }

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [isOpen, userId, fetchUserData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#15b392] to-[#2a6435] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-[#15b392] dark:text-green-400 font-bold text-3xl overflow-hidden flex-shrink-0">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                initials
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{userName || 'User'}</h2>
              {(displayPosition || displayCompany) && (
                <p className="text-white/90">
                  {displayPosition && displayCompany 
                    ? `${displayPosition} at ${displayCompany}`
                    : displayPosition || displayCompany
                  }
                </p>
              )}
              {userRole === 'admin' && (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white text-xs font-bold rounded-full">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900">
          <StatCard
            icon={Calendar}
            value={stats.event_attended}
            label="Events Attended"
            bgColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Users}
            value={stats.connections}
            label="Connections"
            bgColor="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={Edit2}
            value={stats.total_posts}
            label="Total Posts"
            bgColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.networking_score.toFixed(1)}
            label="Network Score"
            bgColor="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-8">
            <button className="py-4 border-b-2 border-[#15b392] dark:border-green-400 text-[#15b392] dark:text-green-400 font-semibold">
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
              <p className="text-red-600 dark:text-red-400 mb-2">Error loading data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchUserData}
                className="px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Edit2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}