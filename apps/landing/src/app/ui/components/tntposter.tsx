"use client";
import React from "react";
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const TalkNTalesPosterAndDescription = () => {
  const highlights = [
    {
      icon: Calendar,
      title: "Date",
      description: "Saturday, December 13, 2025"
    },
    {
      icon: Clock,
      title: "Time",
      description: "15:00 - 22:00 WIB"
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Somewhere in Jaksel"
    },
    {
      icon: Users,
      title: "Capacity",
      description: "60 Gen-Z Founders Selected"
    }
  ];

  const experiences = [
    {
      title: "Mini Talk Show",
      description: "Sit together with fellow founders and listen to inspiring leaders share real stories about networking in both personal and business life. You walk away with simple and practical tips you can use right away."
    },
    {
      title: "Group Game Session",
      description: "A fun icebreaker where everyone laughs, plays, and gets comfortable. The games help you open up and make conversations flow more naturally."
    },
    {
      title: "Speed Networking",
      description: "Move from table to table and meet new founders in minutes. It is fast, energizing, and often leads to unexpected collaboration opportunities based on your chosen interests."
    },
    {
      title: "Free Talk Networking",
      description: "The atmosphere becomes relaxed and open. This is where deeper conversations unfold, ideas flow naturally, and meaningful connections begin to grow."
    },
    {
      title: "Community Channel",
      description: "Join our post-event community channel where you can stay connected with fellow young founders, continue the conversations, and build relationships beyond the event."
    }
  ];

  return (
    <section className="w-full pt-16 sm:pt-20 md:pt-24 lg:pt-28 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        
        {/* Grid Layout - Poster Left, Description Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left: Poster */}
          <div className="w-full">
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl sticky top-8">
              <Image
                src="/images/poster-tnt.png"
                alt="Talk n Tales Event Poster"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 110vw, 50vw"
              />
            </div>
          </div>

          {/* Right: Description */}
          <div className="w-full">
            
            {/* Title */}
            <div className="mb-8 lg:mb-10">
              <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] mb-4">
                About This Event
              </h2>
              <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80 leading-relaxed">
                <span className="font-bold">Talk and Tales</span> is more than a networking event. It is a place where Gen-Z founders sit together, listen to real stories about why networking actually matters, laugh and loosen up through fun games, and connect with other founders in ways that feel natural, unforced, and genuinely enjoyable.
              </p>
            </div>

            {/* Event Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 lg:p-5 bg-white rounded-2xl shadow-sm"
                >
                  <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-[#F47a49] rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-brand text-base sm:text-lg text-[#3f3e3d] mb-1">
                      {item.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-[#3f3e3d]/80">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* What You'll Experience - Updated Structure */}
            <div className="mb-8 lg:mb-10">
              <h3 className="font-brand text-xl sm:text-2xl md:text-3xl text-[#3f3e3d] mb-4 lg:mb-5">
                What You Will Gain From Each Session
              </h3>
              <div className="space-y-4">
                {experiences.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-[#F47a49] font-bold flex-shrink-0 mt-1">•</span>
                    <div>
                      <h4 className="font-body font-bold text-sm sm:text-base text-[#3f3e3d] mb-1">
                        {item.title}
                      </h4>
                      <p className="font-body text-sm sm:text-base text-[#3f3e3d]/80 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who Should Join */}
            <div>
              <h3 className="font-brand text-xl sm:text-2xl md:text-3xl text-[#3f3e3d] mb-2 lg:mb-3">
                Who Can Join
              </h3>
              <p className="font-body text-sm sm:text-base text-[#3f3e3d] leading-relaxed mb-4">
                <span className="bg-[#3f3e3d] px-2 py-2 text-[#F47a49] font-brand">Gen-Z Founders</span><br/>Young founders aged 18 to 27 from diverse industries who are eager to learn, connect, and grow together through meaningful conversations and collaboration.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default TalkNTalesPosterAndDescription;