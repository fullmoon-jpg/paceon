"use client";
import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Activity,
  Bell,
  User,
  Settings,
  LogOut,
  Box,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useRealtimeNotifications";

const SideNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { unreadCount, isConnected } = useNotifications(user?.id || null);

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const menuItems = useMemo(
    () => [
      { id: "dashboard", icon: Home, label: "Dashboard", path: "/" },
      { id: "booking", icon: Calendar, label: "Booking", path: "/booking" },
      { id: "activity", icon: Activity, label: "Activity Feed", path: "/activityfeed" },
      {
        id: "notifications",
        icon: Bell,
        label: "Notifications",
        badge: unreadCount,
        path: "/notifications",
      },
      { id: "profile", icon: User, label: "Profile", path: "/profilepage" },
      { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
    ],
    [unreadCount]
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (authLoading) {
    return (
      <div className="fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-[#15b392] via-[#2a6435] to-[#15b392] shadow-2xl flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#15b392] via-[#2a6435] to-[#15b392] shadow-2xl flex flex-col z-50 transition-all duration-300 ${
        isExpanded ? "w-72" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-white/20 flex items-center justify-center">
        {isExpanded ? (
          <div
            className="text-2xl font-bold font-brand tracking-tight text-white cursor-pointer"
            onClick={() => router.push("/")}
          >
            PACE.ON
          </div>
        ) : (
          <img
            src="/images/logo-paceon.png"
            alt="PACE.ON Logo"
            className="w-10 h-10 object-contain cursor-pointer"
            onClick={() => router.push("/")}
          />
        )}
      </div>

      {/* Profile Section */}
      <div
        className={`px-6 py-6 border-b border-white/20 ${
          isExpanded ? "" : "flex justify-center"
        }`}
      >
        <div className={`flex items-center ${isExpanded ? "space-x-4" : ""}`}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0 relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold text-lg">
                {profile?.full_name
                  ? getInitials(profile.full_name)
                  : profile?.email?.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            {/* Realtime Connection Indicator */}
            {isConnected && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                title="Connected to real-time notifications"
              ></div>
            )}
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {profile?.full_name || "Loading..."}
              </p>
              <p className="text-white/70 text-xs truncate">
                {profile?.email || ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  aria-label={item.label}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#15b392] shadow-lg"
                      : "text-white hover:bg-white/10"
                  } ${isExpanded ? "" : "justify-center"}`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {!isExpanded &&
                      item.badge !== undefined &&
                      item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                  </div>
                  {isExpanded && (
                    <>
                      <span className="font-medium ml-3">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Affirmation Cube */}
      <div
        className={`px-4 py-4 border-t border-white/20 ${
          isExpanded ? "px-6" : "flex justify-center"
        }`}
      >
        <Link
          href="/affirmation-cube"
          aria-label="Affirmation Cube"
          className={`flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 ${
            isExpanded ? "w-full px-4 py-3" : "w-12 h-12"
          }`}
        >
          <Box className={`${isExpanded ? "w-5 h-5" : "w-6 h-6"}`} />
          {isExpanded && <span className="ml-2">Affirmation Cube</span>}
        </Link>
      </div>

      {/* Logout */}
      <div
        className={`px-4 py-4 border-t border-white/20 ${
          isExpanded ? "px-6" : "flex justify-center"
        }`}
      >
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className={`flex items-center justify-center bg-red-500/20 rounded-xl text-white font-medium hover:bg-red-500/30 transition-all duration-200 ${
            isExpanded ? "w-full px-4 py-3" : "w-12 h-12"
          }`}
        >
          <LogOut className={`${isExpanded ? "w-5 h-5" : "w-6 h-6"}`} />
          {isExpanded && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SideNavbar;
