// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { supabase } from "@paceon/lib/supabase";
import { useDataCache } from "@/contexts/DataContext";
import { RealtimeChannel } from "@supabase/supabase-js";

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

export default function ProfilePage() {
  const router = useRouter();
  const { fetchWithCache, invalidateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [matchmakingData, setMatchmakingData] = useState<MatchmakingPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "interests">("profile");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

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

        const [profile, stats, matchmaking] = await Promise.all([
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
        ]);

        setUserProfile(profile);
        setUserStats(stats);
        setMatchmakingData(matchmaking);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#15b392] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4 transition-colors">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-xl shadow-lg p-6 sm:p-8 text-white">
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
                className="flex items-center gap-2 bg-white text-[#15b392] hover:bg-white/90 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
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
                className="bg-[#2a6435] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1f4a28] transition-colors whitespace-nowrap"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Calendar className="text-[#15b392]" size={20} />}
            value={stats.eventsAttended}
            label="Events Attended"
            bgColor="bg-[#15b392]/10 dark:bg-[#15b392]/20"
          />
          <StatCard
            icon={<Users className="text-blue-600 dark:text-blue-400" size={20} />}
            value={stats.connectionsMade}
            label="Connections"
            bgColor="bg-blue-100 dark:bg-blue-900/20"
          />
          <StatCard
            icon={<User className="text-orange-600 dark:text-orange-400" size={20} />}
            value={stats.upcomingEvents}
            label="Upcoming"
            bgColor="bg-orange-100 dark:bg-orange-900/20"
          />
          <StatCard
            icon={<Star className="text-yellow-600 dark:text-yellow-400" size={20} />}
            value={typeof stats.networkScore === "number" ? stats.networkScore.toFixed(1) : "0.0"}
            label="Network Score"
            bgColor="bg-yellow-100 dark:bg-yellow-900/20"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 sm:py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-[#15b392] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("interests")}
              className={`flex-1 py-2 sm:py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "interests"
                  ? "bg-[#15b392] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Interests
            </button>
          </div>
        </div>

        {/* Profile Information */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-6 flex items-center gap-2">
              <User className="text-[#15b392]" size={24} />
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <User size={16} />
                    Bio
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{userProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests Tab */}
        {activeTab === "interests" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-6 flex items-center gap-2">
              <Star className="text-[#15b392]" size={24} />
              Passionate Topics
            </h3>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {matchmakingData?.passionate_topics && matchmakingData.passionate_topics.length > 0 ? (
                matchmakingData.passionate_topics.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white text-sm sm:text-base rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8 w-full">
                  No topics added yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="text-gray-900 dark:text-white font-medium break-words">{value || "-"}</p>
    </div>
  );
}
