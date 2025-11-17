import React from "react";
import { Calendar, Activity, Package, BarChart3 } from "lucide-react";
import Image from "next/image";

interface DashboardFeature {
  id: number;
  icon: React.ReactNode;
  title: string;
}

const DashboardSection = () => {
  const features: DashboardFeature[] = [
    {
      id: 1,
      icon: <Calendar className="w-6 h-6" />,
      title: "Booking Event"
    },
    {
      id: 2,
      icon: <Activity className="w-6 h-6" />,
      title: "Realtime Activity Feed"
    },
    {
      id: 3,
      icon: <Package className="w-6 h-6" />,
      title: "Affirmation & Feedback"
    },
    {
      id: 4,
      icon: <BarChart3 className="w-6 h-6" />,
      title: "User Statistics"
    }
  ];

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 lg:py-28 bg-[#f0c946] overflow-hidden">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Dashboard Mockup */}
          <div className="relative w-full h-[360px] sm:h-[400px] lg:h-[500px]">
            {/* Images Container */}
            <div className="relative w-full h-full">
              {/* Image 1 - Top Left */}
              <div className="absolute top-0 left-0 w-[68%] sm:w-[350px] lg:w-[400px] transform -rotate-3 z-10">
                <div className="bg-white rounded-xl overflow-hidden aspect-video shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
                  <Image
                    src="/images/dashboard-1.png"
                    alt="Dashboard View 1"
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Image 2 - Center */}
              <div className="absolute top-[45px] sm:top-12 left-1/2 -translate-x-1/2 w-[76%] sm:w-[380px] lg:w-[450px] z-30">
                <div className="bg-white rounded-xl overflow-hidden aspect-video shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)]">
                  <Image
                    src="/images/dashboard-2.png"
                    alt="Dashboard View 2"
                    width={450}
                    height={253}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Image 3 - Bottom Right - higher position */}
              <div className="absolute bottom-[15px] sm:bottom-0 right-0 w-[68%] sm:w-[350px] lg:w-[400px] transform rotate-3 z-20">
                <div className="bg-white rounded-xl overflow-hidden aspect-video shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
                  <Image
                    src="/images/dashboard-3.png"
                    alt="Dashboard View 3"
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="font-brand text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#3f3e3d] mb-4 sm:mb-6 leading-tight">
              Your Dashboard — Where Networking Gets Real.
            </h2>

            <p className="font-body text-sm sm:text-base lg:text-lg text-[#3f3e3d] mb-6 sm:mb-8 leading-relaxed">
              One space to connect, collaborate, and keep up with what&apos;s happening in the community. See events, feed, and give feedback, all in one dashboard built for Gen Z founders and decision makers.
            </p>

            {/* Features List */}
            <div className="space-y-3 sm:space-y-4">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex items-center gap-3 sm:gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#21c36e] rounded-lg sm:rounded-xl flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <h3 className="font-brand text-base sm:text-lg lg:text-xl text-[#3f3e3d]">
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DashboardSection;