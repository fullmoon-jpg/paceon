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
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useRealtimeNotifications";
import Image from "next/image";

const ResponsiveNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, session, profile, loading: authLoading, signOut } = useAuth();
  const { unreadCount, isConnected } = useNotifications(user?.id || null);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, router]);

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

  const getInitials = useCallback((name: string) => {
    if (!name) return '?';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handleMouseEnter = useCallback(() => setIsExpanded(true), []);
  const handleMouseLeave = useCallback(() => setIsExpanded(false), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  if (authLoading) {
    return (
      <>
        {/* Desktop skeleton sidebar */}
        <div className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-white dark:bg-[#242837] shadow-2xl flex-col items-center justify-between z-50 border-r border-gray-200 dark:border-[#3d4459]">
          {/* Logo skeleton */}
          <div className="w-10 h-10 bg-gray-200 dark:bg-[#3d4459] rounded-2xl mt-6 animate-pulse" />
          {/* Menu icons skeleton */}
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`nav-skel-${i}`}
                className="w-9 h-9 bg-gray-200 dark:bg-[#3d4459] rounded-xl animate-pulse"
              />
            ))}
          </div>
          {/* Bottom buttons skeleton */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-[#F0C946]/40 rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-[#FB6F7A]/30 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Mobile top bar skeleton */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#242837] border-b border-gray-200 dark:border-[#3d4459] px-4 py-3 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-[#3d4459] rounded-xl animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
            </div>
            <div className="w-9 h-9 bg-gray-200 dark:bg-[#3d4459] rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Mobile bottom nav skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#242837] border-t border-gray-200 dark:border-[#3d4459] px-2 py-2 z-50">
          <div className="flex items-center justify-around">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`bottom-skel-${i}`}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-6 h-6 bg-gray-200 dark:bg-[#3d4459] rounded-lg animate-pulse" />
                <div className="w-10 h-3 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for mobile content */}
        <div className="md:hidden h-[57px]" />
        <div className="md:hidden h-[56px]" />
      </>
    );
  }

  return (
    <>
      {/* ===== DESKTOP SIDE NAVBAR ===== */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-white dark:bg-[#242837] shadow-2xl flex-col z-50 transition-all duration-300 border-r border-gray-200 dark:border-[#3d4459] ${
          isExpanded ? "w-72" : "w-20"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-[#3d4459] flex items-center justify-center">
          {isExpanded ? (
            <div
              className="text-3xl font-brand tracking-tight text-[#FB6F7A] cursor-pointer select-none"
              style={{ transform: 'rotate(-3deg)' }}
              onClick={() => router.push("/")}
            >
              PACE ON
            </div>
          ) : (
            <div className="relative w-10 h-10 cursor-pointer" onClick={() => router.push("/")}>
              <Image
                src="/images/dark-logo.png"
                alt="PACE.ON Logo"
                width={40}
                height={40}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/light-logo.png"
                alt="PACE.ON Logo"
                width={40}
                height={40}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div
          className={`px-6 py-6 border-b border-gray-200 dark:border-[#3d4459] ${
            isExpanded ? "" : "flex justify-center"
          }`}
        >
          <div className={`flex items-center ${isExpanded ? "space-x-4" : ""}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FB6F7A]/30 flex-shrink-0 relative">
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
                <div className="w-full h-full bg-[#FB6F7A] flex items-center justify-center text-white font-semibold text-lg">
                  {profile?.full_name
                    ? getInitials(profile.full_name)
                    : profile?.email?.charAt(0).toUpperCase() || "?"}
                </div>
              )}

              {isConnected && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-[#21C36E] border-2 border-white dark:border-[#242837] rounded-full"
                  title="Connected to real-time notifications"
                />
              )}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-[#3F3E3D] dark:text-white font-semibold text-sm truncate">
                  {profile?.full_name || "Loading..."}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                  {profile?.email || ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
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
                        ? "bg-[#FB6F7A] text-white shadow-lg"
                        : "text-[#3F3E3D] dark:text-white hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548]"
                    } ${isExpanded ? "" : "justify-center"}`}
                  >
                    <div className="relative">
                      <item.icon className="w-5 h-5" />
                      {!isExpanded &&
                        item.badge !== undefined &&
                        item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#FB6F7A] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                    </div>
                    {isExpanded && (
                      <>
                        <span className="font-medium ml-3">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-auto bg-[#FB6F7A] text-white text-xs px-2 py-1 rounded-full animate-pulse">
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
                    ? "bg-[#FB6F7A] text-white shadow-lg"
                    : "text-[#3F3E3D] dark:text-white hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548]"
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
          className={`px-4 py-4 border-t border-gray-200 dark:border-[#3d4459] ${
            isExpanded ? "px-6" : "flex justify-center"
          }`}
        >
          <Link
            href="/affirmation-cube"
            aria-label="Affirmation Cube"
            prefetch={false}
            className={`flex items-center justify-center bg-[#F0C946] rounded-xl text-[#3F3E3D] font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 ${
              isExpanded ? "w-full px-4 py-3" : "w-12 h-12"
            }`}
          >
            <Box className={`${isExpanded ? "w-5 h-5" : "w-6 h-6"}`} />
            {isExpanded && <span className="ml-2">Affirmation Cube</span>}
          </Link>
        </div>

        {/* Logout */}
        <div
          className={`px-4 py-4 border-t border-gray-200 dark:border-[#3d4459] ${
            isExpanded ? "px-6" : "flex justify-center"
          }`}
        >
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={`flex items-center justify-center bg-[#FB6F7A]/20 dark:bg-[#FB6F7A]/30 rounded-xl text-[#FB6F7A] dark:text-white font-medium hover:bg-[#FB6F7A]/30 dark:hover:bg-[#FB6F7A]/40 transition-all duration-200 ${
              isExpanded ? "w-full px-4 py-3" : "w-12 h-12"
            }`}
          >
            <LogOut className={`${isExpanded ? "w-5 h-5" : "w-6 h-6"}`} />
            {isExpanded && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#242837] text-[#3F3E3D] dark:text-white z-50 shadow-lg border-b border-gray-200 dark:border-[#3d4459]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/images/dark-logo.png"
                alt="PACE.ON"
                width={32}
                height={32}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/light-logo.png"
                alt="PACE.ON"
                width={32}
                height={32}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
            <span className="font-brand text-lg text-[#FB6F7A]">PACE ON</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={closeMobileMenu}>
          <div 
            className="fixed top-[57px] right-0 w-64 h-[calc(100vh-57px)] bg-white dark:bg-[#242837] shadow-2xl overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Section */}
            <div className="p-4 border-b border-gray-200 dark:border-[#3d4459] bg-[#F4F4EF] dark:bg-[#2d3548]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FB6F7A]">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FB6F7A] flex items-center justify-center text-white font-semibold">
                      {profile?.full_name
                        ? getInitials(profile.full_name)
                        : profile?.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#3F3E3D] dark:text-white font-semibold text-sm truncate">
                    {profile?.full_name || "Loading..."}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
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
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#3F3E3D] dark:text-white hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/affirmation-cube"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F0C946] text-[#3F3E3D] hover:shadow-lg transition-all"
                  >
                    <Box className="w-5 h-5" />
                    <span className="font-medium">Affirmation Cube</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FB6F7A]/10 text-[#FB6F7A] hover:bg-[#FB6F7A]/20 transition-colors"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#242837] border-t border-gray-200 dark:border-[#3d4459] px-2 py-2 z-50 safe-area-bottom">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                aria-label={item.label}
                prefetch={true}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-[#FB6F7A]"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FB6F7A] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#FB6F7A]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== SPACER FOR MOBILE ===== */}
      <div className="md:hidden h-[57px]" />
      <div className="md:hidden h-[72px]" />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default React.memo(ResponsiveNavbar);