"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  User,
  Star,
  Edit,
  MapPin,
  Briefcase,
  Target,
  Heart,
  Brain,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@paceon/lib/supabaseclient";
import { useDataCache } from "@/contexts/DataContext";
import { RealtimeChannel } from "@supabase/supabase-js";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  location: string | null;
}

interface UserStatistics {
  event_attended: number;
  connections: number;
  event_upcoming: number;
  networking_score: number;
  total_posts: number;
}

interface MatchmakingPreferences {
  company: string | null;
  position: string | null;
  position_duration: number | null;
  linkedin_url: string | null;
  location: string | null;
  goal: string | null;
  networking_style: string | null;
  passionate_topics: string[] | null;
  hobby: string | null;
  personality: string | null;
  completed_at: string | null;
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

// Skeleton Components
function SkeletonHeader() {
  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-[#3d4459] animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto md:mx-0" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto md:mx-0" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto md:mx-0" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#2d3548] p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-[#3d4459] animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

function SkeletonContent() {
  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-[#3d4459] animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { fetchWithCache, invalidateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [matchmakingData, setMatchmakingData] = useState<MatchmakingPreferences | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "ratings">("profile");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }, [ratings]);

  const fetchAllUserData = useCallback(
    async (forceRefresh = false) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/auth/sign-up");
          return;
        }

        setCurrentUserId(user.id);

        const [profile, stats, matchmaking, ratingsResponse] = await Promise.all([
          fetchWithCache<UserProfile | null>(
            `profile-${user.id}`,
            async () => {
              const { data, error } = await supabase
                .from("users_profile")
                .select("*")
                .eq("id", user.id)
                .single();
              if (error && error.code !== "PGRST116") throw error;
              return data;
            },
            forceRefresh ? 0 : undefined
          ),
          fetchWithCache<UserStatistics | null>(
            `stats-${user.id}`,
            async () => {
              const { data, error } = await supabase
                .from("user_statistics")
                .select("*")
                .eq("user_id", user.id)
                .single();
              if (error && error.code !== "PGRST116") throw error;
              return data;
            },
            forceRefresh ? 0 : undefined
          ),
          fetchWithCache<MatchmakingPreferences | null>(
            `matchmaking-${user.id}`,
            async () => {
              const { data, error } = await supabase
                .from("matchmaking_preferences")
                .select("*")
                .eq("user_id", user.id)
                .single();
              if (error && error.code !== "PGRST116") throw error;
              return data;
            },
            forceRefresh ? 0 : undefined
          ),
          supabase
            .from('affirmation_cube')
            .select(`
              id,
              reviewer_id,
              rating,
              feedback,
              created_at,
              event_id
            `)
            .eq('reviewee_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        setUserProfile(profile);
        setUserStats(stats);
        setMatchmakingData(matchmaking);

        // Process ratings
        if (ratingsResponse.data && ratingsResponse.data.length > 0) {
          const reviewerIds = [...new Set(ratingsResponse.data.map((r: Record<string, unknown>) => r.reviewer_id as string))];
          const eventIds = [...new Set(ratingsResponse.data.map((r: Record<string, unknown>) => r.event_id as string))];
          
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

          const ratingsData = ratingsResponse.data.map((r: Record<string, unknown>) => {
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

          setRatings(ratingsData);
        }
      } catch (err) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    },
    [router, fetchWithCache]
  );

  useEffect(() => {
    fetchAllUserData(false);
  }, [fetchAllUserData]);

  useEffect(() => {
    if (!currentUserId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`profile-changes-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users_profile",
          filter: `id=eq.${currentUserId}`,
        },
        () => {
          invalidateCache(`profile-${currentUserId}`);
          fetchAllUserData(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matchmaking_preferences",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          invalidateCache(`matchmaking-${currentUserId}`);
          fetchAllUserData(true);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, fetchAllUserData, invalidateCache]);

  const handleRefresh = () => {
    setLoading(true);
    if (currentUserId) {
      invalidateCache(`profile-${currentUserId}`);
      invalidateCache(`stats-${currentUserId}`);
      invalidateCache(`matchmaking-${currentUserId}`);
    }
    fetchAllUserData(true);
  };

  const stats = {
    eventsAttended: userStats?.event_attended || 0,
    connectionsMade: userStats?.connections || 0,
    upcomingEvents: userStats?.event_upcoming || 0,
    networkScore: userStats?.networking_score || 0,
  };

  const isProfileComplete = userProfile && matchmakingData?.completed_at;

  // Skeleton loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] py-4 sm:py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          <SkeletonHeader />
          <SkeletonStats />
          <SkeletonContent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#242837] py-4 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] rounded-xl shadow-lg p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.full_name || "User"}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-white/30">
                  {userProfile?.full_name?.charAt(0)?.toUpperCase() ||
                    userProfile?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {userProfile?.full_name || userProfile?.username || "Anonymous User"}
              </h1>
              <p className="text-white/90 text-base sm:text-lg mb-1">
                {matchmakingData?.position || "—"} • {matchmakingData?.company || "—"}
              </p>
              <p className="text-white/80 text-sm">
                {matchmakingData?.position_duration
                  ? `${matchmakingData.position_duration} years in role`
                  : "N/A"}
              </p>
              {ratings.length > 0 && (
                <div className="flex items-center gap-1 mt-2 justify-center md:justify-start">
                  <Star size={18} className="text-yellow-300 fill-yellow-300" />
                  <span className="font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-white/80 text-sm">({ratings.length} ratings)</span>
                </div>
              )}
              {matchmakingData?.linkedin_url && (
                <a
                  href={
                    matchmakingData.linkedin_url.startsWith("http")
                      ? matchmakingData.linkedin_url
                      : `https://${matchmakingData.linkedin_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white text-sm underline mt-2 inline-block transition-colors"
                >
                  LinkedIn Profile
                </a>
              )}
            </div>

            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center bg-white/10 text-white hover:bg-white/20 p-3 rounded-lg font-medium transition-all"
                title="Refresh data"
                aria-label="Refresh profile data"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 bg-white text-[#FB6F7A] hover:bg-white/90 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
              >
                <Edit size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>

          {!isProfileComplete && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">Your profile looks incomplete.</p>
                <p className="text-sm">Complete your profile for better matchmaking.</p>
              </div>
              <button
                onClick={() => router.push("/settings")}
                className="bg-[#F47A49] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#FB6F7A] transition-colors whitespace-nowrap"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Calendar className="text-[#FB6F7A]" size={20} />}
            value={stats.eventsAttended}
            label="Events Attended"
            bgColor="bg-[#FB6F7A]/10 dark:bg-[#FB6F7A]/20"
          />
          <StatCard
            icon={<Users className="text-[#21C36E]" size={20} />}
            value={stats.connectionsMade}
            label="Connections"
            bgColor="bg-[#21C36E]/10 dark:bg-[#21C36E]/20"
          />
          <StatCard
            icon={<User className="text-[#F47A49]" size={20} />}
            value={stats.upcomingEvents}
            label="Upcoming"
            bgColor="bg-[#F47A49]/10 dark:bg-[#F47A49]/20"
          />
          <StatCard
            icon={<Star className="text-yellow-500" size={20} />}
            value={typeof stats.networkScore === "number" ? stats.networkScore.toFixed(1) : "0.0"}
            label="Network Score"
            bgColor="bg-yellow-100 dark:bg-yellow-900/20"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-[#3d4459]">
          <div className="flex border-b border-gray-200 dark:border-[#3d4459]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === "profile"
                  ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
              }`}
            >
              Profile Info
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("ratings")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === "ratings"
                  ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
              }`}
            >
              Ratings ({ratings.length})
              {activeTab === "ratings" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
              )}
            </button>
          </div>
        </div>

        {/* Profile Information */}
        {activeTab === "profile" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-[#3d4459]">
              <h3 className="font-bold text-[#3F3E3D] dark:text-white text-lg sm:text-xl mb-6 flex items-center gap-2">
                <User className="text-[#FB6F7A]" size={24} />
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <InfoItem icon={<User size={16} />} label="Full Name" value={userProfile?.full_name} />
                <InfoItem
                  icon={<User size={16} />}
                  label="Username"
                  value={userProfile?.username ? `@${userProfile.username}` : null}
                />
                <InfoItem icon={<Mail size={16} />} label="Email" value={userProfile?.email} />
                <InfoItem icon={<Phone size={16} />} label="Phone" value={userProfile?.phone} />
                <InfoItem icon={<Briefcase size={16} />} label="Company" value={matchmakingData?.company} />
                <InfoItem icon={<Briefcase size={16} />} label="Position" value={matchmakingData?.position} />
                <InfoItem
                  icon={<Calendar size={16} />}
                  label="Years in Role"
                  value={
                    matchmakingData?.position_duration ? `${matchmakingData.position_duration} years` : null
                  }
                />
                <InfoItem
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={matchmakingData?.location || userProfile?.location}
                />
                <InfoItem icon={<Target size={16} />} label="Networking Goal" value={matchmakingData?.goal} />
                <InfoItem
                  icon={<Users size={16} />}
                  label="Networking Style"
                  value={matchmakingData?.networking_style}
                />
                <InfoItem icon={<Heart size={16} />} label="Hobby" value={matchmakingData?.hobby} />
                <InfoItem icon={<Brain size={16} />} label="Personality" value={matchmakingData?.personality} />

                {userProfile?.bio && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <User size={16} />
                      Bio
                    </p>
                    <p className="text-[#3F3E3D] dark:text-white font-medium">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Passionate Topics */}
            <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-[#3d4459]">
              <h3 className="font-bold text-[#3F3E3D] dark:text-white text-lg sm:text-xl mb-4 flex items-center gap-2">
                <Star className="text-[#FB6F7A]" size={24} />
                Passionate Topics
              </h3>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {matchmakingData?.passionate_topics && matchmakingData.passionate_topics.length > 0 ? (
                  matchmakingData.passionate_topics.map((topic: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FB6F7A] to-[#F47A49] text-white text-sm rounded-full font-medium shadow-md"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4 w-full text-sm">
                    No topics added yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === "ratings" && (
          <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-[#3d4459]">
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <Star size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-600 dark:text-gray-400">No ratings yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Ratings will appear here after you attend events
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {ratings.map((rating) => (
                  <RatingCard key={rating.id} rating={rating} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Rating Card Component
function RatingCard({ rating }: { rating: Rating }) {
  return (
    <div className="bg-[#F4F4EF] dark:bg-[#3d4459] border border-gray-200 dark:border-[#4d5469] rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        {rating.reviewer_avatar ? (
          <img
            src={rating.reviewer_avatar}
            alt={rating.reviewer_name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] flex items-center justify-center text-white font-bold flex-shrink-0">
            {rating.reviewer_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base text-[#3F3E3D] dark:text-white truncate">
            {rating.reviewer_name}
          </h4>
          {(rating.reviewer_position || rating.reviewer_company) && (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
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
          <Star size={16} className="text-yellow-500 fill-yellow-500 sm:w-5 sm:h-5" />
          <span className="font-bold text-base sm:text-lg text-[#3F3E3D] dark:text-white">
            {rating.rating}
          </span>
        </div>
      </div>

      {rating.feedback && (
        <div className="bg-white dark:bg-[#2d3548] p-3 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">
            &quot;{rating.feedback}&quot;
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-right">
        {format(new Date(rating.created_at), 'MMM dd, yyyy')}
      </p>
    </div>
  );
}

// Helper Components
function StatCard({
  icon,
  value,
  label,
  bgColor,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white dark:bg-[#2d3548] p-4 sm:p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all border border-gray-200 dark:border-[#3d4459]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#3F3E3D] dark:text-white">{value}</p>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="text-[#3F3E3D] dark:text-white font-medium break-words">{value || "-"}</p>
    </div>
  );
}