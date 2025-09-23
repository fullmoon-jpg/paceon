"use client"
import { React } from "next/dist/server/route-modules/app-page/vendored/rsc/entrypoints";
import { ArrowRight } from "lucide-react";
import { getDashboardUrl } from "@paceon/config/constants";

const PaceOnCTASection: React.FC = () => {

    const handleGetStarted = (): void => {
            // Option 1: Redirect di window yang sama (smooth transition)
            // window.location.href = getDashboardUrl('/auth/sign-up');
            // Option 2: Redirect ke window yang berbeda
            window.open(getDashboardUrl('/auth/sign-up'), '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="w-full py-20 px-8 md:px-16 lg:px-24 bg-gray-50">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1f4381] uppercase tracking-wide">
                        Ready to take on a life-changing experience?
                    </h2>
                </div>

                {/* CTA Card */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                        src="/images/CTA-image.webp"
                        alt="A man is ready for receive the ball"
                        className="h-80 w-full object-cover"
                    />
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16">
                    <div className="text-white max-w-4xl">
                        <h3 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                            Life opens new doors only when you choose to move.
                        </h3>
                        <p className="text-md sm:text-md md:text-xl lg:text-2xl font-open-sans font-bold mb-5 text-gray-200">
                            Hit the button and start with the easiest way to step up!
                        </p>

                    {/* CTA Button */}
                        <button
                            onClick={handleGetStarted}
                            className="inline-flex items-center px-8 py-4 green-fill bg-[#f7ba44] text-black font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-[#e3b2b5] rounded-full opacity-20"></div>
                    <div className="absolute bottom-4 right-8 w-12 h-12 bg-[#e33530] rounded-full opacity-30"></div>
                    <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-[#f7ba44] rounded-full opacity-15"></div>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-8">
                    <p className="text-black text-xl">
                        Keep the Pace On
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaceOnCTASection;
