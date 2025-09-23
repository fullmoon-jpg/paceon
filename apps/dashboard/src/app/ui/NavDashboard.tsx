"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, User, LogOut, Bell } from "lucide-react";
import { auth } from "../../../../../packages/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const DashboardNavbar: React.FC = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // dummy notifikasi sementara
  const [notifications, setNotifications] = useState([
    { id: 1, message: "You joined a new game", time: "2h ago" },
    { id: 2, message: "Your match with Jane is confirmed", time: "1d ago" },
    { id: 3, message: "Court booking tomorrow at 9 AM", time: "3d ago" },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => setShowDropdown(!showDropdown);
  const handleProfileSettings = () => {
    router.push("/profile");
    setShowDropdown(false);
  };
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
    setShowDropdown(false);
  };
  const handleLogoClick = () => router.push("/dashboard");

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        {/* Logo */}
        <div
          onClick={handleLogoClick}
          className="logo-underline relative text-xl md:text-2xl lg:text-2xl font-bold font-brand tracking-tight cursor-pointer"
        >
          PACE.ON
        </div>

        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative text-white hover:text-gray-200 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {/* Badge */}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-800">
                  Notifications
                </div>
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="px-4 py-3 hover:bg-gray-50 text-sm">
                      <p className="text-gray-700">{notif.message}</p>
                      <span className="text-xs text-gray-400">{notif.time}</span>
                    </li>
                  ))}
                </ul>
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Profile Photo */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user?.email
                      ? user.email.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="hidden md:block text-left">
                <p className="text-white font-semibold text-sm leading-tight">
                  {user?.displayName || "Anonymous User"}
                </p>
                <p className="text-white/70 text-xs leading-tight">
                  {user?.email || ""}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-gray-900 font-semibold text-sm">
                    {user?.displayName || "Anonymous User"}
                  </p>
                  <p className="text-gray-600 text-xs">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleProfileSettings}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNavbar;
