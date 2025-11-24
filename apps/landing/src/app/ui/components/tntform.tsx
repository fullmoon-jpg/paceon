"use client";
import React, { useState } from "react";
import { ChevronDown, Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const TalkNTalesRegistrationAndFAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

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

  const faqs: FAQItem[] = [
    {
      question: "Who can join Talk n Tales?",
      answer: "Talk n Tales is open for Gen-Z business founders from any kind of background or industry who want to build real connections and share their stories. You're welcome to join!"
    },
    {
      question: "Is there a registration fee?",
      answer: "Yes, there is an investment fee, and the details will be sent to your email once you are selected to join the event."
    },
    {
      question: "What should I prepare?",
      answer: "Just bring yourself! If you want, you can prepare a short story about your journey. Business cards are also recommended for networking."
    },
    {
      question: "What's the dress code?",
      answer: "Be yourself but stay presentable. The vibe is relaxed, yet still professional."
    },
    {
      question: "Can I bring a friend?",
      answer: "Of course! Just make sure they are also Gen-Z business founders. Each must register individually, as seats are limited."
    },
    {
      question: "When will I get the confirmation?",
      answer: "You'll get an automatic confirmation right after submitting the form. The official announcement and payment instructions will be sent between December 8th — 11th, 2025. Don't forget to check your inbox and spam folder!"
    },
    {
      question: "What if I can't attend?",
      answer: "Please inform us at least 2 days before the event via email or Instagram DM paceon.id so we can give your spot to someone else."
    },
    {
      question: "How does the registration process work?",
      answer: "You can register anytime before the deadline through our website. After registration closes, our team will review all submissions. If you're selected, you'll receive an announcement email along with payment details. Make sure to keep an eye on your inbox!"
    },
    {
      question: "How does the selection process work?",
      answer: "Once the registration period ends, the Pace On team will shortlist participants based on profile relevance (whether you're truly a young founder), alignment with the Talk & Tales theme, and the motivation you wrote in the form. Selected participants will receive an official confirmation via email."
    },
    {
      question: "Is there any chance for collaboration after the event?",
      answer: "Definitely! One of the main goals of Talk & Tales is to spark collaboration between participants and even with Pace On itself."
    },
    {
      question: "What if I'm not selected?",
      answer: "No worries, all registrants will automatically be added to the Pace On community database and will receive priority for future events. You'll still get updates and opportunities through our community email."
    },
    {
      question: "How can I stay updated about Talk & Tales?",
      answer: "Follow us on Instagram paceon.id or check the Pace On website for the latest news and updates."
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="w-full py-16 sm:py-16 md:py-16 lg:py-20 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        
        {/* Grid Layout - Description Left, FAQ Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left: Event Description - Order 1 on mobile (shows first) */}
          <div className="w-full order-1">
            
            {/* Title */}
            <div className="mb-8 lg:mb-10">
              <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] mb-4">
                About This Event
              </h2>
              <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80 leading-relaxed">
                <span className="font-bold">Talk and Tales</span> is more than a networking event. It is a place where Gen-Z founders sit together, listen to real stories about why networking actually matters, laugh and loosen up through fun games, and connect with other founders in ways that feel natural, unforced, and genuinely enjoyable.
              </p>
            </div>

            {/* What You'll Experience */}
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

          {/* Right: FAQ Section - Order 2 on mobile (shows after description) */}
          <div className="w-full order-2">
            <div className="mb-6">
              <h3 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-2">
                Frequently Asked Questions
              </h3>
              <p className="font-body text-sm sm:text-base text-[#3f3e3d]/70">
                Got questions? We&apos;ve got answers!
              </p>
            </div>

            {/* FAQ List */}
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`py-6 ${index !== faqs.length - 1 ? 'border-b-2 border-[#3f3e3d]/30' : ''}`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-start justify-between gap-4 text-left group"
                  >
                    <h4 className="font-brand text-sm sm:text-base text-[#3f3e3d] flex-1 group-hover:text-[#F47a49] transition-colors">
                      {faq.question}
                    </h4>
                    <ChevronDown 
                      className={`w-5 h-5 text-[#3f3e3d]/60 flex-shrink-0 transition-transform duration-300 ${
                        openFAQ === index ? 'rotate-180 text-[#F47a49]' : ''
                      }`}
                    />
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFAQ === index ? 'max-h-96 mt-3' : 'max-h-0'
                    }`}
                  >
                    <p className="font-body text-xs sm:text-sm text-[#3f3e3d]/80 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-8 p-6 border-2 border-[#FB6F7A]/20 rounded-2xl text-center bg-[#FB6F7A]/5">
              <h4 className="font-brand text-lg text-[#3f3e3d] mb-2">
                Any More Question?
              </h4>
              <p className="font-body text-sm text-[#3f3e3d]/70 mb-4">
                Click the button below!
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#FB6F7A] green-fill text-white font-brand text-sm px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default TalkNTalesRegistrationAndFAQ;