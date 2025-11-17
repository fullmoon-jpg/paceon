"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

type TabType = "payments" | "events" | "players";

interface Payment {
  id: string;
  amount: number;
  payment_status: string;
  created_at: string;
  booking_id: string;
  user_id: string;
  bookings?: {
    id: string;
    events?: { title: string };
  } | null;
  users_profile?: {
    full_name?: string;
    email?: string;
  } | null;
}

interface Booking {
  id: string;
  booking_status: string;
}

interface EventData {
  id: string;
  title: string;
  event_status: string;
  event_date: string;
  start_time: string;
  image_url?: string;
  max_players: number;
  sport?: string;
  bookings?: Booking[];
}

interface UserStatistics {
  event_attended: number;
  connections: number;
  networking_score: number;
  event_upcoming?: number;
}

interface Player {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  user_statistics?: UserStatistics;
}

interface BookingData {
  id: string;
  booking_status: string;
  event_id: string;
  events: { id: string; title: string };
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface UserStatisticsData {
  user_id: string;
  event_attended: number;
  connections: number;
  networking_score: number;
  event_upcoming: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (profile === null) {
        return;
      } else if (profile?.role !== "admin") {
        router.replace("/");
      } else {
        fetchData();
      }
    }
  }, [loading, user, profile, activeTab, router]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "payments") await fetchPayments();
      if (activeTab === "events") await fetchEvents();
      if (activeTab === "players") await fetchPlayers();
    } finally {
      setRefreshing(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (paymentsError) throw paymentsError;

      if (!paymentsData || paymentsData.length === 0) {
        setPayments([]);
        return;
      }

      const bookingIds = paymentsData.map((p) => p.booking_id).filter(Boolean);
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, booking_status, event_id, events(id, title)")
        .in("id", bookingIds);

      const userIds = paymentsData.map((p) => p.user_id).filter(Boolean);
      const { data: usersData } = await supabase
        .from("users_profile")
        .select("id, full_name, email")
        .in("id", userIds);

      const merged: Payment[] = paymentsData.map((payment) => ({
        ...payment,
        bookings: (bookingsData as unknown as BookingData[])?.find((b) => b.id === payment.booking_id) || null,
        users_profile: usersData?.find((u: UserProfile) => u.id === payment.user_id) || null,
      }));

      setPayments(merged);
    } catch (error) {
      setPayments([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, bookings(id, booking_status)")
        .order("event_date", { ascending: false });
      
      if (error) throw error;
      setEvents((data as EventData[]) || []);
    } catch (error) {
      setEvents([]);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from("users_profile")
        .select("id, email, full_name, avatar_url, role, created_at, updated_at")
        .order("created_at", { ascending: false });
      
      if (profileError) throw profileError;

      const { data: stats } = await supabase
        .from("user_statistics")
        .select("user_id, event_attended, connections, networking_score, event_upcoming");

      const merged: Player[] = (profiles || []).map((p) => ({
        ...p,
        user_statistics: (stats as UserStatisticsData[])?.find((s) => s.user_id === p.id) || {
          event_attended: 0,
          connections: 0,
          networking_score: 0,
          event_upcoming: 0
        }
      }));
      
      setPlayers(merged);
    } catch (error) {
      setPlayers([]);
    }
  };

  const handleApprovePayment = async (paymentId: string, bookingId: string) => {
    if (!confirm("Approve this payment?")) return;

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ payment_status: "paid", payment_method: "paid", updated_at: new Date().toISOString() })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ booking_status: "confirmed", has_paid: true })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      alert("Payment approved!");
      await fetchPayments();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${message}`);
    }
  };

  const handleRejectPayment = async (paymentId: string, bookingId: string) => {
    if (!confirm("Reject this payment?")) return;

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      alert("Payment rejected!");
      await fetchPayments();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${message}`);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm("Cancel this event? All bookings will be cancelled.")) return;

    try {
      const { error: eventError } = await supabase
        .from("events")
        .update({ event_status: "cancelled", is_active: false })
        .eq("id", eventId);

      if (eventError) throw eventError;

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .eq("event_id", eventId);

      if (bookingError) throw bookingError;

      alert("Event cancelled!");
      await fetchEvents();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${message}`);
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    if (!confirm("Mark this event as completed?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();
      
      if (!data.success) throw new Error(data.error || 'Failed to complete event');
      
      alert("Event completed! Connections auto-created.");
      await fetchEvents();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#15b392] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") return null;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.users_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.users_profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.event_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPlayers = players.filter((p) => {
    return (
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-8 px-4 sm:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-green-100">Manage payments, events, and players</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "payments"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <DollarSign size={20} />
            Payments
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "events"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar size={20} />
            Events
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "players"
                ? "bg-[#15b392] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users size={20} />
            Players
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
            />
          </div>
          {activeTab !== "players" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
            >
              <option value="all">All Status</option>
              {activeTab === "payments" && (
                <>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </>
              )}
              {activeTab === "events" && (
                <>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          )}
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {activeTab === "payments" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{payment.users_profile?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{payment.users_profile?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{payment.bookings?.events?.title || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rp {parseInt(String(payment.amount || 0), 10).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            payment.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : payment.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(payment.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        {payment.payment_status === "pending" && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleApprovePayment(payment.id, payment.booking_id)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id, payment.booking_id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPayments.length === 0 && (
              <div className="text-center py-12 text-gray-500">No payments found</div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const confirmedBookings = event.bookings?.filter((b) => b.booking_status === "confirmed").length || 0;
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <img src={event.image_url || 'https://via.placeholder.com/400x200'} alt={event.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.event_status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : event.event_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {event.event_status}
                      </span>
                      <span className="text-xs text-gray-500">{event.sport}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {format(new Date(event.event_date), "MMM dd, yyyy")} • {event.start_time}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {confirmedBookings}/{event.max_players} players
                    </p>
                    <div className="flex gap-2">
                      {event.event_status === "upcoming" && (
                        <>
                          <button
                            onClick={() => handleCompleteEvent(event.id)}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancelEvent(event.id)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredEvents.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">No events found</div>
            )}
          </div>
        )}

        {activeTab === "players" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Player</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Events</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Connections</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt={player.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#15b392] flex items-center justify-center text-white font-bold">
                              {player.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="font-medium text-gray-900">{player.full_name || "No name"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{player.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{player.user_statistics?.event_attended || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{player.user_statistics?.connections || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{player.user_statistics?.networking_score || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(player.created_at), "MMM dd, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPlayers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No players found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
