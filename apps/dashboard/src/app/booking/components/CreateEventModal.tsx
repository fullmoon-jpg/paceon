// src/app/booking/components/CreateEventModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { getEventImage } from "@/lib/eventImages";

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  price: number;
  image: string;
}

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit?: (eventData: EventFormData) => void | Promise<void>;
}

export default function CreateEventModal({ onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "tennis",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    date: "",
    startTime: "",
    endTime: "",
    maxPlayers: 4,
    price: 50000,
    image: getEventImage("tennis"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    { value: 'tennis', label: 'Tennis' },
    { value: 'padel', label: 'Padel' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'coffee_chat', label: 'Coffee Chat' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'social', label: 'Social Event' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      image: getEventImage(prev.eventType),
    }));
  }, [formData.eventType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (onSubmit) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxPlayers" || name === "price" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-[#15b392]" />
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Morning Tennis Session"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your event..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Type *
              </label>
              <select
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-[#15b392]" />
              Venue Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                name="venueName"
                required
                value={formData.venueName}
                onChange={handleChange}
                placeholder="e.g., MMS Arena"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                name="venueCity"
                required
                value={formData.venueCity}
                onChange={handleChange}
                placeholder="e.g., Jakarta"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="venueAddress"
                required
                value={formData.venueAddress}
                onChange={handleChange}
                placeholder="Full address"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-[#15b392]" />
              Date & Time
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-[#15b392]" />
              Participants & Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Participants *
                </label>
                <input
                  type="number"
                  name="maxPlayers"
                  required
                  min="2"
                  max="50"
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price per Person (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Rp {formData.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Rp 10.000</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800 dark:text-white">Total per Person</span>
                  <span className="font-bold text-[#15b392] dark:text-green-400">
                    Rp {(formData.price + 10000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}