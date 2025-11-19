"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDataCache } from "@/contexts/DataContext";
import { useNotifications } from "@/hooks/useRealtimeNotifications";
import { RealtimeChannel } from "@supabase/supabase-js";
import ProfileModal from "./components/components/ProfileModal";
import {
  Calendar,
  Users,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Trophy,
  Zap,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  event_date: string;
  start_time: string;
  end_time: string;
  max_players: number;
  current_players: number;
  price_per_person: number;
  image_url: string | null;
  is_active: boolean;
  event_status: string;
}

interface Stats {
  eventsAttended: number;
  connections: number;
  upcomingEvents: number;
  networkScore: number;
}

interface Connection {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Booking {
  event_id: string;
  events: Event;
}

interface ViewingProfile {
  userId: string;
  userName: string;
  userAvatar: string | null;
  userPosition?: string;
  userCompany?: string;
  userRole?: string;
}

type TabType = 'notifications' | 'connections';

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  return timeString.substring(0, 5);
};

const DashboardPage = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { fetchWithCache } = useDataCache();
  const { notifications } = useNotifications(user?.id || null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [modalEvent, setModalEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<Stats>({
    eventsAttended: 0,
    connections: 0,
    upcomingEvents: 0,
    networkScore: 0,
  });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [viewingProfile, setViewingProfile] = useState<ViewingProfile | null>(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchWithCache<Stats>(
        `stats-${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from("user_statistics")
            .select("event_attended, connections, event_upcoming, networking_score")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") throw error;

          return {
            eventsAttended: data?.event_attended || 0,
            connections: data?.connections || 0,
            upcomingEvents: data?.event_upcoming || 0,
            networkScore: data?.networking_score || 0,
          };
        }
      );

      setStats(data);
    } catch (error) {
      console.error('Stats fetch error:', error);
      setStats({
        eventsAttended: 0,
        connections: 0,
        upcomingEvents: 0,
        networkScore: 0,
      });
    }
  }, [user, fetchWithCache]);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("user_connections")
        .select("connected_user_id")
        .eq("user_id", user.id);

      if (connectionsError) throw connectionsError;

      const userIds = connectionsData?.map((c) => c.connected_user_id).filter(Boolean) || [];

      if (userIds.length === 0) {
        setConnections([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("users_profile")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const mapped: Connection[] = (profilesData || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || "Unknown User",
        email: profile.email || "",
        avatar: profile.avatar_url || null,
      }));

      setConnections(mapped);
    } catch (error) {
      console.error('Connections fetch error:', error);
      setConnections([]);
    }
  }, [user]);

  const fetchAllEvents = useCallback(async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .eq("event_status", "upcoming")
        .order("event_date", { ascending: true });

      if (error) throw error;

      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .in('booking_status', ['confirmed', 'pending', 'attended']);

          return {
            ...event,
            current_players: count || 0,
          } as Event;
        })
      );

      setAllEvents(eventsWithCounts);
    } catch (error) {
      console.error('Events fetch error:', error);
      setAllEvents([]);
    }
  }, []);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("event_id, events(*)")
        .eq("user_id", user.id)
        .in("booking_status", ['confirmed', 'pending', 'attended']);

      if (error) throw error;

      const bookings = data as unknown as Booking[];
      const eventsList = bookings?.map((b) => b.events).filter((e): e is Event => e !== null) || [];

      const eventsWithCounts = await Promise.all(
        eventsList.map(async (event) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .in('booking_status', ['confirmed', 'pending', 'attended']);

          return {
            ...event,
            current_players: count || 0,
          };
        })
      );

      setRegisteredEvents(eventsWithCounts);
    } catch (error) {
      console.error('Registered events fetch error:', error);
      setRegisteredEvents([]);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      Promise.all([fetchStats(), fetchConnections(), fetchAllEvents(), fetchRegisteredEvents()]);
    }
  }, [loading, user, fetchStats, fetchConnections, fetchAllEvents, fetchRegisteredEvents]);

  useEffect(() => {
    if (!user) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel("dashboard-events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchAllEvents();
          fetchRegisteredEvents();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchAllEvents();
          fetchRegisteredEvents();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchAllEvents, fetchRegisteredEvents]);

  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAllEvents();
        fetchRegisteredEvents();
        fetchStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, fetchAllEvents, fetchRegisteredEvents, fetchStats]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else if (profile?.role === "admin") router.replace("/admin/dashboard");
    }
  }, [loading, user, profile?.role, router]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasEvent = useCallback(
    (date: Date) => allEvents.some((event) => isSameDay(new Date(event.event_date), date)),
    [allEvents]
  );

  const filteredByDate = useMemo(
    () =>
      selectedDate
        ? allEvents.filter((e) => isSameDay(new Date(e.event_date), selectedDate))
        : allEvents,
    [allEvents, selectedDate]
  );

  const registeredIds = useMemo(() => registeredEvents.map((e) => e.id), [registeredEvents]);

  const upcomingAvailableEvents = useMemo(
    () => filteredByDate.filter((e) => !registeredIds.includes(e.id)),
    [filteredByDate, registeredIds]
  );

  const unreadNotifications = useMemo(
    () => notifications?.filter((n) => !n.is_read) || [],
    [notifications]
  );

  const handleViewProfile = useCallback((conn: Connection & { position?: string; company?: string; role?: string }) => {
    setViewingProfile({
      userId: conn.id,
      userName: conn.name,
      userAvatar: conn.avatar,
      userPosition: conn.position,
      userCompany: conn.company,
      userRole: conn.role,
    });
    setProfileRefreshKey(prev => prev + 1);
  }, []);

  const closeModal = useCallback(() => setModalEvent(null), []);
  const closeProfile = useCallback(() => setViewingProfile(null), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#242837]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full p-4">
              <Image
                src="/images/dark-logo.png"
                alt="Loading"
                width={80}
                height={80}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/light-logo.png"
                alt="Loading"
                width={80}
                height={80}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>
          <p className="mt-6 text-[#3F3E3D] dark:text-white font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role === "admin") return null;

  const userName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#242837]">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Main Content */}
        <div className="lg:col-span-2 overflow-y-auto px-4 sm:px-8 pt-8 pb-8 bg-white dark:bg-[#242837] scrollbar-hide">
          {/* Calendar */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#3F3E3D] dark:text-white">Upcoming Events</h2>
            <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg border border-gray-200 dark:border-[#3d4459] p-6">
              <div className="flex items-center justify-between mb-4">
                <div></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} className="text-[#3F3E3D] dark:text-white" />
                  </button>
                  <span className="font-bold text-[#3F3E3D] dark:text-white min-w-[140px] text-center">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} className="text-[#3F3E3D] dark:text-white" />
                  </button>
                  {selectedDate && (
                    <button
                      className="ml-2 text-sm text-[#007AA6] hover:underline font-medium"
                      onClick={() => setSelectedDate(null)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-semibold text-gray-500 dark:text-gray-400 text-sm py-2">
                    {day}
                  </div>
                ))}
                {daysInMonth.map((date) => {
                  const dateHasEvents = hasEvent(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      className={`mx-auto my-1 w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-[#007AA6] text-white font-bold shadow-lg scale-105"
                          : isToday(date)
                          ? "bg-[#FB6F7A]/20 text-[#FB6F7A] font-bold border-2 border-[#FB6F7A]"
                          : "hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-300"
                      }`}
                      onClick={() => setSelectedDate(isSelected ? null : date)}
                      aria-label={`Select ${format(date, "MMMM d, yyyy")}`}
                    >
                      {format(date, "d")}
                      {dateHasEvents && (
                        <div
                          className={`w-1.5 h-1.5 mx-auto mt-0.5 rounded-full ${
                            isSelected ? "bg-white" : "bg-[#F0C946]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Your Events - Green */}
          <section className="mb-8">
            <div className="flex items-center mb-4 justify-between">
              <h3 className="text-lg font-bold text-[#3F3E3D] dark:text-white">Your Events</h3>
              <span className="bg-[#21C36E] text-white text-sm px-3 py-1 rounded-full font-semibold">
                {registeredEvents.length} joined
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[420px] overflow-y-auto pr-2 scrollbar-hide">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <DashboardEventCard key={event.id} event={event} onClick={() => setModalEvent(event)} type="registered" />
                ))
              ) : (
                <div className="col-span-2 bg-[#F4F4EF] dark:bg-[#2d3548] rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-[#3d4459]">
                  <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No events joined yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Browse available events below to get started!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Available Events - Purple/Magenta */}
          <section>
            <div className="flex items-center mb-4 justify-between">
              <h3 className="text-lg font-bold text-[#3F3E3D] dark:text-white">Available Events</h3>
              <span className="bg-[#D33181] text-white text-sm px-3 py-1 rounded-full font-semibold">
                {upcomingAvailableEvents.length} events
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[420px] overflow-y-auto pr-2 scrollbar-hide">
              {upcomingAvailableEvents.length > 0 ? (
                upcomingAvailableEvents.map((event) => (
                  <DashboardEventCard key={event.id} event={event} onClick={() => setModalEvent(event)} type="available" />
                ))
              ) : (
                <div className="col-span-2 bg-[#F4F4EF] dark:bg-[#2d3548] rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-[#3d4459]">
                  <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">All events joined!</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    You&apos;re up to date with all available events
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#242837] border-l border-gray-200 dark:border-[#3d4459] scrollbar-hide">
          <div className="space-y-6">
            {/* Profile Card - Gradient Pink to Orange */}
            <div className="bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] rounded-xl shadow-lg p-6 text-white text-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={userName}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/30">
                  <span className="text-white font-bold text-2xl">{userName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <h3 className="font-bold text-xl text-white mb-1">{userName}</h3>
              <p className="text-white/80 text-sm">{profile?.email || user?.email}</p>
            </div>

            {/* Stats - Different colors for each */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={<Users className="w-4 h-4 text-[#007AA6]" />} 
                value={stats.connections} 
                label="Connections" 
                color="#007AA6" 
                bgColor="bg-[#007AA6]/10"
              />
              <StatCard 
                icon={<Trophy className="w-4 h-4 text-[#21C36E]" />} 
                value={stats.eventsAttended} 
                label="Events Attended" 
                color="#21C36E"
                bgColor="bg-[#21C36E]/10"
              />
              <StatCard 
                icon={<Calendar className="w-4 h-4 text-[#FB6F7A]" />} 
                value={stats.upcomingEvents} 
                label="Upcoming" 
                color="#FB6F7A"
                bgColor="bg-[#FB6F7A]/10"
              />
              <StatCard 
                icon={<Zap className="w-4 h-4 text-[#F0C946]" />} 
                value={stats.networkScore} 
                label="Network Score" 
                color="#F0C946"
                bgColor="bg-[#F0C946]/10"
              />
            </div>

            {/* Tabs - Blue & Green accent */}
            <div className="bg-[#F4F4EF] dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] p-2 shadow-md">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm relative transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-[#007AA6] text-white'
                      : 'text-[#3F3E3D] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3d4459]'
                  }`}
                >
                  Notifications
                  {unreadNotifications.length > 0 && activeTab !== 'notifications' && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FB6F7A] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('connections')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'connections'
                      ? 'bg-[#21C36E] text-white'
                      : 'text-[#3F3E3D] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3d4459]'
                  }`}
                >
                  Connections
                </button>
              </div>
            </div>

            {/* Notifications Tab */}
            {activeTab === 'notifications' && notifications && notifications.length > 0 && (
              <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-[#3d4459] bg-gradient-to-r from-[#007AA6]/10 to-[#007AA6]/5">
                  <h3 className="font-semibold text-[#3F3E3D] dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#007AA6]" />
                    Recent Activity
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 scrollbar-hide">
                  {notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg transition-all ${
                        !notif.is_read
                          ? "bg-[#007AA6]/10 border-l-4 border-[#007AA6]"
                          : "bg-[#F4F4EF] dark:bg-[#3d4459] hover:bg-gray-200 dark:hover:bg-[#4a5166]"
                      }`}
                    >
                      <p className={`text-sm ${!notif.is_read ? "font-semibold text-[#3F3E3D] dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{format(new Date(notif.created_at), "MMM dd, HH:mm")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-[#3d4459] bg-gradient-to-r from-[#21C36E]/10 to-[#21C36E]/5">
                  <h3 className="font-semibold text-[#3F3E3D] dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#21C36E]" />
                    Your Connections
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 scrollbar-hide">
                  {connections.length > 0 ? (
                    <ul className="space-y-3">
                      {connections.map((conn) => (
                        <li
                          key={conn.id}
                          onClick={() => handleViewProfile(conn as Connection & { position?: string; company?: string; role?: string })}
                          className="flex items-center gap-3 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-[#4a5166] transition-colors cursor-pointer"
                        >
                          {conn.avatar ? (
                            <img
                              src={conn.avatar}
                              alt={conn.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-[#4a5166]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#21C36E] flex items-center justify-center text-white text-lg font-bold">
                              {conn.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-[#3F3E3D] dark:text-white">{conn.name || "Unknown User"}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{conn.email}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No connections yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Join events to meet new players!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {viewingProfile && (
        <ProfileModal
          isOpen={true}
          onClose={closeProfile}
          userId={viewingProfile.userId}
          userName={viewingProfile.userName}
          userAvatar={viewingProfile.userAvatar}
          userPosition={viewingProfile.userPosition}
          userCompany={viewingProfile.userCompany}
          userRole={viewingProfile.userRole}
          key={`profile-${viewingProfile.userId}-${profileRefreshKey}`}
        />
      )}

      {/* Event Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#242837] rounded-xl p-6 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button
              className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-[#3d4459]/90 hover:bg-white dark:hover:bg-[#3d4459] p-2 rounded-full text-[#3F3E3D] dark:text-gray-200 hover:text-[#F47A49] transition-all shadow-lg"
              onClick={closeModal}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="relative h-48 -mx-6 -mt-6 mb-6 rounded-t-xl overflow-hidden">
              <img
                src={modalEvent.image_url || "https://images.unsplash.com/photo-1554068865-64ba29f34874?w=800&q=80"}
                alt={modalEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-[#FB6F7A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {modalEvent.event_type}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-2xl mb-2 text-[#3F3E3D] dark:text-white">{modalEvent.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{modalEvent.venue_name}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
              {modalEvent.venue_address}, {modalEvent.venue_city}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-[#3F3E3D] dark:text-gray-300">
                <Calendar className="w-5 h-5 text-[#F47A49]" />
                <span className="text-sm">{format(new Date(modalEvent.event_date), "EEEE, MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-[#3F3E3D] dark:text-gray-300">
                <Clock className="w-5 h-5 text-[#F47A49]" />
                <span className="text-sm">
                  {formatTime(modalEvent.start_time)} - {formatTime(modalEvent.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#3F3E3D] dark:text-gray-300">
                <Users className="w-5 h-5 text-[#F47A49]" />
                <span className="text-sm font-semibold">
                  {modalEvent.current_players}/{modalEvent.max_players} players
                </span>
              </div>
            </div>

            {modalEvent.description && (
              <div className="mb-6">
                <h4 className="font-semibold text-[#3F3E3D] dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{modalEvent.description}</p>
              </div>
            )}

            <div className="bg-[#F4F4EF] dark:bg-[#2d3548] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Price per person</span>
                <span className="text-2xl font-bold text-[#3F3E3D] dark:text-white">
                  Rp {parseInt(String(modalEvent.price_per_person || 0), 10).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                router.push("/booking");
              }}
              className="w-full bg-[#FB6F7A] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              View in Booking Page
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

interface DashboardEventCardProps {
  event: Event;
  onClick: () => void;
  type: 'registered' | 'available';
}

const DashboardEventCard = ({ event, onClick, type }: DashboardEventCardProps) => (
  <div
    className="border border-gray-200 dark:border-[#3d4459] rounded-xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer bg-white dark:bg-[#2d3548] transition-all hover:scale-[1.02]"
    onClick={onClick}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={event.image_url || "https://images.unsplash.com/photo-1554068865-64ba29f34874?w=800&q=80"}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 left-3">
        <span className={`${type === 'registered' ? 'bg-[#21C36E]' : 'bg-[#D33181]'} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
          {event.event_type}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-bold text-base text-[#3F3E3D] dark:text-white mb-2 line-clamp-1">{event.title}</h4>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        <Calendar size={14} />
        {format(new Date(event.event_date), "PPP")}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        <Clock size={14} />
        {formatTime(event.start_time)} - {formatTime(event.end_time)}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Users size={14} />
          <span className="font-semibold">
            {event.current_players}/{event.max_players}
          </span>{" "}
          players
        </div>
        <div className="text-sm font-bold text-[#F47A49]">
          Rp {parseInt(String(event.price_per_person || 0), 10).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bgColor: string;
}

const StatCard = ({ icon, value, label, color, bgColor }: StatCardProps) => (
  <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-4 border border-gray-200 dark:border-[#3d4459]">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-[#3F3E3D] dark:text-white">{value}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
  </div>
);

export default DashboardPage;