// src/app/booking/components/EventDetailModal.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "@paceon/lib/supabase";
import Image from "next/image";

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

interface PlayerRow {
  booking_id: number;
  full_name: string | null;
  avatar_url: string | null;
  user_position: string | null;
  company: string | null;
  networking_score: number | null;
  email: string | null;
}

export default function EventDetailModal({ 
  event, 
  onClose,
  onJoin 
}: EventDetailModalProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const isFull = useMemo(() => 
    event ? event.currentPlayers >= event.maxPlayers : false,
    [event]
  );

  const availableSlots = useMemo(() => 
    event ? event.maxPlayers - event.currentPlayers : 0,
    [event]
  );

  const getInitials = useCallback((name: string) => {
    if (!name) return '??';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, []);

  const fetchRegisteredPlayers = useCallback(async () => {
    if (!event) return;

    setLoadingPlayers(true);
    try {
      const { data, error } = await supabase
        .rpc('get_event_players', { p_event_id: event.id });

      if (error) {
        console.error('Error fetching players:', error);
        setRegisteredPlayers([]);
        return;
      }

      if (!data || data.length === 0) {
        setRegisteredPlayers([]);
        return;
      }

      const players: RegisteredPlayer[] = (data as PlayerRow[]).map((row) => ({
        id: row.booking_id,
        name: row.full_name || 'Anonymous Player',
        avatar: getInitials(row.full_name || '??'),
        avatarUrl: row.avatar_url || undefined,
        position: row.user_position || 'Not specified',
        company: row.company || 'Not specified',
        networkingScore: row.networking_score || 0,
        email: row.email || '',
        joinedDate: undefined,
      }));

      setRegisteredPlayers(players);
    } catch (err) {
      console.error('Error:', err);
      setRegisteredPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }, [event, getInitials]);

  useEffect(() => {
    if (event) {
      fetchRegisteredPlayers();
    }
  }, [event, fetchRegisteredPlayers]);

  const getServicesForEventType = useCallback((eventType: string) => {
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
  }, []);

  const confirmBooking = useCallback(async () => {
    setIsBooking(true);
    setShowConfirmModal(false);
    
    try {
      await onJoin();
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete booking. Please try again.';
      alert(errorMessage);
    } finally {
      setIsBooking(false);
    }
  }, [onJoin]);

  const eventTypeColors: Record<string, { badge: string }> = useMemo(() => ({
    tennis: { badge: "bg-[#007AA6]" },
    padel: { badge: "bg-[#21C36E]" },
    badminton: { badge: "bg-[#F47A49]" },
    coffee_chat: { badge: "bg-[#F0C946]" },
    workshop: { badge: "bg-[#FB6F7A]" },
    meetup: { badge: "bg-[#D33181]" },
    social: { badge: "bg-[#007AA6]" },
    other: { badge: "bg-gray-500" },
  }), []);

  const formatEventType = useCallback((eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!event) return null;

  const colors = eventTypeColors[event.event_type] || eventTypeColors.other;
  const ourServices = getServicesForEventType(event.event_type);
  
  const rules = useMemo(() => [
    "Arrive 10 minutes before the scheduled start time",
    event.event_type === 'coffee_chat' || event.event_type === 'meetup' 
      ? "Business casual attire recommended" 
      : "Proper attire required",
    `Maximum ${event.maxPlayers} participants per session`,
    "Cancellation allowed up to 2 hours before start time",
    "Respect other participants and maintain etiquette",
    "Follow all venue safety guidelines and staff instructions",
    "Photography policy: Ask for consent before taking photos",
  ], [event.event_type, event.maxPlayers]);

  const totalPrice = event.price + 10000;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-[#242837] rounded-xl max-w-5xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#242837] border-b border-gray-200 dark:border-[#3d4459] p-4 flex items-center justify-between z-10 rounded-t-xl">
            <h2 className="text-xl font-bold text-[#3F3E3D] dark:text-white">Event Details</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={24} className="text-[#3F3E3D] dark:text-gray-300" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Image & Info */}
                <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] overflow-hidden">
                  <div className="relative h-48">
                    {/* Using regular img to avoid Next.js Image config issues */}
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-semibold uppercase`}>
                        {formatEventType(event.event_type)}
                      </span>
                      <span className={`${isFull ? 'bg-[#FB6F7A]' : 'bg-[#21C36E]'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                        {isFull ? 'FULL' : 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white mb-3">{event.title}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-2 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg">
                        <Calendar className="text-[#FB6F7A]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                          <div className="text-sm font-semibold text-[#3F3E3D] dark:text-white">
                            {format(event.date, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg">
                        <Clock className="text-[#FB6F7A]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                          <div className="text-sm font-semibold text-[#3F3E3D] dark:text-white">{event.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg">
                        <MapPin className="text-[#FB6F7A]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Venue</div>
                          <div className="text-sm font-semibold text-[#3F3E3D] dark:text-white">{event.venueName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg">
                        <Users className="text-[#FB6F7A]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Participants</div>
                          <div className="text-sm font-semibold text-[#3F3E3D] dark:text-white">
                            {event.currentPlayers}/{event.maxPlayers}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-[#F4F4EF] dark:bg-[#3d4459] rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="text-[#FB6F7A] flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                          <div className="text-sm font-medium text-[#3F3E3D] dark:text-white">
                            {event.venueAddress}, {event.venueCity}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Booking Status</span>
                        <span className="font-semibold text-[#3F3E3D] dark:text-white">
                          {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#3d4459] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#21C36E] to-[#007AA6] h-2 rounded-full transition-all"
                          style={{ width: `${(event.currentPlayers / event.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#3F3E3D] dark:text-white text-sm mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] p-4">
                  <h4 className="font-bold text-[#3F3E3D] dark:text-white mb-3 text-sm">Our Services</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ourServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-[#21C36E]/10 rounded-lg">
                        <div className="w-2 h-2 bg-[#21C36E] rounded-full flex-shrink-0" />
                        <span className="text-xs font-medium text-[#3F3E3D] dark:text-gray-300">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] p-4">
                  <h4 className="font-bold text-[#3F3E3D] dark:text-white mb-3 text-sm">Event Rules</h4>
                  <ul className="space-y-2">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="text-[#FB6F7A] mt-0.5 font-bold">{index + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registered Participants */}
                <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] p-4">
                  <h4 className="font-bold text-[#3F3E3D] dark:text-white mb-3 text-sm">
                    Registered Participants ({event.currentPlayers}/{event.maxPlayers})
                  </h4>
                  
                  {loadingPlayers ? (
                    <div className="text-center py-8">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 rounded-full">
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-[#FB6F7A]" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading participants...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registeredPlayers.length > 0 ? (
                        registeredPlayers.map((player) => (
                          <div key={player.id} className="border border-gray-200 dark:border-[#3d4459] rounded-lg p-3 hover:border-[#FB6F7A] transition-colors">
                            <div className="flex items-start gap-3">
                              {player.avatarUrl ? (
                                <img
                                  src={player.avatarUrl}
                                  alt={player.name}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-[#FB6F7A] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {player.avatar}
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-[#3F3E3D] dark:text-white text-sm">{player.name}</h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {player.position} • {player.company}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Networking Score:</span>
                                  <span className="text-xs font-semibold text-[#21C36E]">
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
                        <div key={`empty-${index}`} className="border-2 border-dashed border-gray-300 dark:border-[#3d4459] rounded-lg p-3 bg-[#F4F4EF] dark:bg-[#3d4459]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-[#4a5166] rounded-full flex items-center justify-center flex-shrink-0">
                              <Users size={20} className="text-gray-400 dark:text-gray-500" />
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
                <div className="bg-white dark:bg-[#2d3548] rounded-xl border border-gray-200 dark:border-[#3d4459] p-4 sticky top-20">
                  <h4 className="font-bold text-[#3F3E3D] dark:text-white mb-3 text-sm">Booking Summary</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
                      <span className="font-semibold text-[#3F3E3D] dark:text-white">Rp {event.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                      <span className="font-semibold text-[#3F3E3D] dark:text-white">Rp 10.000</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-[#3d4459] pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#3F3E3D] dark:text-white">Total</span>
                        <span className="font-bold text-lg text-[#FB6F7A]">
                          Rp {totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isFull}
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-200 mb-2 ${
                      isFull
                        ? 'bg-gray-300 dark:bg-[#3d4459] text-gray-500 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FB6F7A] to-[#D33181] text-white hover:shadow-lg'
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-[#242837] rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white mb-4 text-center">Confirm Booking</h3>
            
            <div className="bg-[#F4F4EF] dark:bg-[#2d3548] rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Event</span>
                <span className="font-semibold text-[#3F3E3D] dark:text-white">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date</span>
                <span className="font-semibold text-[#3F3E3D] dark:text-white">{format(event.date, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time</span>
                <span className="font-semibold text-[#3F3E3D] dark:text-white">{event.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-bold text-[#FB6F7A]">Rp {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#F0C946]/20 border border-[#F0C946] rounded-lg p-3 mb-4">
              <p className="text-xs text-[#3F3E3D] dark:text-white">
                ⏰ You will have <strong>12 hours</strong> to complete the payment after confirmation
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isBooking}
                className="flex-1 bg-[#F4F4EF] dark:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-[#4a5166] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-[#FB6F7A] to-[#D33181] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Confirm'}
              </button>
            </div>
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
    </>
  );
}