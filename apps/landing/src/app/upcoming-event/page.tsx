'use client';

import { useState } from 'react';
import Footer from '../ui/footer';

// Event Data
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  locationDetail: string;
  description: string;
  subtitle: string;
  category: 'LOOP' | 'Talk n Tales' | 'LEAP';
  status: 'upcoming' | 'past' | 'coming-soon';
  featured: boolean;
}

const allEvents: Event[] = [
  {
    id: 'loop-feb-2026',
    title: 'LOOP SERIES: How to Build Content Like a Creator',
    subtitle: 'Business class - A space for young people to learn business.',
    date: '7 Februari 2026',
    time: '08:30 - 13:30 WIB',
    location: 'Kopikina Cikini',
    locationDetail: 'Jl. Raden Saleh Raya No.66, RT.1/RW.2, Cikini, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta',
    description: 'Learn the secrets of content creation from successful creators. Discover how to build engaging content, grow your audience, and monetize your creative work.',
    category: 'LOOP',
    status: 'upcoming',
    featured: true
  },
  {
    id: 'tales-dec-2025',
    title: 'Talk n Tales',
    subtitle: '',
    date: '13 Desember 2025',
    time: '15.00 - 22:00 WIB',
    location: 'DeepSpace by Pemimpin.id',
    locationDetail: 'Kec. Kby. Baru, Kota Jakarta Selatan, Jakarta',
    description: '',
    category: 'Talk n Tales',
    status: 'past',
    featured: false
  },
  {
    id: 'tales-apr-2026',
    title: 'Talk-n-Tales',
    subtitle: '',
    date: 'TBA',
    time: 'TBA',
    location: 'TBA',
    locationDetail: 'Location will be announced soon',
    description: '',
    category: 'Talk n Tales',
    status: 'coming-soon',
    featured: false
  },
  {
    id: 'leap-sep-2026',
    title: 'LEAP',
    subtitle: '',
    date: 'TBA',
    time: 'TBA',
    location: 'TBA',
    locationDetail: 'Location will be announced soon',
    description: '',
    category: 'LEAP',
    status: 'coming-soon',
    featured: false
  }
];

type FilterType = 'all' | 'upcoming' | 'past' | 'coming-soon';

export default function UpcomingEventPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleRegister = (eventId: string) => {
    window.open('https://paceon.id/LOOP', '_blank');
  };

  const filteredEvents = activeFilter === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.status === activeFilter);

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All Events', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past Events', value: 'past' },
    { label: 'Coming Soon', value: 'coming-soon' }
  ];

  return (
    <div className="min-h-screen bg-[#f4f4ef]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#007AA6] to-[#1a5f7a] py-20 sm:py-28">
        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-28 text-center text-white z-10">
          <div className="inline-block mb-6 transform -skew-y-1">
            <p className="font-body text-lg sm:text-xl text-white/90 mb-3">
              What's Coming Up?
            </p>
            <div className="bg-[#F0C946] px-12 py-4">
              <h1 className="font-brand text-4xl sm:text-5xl md:text-6xl text-[#3f3e3d] transform skew-y-1">
                OUR EVENTS
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-28 bg-white border-b-2 border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setActiveFilter(button.value)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeFilter === button.value
                    ? 'bg-[#FB6F7A] text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12 px-4 sm:px-6 lg:px-28">
        <div className="max-w-5xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎪</div>
              <h3 
                className="text-3xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
              >
                No Events Yet
              </h3>
              <p 
                className="text-xl text-gray-600"
                style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
              >
                Stay tuned! We're cooking up something special.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredEvents.map((event, index) => (
                <div key={event.id}>
                  <div className="py-12">
                    {/* Status Badge */}
                    <div className="mb-4">
                      <span 
                        className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          event.status === 'upcoming' 
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'past'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                        style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                      >
                        {event.status === 'upcoming' ? '🔥 UPCOMING' : event.status === 'past' ? 'PAST EVENT' : 'COMING SOON'}
                      </span>
                    </div>

                    {/* Event Title */}
                    <h2 
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4"
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.title}
                    </h2>

                    {/* Event Subtitle */}
                    <p 
                      className="text-lg sm:text-xl text-gray-600 mb-6"
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.subtitle}
                    </p>

                    {/* Event Description */}
                    <p 
                      className="text-base sm:text-lg text-gray-800 mb-8 font-semibold"
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.description}
                    </p>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Date & Time */}
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <svg className="w-6 h-6 text-[#FB6F7A] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                              {event.date}
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <svg className="w-6 h-6 text-[#FB6F7A] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                              {event.location}
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                              {event.locationDetail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {event.status === 'upcoming' && (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="inline-flex items-center gap-3 bg-[#FB6F7A] hover:bg-[#D33181] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                        style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                      >
                        <span className="text-lg">SAVE YOUR SEAT</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {event.status === 'coming-soon' && (
                      <div
                        className="inline-block px-8 py-4 bg-gray-300 text-gray-600 font-bold rounded-full"
                        style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                      >
                        <span className="text-lg">DETAILS COMING SOON</span>
                      </div>
                    )}
                  </div>

                  {/* Separator Line - Only show if not last item */}
                  {index < filteredEvents.length - 1 && (
                    <div className="border-t-2 border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-28 bg-gradient-to-br from-[#5F0101] to-[#8B0000]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl sm:text-5xl font-black text-white mb-6"
            style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
          >
            DON'T SEE YOUR VIBE YET?
          </h2>
          <p 
            className="text-xl text-white/90 mb-8"
            style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
          >
            We will update soon.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#21C36E] hover:bg-[#1BA55E] text-white font-bold px-10 py-5 rounded-full text-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
          >
            BACK TO HOME
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}