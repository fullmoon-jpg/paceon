"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../packages/lib/supabase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
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
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { Analytics } from "@vercel/analytics/next";

const MainDashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const formattedDate = format(today, "EEEE, dd MMMM yyyy");
  
  const events = [
    {
      id: 1,
      sport: "tennis",
      title: "Tennis Tournament - Mixed Doubles",
      date: new Date(2025, 9, 5),
      time: "08:00 - 12:00",
      location: "Senayan Tennis Court",
      participants: 4,
      maxParticipants: 6,
      level: "Intermediate",
      price: "$15",
      host: "John Doe",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
    },
    {
      id: 2,
      sport: "padel",
      title: "Padel Social Play",
      date: new Date(2025, 9, 8),
      time: "17:00 - 19:00",
      location: "Padel Club Jakarta",
      participants: 3,
      maxParticipants: 6,
      level: "All Levels",
      price: "$12",
      host: "Jane Smith",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8"
    },
    {
      id: 3,
      sport: "badminton",
      title: "Badminton League - Week 4",
      date: new Date(2025, 9, 12),
      time: "14:00 - 17:00",
      location: "GBK Badminton Hall",
      participants: 5,
      maxParticipants: 6,
      level: "Advanced",
      price: "$10",
      host: "Mike Johnson",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea"
    },
    {
      id: 4,
      sport: "tennis",
      title: "Friday Night Tennis",
      date: new Date(2025, 9, 11),
      time: "18:00 - 21:00",
      location: "BSD Tennis Arena",
      participants: 4,
      maxParticipants: 6,
      level: "All Levels",
      price: "$8",
      host: "Sarah Wilson",
      image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
    },
    {
      id: 5,
      sport: "padel",
      title: "Padel Championship 2025",
      date: new Date(2025, 9, 15),
      time: "09:00 - 18:00",
      location: "SCBD Padel Court",
      participants: 6,
      maxParticipants: 6,
      level: "Pro",
      price: "$25",
      host: "David Lee",
      image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1"
    },
    {
      id: 6,
      sport: "badminton",
      title: "Weekend Badminton Fun",
      date: new Date(2025, 9, 6),
      time: "10:00 - 13:00",
      location: "Kemang Sports Center",
      participants: 2,
      maxParticipants: 6,
      level: "Beginner",
      price: "$5",
      host: "Emma Brown",
      image: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135"
    }
  ];

  const sportColors: Record<string, { bg: string; text: string; badge: string }> = {
    tennis: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-500" },
    padel: { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-500" },
    badminton: { bg: "bg-orange-100", text: "text-orange-700", badge: "bg-orange-500" }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasEvents = (date: Date) => {
    return events.some(event => isSameDay(event.date, date));
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return events;
    return events.filter(event => isSameDay(event.date, date));
  };

  const filteredEvents = getEventsForDate(selectedDate).filter(
    (event) =>
      (selectedSport === "all" || event.sport === selectedSport) &&
      (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex items-center gap-4">
        <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
          <Calendar className="text-white" size={28} />
        </div>
        <div>
          <p className="text-blue-600 font-medium">Today</p>
          <p className="text-2xl font-bold text-gray-800">{formattedDate}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Event Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {daysInMonth.map((date) => {
            const dateHasEvents = hasEvents(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`
                  p-2 h-12 text-sm rounded-lg transition-all duration-200 relative overflow-hidden
                  ${isSelected 
                    ? "bg-blue-500 text-white shadow-md font-bold" 
                    : isToday(date)
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                {format(date, "d")}
                {dateHasEvents && (
                  <>
                    <div className={`
                      absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px]
                      ${isSelected 
                        ? "border-t-yellow-300 border-r-yellow-300" 
                        : "border-t-green-500 border-r-green-500"
                      }
                    `} />
                    <div className={`
                      absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                      ${isSelected ? "bg-yellow-300" : "bg-green-500"}
                    `} />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedDate ? `Events for ${format(selectedDate, "MMMM dd, yyyy")}` : "All Upcoming Events"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{filteredEvents.length} events available</span>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by event title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSport("all")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedSport === "all"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Sports
          </button>
          <button
            onClick={() => setSelectedSport("tennis")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedSport === "tennis"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Tennis
          </button>
          <button
            onClick={() => setSelectedSport("padel")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedSport === "padel"
                ? "bg-green-600 text-white shadow-md"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            Padel
          </button>
          <button
            onClick={() => setSelectedSport("badminton")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedSport === "badminton"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
          >
            Badminton
          </button>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const colors = sportColors[event.sport];
              const isFull = event.participants >= event.maxParticipants;
              
              return (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full">
                      <span className="text-blue-600 font-bold text-sm">
                        {event.price}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className={`${colors.badge} text-white px-2 py-1 rounded-md text-xs font-semibold uppercase`}>
                        {event.sport}
                      </span>
                      <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                        {event.level}
                      </span>
                    </div>
                    {isFull && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FULL
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-3">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{format(event.date, "MMM dd")} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span className="font-medium">{event.participants}/{event.maxParticipants} players</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                          <div 
                            className={`${isFull ? 'bg-red-500' : colors.badge} h-2 rounded-full transition-all`}
                            style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">by {event.host}</span>
                      <button 
                        disabled={isFull}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                          isFull 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        }`}
                      >
                        {isFull ? 'Event Full' : 'Join Event'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No events found</h3>
            <p className="text-gray-400">Try selecting a different date or adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ userName, isNewUser = true }: { userName: string; isNewUser?: boolean }) => {
  const [activeTab, setActiveTab] = useState("stats");
  
  const stats = {
    eventsAttended: 12,
    connectionsMode: 45,
    upcomingEvents: 3,
    networkScore: 87
  };

  const recentActivities = [
    { id: 1, action: "Joined Tennis Tournament", time: "2 hours ago", icon: "🎾" },
    { id: 2, action: "Connected with 3 players", time: "5 hours ago", icon: "👥" },
    { id: 3, action: "RSVP'd to Padel Social", time: "1 day ago", icon: "🏓" },
    { id: 4, action: "Completed profile", time: "2 days ago", icon: "✅" }
  ];

  const notifications = [
    { id: 1, text: "New event: Friday Night Tennis", time: "1h ago", unread: true },
    { id: 2, text: "Match reminder tomorrow at 09:00", time: "3h ago", unread: true },
    { id: 3, text: "John accepted your connection", time: "5h ago", unread: false }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-xl shadow-lg p-6 text-white">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/30 relative">
            <span className="text-white font-bold text-2xl">{userName?.charAt(0).toUpperCase() || 'U'}</span>
            {isNewUser && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-lg">
                NEW
              </div>
            )}
          </div>
          <h3 className="font-bold text-xl text-white mb-1">{userName || 'User'}</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-white/80 text-sm">Active Member</p>
            {isNewUser && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                New User
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.eventsAttended}</p>
            <p className="text-xs text-white/70">Events</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.connectionsMode}</p>
            <p className="text-xs text-white/70">Connections</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "stats"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "activity"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all relative ${
              activeTab === "notifications"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Alerts
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "stats" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#15b392]" />
            Your Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events Attended
              </span>
              <span className="font-bold text-lg text-gray-900">{stats.eventsAttended}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Connections Made
              </span>
              <span className="font-bold text-lg text-gray-900">{stats.connectionsMode}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming Events
              </span>
              <span className="font-bold text-lg text-gray-900">{stats.upcomingEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Network Score
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#15b392] h-2 rounded-full"
                    style={{ width: `${stats.networkScore}%` }}
                  ></div>
                </div>
                <span className="font-bold text-lg text-gray-900">{stats.networkScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#15b392]" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#15b392]" />
            Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-lg ${
                  notif.unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {notif.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${notif.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notif.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-700" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full bg-[#15b392] text-white py-3 rounded-lg font-medium hover:bg-[#2a6435] transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Create Event
          </button>
          <button className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Find Players
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          router.replace("/auth/login");
          return;
        }

        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role || 'user';
        const name = profile?.full_name || 
                     profile?.name ||
                     session.user.user_metadata?.full_name || 
                     session.user.email?.split('@')[0] || 
                     'User';

        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          setUserName(name);
          setLoading(false);
        }

      } catch (err) {
        console.error('Auth check error:', err);
        router.replace("/auth/login");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      <Analytics />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        <div className="lg:col-span-2 overflow-y-auto p-4 sm:p-6 bg-white">
          <MainDashboardContent />
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50 border-l border-gray-200">
          <Sidebar userName={userName} />
        </div>
      </main>
    </div>
  );
}