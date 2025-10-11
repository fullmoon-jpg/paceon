"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign,
  Users,
  Filter,
  Search,
  Plus,
  X
} from "lucide-react";

export default function BookingPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Simulate admin role (in real app, get from auth)
  const isAdmin = true;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Dummy events data (simulating database)
  const events = [
    { 
      id: 1, 
      date: new Date(2025, 9, 5), 
      time: "08:00 - 10:00",
      startTime: "08:00",
      endTime: "10:00",
      venue: "Senayan Tennis Court",
      venueName: "Senayan Tennis Court",
      venueAddress: "Jl. Pintu Satu Senayan, Jakarta Pusat",
      venueCity: "Jakarta",
      court: "Court 1",
      sport: "tennis",
      maxPlayers: 4,
      currentPlayers: 2,
      price: 150000,
      title: "Morning Tennis Match",
      description: "Premium court with professional-grade surface. Perfect lighting for day and night games.",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"
    },
    { 
      id: 2, 
      date: new Date(2025, 9, 5), 
      time: "10:00 - 12:00",
      startTime: "10:00",
      endTime: "12:00",
      venue: "Senayan Tennis Court",
      venueName: "Senayan Tennis Court",
      venueAddress: "Jl. Pintu Satu Senayan, Jakarta Pusat",
      venueCity: "Jakarta",
      court: "Court 2",
      sport: "tennis",
      maxPlayers: 4,
      currentPlayers: 3,
      price: 150000,
      title: "Late Morning Session",
      description: "Premium court with professional-grade surface. Perfect lighting for day and night games.",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"
    },
    { 
      id: 3, 
      date: new Date(2025, 9, 5), 
      time: "14:00 - 16:00",
      startTime: "14:00",
      endTime: "16:00",
      venue: "Padel Club Jakarta",
      venueName: "Padel Club Jakarta",
      venueAddress: "Plaza Indonesia, Jakarta Pusat",
      venueCity: "Jakarta",
      court: "Court 1",
      sport: "padel",
      maxPlayers: 4,
      currentPlayers: 1,
      price: 200000,
      title: "Afternoon Padel Fun",
      description: "Premium padel court with air conditioning. Includes equipment rental.",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800"
    },
    { 
      id: 4, 
      date: new Date(2025, 9, 6), 
      time: "16:00 - 18:00",
      startTime: "16:00",
      endTime: "18:00",
      venue: "Padel Club Jakarta",
      venueName: "Padel Club Jakarta",
      venueAddress: "Plaza Indonesia, Jakarta Pusat",
      venueCity: "Jakarta",
      court: "Court 2",
      sport: "padel",
      maxPlayers: 4,
      currentPlayers: 4,
      price: 200000,
      title: "Evening Padel Session",
      description: "Premium padel court with air conditioning. Includes equipment rental.",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800"
    },
    { 
      id: 5, 
      date: new Date(2025, 9, 6), 
      time: "09:00 - 11:00",
      startTime: "09:00",
      endTime: "11:00",
      venue: "GBK Badminton Hall",
      venueName: "GBK Badminton Hall",
      venueAddress: "Gelora Bung Karno, Jakarta Pusat",
      venueCity: "Jakarta",
      court: "Court 5",
      sport: "badminton",
      maxPlayers: 6,
      currentPlayers: 2,
      price: 100000,
      title: "Badminton Tournament",
      description: "International standard badminton court with excellent ventilation.",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
    },
    { 
      id: 6, 
      date: new Date(2025, 9, 8), 
      time: "18:00 - 20:00",
      startTime: "18:00",
      endTime: "20:00",
      venue: "BSD Tennis Arena",
      venueName: "BSD Tennis Arena",
      venueAddress: "BSD City, Tangerang Selatan",
      venueCity: "Tangerang",
      court: "Court 3",
      sport: "tennis",
      maxPlayers: 4,
      currentPlayers: 1,
      price: 120000,
      title: "Evening Tennis Match",
      description: "Modern tennis facility with LED lighting for night games.",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"
    }
  ];

  const sportColors: Record<string, { bg: string; text: string; badge: string }> = {
    tennis: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-500" },
    padel: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-500" },
    badminton: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-500" }
  };

  const hasEvents = (date: Date) => {
    return events.some((e) => isSameDay(e.date, date));
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return events;
    return events.filter((e) => isSameDay(e.date, date));
  };

  const filteredEvents = getEventsForDate(selectedDate).filter((event) => {
    const matchesSport = selectedSport === "all" || event.sport === selectedSport;
    const matchesSearch = 
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Stats
  const totalEvents = filteredEvents.length;
  const availableEvents = filteredEvents.filter(e => e.currentPlayers < e.maxPlayers).length;
  const fullEvents = filteredEvents.filter(e => e.currentPlayers >= e.maxPlayers).length;

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="">
        <div className="max-w-6xl p-6 mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-black font-bold mb-2">Event Booking</h1>
            <p className="text-black">Find and join available sports events</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-[#15b392] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Create Event
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-gray-800">{totalEvents}</p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableEvents}</p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Full</p>
                <p className="text-2xl font-bold text-red-600">{fullEvents}</p>
              </div>
              <MapPin className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Calendar & Filters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Select Date</h2>
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
                          ? "bg-[#15b392] text-white shadow-md font-bold" 
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

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="text-gray-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search event, venue or court..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                />
              </div>

              {/* Sport Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sport Type</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedSport("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSport === "all"
                        ? "bg-[#15b392] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Sports
                  </button>
                  <button
                    onClick={() => setSelectedSport("tennis")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSport === "tennis"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    Tennis
                  </button>
                  <button
                    onClick={() => setSelectedSport("padel")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSport === "padel"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    Padel
                  </button>
                  <button
                    onClick={() => setSelectedSport("badminton")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSport === "badminton"
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    Badminton
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Event List */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {selectedDate ? `Events for ${format(selectedDate, "MMM dd, yyyy")}` : "All Available Events"}
            </h3>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const colors = sportColors[event.sport];
                  const isFull = event.currentPlayers >= event.maxPlayers;
                  const availableSlots = event.maxPlayers - event.currentPlayers;
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                        isFull
                          ? "border-red-200 bg-red-50"
                          : "border-green-200 bg-green-50"
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock size={14} />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span>{event.venue}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {event.court}
                          </div>
                        </div>
                        <span className={`${colors.badge} text-white px-2 py-1 rounded-md text-xs font-semibold uppercase`}>
                          {event.sport}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                          <DollarSign size={18} className="text-[#15b392]" />
                          {(event.price / 1000).toFixed(0)}k
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={16} />
                          <span className="font-semibold">{event.currentPlayers}/{event.maxPlayers}</span>
                        </div>
                      </div>

                      <button 
                        className={`w-full py-2.5 rounded-lg font-bold transition-all duration-200 ${
                          isFull
                            ? "bg-red-500 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white hover:shadow-lg"
                        }`}
                        disabled={isFull}
                      >
                        {isFull ? "FULL" : `Available ${availableSlots} ${availableSlots === 1 ? 'Slot' : 'Slots'}`}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No events available</p>
                  <p className="text-gray-400 text-sm">Try selecting a different date or adjusting filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && isModalOpen && (
        <EventDetailModal 
          event={selectedEvent}
          onClose={closeModal}
        />
      )}

      {/* Create Event Modal (Admin Only) */}
      {isCreateModalOpen && (
        <CreateEventModal 
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

// Event Detail Modal Component
function EventDetailModal({ event, onClose }: any) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const isFull = event.currentPlayers >= event.maxPlayers;
  const availableSlots = event.maxPlayers - event.currentPlayers;

  // Hardcoded templates
  const ourServices = [
    "Professional Equipment Rental",
    "Locker Room & Shower Facilities",
    "Free Parking Area",
    "On-site Cafe & Refreshments",
    "Pro Shop & Merchandise",
    "First Aid & Safety Equipment"
  ];

  const rules = [
    "Arrive 10 minutes before the scheduled start time",
    "Proper sports attire and non-marking shoes required",
    "Outside food and beverages are not permitted",
    `Maximum ${event.maxPlayers} players per session`,
    "Cancellation allowed up to 2 hours before start time",
    "Respect other players and maintain court etiquette",
    "Follow all venue safety guidelines and staff instructions"
  ];

  // Dummy registered players
  const registeredPlayers = [
    {
      id: 1,
      name: "John Doe",
      avatar: "JD",
      level: "Intermediate",
      gamesPlayed: 45,
      rating: 4.7,
      phone: "+62 812-3456-7890",
      email: "john.doe@email.com",
      joinedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      avatar: "SW",
      level: "Advanced",
      gamesPlayed: 78,
      rating: 4.9,
      phone: "+62 813-9876-5432",
      email: "sarah.w@email.com",
      joinedDate: "2023-11-20"
    }
  ].slice(0, event.currentPlayers);

  const confirmBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      setShowConfirmModal(false);
      onClose();
      alert("Booking confirmed! Check your email for details.");
    }, 2000);
  };

  const sportColors: Record<string, { badge: string }> = {
    tennis: { badge: "bg-blue-500" },
    padel: { badge: "bg-green-500" },
    badminton: { badge: "bg-orange-500" }
  };

  const colors = sportColors[event.sport] || sportColors.tennis;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-5xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Image & Info */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-semibold uppercase`}>
                        {event.sport}
                      </span>
                      <span className={`${isFull ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                        {isFull ? 'FULL' : 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Calendar className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="text-sm font-semibold text-gray-800">{format(event.date, "MMM dd, yyyy")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="text-sm font-semibold text-gray-800">{event.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Venue</div>
                          <div className="text-sm font-semibold text-gray-800">{event.venueName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Users className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Players</div>
                          <div className="text-sm font-semibold text-gray-800">{event.currentPlayers}/{event.maxPlayers}</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Booking Status</span>
                        <span className="font-semibold text-gray-800">
                          {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#15b392] to-[#2a6435] h-2 rounded-full transition-all"
                          style={{ width: `${(event.currentPlayers / event.maxPlayers) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm mb-2">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>

                {/* Our Services */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">Our Services</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ourServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                        <span className="text-xs font-medium text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">Booking Rules</h4>
                  <ul className="space-y-2">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-[#15b392] mt-0.5 font-bold">{index + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registered Players */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">
                    Registered Players ({event.currentPlayers}/{event.maxPlayers})
                  </h4>
                  <div className="space-y-3">
                    {registeredPlayers.map((player: any) => (
                      <div key={player.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {player.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-800 text-sm">{player.name}</h5>
                            <p className="text-xs text-gray-500">{player.level} • {player.gamesPlayed} games • ⭐ {player.rating}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate">{player.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: availableSlots }).map((_, index) => (
                      <div key={`empty-${index}`} className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-sm">Available Slot</p>
                            <p className="text-xs text-gray-400">Waiting for player to join</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">Booking Summary</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entry Fee</span>
                      <span className="font-semibold text-gray-800">Rp {event.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-semibold text-gray-800">Rp 10.000</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-lg text-[#15b392]">
                          Rp {(event.price + 10000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isFull}
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-200 mb-2 ${
                      isFull
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white hover:shadow-lg"
                    }`}
                  >
                    {isFull ? 'Event Full' : 'Join Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Booking</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-semibold text-gray-800">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-800">{format(event.date, "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-800">{event.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-[#15b392]">Rp {(event.price + 10000).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={isBooking}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBooking}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isBooking ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Create Event Modal (Admin Only)
function CreateEventModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    sport: "tennis",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    court: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    maxPlayers: 4,
    price: 150000,
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Event created successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Create New Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              placeholder="Morning Tennis Match"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({...formData, sport: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              >
                <option value="tennis">Tennis</option>
                <option value="padel">Padel</option>
                <option value="badminton">Badminton</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Players</label>
              <input
                type="number"
                required
                min="2"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value) || 2})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
            <input
              type="text"
              required
              value={formData.venueName}
              onChange={(e) => setFormData({...formData, venueName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              placeholder="Senayan Tennis Court"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.venueCity}
                onChange={(e) => setFormData({...formData, venueCity: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
                placeholder="Jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
              <input
                type="text"
                required
                value={formData.court}
                onChange={(e) => setFormData({...formData, court: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
                placeholder="Court 1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
            <input
              type="text"
              required
              value={formData.venueAddress}
              onChange={(e) => setFormData({...formData, venueAddress: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              placeholder="Jl. Pintu Satu Senayan"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Person (Rp)</label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392]"
              placeholder="Premium court with professional-grade surface..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}