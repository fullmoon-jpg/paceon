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
    id: 'tales-apr-2026',
    title: 'Talk n Tales #2',
    subtitle: 'The Next Chapter of Our Stories',
    date: '9 Mei 2026',
    time: '14.00-19.30',
    location: 'Mantra Space',
    locationDetail: 'South Jakarta',
    description: 'Get ready for the second edition of Talk n Tales. More exciting, deeper conversations, and a bigger community gathering. Stay tuned!',
    category: 'Talk n Tales',
    status: 'upcoming',
    featured: true
  },
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
    status: 'past',
    featured: false
  },
  {
    id: 'tales-dec-2025',
    title: 'Talk n Tales',
    subtitle: 'First Edition',
    date: '13 Desember 2025',
    time: '15.00 - 22:00 WIB',
    location: 'DeepSpace by Pemimpin.id',
    locationDetail: 'Kec. Kby. Baru, Kota Jakarta Selatan, Jakarta',
    description: 'Our successful first edition where we gathered to share stories, insights, and build meaningful connections.',
    category: 'Talk n Tales',
    status: 'past',
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
    window.open('https://paceon.id/Talk-n-Tales/registrationform', '_blank');
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
      {/* --- CSS KHUSUS ANIMASI API GACOR --- */}
      <style jsx>{`
        @keyframes flame-flicker {
          0%, 100% { opacity: 1; transform: scale(1) rotate(-5deg); text-shadow: 0 0 8px rgba(255,100,0,0.8); }
          50% { opacity: 0.8; transform: scale(1.15) rotate(5deg); text-shadow: 0 0 15px rgba(255,0,0,1); }
        }
        .api-gacor {
          display: inline-block;
          animation: flame-flicker 0.8s infinite alternate ease-in-out;
        }
        .glowing-border {
          box-shadow: 0 0 20px rgba(251, 111, 122, 0.15);
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#007AA6] to-[#1a5f7a] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-28 text-center text-white z-10">
          <div className="inline-block mb-6 transform -skew-y-1 transition-transform hover:scale-105 duration-500">
            <p className="font-body text-lg sm:text-xl text-white/90 mb-3 tracking-wider font-semibold">
              What&apos;s Coming Up?
            </p>
            <div className="bg-[#F0C946] px-12 py-4 shadow-xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl text-[#3f3e3d] transform skew-y-1 font-black tracking-tight">
                OUR EVENTS
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-28 bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setActiveFilter(button.value)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeFilter === button.value
                    ? 'bg-[#FB6F7A] text-white shadow-lg shadow-[#FB6F7A]/30 scale-105 transform'
                    : 'bg-[#f4f4ef] text-gray-600 hover:bg-gray-200 hover:text-gray-900'
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
      <section className="py-16 px-4 sm:px-6 lg:px-28">
        <div className="max-w-4xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4 animate-bounce">🎪</div>
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
                Stay tuned! We&apos;re cooking up something special.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={`bg-white rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group ${
                    event.status === 'upcoming' ? 'border-2 border-[#FB6F7A]/30 glowing-border' : 'border border-gray-100'
                  }`}
                >
                  {/* Accent Line for Card */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${
                    event.status === 'upcoming' ? 'bg-[#FB6F7A]' : event.status === 'past' ? 'bg-gray-300' : 'bg-[#F0C946]'
                  }`}></div>

                  {/* Status Badge */}
                  <div className="mb-6">
                    <span 
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm ${
                        event.status === 'upcoming' 
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-red-700 border border-red-200'
                          : event.status === 'past'
                          ? 'bg-gray-100 text-gray-600 border border-gray-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.status === 'upcoming' && <span className="api-gacor text-lg">🔥</span>}
                      {event.status === 'upcoming' 
                        ? 'UPCOMING EVENT' 
                        : event.status === 'past' 
                        ? 'PAST EVENT' 
                        : 'COMING SOON'}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight group-hover:text-[#007AA6] transition-colors duration-300"
                    style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                  >
                    {event.title}
                  </h2>

                  {/* Event Subtitle */}
                  {event.subtitle && (
                    <p 
                      className="text-lg sm:text-xl text-[#FB6F7A] font-bold mb-6"
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.subtitle}
                    </p>
                  )}

                  {/* Event Description */}
                  {event.description && (
                    <p 
                      className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed"
                      style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                    >
                      {event.description}
                    </p>
                  )}

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-[#f4f4ef]/50 p-6 rounded-2xl border border-gray-100">
                    {/* Date & Time */}
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        <svg className="w-6 h-6 text-[#007AA6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                          {event.date}
                        </p>
                        <p className="text-gray-500 font-medium mt-1" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                          {event.time}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        <svg className="w-6 h-6 text-[#007AA6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                          {event.location}
                        </p>
                        <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base" style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}>
                          {event.locationDetail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {event.status === 'upcoming' && (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="inline-flex items-center gap-3 bg-[#FB6F7A] hover:bg-[#D33181] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-[#FB6F7A]/30 transform hover:-translate-y-1"
                        style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                      >
                        <span className="text-lg tracking-wide">SAVE YOUR SEAT</span>
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    )}

                    {event.status === 'coming-soon' && (
                      <div
                        className="inline-block px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-full border border-gray-200"
                        style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                      >
                        <span className="text-lg tracking-wide">DETAILS COMING SOON</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-28 bg-gradient-to-br from-[#5F0101] to-[#8B0000] relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F0C946]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
            style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
          >
            DON&apos;T SEE YOUR VIBE YET?
          </h2>
          <p 
            className="text-xl text-white/80 mb-10 font-medium"
            style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
          >
            We&apos;re cooking up more events. Stay in the loop!
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#21C36E] hover:bg-[#1BA55E] text-white font-bold px-12 py-5 rounded-full text-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#21C36E]/30 transform hover:-translate-y-1"
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