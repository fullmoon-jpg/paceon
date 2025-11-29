// src/app/activity-feed/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@paceon/lib/supabaseclient";
import ActivityFeed from "../components";
import { Loader2 } from "lucide-react";

type TabType = "all" | "yours" | "saved";

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  position?: string;
  company?: string;
}

export default function ActivityFeedPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          setLoading(false);
          return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
        });

        const { data: profileData } = await supabase
          .from("users_profile")
          .select("id, full_name, avatar_url, role")
          .eq("id", session.user.id)
          .maybeSingle();

        const { data: preferencesData } = await supabase
          .from("matchmaking_preferences")
          .select("position, company")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            role: profileData.role,
            position: preferencesData?.position,
            company: preferencesData?.company,
          });
        } else {
          const userName =
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User";

          setProfile({
            id: session.user.id,
            full_name: userName,
            avatar_url: session.user.user_metadata?.avatar_url,
            role: "user",
            position: preferencesData?.position,
            company: preferencesData?.company,
          });
        }
      } catch (error) {
        console.error("Error in getUser:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
        });

        const { data: profileData } = await supabase
          .from("users_profile")
          .select("id, full_name, avatar_url, role")
          .eq("id", session.user.id)
          .maybeSingle();

        const { data: preferencesData } = await supabase
          .from("matchmaking_preferences")
          .select("position, company")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            ...profileData,
            position: preferencesData?.position,
            company: preferencesData?.company,
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simple centered loader untuk user loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FB6F7A]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200 dark:border-[#3d4459]">
          <h2 className="text-2xl font-bold text-[#3F3E3D] dark:text-white mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view the activity feed.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-white dark:bg-[#242837]">
      {/* Header */}
      <div className="bg-transparent">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl text-[#3F3E3D] dark:text-white font-bold mb-2">
            Activity Feed
          </h1>
          <p className="text-gray-700 dark:text-gray-400">
            Share your sports moments with the community
          </p>
          {isAdmin && (
            <span className="inline-block mt-2 px-3 py-1 bg-[#21C36E]/10 border border-[#21C36E]/30 text-[#21C36E] text-xs font-bold rounded-full">
              ADMIN
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Sticky Tabs */}
        <div className="sticky top-0 z-20 bg-white dark:bg-[#242837] pb-4 -mx-4 px-4">
          <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-[#3d4459]">
            <div className="flex border-b border-gray-200 dark:border-[#3d4459]">
              {(["all", "yours", "saved"] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                      isActive
                        ? "text-[#FB6F7A] bg-[#F4F4EF] dark:bg-[#242837]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459]"
                    }`}
                  >
                    {tab === "all"
                      ? "All Posts"
                      : tab === "yours"
                      ? "Your Posts"
                      : "Saved Posts"}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FB6F7A]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity Feed dengan skeleton loading internal */}
        <div className="pb-6">
          <ActivityFeed
            currentUserId={user.id}
            currentUserName={
              profile?.full_name || user.email?.split("@")[0] || "User"
            }
            avatar_url={profile?.avatar_url}
            currentUserPosition={profile?.position}
            currentUserCompany={profile?.company}
            currentUserRole={profile?.role || "user"}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
}
