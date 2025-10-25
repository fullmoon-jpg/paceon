// src/app/booking/components/BookingFilters.tsx
"use client";

import { Filter, Search } from "lucide-react";

interface BookingFiltersProps {
  selectedSport: string;
  searchQuery: string;
  onSportChange: (sport: string) => void;
  onSearchChange: (query: string) => void;
}

export default function BookingFilters({
  selectedSport,
  searchQuery,
  onSportChange,
  onSearchChange,
}: BookingFiltersProps) {
  // ✅ Updated: Complete event types list
  const eventTypes = [
    { id: "all", label: "All Events", color: "gray" },
    { id: "tennis", label: "Tennis", color: "blue" },
    { id: "padel", label: "Padel", color: "green" },
    { id: "badminton", label: "Badminton", color: "orange" },
    { id: "coffee_chat", label: "Coffee Chat", color: "amber" },
    { id: "workshop", label: "Workshop", color: "yellow" },
    { id: "meetup", label: "Meetup", color: "pink" },
    { id: "social", label: "Social", color: "indigo" },
    { id: "other", label: "Other", color: "slate" },
  ];

  // ✅ Color mapping helper
  const getColorClasses = (eventTypeId: string, isSelected: boolean) => {
    if (!isSelected) {
      return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }

    const colorMap: Record<string, string> = {
      all: "bg-gray-800 text-white shadow-md",
      tennis: "bg-blue-500 text-white shadow-md",
      padel: "bg-green-500 text-white shadow-md",
      badminton: "bg-orange-500 text-white shadow-md",
      coffee_chat: "bg-amber-600 text-white shadow-md",
      workshop: "bg-yellow-500 text-white shadow-md",
      meetup: "bg-pink-500 text-white shadow-md",
      social: "bg-indigo-500 text-white shadow-md",
      other: "bg-slate-500 text-white shadow-md",
    };

    return colorMap[eventTypeId] || colorMap.all;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search events, venues, or locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15b392] focus:border-transparent transition-all"
        />
      </div>

      {/* Event Type Filters */}
      <div className="flex items-start gap-2">
        <Filter size={18} className="text-gray-500 flex-shrink-0 mt-2" />
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType.id}
              onClick={() => onSportChange(eventType.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                flex items-center gap-2
                ${getColorClasses(eventType.id, selectedSport === eventType.id)}
              `}
            >
              <span>{eventType.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
