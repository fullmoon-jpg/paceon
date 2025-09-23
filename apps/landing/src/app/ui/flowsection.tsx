"use client"
import React from 'react';

const PaceOnSection: React.FC = () => {
  return (
    <div className="w-full py-4 lg:py-26 px-8 md:px-16 lg:px-24 bg-gray-50">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1f4381]">
            The Smarter Way to Connect, Book, and Play
          </h2>
        </div>

        {/* Steps Container */}
        <div className="space-y-20">
          {/* Step 1 - READY */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 relative">
              <img 
                src="/images/signup-mockup.png" 
                id='Ready-Image'
                alt="Person Ready for Networking" 
                className="rounded-xl shadow-lg w-full h-80 lg:h-96 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-left">
                <div className="mb-6">
                  <span className="text-xl font-semibold text-[#1f4381]">#1</span>
                  <h4 className="text-4xl lg:text-5xl font-bold text-[#e33530] mt-2 ">READY <span className='text-black'>FOR LOGIN</span></h4>
                </div>
                <p className="text-black text-xl leading-relaxed font-open-sans font-bold text-justify">
                  You&apos;re ready to log in at paceon.id and start your journey. With just a few steps, you can access your dashboard and join the community instantly.  
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 - SET */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 relative">
              <img 
                src="/images/dashboard.jpg" 
                id='Set-Image'
                alt="Setting up booking system" 
                className="rounded-xl shadow-lg w-full h-80 lg:h-96 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-left">
                <div className="mb-6">
                  <span className="text-xl font-semibold text-[#1f4381]">#2</span>
                  <h4 className="text-4xl lg:text-5xl font-bold text-[#e33530] mt-2 ">SET <span className='text-black'>YOUR AVAILABILITY</span></h4>
                </div>
                <p className="text-black text-xl leading-relaxed font-open-sans font-bold text-justify">
                  You&apos;re set to arrange your availability. Choose the times that fit your schedule so matching can happen seamlessly.  
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 - GO */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 relative">
              <img 
                src="/images/Go-image.webp"
                id='Go-Image' 
                alt="Ready to go and play" 
                className="rounded-xl shadow-lg w-full h-80 lg:h-96 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-left">
                <div className="mb-6">
                  <span className="text-xl font-semibold text-[#1f4381]">#3</span>
                  <h4 className="text-4xl lg:text-5xl font-bold text-[#e33530] mt-2 ">GO <span className='text-black'>TO PLAY & CONNECT</span></h4>
                </div>
                <p className="text-black text-xl leading-relaxed font-open-sans font-bold text-justify">
                  Now you go. Connect with others, join the sessions, and play the game while building real connections along the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaceOnSection;
