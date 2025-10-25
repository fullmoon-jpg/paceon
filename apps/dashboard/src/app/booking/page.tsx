// src/app/booking/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Plus, TrendingUp, Users, Calendar as CalendarIcon, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@paceon/lib/supabase";

// Import components
import BookingCalendar from "./components/BookingCalendar";
import BookingFilters from "./components/BookingFilters";
import BookingCard from "./components/BookingCard";
import EventDetailModal from "./components/EventDetailModal";
import CreateEventModal from "./components/CreateEventModal";

// ✅ Updated interface
interface BookingEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'tennis' | 'padel' | 'badminton' | 'coffee_chat' | 'workshop' | 'meetup' | 'social' | 'other'; // ✅ Changed from 'coffee chat'
  venueName: string;
  venueAddress: string;
  venueCity: string;
  // court: string; // ❌ Removed
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

export default function BookingPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState("all"); // ✅ Renamed from selectedSport
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('users_profile')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch events + Realtime subscription
  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      fetchEvents();

      // Realtime subscription
      const channel = supabase
        .channel('public:events')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
          },
          (payload) => {
            console.log('🔄 Event changed:', payload);
            fetchEvents();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            console.log('🔄 Booking changed:', payload);
            fetchEvents();
          }
        )
        .subscribe();

      return () => {
        console.log('🧹 Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [authLoading, checkingAdmin]);

  // ✅ FETCH EVENTS USING RPC
  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching events with RPC...');
      
      const { data, error } = await supabase.rpc('get_events_with_counts');

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      console.log('RPC response:', data);

      const formatTime = (timeString: string) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
      };

      // ✅ Updated transformation
      const transformedEvents: BookingEvent[] = (data || []).map((event: any) => {
        console.log(`📊 Event: ${event.title}, Players: ${event.current_players}/${event.max_players}`);
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          event_type: event.event_type, // ✅ Changed from 'sport'
          venueName: event.venue_name,
          venueAddress: event.venue_address,
          venueCity: event.venue_city,
          // court: event.court_name, // ❌ Removed
          date: new Date(event.event_date),
          time: `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
          startTime: formatTime(event.start_time),
          endTime: formatTime(event.end_time),
          maxPlayers: event.max_players,
          currentPlayers: Number(event.current_players) || 0,
          price: event.price_per_person,
          image: event.image_url || getDefaultImage(event.event_type), // ✅ Changed
          createdBy: event.created_by,
          status: event.event_status,
        };
      });

      console.log('Transformed events:', transformedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated with more event types
  const getDefaultImage = (eventType: string) => {
    const images: Record<string, string> = {
      tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
      padel: 'https://images.unsplash.com/photo-1554068865-64ba29f34874?w=800&q=80',
      badminton: 'https://images.unsplash.com/photo-1626224583643-c1dc0c4f0b6d?w=800&q=80',
      coffee_chat: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', // ☕
      workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      meetup: 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&q=80',
      social: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      other: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    };
    return images[eventType] || images.other;
  };

  // ✅ Updated filter logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = selectedEventType === "all" || event.event_type === selectedEventType; // ✅ Changed
      const matchesSearch = searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueCity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !selectedDate || 
        format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      return matchesType && matchesSearch && matchesDate;
    });
  }, [events, selectedEventType, searchQuery, selectedDate]);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalPlayers = events.reduce((sum, e) => sum + e.currentPlayers, 0);
    const upcomingToday = events.filter(e => 
      format(e.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;

    return { totalEvents, totalPlayers, upcomingToday };
  }, [events]);

  const handleEventClick = (event: BookingEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  // ✅ IMPROVED JOIN EVENT
  const handleJoinEvent = async () => {
    if (!selectedEvent || !user) {
      alert('❌ Please login first');
      return;
    }

    console.log('🚀 Starting booking...');

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const userId = user?.id || currentUser?.id;

      if (!userId) {
        alert('❌ Authentication required');
        return;
      }

      // Step 1: Check existing booking
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id, booking_status')
        .eq('event_id', selectedEvent.id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Check error:', checkError);
        throw checkError;
      }
      
      if (existingBooking) {
        if (existingBooking.booking_status === 'cancelled') {
          alert('❌ You cancelled this booking. Please contact admin to rejoin.');
        } else {
          alert('❌ You already have a booking for this event!');
        }
        return;
      }

      // Step 2: Verify event availability
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, max_players, current_players, event_status, is_active, price_per_person')
        .eq('id', selectedEvent.id)
        .single();

      if (eventError) {
        console.error('Event fetch error:', eventError);
        throw eventError;
      }

      if (!eventData.is_active) {
        alert('❌ This event is no longer active');
        return;
      }

      if (eventData.event_status === 'cancelled') {
        alert('❌ This event has been cancelled');
        return;
      }

      if (eventData.event_status === 'completed') {
        alert('❌ This event has already ended');
        return;
      }

      if (eventData.current_players >= eventData.max_players) {
        alert('❌ Sorry, this event is now full!');
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id 
            ? { ...e, currentPlayers: eventData.current_players }
            : e
        ));
        return;
      }

      console.log('✅ Event available:', {
        currentPlayers: eventData.current_players,
        maxPlayers: eventData.max_players,
        slotsLeft: eventData.max_players - eventData.current_players
      });

      // Step 3: Insert booking
      const totalAmount = eventData.price_per_person + 10000;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_id: selectedEvent.id,
          user_id: userId,
          booking_status: 'pending_payment', // ✅ Changed to trigger notification
          amount_to_pay: totalAmount,
          has_paid: false,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        if (bookingError.message?.includes('full')) {
          alert('❌ Sorry, someone just took the last slot!');
          await fetchEvents();
          return;
        }
        throw bookingError;
      }

      console.log('✅ Booking created:', booking.id);

      // Step 4: Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          user_id: userId,
          event_id: selectedEvent.id,
          amount: totalAmount,
          payment_status: 'pending',
          payment_method: 'pending',
        });

      if (paymentError) {
        console.error('Payment error:', paymentError);
        console.log('🔙 Rolling back booking...');
        await supabase.from('bookings').delete().eq('id', booking.id);
        throw new Error('Failed to create payment record');
      }

      console.log('✅ Payment record created');

      // Step 5: Close modals
      setIsDetailModalOpen(false);
      setSelectedEvent(null);

      // Step 6: Refresh events
      await fetchEvents();

      // Success
      alert('🎉 Booking successful! Please complete payment within 12 hours.');

    } catch (error: any) {
      console.error('❌ Booking failed:', error);
      if (error.message?.includes('duplicate key')) {
        alert('❌ You already have a booking for this event');
      } else if (error.message?.includes('full')) {
        alert('❌ Event is now full. Please choose another event.');
      } else {
        alert(`❌ Booking failed: ${error.message}`);
      }
    }
  };

  // ✅ Updated create event handler
  const handleCreateEvent = async (eventData: any) => {
    if (!user || !isAdmin) {
      alert('❌ Admin access required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.eventType, // ✅ Changed from 'sport'
          venue_name: eventData.venueName,
          venue_address: eventData.venueAddress,
          venue_city: eventData.venueCity,
          // court_name: eventData.court, // ❌ Removed
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
        })
        .select()
        .single();

      if (error) throw error;

      setIsCreateModalOpen(false);
      await fetchEvents();
      alert('🎉 Event created!');
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return durationMinutes / 60;
  };

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15b392] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and book events</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gray-50 text-black overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-36 bg-gradient-to-tr from-[#15b392]/20 to-[#2a6435]/10 rounded-b-full blur-2xl opacity-75 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-extrabold mb-1 tracking-tight flex items-center gap-3">
                Book Your Sessions
              </h1>
              <p className="text-lg text-gray-600 mt-1 flex items-center gap-2 font-medium">
                Find and join events in your area
              </p>
              {isAdmin && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#e4f7f2] border border-[#15b392]/20 px-2 py-[2px] rounded-full">
                  <Shield size={14} className="text-[#15b392]" />
                  <span className="text-xs font-semibold text-[#1b4635]">Admin Access</span>
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white px-7 py-3 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
              >
                <Plus size={22} />
                Create Event
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#e0f7ef] rounded-xl flex items-center justify-center text-[#15b392]">
                <CalendarIcon size={26} />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
            <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#e4f5ff] rounded-xl flex items-center justify-center text-[#1ca3cc]">
                <Users size={26} />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</p>
              </div>
            </div>
            <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#fff6e4] rounded-xl flex items-center justify-center text-[#eab308]">
                <TrendingUp size={26} />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingToday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">
                      {format(selectedDate, 'EEEE, MMM dd')}
                    </h3>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-sm text-[#15b392] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-2rem)]">
            <div className="sticky top-4 z-20 bg-gray-50 pb-4 flex-shrink-0">
              {/* ✅ Updated prop names */}
              <BookingFilters
                selectedSport={selectedEventType}
                searchQuery={searchQuery}
                onSportChange={setSelectedEventType}
                onSearchChange={setSearchQuery}
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Events Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || selectedEventType !== 'all' || selectedDate
                      ? 'Try adjusting your filters'
                      : 'No upcoming events'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
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
    </div>
  );
}
