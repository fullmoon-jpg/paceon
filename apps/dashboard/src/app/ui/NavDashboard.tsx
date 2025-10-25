"use client";
import React, { useEffect, useMemo, useCallback } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useRealtimeNotifications";

const ResponsiveNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { unreadCount, isConnected } = useNotifications(user?.id || null);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // ✅ Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // ✅ Add timeout for loading state
  useEffect(() => {
    if (!authLoading) return;

    const timeout = setTimeout(() => {
      console.error('⚠️ Auth loading timeout - redirecting to login');
      router.push('/auth/login');
    }, 30000);

    return () => clearTimeout(timeout);
  }, [authLoading, router]);

  // ✅ Memoize logout handler
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, router]);

  // ✅ Memoize menu items
  const menuItems = useMemo(
    () => [
      { id: "dashboard", icon: Home, label: "Dashboard", path: "/" },
      { id: "booking", icon: Calendar, label: "Booking", path: "/booking" },
      { id: "activity", icon: Activity, label: "Activity", path: "/activityfeed" },
      {
        id: "notifications",
        icon: Bell,
        label: "Notifications",
        badge: unreadCount,
        path: "/notifications",
      },
      { id: "profile", icon: User, label: "Profile", path: "/profilepage" },
    ],
    [unreadCount]
  );

  // ✅ Memoize getInitials
  const getInitials = useCallback((name: string) => {
    if (!name) return '?';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // ✅ Memoize expand handlers
  const handleMouseEnter = useCallback(() => setIsExpanded(true), []);
  const handleMouseLeave = useCallback(() => setIsExpanded(false), []);

  // ✅ Loading state
  if (authLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-[#15b392] via-[#2a6435] to-[#15b392] shadow-2xl flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <p className="text-white text-xs">Loading...</p>
        </div>
        {/* Mobile Loading */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#15b392]"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ===== DESKTOP SIDE NAVBAR ===== */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-[#15b392] via-[#2a6435] to-[#15b392] shadow-2xl flex-col z-50 transition-all duration-300 ${
          isExpanded ? "w-72" : "w-20"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
              loading="eager"
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
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold text-lg">
                  {profile?.full_name
                    ? getInitials(profile.full_name)
                    : profile?.email?.charAt(0).toUpperCase() || "?"}
                </div>
              )}

              {isConnected && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                  title="Connected to real-time notifications"
                />
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
                    prefetch={true}
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
            <li>
              <Link
                href="/settings"
                aria-label="Settings"
                prefetch={true}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === "/settings"
                    ? "bg-white text-[#15b392] shadow-lg"
                    : "text-white hover:bg-white/10"
                } ${isExpanded ? "" : "justify-center"}`}
              >
                <Settings className="w-5 h-5" />
                {isExpanded && <span className="font-medium ml-3">Settings</span>}
              </Link>
            </li>
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
            prefetch={false}
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

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-paceon.png"
              alt="PACE.ON"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-lg">PACE.ON</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed top-[56px] right-0 w-64 h-[calc(100vh-56px)] bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Section */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#15b392] to-[#2a6435]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold">
                      {profile?.full_name
                        ? getInitials(profile.full_name)
                        : profile?.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {profile?.full_name || "Loading..."}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {profile?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Settings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/affirmation-cube"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
                  >
                    <Box className="w-5 h-5" />
                    <span className="font-medium">Affirmation Cube</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 safe-area-bottom">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-[#15b392]"
                    : "text-gray-600"
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#15b392]' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== SPACER FOR MOBILE ===== */}
      <div className="md:hidden h-[56px]" /> {/* Top spacer */}
      <div className="md:hidden h-[72px]" /> {/* Bottom spacer */}
    </>
  );
};

export default React.memo(ResponsiveNavbar);