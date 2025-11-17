// src/app/booking/components/BookingCard.tsx
"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  event_type: string;
  image: string;
  date: string | Date;
  time: string;
  venueName: string;
  venueCity: string;
  currentPlayers: number;
  maxPlayers: number;
  price: number;
  [key: string]: unknown;
}

interface BookingCardProps {
  event: Event;
  onClick: () => void;
}

export default function BookingCard({ event, onClick }: BookingCardProps) {
  const isFull = event.currentPlayers >= event.maxPlayers;
  const availableSlots = event.maxPlayers - event.currentPlayers;

  const eventTypeColors: Record<string, { bg: string; badge: string }> = {
    tennis: { bg: "from-blue-500 to-blue-700", badge: "bg-blue-500" },
    padel: { bg: "from-green-500 to-green-700", badge: "bg-green-500" },
    badminton: { bg: "from-orange-500 to-orange-700", badge: "bg-orange-500" },
    coffee_chat: { bg: "from-amber-600 to-amber-800", badge: "bg-amber-600" }, 
    workshop: { bg: "from-yellow-500 to-yellow-700", badge: "bg-yellow-500" },
    meetup: { bg: "from-pink-500 to-pink-700", badge: "bg-pink-500" },
    social: { bg: "from-indigo-500 to-indigo-700", badge: "bg-indigo-500" },
    other: { bg: "from-gray-500 to-gray-700", badge: "bg-gray-500" },
  };

  const colors = eventTypeColors[event.event_type] || eventTypeColors.other;

  const formatEventType = (eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-700"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
            {formatEventType(event.event_type)}
          </span>
          <span className={`${isFull ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {isFull ? 'FULL' : 'OPEN'}
          </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg line-clamp-1">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16} className="text-[#15b392] flex-shrink-0" />
            <span>{format(new Date(event.date), 'EEE, MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock size={16} className="text-[#15b392] flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-[#15b392] flex-shrink-0" />
            <span className="line-clamp-1">{event.venueName}, {event.venueCity}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Users size={14} />
              Participants
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {event.currentPlayers}/{event.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all`}
              style={{ width: `${(event.currentPlayers / event.maxPlayers) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              Rp {event.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/person</span>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isFull
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white hover:shadow-md'
            }`}
            disabled={isFull}
          >
            {isFull ? 'Full' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
