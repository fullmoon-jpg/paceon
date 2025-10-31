// src/app/booking/components/EventDetailModal.tsx - FULL REPLACEMENT

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@paceon/lib/supabase";

interface BookingEvent {
  id: number | string;
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
}

interface RegisteredPlayer {
  id: number;
  name: string;
  avatar: string;
  avatarUrl?: string;
  position: string;
  company: string;
  networkingScore: number;
  email: string;
  joinedDate?: string;
}

interface EventDetailModalProps {
  event: BookingEvent | null;
  onClose: () => void;
  onJoin: () => void;
}

export default function EventDetailModal({ 
  event, 
  onClose,
  onJoin 
}: EventDetailModalProps) {
  if (!event) return null;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const isFull = event.currentPlayers >= event.maxPlayers;
  const availableSlots = event.maxPlayers - event.currentPlayers;

  useEffect(() => {
    const fetchRegisteredPlayers = async () => {
      setLoadingPlayers(true);
      try {
        const { data, error } = await supabase
          .rpc('get_event_players', { p_event_id: event.id });

        if (error) {
          console.error('Error fetching players:', error);
          setRegisteredPlayers([]);
          setLoadingPlayers(false);
          return;
        }

        if (!data || data.length === 0) {
          setRegisteredPlayers([]);
          setLoadingPlayers(false);
          return;
        }

        const players: RegisteredPlayer[] = data.map((row: any) => {
          const getInitials = (name: string) => {
            if (!name) return '??';
            const names = name.trim().split(' ');
            if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
          };

          return {
            id: row.booking_id,
            name: row.full_name || 'Anonymous Player',
            avatar: getInitials(row.full_name || '??'),
            avatarUrl: row.avatar_url || null,
            position: row.user_position || 'Not specified',
            company: row.company || 'Not specified',
            networkingScore: row.networking_score || 0,
            email: row.email || '',
            joinedDate: null,
          };
        });

        setRegisteredPlayers(players);
      } catch (err) {
        console.error('Error:', err);
        setRegisteredPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchRegisteredPlayers();
  }, [event.id]);

  const getServicesForEventType = (eventType: string) => {
    const sportServices = [
      "Professional Equipment Rental",
      "Locker Room & Shower Facilities",
      "Free Parking Area",
      "On-site Cafe & Refreshments",
      "Pro Shop & Merchandise",
      "First Aid & Safety Equipment",
    ];

    const networkingServices = [
      "Free Wi-Fi & Charging Stations",
      "Comfortable Seating Area",
      "Complimentary Beverages",
      "Networking Name Tags",
      "Photo Opportunities",
      "Event Materials & Resources",
    ];

    if (['coffee_chat', 'workshop', 'meetup', 'social'].includes(eventType)) {
      return networkingServices;
    }
    return sportServices;
  };

  const ourServices = getServicesForEventType(event.event_type);

  const rules = [
    "Arrive 10 minutes before the scheduled start time",
    event.event_type === 'coffee_chat' || event.event_type === 'meetup' 
      ? "Business casual attire recommended" 
      : "Proper attire required",
    `Maximum ${event.maxPlayers} participants per session`,
    "Cancellation allowed up to 2 hours before start time",
    "Respect other participants and maintain etiquette",
    "Follow all venue safety guidelines and staff instructions",
    "Photography policy: Ask for consent before taking photos",
  ];

  const confirmBooking = async () => {
    setIsBooking(true);
    setShowConfirmModal(false);
    
    try {
      await onJoin();
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const eventTypeColors: Record<string, { badge: string }> = {
    tennis: { badge: "bg-blue-500" },
    padel: { badge: "bg-green-500" },
    badminton: { badge: "bg-orange-500" },
    coffee_chat: { badge: "bg-amber-600" },
    workshop: { badge: "bg-yellow-500" },
    meetup: { badge: "bg-pink-500" },
    social: { badge: "bg-indigo-500" },
    other: { badge: "bg-gray-500" },
  };

  const colors = eventTypeColors[event.event_type] || eventTypeColors.other;

  const formatEventType = (eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10 rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Event Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Image & Info */}
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-semibold uppercase`}>
                        {formatEventType(event.event_type)}
                      </span>
                      <span className={`${isFull ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                        {isFull ? 'FULL' : 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{event.title}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <Calendar className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-white">
                            {format(event.date, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <Clock className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-white">{event.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <MapPin className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Venue</div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-white">{event.venueName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <Users className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Participants</div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-white">
                            {event.currentPlayers}/{event.maxPlayers}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="text-[#15b392] flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {event.venueAddress}, {event.venueCity}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Booking Status</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#15b392] to-[#2a6435] h-2 rounded-full transition-all"
                          style={{ width: `${(event.currentPlayers / event.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">Our Services</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ourServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">Event Rules</h4>
                  <ul className="space-y-2">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="text-[#15b392] mt-0.5 font-bold">{index + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registered Participants */}
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">
                    Registered Participants ({event.currentPlayers}/{event.maxPlayers})
                  </h4>
                  
                  {loadingPlayers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15b392] mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading participants...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registeredPlayers.length > 0 ? (
                        registeredPlayers.map((player) => (
                          <div key={player.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-[#15b392] transition-colors">
                            <div className="flex items-start gap-3">
                              {player.avatarUrl ? (
                                <img
                                  src={player.avatarUrl}
                                  alt={player.name}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {player.avatar}
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-800 dark:text-white text-sm">{player.name}</h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {player.position} • {player.company}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Networking Score:</span>
                                  <span className="text-xs font-semibold text-[#15b392]">
                                    {player.networkingScore}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                          No participants yet. Be the first!
                        </div>
                      )}

                      {availableSlots > 0 && Array.from({ length: availableSlots }).map((_, index) => (
                        <div key={`empty-${index}`} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users size={20} className="text-gray-400 dark:text-gray-300" />
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-300 font-medium text-sm">Available Slot</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">Waiting for participant to join</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sticky top-20">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">Booking Summary</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
                      <span className="font-semibold text-gray-800 dark:text-white">Rp {event.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                      <span className="font-semibold text-gray-800 dark:text-white">Rp 10.000</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800 dark:text-white">Total</span>
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
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white hover:shadow-lg'
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Confirm Booking</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Event</span>
                <span className="font-semibold text-gray-800 dark:text-white">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date</span>
                <span className="font-semibold text-gray-800 dark:text-white">{format(event.date, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time</span>
                <span className="font-semibold text-gray-800 dark:text-white">{event.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-bold text-[#15b392]">Rp {(event.price + 10000).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                ⏰ You will have <strong>12 hours</strong> to complete the payment after confirmation
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isBooking}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
