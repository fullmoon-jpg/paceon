"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Edit2, Calendar, Users, TrendingUp, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@paceon/lib/supabaseclient';
import Image from 'next/image';

interface Post {
  _id: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Rating {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewer_position: string | null;
  reviewer_company: string | null;
  event_name: string;
  rating: number;
  feedback: string | null;
  created_at: string;
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
  userAvatar?: string | null;
  userPosition?: string;
  userCompany?: string;
  userRole?: string;
}

const profileCache = new Map<string, {
  stats: UserStats;
  profileInfo: ProfileInfo;
  posts: Post[];
  ratings: Rating[];
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
  <div className="bg-white dark:bg-[#2d3548] border border-gray-200 dark:border-[#3d4459] rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]">
    {post.mediaUrls && post.mediaUrls.length > 0 ? (
      <img
        src={post.mediaUrls[0]}
        alt="Post"
        className="w-full h-40 object-cover"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-40 bg-[#F4F4EF] dark:bg-[#3d4459] flex items-center justify-center">
        <Edit2 size={32} className="text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <div className="p-3">
      <p className="text-sm text-[#3F3E3D] dark:text-gray-200 line-clamp-2 mb-2">
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

const RatingCard = ({ rating }: { rating: Rating }) => (
  <div className="bg-white dark:bg-[#2d3548] border border-gray-200 dark:border-[#3d4459] rounded-lg p-4 hover:shadow-lg transition-all">
    <div className="flex items-start gap-3 mb-3">
      {rating.reviewer_avatar ? (
        <img
          src={rating.reviewer_avatar}
          alt={rating.reviewer_name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#21C36E] flex items-center justify-center text-white font-bold flex-shrink-0">
          {rating.reviewer_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm sm:text-base text-[#3F3E3D] dark:text-white truncate">
          {rating.reviewer_name}
        </h4>
        {(rating.reviewer_position || rating.reviewer_company) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {rating.reviewer_position && rating.reviewer_company
              ? `${rating.reviewer_position} at ${rating.reviewer_company}`
              : rating.reviewer_position || rating.reviewer_company
            }
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {rating.event_name}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star size={16} className="text-[#F0C946] fill-[#F0C946] sm:w-5 sm:h-5" />
        <span className="font-bold text-base sm:text-lg text-[#3F3E3D] dark:text-white">
          {rating.rating}
        </span>
      </div>
    </div>

    {rating.feedback && (
      <div className="bg-[#F4F4EF] dark:bg-[#3d4459] p-3 rounded-lg">
        <p className="text-xs sm:text-sm text-[#3F3E3D] dark:text-gray-300 italic">
          &quot;{rating.feedback}&quot;
        </p>
      </div>
    )}

    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-right">
      {format(new Date(rating.created_at), 'MMM dd, yyyy')}
    </p>
  </div>
);

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  bgColor,
  iconColor
}: { 
  icon: React.ComponentType<{ size: number; className?: string }>;
  value: number | string; 
  label: string; 
  bgColor: string;
  iconColor: string;
}) => (
  <div className="bg-white dark:bg-[#2d3548] border border-gray-200 dark:border-[#3d4459] rounded-lg p-3 sm:p-4 text-center shadow-sm">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon size={20} className={`sm:w-6 sm:h-6 ${iconColor}`} />
    </div>
    <p className="text-xl sm:text-2xl font-bold text-[#3F3E3D] dark:text-white">{value}</p>
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</p>
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
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({});
  const [activeTab, setActiveTab] = useState<'posts' | 'ratings'>('posts');

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

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }, [ratings]);

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
        setRatings(cached.ratings);
        setLoading(false);
      }
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const [statsResponse, preferencesResponse, postsResponse, ratingsResponse] = await Promise.allSettled([
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
        }).then(res => res.json()),

        supabase
          .from('affirmation_cube')
          .select('id, reviewer_id, rating, feedback, created_at, event_id')
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false })
          .abortSignal(abortControllerRef.current.signal)
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

      let ratingsData: Rating[] = [];
      if (ratingsResponse.status === 'fulfilled' && ratingsResponse.value.data && ratingsResponse.value.data.length > 0) {
        const reviewerIds = [...new Set(ratingsResponse.value.data.map((r: Record<string, unknown>) => r.reviewer_id as string))];
        const eventIds = [...new Set(ratingsResponse.value.data.map((r: Record<string, unknown>) => r.event_id as string))];
        
        const [reviewerProfiles, reviewerPreferences, events] = await Promise.all([
          supabase
            .from('users_profile')
            .select('id, full_name, avatar_url')
            .in('id', reviewerIds),
          supabase
            .from('matchmaking_preferences')
            .select('user_id, position, company')
            .in('user_id', reviewerIds),
          supabase
            .from('events')
            .select('id, title')
            .in('id', eventIds)
        ]);

        const reviewerProfileMap = new Map(
          (reviewerProfiles.data || []).map((p: { id: string; full_name: string; avatar_url: string | null }) => [p.id, p])
        );

        const reviewerPrefMap = new Map(
          (reviewerPreferences.data || []).map((p: { user_id: string; position: string | null; company: string | null }) => [p.user_id, p])
        );

        const eventMap = new Map(
          (events.data || []).map((e: { id: string; title: string }) => [e.id, e])
        );

        ratingsData = ratingsResponse.value.data.map((r: Record<string, unknown>) => {
          const reviewerId = r.reviewer_id as string;
          const eventId = r.event_id as string;
          const reviewerProfile = reviewerProfileMap.get(reviewerId);
          const reviewerPref = reviewerPrefMap.get(reviewerId);
          const event = eventMap.get(eventId);

          return {
            id: r.id as string,
            reviewer_id: reviewerId,
            reviewer_name: reviewerProfile?.full_name || 'Unknown User',
            reviewer_avatar: reviewerProfile?.avatar_url || null,
            reviewer_position: reviewerPref?.position || null,
            reviewer_company: reviewerPref?.company || null,
            event_name: event?.title || 'Unknown Event',
            rating: r.rating as number,
            feedback: r.feedback as string | null,
            created_at: r.created_at as string,
          };
        });
      }

      setStats(statsData);
      setProfileInfo(preferencesData);
      setPosts(postsData);
      setRatings(ratingsData);

      profileCache.set(userId, {
        stats: statsData,
        profileInfo: preferencesData,
        posts: postsData,
        ratings: ratingsData,
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

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[#242837] rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FB6F7A] to-[#F47A49] p-4 sm:p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-white sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white dark:bg-[#2d3548] rounded-full flex items-center justify-center text-[#FB6F7A] font-bold text-xl sm:text-3xl overflow-hidden flex-shrink-0">
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
            <div className="text-white min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold truncate">{userName || 'User'}</h2>
              {(displayPosition || displayCompany) && (
                <p className="text-sm sm:text-base text-white/90 truncate">
                  {displayPosition && displayCompany 
                    ? `${displayPosition} at ${displayCompany}`
                    : displayPosition || displayCompany
                  }
                </p>
              )}
              {ratings.length > 0 && (
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  <Star size={14} className="text-[#F0C946] fill-[#F0C946] sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-xs sm:text-sm text-white/80">({ratings.length} ratings)</span>
                </div>
              )}
              {userRole === 'admin' && (
                <span className="inline-block mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F0C946] text-[#3F3E3D] text-xs font-bold rounded-full">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#F4F4EF] dark:bg-[#1a1d29]">
          <StatCard
            icon={Calendar}
            value={stats.event_attended}
            label="Events Attended"
            bgColor="bg-[#FB6F7A]/10"
            iconColor="text-[#FB6F7A]"
          />
          <StatCard
            icon={Users}
            value={stats.connections}
            label="Connections"
            bgColor="bg-[#21C36E]/10"
            iconColor="text-[#21C36E]"
          />
          <StatCard
            icon={Edit2}
            value={stats.total_posts}
            label="Total Posts"
            bgColor="bg-[#D33181]/10"
            iconColor="text-[#D33181]"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.networking_score.toFixed(1)}
            label="Network Score"
            bgColor="bg-[#F0C946]/10"
            iconColor="text-[#F0C946]"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[#3d4459] px-4 sm:px-6">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`py-3 sm:py-4 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-[#FB6F7A] text-[#FB6F7A]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#3F3E3D] dark:hover:text-gray-200'
              }`}
            >
              Posts ({stats.total_posts})
            </button>
            <button 
              onClick={() => setActiveTab('ratings')}
              className={`py-3 sm:py-4 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'ratings'
                  ? 'border-[#21C36E] text-[#21C36E]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#3F3E3D] dark:hover:text-gray-200'
              }`}
            >
              Ratings ({ratings.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#FB6F7A]" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[#FB6F7A] mb-2 font-semibold">Error loading data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchUserData}
                className="px-4 py-2 bg-[#FB6F7A] text-white rounded-lg hover:bg-[#D33181] transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          ) : activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="text-center py-12">
                <Edit2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )
          ) : (
            ratings.length === 0 ? (
              <div className="text-center py-12">
                <Star size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400">No ratings yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {ratings.map((rating) => (
                  <RatingCard key={rating.id} rating={rating} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}