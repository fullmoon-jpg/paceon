// src/app/settings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  CreditCard,
  HelpCircle,
  Camera,
  LogOut,
  Target,
  Briefcase,
  MapPin,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabaseclient";
import { useAuth } from "@/contexts/AuthContext";
import { useDataCache } from "@/contexts/DataContext";

interface Message {
  type: "success" | "error" | "";
  text: string;
}

interface MatchmakingPreferences {
  user_id: string;
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
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { fetchWithCache, invalidateCache } = useDataCache();

  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });

  // User data
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Matchmaking
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [positionDuration, setPositionDuration] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [location, setLocation] = useState("");
  const [locationOther, setLocationOther] = useState("");
  const [goal, setGoal] = useState("");
  const [goalOther, setGoalOther] = useState("");
  const [networkingStyle, setNetworkingStyle] = useState("");
  const [passionateTopics, setPassionateTopics] = useState<string[]>([]);
  const [passionateOther, setPassionateOther] = useState("");
  const [hobby, setHobby] = useState("");
  const [hobbyOther, setHobbyOther] = useState("");
  const [personality, setPersonality] = useState("");

  const loadMatchmakingPreferences = useCallback(
    async (userId: string) => {
      try {
        const data = await fetchWithCache<MatchmakingPreferences | null>(
          `matchmaking-${userId}`,
          async () => {
            const { data, error } = await supabase
              .from("matchmaking_preferences")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            if (error && error.code !== "PGRST116") throw error;
            return data;
          }
        );

        if (data) {
          setCompany(data.company || "");
          setPosition(data.position || "");
          setPositionDuration(data.position_duration?.toString() || "");
          setLinkedIn(data.linkedin_url || "");

          // Handle location
          const predefinedLocations = ["Jakarta", "Bandung", "Surabaya", "Bali"];
          if (data.location && predefinedLocations.includes(data.location)) {
            setLocation(data.location);
            setLocationOther("");
          } else if (data.location) {
            setLocation("Other");
            setLocationOther(data.location);
          }

          // Handle goal
          const predefinedGoals = ["Professional Growth", "Find Co-founder", "Make Friends"];
          if (data.goal && predefinedGoals.includes(data.goal)) {
            setGoal(data.goal);
            setGoalOther("");
          } else if (data.goal) {
            setGoal("Other");
            setGoalOther(data.goal);
          }

          setNetworkingStyle(data.networking_style || "");

          // Handle passionate topics
          if (data.passionate_topics && Array.isArray(data.passionate_topics)) {
            const predefinedTopics = [
              "Tech & Innovation",
              "Business & Startups",
              "Sports & Fitness",
              "Arts & Culture",
              "Social Impact",
            ];
            const selected = data.passionate_topics.filter((t) => predefinedTopics.includes(t));
            const other = data.passionate_topics.find((t) => !predefinedTopics.includes(t));

            setPassionateTopics(selected);
            setPassionateOther(other || "");
          }

          // Handle hobby
          const predefinedHobbies = ["Sports", "Reading", "Gaming", "Travel", "Music"];
          if (data.hobby && predefinedHobbies.includes(data.hobby)) {
            setHobby(data.hobby);
            setHobbyOther("");
          } else if (data.hobby) {
            setHobby("Other");
            setHobbyOther(data.hobby);
          }

          setPersonality(data.personality || "");
        }
      } catch (error) {
        // Silent fail - form stays empty
      }
    },
    [fetchWithCache]
  );

  useEffect(() => {
    if (!authLoading && user && profile) {
      setUserId(user.id);
      setEmail(user.email || "");
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
      setBio(profile.bio || "");

      loadMatchmakingPreferences(user.id);
    }
  }, [authLoading, user, profile, loadMatchmakingPreferences]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSaveBasicInfo = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("users_profile")
        .update({
          username,
          full_name: fullName,
          phone,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      await refreshProfile();
      invalidateCache(`profile-${userId}`);

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMatchmaking = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const matchmakingData: Omit<MatchmakingPreferences, 'user_id'> & { user_id: string; updated_at: string } = {
        user_id: userId,
        company,
        position,
        position_duration: parseInt(positionDuration) || null,
        linkedin_url: linkedIn,
        location: location === "Other" ? locationOther : location,
        goal: goal === "Other" ? goalOther : goal,
        networking_style: networkingStyle,
        passionate_topics: [...passionateTopics, ...(passionateOther ? [passionateOther] : [])].filter(Boolean),
        hobby: hobby === "Other" ? hobbyOther : hobby,
        personality,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("matchmaking_preferences")
        .upsert(matchmakingData, {
          onConflict: "user_id",
        });

      if (error) throw error;

      // Invalidate cache
      invalidateCache(`matchmaking-${userId}`);

      setMessage({
        type: "success",
        text: "Matchmaking preferences saved!",
      });

      // Reload to reflect changes
      await loadMatchmakingPreferences(userId);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save preferences",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (topic: string) => {
    setPassionateTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setLoading(true);
    try {
      await supabase.from("matchmaking_preferences").delete().eq("user_id", userId);
      await supabase.from("users_profile").delete().eq("id", userId);
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to delete account",
      });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      router.push("/auth/login");
    }
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "matchmaking", label: "Matchmaking", icon: Target },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15b392] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;


  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your account information
              </p>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Photo */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Profile Photo
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#15b392] to-[#2a6435] flex items-center justify-center text-white text-2xl font-bold">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (username.substring(0, 2) || fullName.substring(0, 2) || "U").toUpperCase()
                  )}
                </div>
                <div>
                  <button className="px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors text-sm font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG or GIF. Max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392] resize-none"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveBasicInfo}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors font-medium disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="mt-4 px-6 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors font-medium disabled:bg-gray-400"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>

            {/* Logout & Delete */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-red-700 dark:text-red-500 mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:bg-gray-400"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      case "matchmaking":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Matchmaking Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Update your networking preferences
              </p>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Professional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-[#15b392]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Professional Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Where do you work?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Your position"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration in Position
                </label>
                <select
                  value={positionDuration}
                  onChange={(e) => setPositionDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                >
                  <option value="">Select duration</option>
                  <option value="1">Less than 1 year</option>
                  <option value="2">1-2 years</option>
                  <option value="3">2-3 years</option>
                  <option value="4">3-5 years</option>
                  <option value="5">More than 5 years</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#15b392]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Location
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Jakarta", "Bandung", "Surabaya", "Bali", "Other"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`px-4 py-3 text-left rounded-lg border transition ${
                      location === loc
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {location === "Other" && (
                <input
                  type="text"
                  value={locationOther}
                  onChange={(e) => setLocationOther(e.target.value)}
                  placeholder="Please specify your location"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              )}
            </div>

            {/* Goal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#15b392]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Networking Goal
                </h3>
              </div>

              <div className="space-y-3">
                {["Professional Growth", "Find Co-founder", "Make Friends", "Other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                      goal === g
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {goal === "Other" && (
                <input
                  type="text"
                  value={goalOther}
                  onChange={(e) => setGoalOther(e.target.value)}
                  placeholder="Please specify your goal"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              )}
            </div>

            {/* Networking Style */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Networking Style
              </h3>

              <div className="space-y-3">
                {["Small Groups", "One-on-One", "Large Events", "Online First"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setNetworkingStyle(style)}
                    className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                      networkingStyle === style
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Passionate Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#15b392]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Passionate Topics (Select multiple)
                </h3>
              </div>

              <div className="space-y-3">
                {["Tech & Innovation", "Business & Startups", "Sports & Fitness", "Arts & Culture", "Social Impact"].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleMultiSelect(topic)}
                    className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                      passionateTopics.includes(topic)
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={passionateOther}
                onChange={(e) => setPassionateOther(e.target.value)}
                placeholder="Other topics (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
              />
            </div>

            {/* Hobby */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Favorite Hobby
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Sports", "Reading", "Gaming", "Travel", "Music", "Other"].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHobby(h)}
                    className={`px-4 py-3 text-left rounded-lg border transition ${
                      hobby === h
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>

              {hobby === "Other" && (
                <input
                  type="text"
                  value={hobbyOther}
                  onChange={(e) => setHobbyOther(e.target.value)}
                  placeholder="Please specify your hobby"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#15b392]"
                />
              )}
            </div>

            {/* Personality */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Personality
              </h3>

              <div className="space-y-3">
                {[
                  "I usually wait for others to start the conversation. I warm up once I feel comfortable.",
                  "I can be chatty or quiet depending on the vibe. I adjust to the people around me.",
                  "I'm usually the one to break the ice and keep the energy up in the group."
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersonality(p)}
                    className={`w-full px-4 py-3 text-left rounded-lg border transition text-sm ${
                      personality === p
                        ? "bg-[#15b392] text-white border-[#15b392]"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#15b392]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveMatchmaking}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors font-medium disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Matchmaking Preferences"}
            </button>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
          </div>
        );
    }
  };

   return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full px-6 py-4 flex items-center space-x-3 transition-colors ${
                      activeSection === section.id
                        ? "bg-[#15b392] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="col-span-12 md:col-span-9">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;