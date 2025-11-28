"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabaseclient";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, ChevronRight, Calendar, Users } from "lucide-react";

interface CompletedEvent {
  id: string;
  title: string;
  event_date: string;
  participant_count: number;
  is_rated: boolean;
}

interface Booking {
  event_id: string;
}

interface EventData {
  id: string;
  title: string;
  event_date: string;
}

const AffirmationPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [events, setEvents] = useState<CompletedEvent[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCompletedEvents();
    } else if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const fetchCompletedEvents = async () => {
    try {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("event_id")
        .eq("user_id", user?.id)
        .eq("booking_status", "attended");

      if (bookingsError) throw bookingsError;

      if (!bookings || bookings.length === 0) {
        setEvents([]);
        setPageLoading(false);
        return;
      }

      const eventIds = [...new Set(bookings.map((b: Booking) => b.event_id))];

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, event_date")
        .in("id", eventIds)
        .in("event_status", ["completed"]);

      if (eventsError) throw eventsError;

      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setPageLoading(false);
        return;
      }

      const mappedEvents: CompletedEvent[] = (eventsData as EventData[]).map(
        (event) => ({
          id: event.id,
          title: event.title,
          event_date: event.event_date,
          participant_count: 0,
          is_rated: false,
        })
      );

      const eventsWithCounts: CompletedEvent[] = [];
      for (const event of mappedEvents) {
        const { count } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("booking_status", "attended");

        const { count: ratedCount } = await supabase
          .from("affirmation_cube")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("reviewer_id", user?.id);

        event.participant_count = count || 0;
        event.is_rated = (ratedCount || 0) > 0;
        eventsWithCounts.push(event);
      }

      setEvents(eventsWithCounts);
      setPageLoading(false);
    } catch (error) {
      setEvents([]);
      setPageLoading(false);
    }
  };

  const handleStartRating = (eventId: string) => {
    router.push(`/affirmation-cube/rate?event_id=${eventId}`);
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#15b392] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Affirmation Cube
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Rate your teammates from completed events
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No completed events to rate yet
            </p>
            <button
              onClick={() => router.push("/booking")}
              className="bg-[#15b392] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Book Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#15b392]" />
                        <span>
                          {new Date(event.event_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#15b392]" />
                        <span>{event.participant_count} participants</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {event.is_rated ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap">
                        ✓ Rated
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap">
                        Pending
                      </span>
                    )}

                    <button
                      onClick={() => handleStartRating(event.id)}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      {event.is_rated ? "Update Ratings" : "Start Rating"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffirmationPage;
