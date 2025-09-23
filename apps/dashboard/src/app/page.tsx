"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../../packages/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import DashboardNavbar from "./ui/NavDashboard";
import { 
  Calendar, 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  TrendingUp,
  MapPin,
  Clock,
  Star,
  MessageCircle
} from "lucide-react";

const MainDashboardContent = () => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Card - Main */}
      <div className="bg-gradient-to-br from-[#15b392] via-[#2a6435] to-[#15b392] rounded-2xl shadow-xl p-8 text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Dashboard Coming Soon</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Kami sedang membangun dashboard yang amazing untuk pengalaman networking Anda yang lebih baik.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Segera Hadir</span>
        </div>
      </div>

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Event Management</h3>
              <p className="text-sm text-gray-500">Kelola jadwal event Anda</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Network Stats</h3>
              <p className="text-sm text-gray-500">Statistik networking Anda</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
              <p className="text-sm text-gray-500">Analisis performa networking</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/5"></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">Pesan dari komunitas</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-4/5 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800">Development Progress</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
        </div>
        <p className="text-sm text-blue-700">Dashboard sedang dalam tahap pengembangan 75%</p>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h3 className="font-semibold text-gray-900">User Profile</h3>
          <p className="text-sm text-gray-500">Coming Soon</p>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Quick Stats
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Events Attended</span>
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Connections Made</span>
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network Score</span>
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          Upcoming Events
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No upcoming events</p>
          <p className="text-xs text-gray-400 mt-1">Stay tuned for new events!</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          Notifications
        </h3>
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">All caught up!</p>
          <p className="text-xs text-gray-400 mt-1">No new notifications</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-[#15b392]/10 to-[#2a6435]/10 rounded-xl border-2 border-dashed border-[#2a6435]/30 p-4 text-center">
        <Clock className="w-6 h-6 text-[#2a6435] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#2a6435]">More features coming soon!</p>
        <p className="text-xs text-gray-600 mt-1">Stay tuned for updates</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/sign-up");
      } else {
        const snap = await getDoc(doc(db, "users", user.uid));
        const userData = snap.exists() ? snap.data() : {};
        const role = userData.role || "user";
        const name =
          userData.name ||
          userData.displayName ||
          user.displayName ||
          "User";

        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          setUserName(name);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2a6435] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="shrink-0">
        <DashboardNavbar />
      </header>

      {/* Welcome Header */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Hi {userName}, Welcome to Your Dashboard!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Here&apos;s your personalized overview and latest updates
          </p>
        </div>
      </div>

      {/* Konten utama dengan tinggi penuh sisa layar */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Kiri: Main Content */}
        <div className="lg:col-span-2 overflow-y-auto p-4 sm:p-6 bg-white">
          <MainDashboardContent />
        </div>

        {/* Kanan: Sidebar */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50 border-l border-gray-200">
          <Sidebar />
        </div>
      </main>
    </div>
  );
}