// src/app/dashboard/page.tsx - PART 1
"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDataCache } from "@/contexts/DataContext";
import { useNotifications } from "@/hooks/useRealtimeNotifications";
import { RealtimeChannel } from "@supabase/supabase-js";
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
  const [showFindPlayers, setShowFindPlayers] = useState(false);

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
    }
  }, [user, fetchWithCache]);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchWithCache<Connection[]>(
        `connections-${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from("user_connections")
            .select(
              "connected_user_id, users_profile!user_connections_connected_user_id_fkey(full_name,email,avatar_url)"
            )
            .eq("user_id", user.id)
            .eq("status", "active");

          if (error) throw error;

          return (
            data?.map((r: any) => ({
              id: r.connected_user_id,
              name: r.users_profile?.full_name || "Unknown User",
              email: r.users_profile?.email || "",
              avatar: r.users_profile?.avatar_url || null,
            })) || []
          );
        }
      );

      setConnections(data);
    } catch (error) {
      console.error('Connections fetch error:', error);
    }
  }, [user, fetchWithCache]);

  // ✅ FIXED: Fetch events dengan current_players yang benar
  const fetchAllEvents = useCallback(async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .eq("event_status", "upcoming")
        .order("event_date", { ascending: true });

      if (error) throw error;

      // ✅ Count current_players for each event
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event: any) => {
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

      setAllEvents(eventsWithCounts as Event[]);
    } catch (error) {
      console.error('All events fetch error:', error);
    }
  }, []);

  // ✅ FIXED: Fetch registered events dengan current_players
  const fetchRegisteredEvents = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("event_id, events(*)")
        .eq("user_id", user.id)
        .in("booking_status", ['confirmed', 'pending', 'attended']);

      if (error) throw error;

      const eventsList = data?.map((b: any) => b.events).filter((e): e is Event => e !== null) || [];

      // ✅ Count current_players for registered events
      const eventsWithCounts = await Promise.all(
        eventsList.map(async (event: Event) => {
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
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (!loading && user) {
      Promise.all([fetchStats(), fetchConnections(), fetchAllEvents(), fetchRegisteredEvents()]);
    }
  }, [loading, user, fetchStats, fetchConnections, fetchAllEvents, fetchRegisteredEvents]);

  // ✅ IMPROVED: Realtime subscription with current_players update
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

  // Visibility change - refetch
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

  // Redirect
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else if (profile?.role === "admin") router.replace("/admin/dashboard");
    }
  }, [loading, user, profile?.role, router]);

  // Calendar logic
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15b392] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role === "admin") return null;

  const userName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";

    // ... continuing from Part 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60 dark:opacity-40">
          <img
            src="/images/login-img.webp"
            alt="Sports Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">WELCOME TO PACE ON</h1>
          <p className="text-green-100 font-open-sans font-bold">
            Hey {userName}, ready to play today?
          </p>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 overflow-y-auto px-4 sm:px-8 pt-8 pb-8 bg-white dark:bg-gray-800">
          {/* Calendar */}
          <div className="mb-8">
            <h2 className="text-xl font-extrabold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} className="text-black dark:text-white" />
                  </button>
                  <span className="font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} className="text-black dark:text-white" />
                  </button>
                  {selectedDate && (
                    <button
                      className="ml-2 text-sm text-[#15b392] dark:text-green-400 hover:underline font-medium"
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
                          ? "bg-[#15b392] text-white font-bold shadow-lg scale-105"
                          : isToday(date)
                          ? "bg-green-50 dark:bg-green-900 text-[#15b392] dark:text-green-300 font-bold border-2 border-[#15b392] dark:border-green-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => setSelectedDate(isSelected ? null : date)}
                      aria-label={`Select ${format(date, "MMMM d, yyyy")}`}
                    >
                      {format(date, "d")}
                      {dateHasEvents && (
                        <div
                          className={`w-1.5 h-1.5 mx-auto mt-0.5 rounded-full ${
                            isSelected ? "bg-white" : "bg-[#15b392] dark:bg-green-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Your Events */}
          <section className="mb-8">
            <div className="flex items-center mb-4 justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Your Events</h3>
              <span className="bg-[#15b392] text-white text-sm px-3 py-1 rounded-full font-semibold">
                {registeredEvents.length} joined
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[420px] overflow-y-auto pr-2">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <DashboardEventCard key={event.id} event={event} onClick={() => setModalEvent(event)} />
                ))
              ) : (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No events joined yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 font-open-sans font-bold">
                    Browse available events below to get started!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Available Events */}
          <section>
            <div className="flex items-center mb-4 justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Available Events</h3>
              <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-semibold">
                {upcomingAvailableEvents.length} events
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[420px] overflow-y-auto pr-2">
              {upcomingAvailableEvents.length > 0 ? (
                upcomingAvailableEvents.map((event) => (
                  <DashboardEventCard key={event.id} event={event} onClick={() => setModalEvent(event)} />
                ))
              ) : (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">All events joined!</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 font-open-sans font-bold">
                    You&apos;re up to date with all available events
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-xl shadow-lg p-6 text-white text-center">
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} value={stats.connections} label="Connections" color="blue" />
              <StatCard icon={<Trophy className="w-4 h-4 text-green-600" />} value={stats.eventsAttended} label="Events Attended" color="green" />
              <StatCard icon={<Calendar className="w-4 h-4 text-purple-600" />} value={stats.upcomingEvents} label="Upcoming" color="purple" />
              <StatCard icon={<Zap className="w-4 h-4 text-orange-600" />} value={stats.networkScore} label="Network Score" color="orange" />
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-2 shadow-md">
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-[#15b392] text-white relative">
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
                <button
                  className="flex-1 py-2 px-3 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowFindPlayers(true)}
                >
                  Find Players
                </button>
              </div>
            </div>

            {/* Notifications */}
            {notifications && notifications.length > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#15b392]" />
                    Recent Activity
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                  {notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg transition-all ${
                        !notif.is_read
                          ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
                          : "bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                      }`}
                    >
                      <p className={`text-sm ${!notif.is_read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{format(new Date(notif.created_at), "MMM dd, HH:mm")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
          {/* Find Players Modal */}
      {showFindPlayers && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-[#15b392] dark:hover:text-green-400 transition-colors"
              onClick={() => setShowFindPlayers(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <h3 className="font-bold text-2xl mb-6 text-gray-800 dark:text-white">Your Connections</h3>
            {connections.length > 0 ? (
              <ul className="space-y-3">
                {connections.map((conn) => (
                  <li
                    key={conn.id}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {conn.avatar ? (
                      <img
                        src={conn.avatar}
                        alt={conn.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#15b392] flex items-center justify-center text-white text-lg font-bold">
                        {conn.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{conn.name || "Unknown User"}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{conn.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No connections yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-open-sans font-bold">Join events to meet new players!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full text-gray-800 dark:text-gray-200 hover:text-[#15b392] dark:hover:text-green-400 transition-all shadow-lg"
              onClick={() => setModalEvent(null)}
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
                <span className="bg-[#15b392] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {modalEvent.event_type}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-2xl mb-2 text-gray-800 dark:text-white">{modalEvent.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{modalEvent.venue_name}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
              {modalEvent.venue_address}, {modalEvent.venue_city}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-[#15b392]" />
                <span className="text-sm">{format(new Date(modalEvent.event_date), "EEEE, MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 text-[#15b392]" />
                <span className="text-sm">
                  {formatTime(modalEvent.start_time)} - {formatTime(modalEvent.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-[#15b392]" />
                <span className="text-sm font-semibold">
                  {modalEvent.current_players}/{modalEvent.max_players} players
                </span>
              </div>
            </div>

            {modalEvent.description && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{modalEvent.description}</p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Price per person</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rp {parseInt(String(modalEvent.price_per_person || 0), 10).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = "/booking";
              }}
              className="w-full bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              View in Booking Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface DashboardEventCardProps {
  event: Event;
  onClick: () => void;
}

const DashboardEventCard = ({ event, onClick }: DashboardEventCardProps) => (
  <div
    className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer bg-white dark:bg-gray-700 transition-all hover:scale-[1.02]"
    onClick={onClick}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={event.image_url || "https://images.unsplash.com/photo-1554068865-64ba29f34874?w=800&q=80"}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 left-3">
        <span className="bg-[#15b392] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
          {event.event_type}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-bold text-base text-gray-800 dark:text-white mb-2 line-clamp-1">{event.title}</h4>
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
        <div className="text-sm font-bold text-[#15b392]">
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
}

const StatCard = ({ icon, value, label, color }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-600">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
  </div>
);

export default DashboardPage;

