// src/app/booking/components/BookingCalendar.tsx
"use client";

import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  format,
  addMonths,
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useCallback } from "react";

interface Event {
  date: string | Date;
  [key: string]: unknown;
}

interface BookingCalendarProps {
  currentMonth: Date;
  selectedDate: Date | null;
  events: Event[];
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

export default function BookingCalendar({
  currentMonth,
  selectedDate,
  events,
  onMonthChange,
  onDateSelect,
}: BookingCalendarProps) {
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  );

  const getEventsForDate = useCallback((date: Date) => {
    return events.filter((event) => 
      isSameDay(new Date(event.date), date)
    );
  }, [events]);

  const handlePrevMonth = useCallback(() => {
    onMonthChange(subMonths(currentMonth, 1));
  }, [currentMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    onMonthChange(addMonths(currentMonth, 1));
  }, [currentMonth, onMonthChange]);

  const weekDays = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#3d4459]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#3F3E3D] dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} className="text-[#3F3E3D] dark:text-gray-300" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} className="text-[#3F3E3D] dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`
                relative p-3 rounded-lg text-center transition-all
                ${isSelected 
                  ? "bg-[#007aa6] text-white shadow-lg scale-105" 
                  : isCurrentDay
                    ? "bg-[#FB6F7A]/20 text-[#FB6F7A] font-bold border-2 border-[#FB6F7A]"
                    : "hover:bg-[#F4F4EF] dark:hover:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-200"
                }
              `}
              aria-label={`Select ${format(day, "MMMM d, yyyy")}`}
            >
              <div className="text-sm font-semibold">{format(day, "d")}</div>
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-[#F0C946]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}