// src/app/booking/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Plus, TrendingUp, Users, Calendar as CalendarIcon, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@paceon/lib/supabaseclient";
import { getEventImage } from "@/lib/eventImages";
import Image from "next/image";

import BookingCalendar from "./components/BookingCalendar";
import BookingFilters from "./components/BookingFilters";
import BookingCard from "./components/BookingCard";
import EventDetailModal from "./components/EventDetailModal";
import CreateEventModal from "./components/CreateEventModal";
import { useToast } from "@/contexts/ToastContext";

interface BookingEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'tennis' | 'padel' | 'badminton' | 'coffee_chat' | 'workshop' | 'meetup' | 'social' | 'other';
  venueName: string;
  venueAddress: string;
  venueCity: string;
  date: Date;
  time: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentPlayers: number;
  price: number;
  image: string;
  createdBy: string;
  status: string;
}

interface EventData {
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
  price_per_person: number;
  image_url: string | null;
  created_by: string;
  event_status: string;
  is_active: boolean;
  current_players?: number;
}

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  price: number;
  image: string;
}

interface Stats {
  totalEvents: number;
  totalPlayers: number;
  upcomingToday: number;
}

export default function BookingPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  }, []);

  const calculateDuration = useCallback((startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;

      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const eventsWithCounts = await Promise.all(
        (eventsData as EventData[]).map(async (event) => {
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

      const transformedEvents: BookingEvent[] = eventsWithCounts.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        event_type: event.event_type as BookingEvent['event_type'],
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        venueCity: event.venue_city,
        date: new Date(event.event_date),
        time: `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
        startTime: formatTime(event.start_time),
        endTime: formatTime(event.end_time),
        maxPlayers: event.max_players,
        currentPlayers: Number(event.current_players) || 0,
        price: event.price_per_person,
        image: event.image_url || getEventImage(event.event_type),
        createdBy: event.created_by,
        status: event.event_status,
      }));

      setEvents(transformedEvents);
      
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [formatTime]);

  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      fetchEvents();

      const channel = supabase
        .channel('public:events')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => fetchEvents()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => fetchEvents()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [authLoading, checkingAdmin, fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = selectedEventType === "all" || event.event_type === selectedEventType;
      const matchesSearch = searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueCity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !selectedDate || 
        format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      return matchesType && matchesSearch && matchesDate;
    });
  }, [events, selectedEventType, searchQuery, selectedDate]);

  const stats: Stats = useMemo(() => {
    const totalEvents = events.length;
    const totalPlayers = events.reduce((sum, e) => sum + e.currentPlayers, 0);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const upcomingToday = events.filter(e => 
      format(e.date, 'yyyy-MM-dd') === todayStr
    ).length;

    return { totalEvents, totalPlayers, upcomingToday };
  }, [events]);

  const handleEventClick = useCallback((event: BookingEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleJoinEvent = useCallback(async () => {
    if (!selectedEvent || !user) {
      showToast('error', 'Please login first');
      return;
    }

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        showToast('error', data.error || 'Booking failed');
        return;
      }

      setIsDetailModalOpen(false);
      setSelectedEvent(null);
      await fetchEvents();

      showToast('success', `Booking successful! Invoice #${data.invoiceNumber} sent to your email.`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking failed';
      showToast('error', errorMessage);
    }
  }, [selectedEvent, user, showToast, fetchEvents]);

  const handleCreateEvent = useCallback(async (eventData: EventFormData) => {
    if (!user || !isAdmin) {
      showToast('error', 'Admin access required');
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.eventType,
          venue_name: eventData.venueName,
          venue_address: eventData.venueAddress,
          venue_city: eventData.venueCity,
          event_date: eventData.date,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          duration_hours: calculateDuration(eventData.startTime, eventData.endTime),
          max_players: eventData.maxPlayers,
          current_players: 0,
          price_per_person: eventData.price,
          event_status: 'upcoming',
          is_active: true,
          image_url: eventData.image || null,
          created_by: user.id,
        });

      if (error) throw error;

      setIsCreateModalOpen(false);
      await fetchEvents();
      showToast('success', 'Event created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      showToast('error', `Failed: ${errorMessage}`);
    }
  }, [user, isAdmin, calculateDuration, fetchEvents, showToast]);

  const handleClearDate = useCallback(() => setSelectedDate(null), []);

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837]">
        {/* Header skeleton */}
        <div className="relative text-[#3F3E3D] dark:text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-36 bg-[#FB6F7A]/10 rounded-b-full blur-2xl opacity-75 -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-3">
                <div className="h-8 w-64 bg-gray-200 dark:bg-[#3d4459] rounded-lg animate-pulse" />
                <div className="h-4 w-80 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                <div className="h-6 w-32 bg-[#21C36E]/20 rounded-full animate-pulse" />
              </div>
              <div className="h-11 w-40 bg-[#21C36E]/40 rounded-xl animate-pulse hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#2d3548] shadow rounded-2xl p-6 flex items-center gap-3 border border-gray-200 dark:border-[#3d4459]"
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-[#3d4459] rounded-xl animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                    <div className="h-5 w-10 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4 space-y-4 z-10">
                <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-4 border border-gray-200 dark:border-[#3d4459]">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-[#3d4459] rounded-md mb-4 animate-pulse" />
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={`day-${i}`}
                        className="h-4 w-10 bg-gray-100 dark:bg-[#3d4459] rounded-md mx-auto"
                      />
                    ))}
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={`date-${i}`}
                        className="h-8 w-8 bg-gray-100 dark:bg-[#2d3548] rounded-lg mx-auto animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                <div className="h-20 bg-white dark:bg-[#2d3548] rounded-xl shadow-lg border border-gray-200 dark:border-[#3d4459] animate-pulse" />
              </div>
            </div>

            {/* Events grid skeleton */}
            <div className="lg:col-span-2 flex flex-col h-[calc(100vh-2rem)]">
              <div className="sticky top-4 z-20 bg-[#F4F4EF] dark:bg-[#1a1d29] pb-4 flex-shrink-0">
                <div className="h-12 bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] animate-pulse" />
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`card-skel-${i}`}
                      className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg border border-gray-200 dark:border-[#3d4459] overflow-hidden"
                    >
                      <div className="h-32 bg-gray-200 dark:bg-[#3d4459] animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-40 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                        <div className="h-3 w-32 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-3 w-24 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                          <div className="h-4 w-16 bg-gray-200 dark:bg-[#3d4459] rounded-md animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#242837] rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-[#3d4459]">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-[#3F3E3D] dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view and book events</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 bg-[#21C36E] text-white rounded-lg font-bold hover:bg-[#1a9d57] transition-all shadow-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#242837]">
      {/* Header Section */}
      <div className="relative text-[#3F3E3D] dark:text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-36 bg-[#FB6F7A]/10 rounded-b-full blur-2xl opacity-75 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-extrabold mb-1 tracking-tight flex items-center gap-3">
                Book Your Sessions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2 font-medium">
                Find and join events in your area
              </p>
              {isAdmin && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#21C36E]/10 border border-[#21C36E]/20 px-2 py-[2px] rounded-full">
                  <Shield size={14} className="text-[#21C36E]" />
                  <span className="text-xs font-semibold text-[#21C36E]">Admin Access</span>
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#21C36E] text-white px-7 py-3 rounded-xl font-bold shadow-lg hover:bg-[#1a9d57] transition-all flex items-center gap-2"
              >
                <Plus size={22} />
                Create Event
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#2d3548] shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-lg transition-shadow border border-gray-200 dark:border-[#3d4459]">
              <div className="w-12 h-12 bg-[#FB6F7A]/10 rounded-xl flex items-center justify-center text-[#FB6F7A]">
                <CalendarIcon size={26} />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-[#3F3E3D] dark:text-white">{stats.totalEvents}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2d3548] shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-lg transition-shadow border border-gray-200 dark:border-[#3d4459]">
              <div className="w-12 h-12 bg-[#007AA6]/10 rounded-xl flex items-center justify-center text-[#007AA6]">
                <Users size={26} />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Active Participants</p>
                <p className="text-2xl font-bold text-[#3F3E3D] dark:text-white">{stats.totalPlayers}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2d3548] shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-lg transition-shadow border border-gray-200 dark:border-[#3d4459]">
              <div className="w-12 h-12 bg-[#F0C946]/10 rounded-xl flex items-center justify-center text-[#F0C946]">
                <TrendingUp size={26} />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Today&apos;s Events</p>
                <p className="text-2xl font-bold text-[#3F3E3D] dark:text-white">{stats.upcomingToday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-4 z-10">
              <BookingCalendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                events={events}
                onMonthChange={setCurrentMonth}
                onDateSelect={setSelectedDate}
              />

              {selectedDate && (
                <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-4 border border-gray-200 dark:border-[#3d4459]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#3F3E3D] dark:text-white">
                      {format(selectedDate, 'EEEE, MMM dd')}
                    </h3>
                    <button
                      onClick={handleClearDate}
                      className="text-sm text-[#FB6F7A] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-2rem)]">
            <div className="sticky top-4 z-20 bg-[#F4F4EF] dark:bg-[#1a1d29] pb-4 flex-shrink-0">
              <BookingFilters
                selectedSport={selectedEventType}
                searchQuery={searchQuery}
                onSportChange={setSelectedEventType}
                onSearchChange={setSearchQuery}
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  {filteredEvents.map((event) => (
                    <BookingCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-[#3d4459]">
                  <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white mb-2">No Events Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery || selectedEventType !== 'all' || selectedDate
                      ? 'Try adjusting your filters'
                      : 'No upcoming events'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-[#21C36E] text-white rounded-lg font-bold hover:bg-[#1a9d57] transition-all inline-flex items-center gap-2 shadow-lg"
                    >
                      <Plus size={20} />
                      Create Event
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEvent && isDetailModalOpen && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseDetailModal}
          onJoin={handleJoinEvent}
        />
      )}

      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
        />
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
}