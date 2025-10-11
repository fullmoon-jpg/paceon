"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  Users,
  Star,
  X,
  CheckCircle,
  User,
  Trophy,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  Info
} from "lucide-react";

interface Player {
  id: number;
  name: string;
  avatar: string;
  level: string;
  gamesPlayed: number;
  rating: number;
  isHost: boolean;
  phone: string;
  email: string;
  joinedDate: string;
}

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number;
    date: Date;
    time: string;
    venue: string;
    court: string;
    sport: string;
    status: string;
    price: number;
    maxPlayers?: number;
    currentPlayers?: number;
    description?: string;
    amenities?: string[];
    courtImage?: string;
    venueRating?: number;
    totalReviews?: number;
    rules?: string[];
  };
}

export default function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  if (!isOpen) return null;

  // Default values
  const maxPlayers = booking.maxPlayers || 4;
  const currentPlayers = booking.currentPlayers || 2;
  const description = booking.description || "Premium court with professional-grade surface. Perfect lighting for day and night games. Includes locker rooms and shower facilities.";
  const amenities = booking.amenities || ["Locker Room", "Shower", "Parking", "Cafe", "Pro Shop"];
  const courtImage = booking.courtImage || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800";
  const venueRating = booking.venueRating || 4.8;
  const totalReviews = booking.totalReviews || 156;
  const rules = booking.rules || [
    "Arrive 10 minutes before booking time",
    "Proper sports attire required",
    "No outside food or drinks",
    `Maximum ${maxPlayers} players per court`,
    "Cancellation allowed up to 2 hours before"
  ];

  // Registered players
  const registeredPlayers: Player[] = [
    {
      id: 1,
      name: "John Doe",
      avatar: "JD",
      level: "Intermediate",
      gamesPlayed: 45,
      rating: 4.7,
      isHost: true,
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
      isHost: false,
      phone: "+62 813-9876-5432",
      email: "sarah.w@email.com",
      joinedDate: "2023-11-20"
    }
  ];

  const sportColors: Record<string, { bg: string; text: string; badge: string; light: string }> = {
    tennis: { bg: "bg-blue-500", text: "text-blue-700", badge: "bg-blue-500", light: "bg-blue-50" },
    padel: { bg: "bg-green-500", text: "text-green-700", badge: "bg-green-500", light: "bg-green-50" },
    badminton: { bg: "bg-orange-500", text: "text-orange-700", badge: "bg-orange-500", light: "bg-orange-50" }
  };

  const colors = sportColors[booking.sport] || sportColors.tennis;
  const availableSlots = maxPlayers - currentPlayers;

  const handleBookNow = () => {
    setShowConfirmModal(true);
  };

  const confirmBooking = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setShowConfirmModal(false);
      onClose();
      alert("Booking confirmed! Check your email for details.");
    }, 2000);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-6xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Court Image & Basic Info */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={courtImage} 
                      alt={booking.venue}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-semibold uppercase`}>
                        {booking.sport}
                      </span>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        AVAILABLE
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.venue}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{venueRating}</span>
                          <span>({totalReviews} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="flex items-center gap-1 text-xl font-bold text-[#15b392]">
                          <DollarSign size={20} />
                          {(booking.price / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Calendar className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="text-sm font-semibold text-gray-800">{format(booking.date, "MMM dd, yyyy")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="text-sm font-semibold text-gray-800">{booking.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Court</div>
                          <div className="text-sm font-semibold text-gray-800">{booking.court}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Users className="text-[#15b392]" size={16} />
                        <div>
                          <div className="text-xs text-gray-500">Players</div>
                          <div className="text-sm font-semibold text-gray-800">{currentPlayers}/{maxPlayers}</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Booking Status</span>
                        <span className="font-semibold text-gray-800">
                          {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#15b392] to-[#2a6435] h-2 rounded-full transition-all"
                          style={{ width: `${(currentPlayers / maxPlayers) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">Description</h4>
                      <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <Info className="text-[#15b392]" size={16} />
                    Amenities & Facilities
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <AlertCircle className="text-orange-500" size={16} />
                    Booking Rules
                  </h4>
                  <ul className="space-y-1">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-[#15b392] mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registered Players */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <Users className="text-[#15b392]" size={16} />
                    Registered Players ({currentPlayers}/{maxPlayers})
                  </h4>
                  <div className="space-y-3">
                    {registeredPlayers.map((player) => (
                      <div key={player.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {player.avatar}
                            </div>
                            {player.isHost && (
                              <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                                <Shield size={10} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-gray-800 text-sm">{player.name}</h5>
                                  {player.isHost && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                      Host
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{player.level}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-semibold text-gray-700">{player.rating}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Trophy size={12} className="text-[#15b392]" />
                                <span>{player.gamesPlayed} games</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined {format(new Date(player.joinedDate), "MMM yyyy")}
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex gap-2">
                              <a 
                                href={`tel:${player.phone}`}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                              >
                                <Phone size={10} />
                                <span className="truncate">{player.phone}</span>
                              </a>
                              <a 
                                href={`mailto:${player.email}`}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 truncate"
                              >
                                <Mail size={10} />
                                <span className="truncate">{player.email}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: availableSlots }).map((_, index) => (
                      <div key={`empty-${index}`} className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-500 font-medium text-sm">Available Slot</p>
                            <p className="text-xs text-gray-400">Waiting for player to join</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Section - Booking Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Booking Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Court Fee</span>
                        <span className="font-semibold text-gray-800">Rp {booking.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-semibold text-gray-800">Rp 10.000</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-800 text-sm">Total</span>
                          <span className="font-bold text-lg text-[#15b392]">
                            Rp {(booking.price + 10000).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={handleBookNow}
                      className="w-full bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-2.5 rounded-lg font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle size={18} />
                      Book Now
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                      Add to Wishlist
                    </button>
                  </div>

                  {/* Quick Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-semibold mb-1">Quick Info</p>
                        <p>You can cancel this booking up to 2 hours before the start time for a full refund.</p>
                      </div>
                    </div>
                  </div>
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
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Booking</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to book this court session?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-semibold text-gray-800">{booking.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-800">{format(booking.date, "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-800">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-[#15b392]">Rp {(booking.price + 10000).toLocaleString()}</span>
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
                className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}