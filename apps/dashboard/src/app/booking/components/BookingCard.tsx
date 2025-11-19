// src/app/booking/components/BookingCard.tsx
"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useCallback } from "react";

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
  const isFull = useMemo(
    () => event.currentPlayers >= event.maxPlayers,
    [event.currentPlayers, event.maxPlayers]
  );

  const availableSlots = useMemo(
    () => event.maxPlayers - event.currentPlayers,
    [event.maxPlayers, event.currentPlayers]
  );

  const progressPercentage = useMemo(
    () => (event.currentPlayers / event.maxPlayers) * 100,
    [event.currentPlayers, event.maxPlayers]
  );

  const eventTypeColors: Record<string, { gradient: string; badge: string }> = useMemo(
    () => ({
      tennis: { gradient: "from-[#007AA6] to-[#005f7f]", badge: "bg-[#007AA6]" },
      padel: { gradient: "from-[#21C36E] to-[#1a9d57]", badge: "bg-[#21C36E]" },
      badminton: { gradient: "from-[#F47A49] to-[#d65a2f]", badge: "bg-[#F47A49]" },
      coffee_chat: { gradient: "from-[#F0C946] to-[#d4ad2f]", badge: "bg-[#F0C946]" },
      workshop: { gradient: "from-[#FB6F7A] to-[#d64d5a]", badge: "bg-[#FB6F7A]" },
      meetup: { gradient: "from-[#D33181] to-[#a82664]", badge: "bg-[#D33181]" },
      social: { gradient: "from-[#007AA6] to-[#005f7f]", badge: "bg-[#007AA6]" },
      other: { gradient: "from-gray-500 to-gray-700", badge: "bg-gray-500" },
    }),
    []
  );

  const colors = useMemo(
    () => eventTypeColors[event.event_type] || eventTypeColors.other,
    [event.event_type, eventTypeColors]
  );

  const formatEventType = useCallback((eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const formattedDate = useMemo(
    () => format(new Date(event.date), 'EEE, MMM dd, yyyy'),
    [event.date]
  );

  const handleClick = useCallback(() => onClick(), [onClick]);

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-200 dark:border-[#3d4459] hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {/* Using regular img to avoid Next.js config issues */}
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
            {formatEventType(event.event_type)}
          </span>
          <span className={`${isFull ? 'bg-[#FB6F7A]' : 'bg-[#21C36E]'} text-white px-3 py-1 rounded-full text-xs font-bold`}>
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
            <Calendar size={16} className="text-[#f47a46] flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock size={16} className="text-[#f47a46] flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-[#f47a46] flex-shrink-0" />
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
            <span className="font-semibold text-[#3F3E3D] dark:text-white">
              {event.currentPlayers}/{event.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#3d4459] rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} remaining
          </p>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg text-[#3F3E3D] dark:text-white">
              Rp {event.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/person</span>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isFull
                ? 'bg-gray-300 dark:bg-[#3d4459] text-gray-500 dark:text-gray-500 cursor-not-allowed'
                : 'bg-[#FB6F7A] text-white hover:shadow-lg'
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