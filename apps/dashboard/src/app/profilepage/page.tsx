"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

// Cache storage dengan timestamp
const CACHE_KEY = 'user_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

interface CachedData {
  profile: UserProfile | null;
  stats: UserStatistics | null;
  matchmaking: MatchmakingPreferences | null;
  timestamp: number;
  userId: string;
}

// Helper untuk cache management
const cacheManager = {
  get: (userId: string): CachedData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      const isDifferentUser = data.userId !== userId;
      
      if (isExpired || isDifferentUser) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  },
  
  set: (userId: string, profile: UserProfile | null, stats: UserStatistics | null, matchmaking: MatchmakingPreferences | null) => {
    try {
      const data: CachedData = {
        profile,
        stats,
        matchmaking,
        timestamp: Date.now(),
        userId
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },
  
  clear: () => {
    sessionStorage.removeItem(CACHE_KEY);
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [matchmakingData, setMatchmakingData] = useState<MatchmakingPreferences | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fungsi fetch data yang bisa dipanggil manual
  const fetchAllUserData = useCallback(async (forceRefresh = false) => {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/auth/sign-up");
        return;
      }

      setCurrentUserId(user.id);

      // Cek cache dulu (kecuali force refresh)
      if (!forceRefresh) {
        const cached = cacheManager.get(user.id);
        if (cached) {
          console.log('✅ Using cached data');
          setUserProfile(cached.profile);
          setUserStats(cached.stats);
          setMatchmakingData(cached.matchmaking);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Fetching fresh data from database');

      // Fetch semua data sekaligus (lebih efisien)
      const [profileResult, statsResult, matchmakingResult] = await Promise.all([
        supabase
          .from("users_profile")
          .select("*")
          .eq("id", user.id)
          .single(),
        
        supabase
          .from("user_statistics")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        
        supabase
          .from("matchmaking_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

      const profile = profileResult.data || null;
      const stats = statsResult.data || null;
      const matchmaking = matchmakingResult.data || null;

      // Set state
      setUserProfile(profile);
      setUserStats(stats);
      setMatchmakingData(matchmaking);

      // Save to cache
      cacheManager.set(user.id, profile, stats, matchmaking);

      if (profileResult.error) console.error("Profile error:", profileResult.error);
      if (statsResult.error) console.error("Stats error:", statsResult.error);
      if (matchmakingResult.error) console.error("Matchmaking error:", matchmakingResult.error);

    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initial load dengan cache
  useEffect(() => {
    fetchAllUserData(false);
  }, [fetchAllUserData]);

  // Real-time subscription untuk updates (opsional)
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users_profile',
          filter: `id=eq.${currentUserId}`
        },
        () => {
          console.log('🔔 Profile updated, refreshing...');
          fetchAllUserData(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchmaking_preferences',
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          console.log('🔔 Matchmaking updated, refreshing...');
          fetchAllUserData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchAllUserData]);

  // Manual refresh handler
  const handleRefresh = () => {
    setLoading(true);
    fetchAllUserData(true);
  };

  const stats = {
    eventsAttended: userStats?.event_attended || 0,
    connectionsMade: userStats?.connections || 0,
    upcomingEvents: userStats?.event_upcoming || 0,
    networkScore: userStats?.networking_score || 0,
    totalPosts: userStats?.total_posts || 0,
  };

  const isProfileComplete = userProfile && matchmakingData?.completed_at;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#15b392] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.full_name || "User"}
                  className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  {userProfile?.full_name?.charAt(0)?.toUpperCase() || userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userProfile?.full_name || userProfile?.username || "Anonymous User"}
              </h1>
              <p className="text-white/90 text-lg mb-1">
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
                  className="text-white/90 hover:text-white text-sm underline mt-2 inline-block"
                >
                  LinkedIn Profile
                </a>
              )}
            </div>

            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium transition-all"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => router.push("/matchmaking")}
                className="flex items-center gap-2 bg-white text-[#15b392] hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
              >
                <Edit size={18} /> Edit Profile
              </button>
            </div>
          </div>

          {!isProfileComplete && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">Your profile looks incomplete.</p>
                <p className="text-sm">Complete your profile so matchmaking and recommendations work better.</p>
              </div>
              <div>
                <button
                  onClick={() => router.push("/matchmaking")}
                  className="bg-[#2a6435] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-95 transition"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-[#15b392]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-[#15b392]" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.eventsAttended}</p>
            <p className="text-sm text-gray-600 mt-1">Events Attended</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.connectionsMade}</p>
            <p className="text-sm text-gray-600 mt-1">Connections</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            <p className="text-sm text-gray-600 mt-1">Upcoming Events</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="text-yellow-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stats.networkScore === 'number' ? stats.networkScore.toFixed(1) : '0.0'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Network Score</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "profile" ? "bg-[#15b392] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("interests")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "interests" ? "bg-[#15b392] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Interests
            </button>
          </div>
        </div>

        {/* Profile Information */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <User className="text-[#15b392]" size={24} />
              Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <User size={16} />
                  Full Name
                </p>
                <p className="text-gray-900 font-medium">{userProfile?.full_name || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <User size={16} />
                  Username
                </p>
                <p className="text-gray-900 font-medium">@{userProfile?.username || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </p>
                <p className="text-gray-900 font-medium">{userProfile?.email || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </p>
                <p className="text-gray-900 font-medium">{userProfile?.phone || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Briefcase size={16} />
                  Company
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.company || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Briefcase size={16} />
                  Position
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.position || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={16} />
                  Years in Role
                </p>
                <p className="text-gray-900 font-medium">
                  {matchmakingData?.position_duration 
                    ? `${matchmakingData.position_duration} years`
                    : "-"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </p>
                <p className="text-gray-900 font-medium">
                  {matchmakingData?.location || userProfile?.location || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Target size={16} />
                  Networking Goal
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.goal || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Users size={16} />
                  Networking Style
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.networking_style || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Heart size={16} />
                  Hobby
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.hobby || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Brain size={16} />
                  Personality Type
                </p>
                <p className="text-gray-900 font-medium">{matchmakingData?.personality || "-"}</p>
              </div>

              {userProfile?.bio && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <User size={16} />
                    Bio
                  </p>
                  <p className="text-gray-900 font-medium">{userProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests Tab */}
        {activeTab === "interests" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <Star className="text-[#15b392]" size={24} />
              Passionate Topics
            </h3>

            <div className="flex flex-wrap gap-3">
              {matchmakingData?.passionate_topics && matchmakingData.passionate_topics.length > 0 ? (
                matchmakingData.passionate_topics.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="px-5 py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 w-full">No topics added yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}