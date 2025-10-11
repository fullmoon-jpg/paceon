"use client"
import React, { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Smartphone,
  Shield,
  CreditCard,
  Mail,
  Eye,
  EyeOff,
  ChevronRight,
  Trash2,
  LogOut,
  HelpCircle,
  Camera
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../packages/lib/supabase";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // User data from Supabase
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification Settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [socialNotif, setSocialNotif] = useState(true);
  const [bookingNotif, setBookingNotif] = useState(true);
  const [matchNotif, setMatchNotif] = useState(true);
  
  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showActivity, setShowActivity] = useState(true);
  const [showStats, setShowStats] = useState(true);
  
  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");
      setUsername(user.user_metadata?.username || "");
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      // Load preferences from profiles table jika ada
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfileVisibility(profile.profile_visibility || "public");
        setShowActivity(profile.show_activity ?? true);
        setShowStats(profile.show_stats ?? true);
        setEmailNotif(profile.email_notif ?? true);
        setPushNotif(profile.push_notif ?? true);
        setSocialNotif(profile.social_notif ?? true);
        setBookingNotif(profile.booking_notif ?? true);
        setMatchNotif(profile.match_notif ?? true);
        setDarkMode(profile.dark_mode ?? false);
        setLanguage(profile.language || "en");
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);
      setMessage({ type: "error", text: "Failed to load user data" });
    }
  };

  const handleSaveBasicInfo = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username,
          full_name: fullName,
          phone
        }
      });

      if (updateError) throw updateError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
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
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: error.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          profile_visibility: profileVisibility,
          show_activity: showActivity,
          show_stats: showStats,
          email_notif: emailNotif,
          push_notif: pushNotif,
          social_notif: socialNotif,
          booking_notif: bookingNotif,
          match_notif: matchNotif,
          dark_mode: darkMode,
          language: language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: "success", text: "Preferences saved successfully!" });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // Delete from profiles table
      await supabase.from('profiles').delete().eq('id', userId);

      // Sign out (Supabase doesn't allow self-delete via client SDK)
      await supabase.auth.signOut();
      
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setMessage({ type: "error", text: "Failed to delete account" });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
    }
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
              <p className="text-gray-600 text-sm">Manage your account information and preferences</p>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Photo */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#15b392] to-[#2a6435] flex items-center justify-center text-white text-2xl font-bold">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    username.substring(0, 2).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <button className="px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors text-sm font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
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
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
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
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
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

      case "notifications":
      case "privacy":
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeSection === "notifications" && "Notification Preferences"}
                {activeSection === "privacy" && "Privacy & Security"}
                {activeSection === "appearance" && "Appearance"}
              </h2>
              <p className="text-gray-600 text-sm">
                {activeSection === "notifications" && "Choose how you want to be notified"}
                {activeSection === "privacy" && "Manage your privacy and security settings"}
                {activeSection === "appearance" && "Customize how PACE.ON looks for you"}
              </p>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            {/* Settings content based on section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
              {activeSection === "notifications" && (
                <>
                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={emailNotif}
                    onChange={setEmailNotif}
                  />
                  <ToggleSetting
                    label="Push Notifications"
                    description="Receive push notifications"
                    checked={pushNotif}
                    onChange={setPushNotif}
                  />
                  <ToggleSetting
                    label="Social Activity"
                    description="Likes, comments, and follows"
                    checked={socialNotif}
                    onChange={setSocialNotif}
                  />
                  <ToggleSetting
                    label="Booking Reminders"
                    description="Court booking confirmations"
                    checked={bookingNotif}
                    onChange={setBookingNotif}
                  />
                  <ToggleSetting
                    label="Match Updates"
                    description="Match requests and invitations"
                    checked={matchNotif}
                    onChange={setMatchNotif}
                  />
                </>
              )}

              {activeSection === "privacy" && (
                <>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value="public"
                        checked={profileVisibility === "public"}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-4 h-4 text-[#15b392]"
                      />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-sm text-gray-500">Anyone can see your profile</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value="friends"
                        checked={profileVisibility === "friends"}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-4 h-4 text-[#15b392]"
                      />
                      <div>
                        <p className="font-medium">Friends Only</p>
                        <p className="text-sm text-gray-500">Only friends can see</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value="private"
                        checked={profileVisibility === "private"}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-4 h-4 text-[#15b392]"
                      />
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-sm text-gray-500">Only you can see</p>
                      </div>
                    </label>
                  </div>
                  <ToggleSetting
                    label="Show Activity Status"
                    description="Let others see when you're active"
                    checked={showActivity}
                    onChange={setShowActivity}
                  />
                  <ToggleSetting
                    label="Show Game Statistics"
                    description="Display your stats on profile"
                    checked={showStats}
                    onChange={setShowStats}
                  />
                </>
              )}

              {activeSection === "appearance" && (
                <>
                  <ToggleSetting
                    label="Dark Mode"
                    description="Use dark theme across the app"
                    checked={darkMode}
                    onChange={setDarkMode}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
                    >
                      <option value="en">English</option>
                      <option value="id">Bahasa Indonesia</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={handleSavePreferences}
              disabled={loading}
              className="px-6 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#129176] transition-colors font-medium disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        );

      default:
        return <div>Section coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full px-6 py-4 flex items-center space-x-3 transition-colors ${
                      activeSection === section.id
                        ? "bg-[#15b392] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 md:col-span-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleSetting: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-t border-gray-100 first:border-t-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#15b392]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15b392]"></div>
    </label>
  </div>
);

export default SettingsPage;