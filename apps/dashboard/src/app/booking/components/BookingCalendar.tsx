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

interface BookingCalendarProps {
  currentMonth: Date;
  selectedDate: Date | null;
  events: any[];
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
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => 
      isSameDay(new Date(event.date), date)
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                  ? "bg-gradient-to-br from-[#15b392] to-[#2a6435] text-white shadow-md" 
                  : isCurrentDay
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                }
              `}
            >
              <div className="text-sm font-semibold">{format(day, "d")}</div>
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-[#15b392]"
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
