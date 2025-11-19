// src/app/booking/components/BookingFilters.tsx
"use client";

import { Filter, Search } from "lucide-react";
import { useMemo, useCallback } from "react";

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
  const eventTypes = useMemo(
    () => [
      { id: "all", label: "All Events", color: "gray" },
      { id: "tennis", label: "Tennis", color: "blue" },
      { id: "padel", label: "Padel", color: "green" },
      { id: "badminton", label: "Badminton", color: "orange" },
      { id: "coffee_chat", label: "Coffee Chat", color: "amber" },
      { id: "workshop", label: "Workshop", color: "yellow" },
      { id: "meetup", label: "Meetup", color: "pink" },
      { id: "social", label: "Social", color: "indigo" },
      { id: "other", label: "Other", color: "slate" },
    ],
    []
  );

  const getColorClasses = useCallback((eventTypeId: string, isSelected: boolean) => {
    if (!isSelected) {
      return "bg-[#F4F4EF] dark:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#4a5166]";
    }

    const colorMap: Record<string, string> = {
      all: "bg-[#3F3E3D] dark:bg-[#4a5166] text-white shadow-lg",
      tennis: "bg-[#007AA6] text-white shadow-lg",
      padel: "bg-[#21C36E] text-white shadow-lg",
      badminton: "bg-[#F47A49] text-white shadow-lg",
      coffee_chat: "bg-[#F0C946] text-[#3F3E3D] shadow-lg",
      workshop: "bg-[#FB6F7A] text-white shadow-lg",
      meetup: "bg-[#D33181] text-white shadow-lg",
      social: "bg-[#007AA6] text-white shadow-lg",
      other: "bg-gray-500 text-white shadow-lg",
    };

    return colorMap[eventTypeId] || colorMap.all;
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg border border-gray-200 dark:border-[#3d4459] p-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
        <input
          type="text"
          placeholder="Search events, venues, or locations..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-[#3d4459] rounded-lg bg-white dark:bg-[#242837] text-[#3F3E3D] dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent transition-all"
        />
      </div>

      {/* Event Type Filters */}
      <div className="flex items-start gap-2">
        <Filter size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0 mt-2" />
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType.id}
              onClick={() => onSportChange(eventType.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                ${getColorClasses(eventType.id, selectedSport === eventType.id)}
              `}
            >
              {eventType.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}