"use client"

import React from 'react';
import { Users, Heart, Target, MessageCircle, Shield, Handshake, Smile, UserPlus, Ban, Home } from 'lucide-react';

const HouseRulesPage = () => {
  const rules = [
    {
      id: 1,
      icon: <Users className="w-6 h-6" />,
      title: "Equal Ground for Everyone",
      description: "All participants are on equal ground. There is no hierarchy or seniority during sports activities or networking sessions."
    },
    {
      id: 2,
      icon: <Heart className="w-6 h-6" />,
      title: "Maintain Mutual Respect",
      description: "Maintain mutual respect at all times. Avoid comments or behaviors that may cause discomfort to others."
    },
    {
      id: 3,
      icon: <Target className="w-6 h-6" />,
      title: "Focus on Fun & Effort",
      description: "Focus on fun, togetherness, and effort, not competition, performance, or comparison.",
    },
    {
      id: 4,
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Positive Language Only",
      description: "Use positive and friendly language in every conversation."
    },
    {
      id: 5,
      icon: <Shield className="w-6 h-6" />,
      title: "Avoid Sensitive Topics",
      description: "Refrain from discussing sensitive topics such as politics, religion, financial status, or personal matters."
    },
    {
      id: 6,
      icon: <Handshake className="w-6 h-6" />,
      title: "Collaborative Networking",
      description: "Approach networking with a spirit of collaboration, not competition."
    },
    {
      id: 7,
      icon: <Smile className="w-6 h-6" />,
      title: "Create Positive Atmosphere",
      description: "Every participant is expected to help create an enjoyable, inclusive, and supportive atmosphere."
    },
    {
      id: 8,
      icon: <UserPlus className="w-6 h-6" />,
      title: "Be Open to New Connections",
      description: "Be open to meeting new people and exchanging insights in a polite and natural way."
    },
    {
      id: 9,
      icon: <Ban className="w-6 h-6" />,
      title: "No Sales Pitches",
      description: "Avoid monopolizing the conversation for self-promotion or turning discussions into a sales pitch."
    },
    {
      id: 10,
      icon: <Home className="w-6 h-6" />,
      title: "Safe & Productive Space",
      description: "The main goal of this activity is to provide a safe, enjoyable, and productive space to meet, play, and build meaningful connections."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f4ef]">
      {/* Header Section - Blue Solid Color */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#007AA6] to-[#1a5f7a] py-20 sm:py-28">
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-28 text-center text-white z-10">
          <div className="inline-block mb-6 transform -skew-y-1">
            <div className="bg-[#F0C946] px-12 py-4">
              <h1 className="font-brand text-4xl sm:text-5xl md:text-6xl text-[#3f3e3d] transform skew-y-1">
                HOUSE RULES
              </h1>
            </div>
          </div>
          <p className="font-body text-lg sm:text-xl text-white/90 mb-3">
            PACE ON Community Guidelines
          </p>
          <p className="font-body text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Creating a safe, inclusive, and enjoyable environment for everyone to connect, play, and grow together
          </p>
        </div>
      </div>

      {/* Rules Section - Side by Side Layout */}
      <div className="w-full px-6 sm:px-8 lg:px-28 py-16 sm:py-20 md:py-24 lg:py-28">
        
        {/* Grid Layout - Sidebar Left, Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Sidebar - Sticky Title (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <h2 className="font-brand text-3xl text-[#3f3e3d] mb-4">
                Our Community Standards
              </h2>
              <p className="font-body text-base text-[#3f3e3d]/80 leading-relaxed">
                These guidelines ensure everyone has a positive and meaningful experience at PACE ON events
              </p>
            </div>
          </div>

          {/* Mobile Title (Shown only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="font-brand text-3xl text-[#3f3e3d] mb-4">
              Our Community Standards
            </h2>
            <p className="font-body text-base text-[#3f3e3d]/80">
              These guidelines ensure everyone has a positive and meaningful experience at PACE ON events
            </p>
          </div>

          {/* Right Content - Scrollable Rules */}
          <div className="lg:col-span-8">
            <div className="border-2 border-[#3f3e3d]/10 rounded-3xl p-6 sm:p-8 lg:p-10 bg-white/50">
              {/* Header Info */}
              <div className="pb-8 border-b-2 border-[#3f3e3d]/10">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#3f3e3d]/70 mb-4">
                  <span className="bg-[#007AA6] text-white px-4 py-1.5 rounded-full font-body font-medium">
                    Community Guidelines
                  </span>
                  <span>•</span>
                  <span className='font-body'>
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-4">
                  Building a Better Community Together
                </h3>
                <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80 leading-relaxed">
                  At PACE ON, we believe that great connections happen when everyone feels welcome, respected, and valued. 
                  These house rules aren&apos;t just guidelines—they&apos;re the foundation of our community culture that makes 
                  every event memorable and meaningful for all participants.
                </p>
              </div>

              {/* Rules List */}
              <div className="py-8 space-y-8">
                {rules.map((rule) => (
                  <div 
                    key={rule.id} 
                    className="border-l-4 border-[#007AA6] pl-6 py-2"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#F47a49] rounded-xl flex items-center justify-center text-white shadow-md">
                        <span className="font-brand text-base">{rule.id}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-brand text-lg sm:text-xl text-[#3f3e3d] mb-2">
                          {rule.title}
                        </h4>
                        <p className="font-body text-[#3f3e3d]/80 leading-relaxed text-base">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Context */}
              <div className="pt-8 border-t-2 border-[#3f3e3d]/10">
                <h3 className="font-brand text-2xl text-[#3f3e3d] mb-4">
                  Why These Rules Matter
                </h3>
                <div className="space-y-4 font-body text-[#3f3e3d]/80 leading-relaxed">
                  <p>
                    These guidelines aren&apos;t about restricting your experience, they&apos;re about enhancing it. When everyone 
                    follows these simple principles, we create an environment where authentic connections flourish, 
                    meaningful conversations happen naturally, and everyone leaves feeling energized and inspired.
                  </p>
                  
                  <p>
                    Whether you&apos;re joining us for a friendly sport and networking session, 
                    these rules ensure that every participant can focus on what truly matters building genuine relationships 
                    through shared experiences and mutual respect.
                  </p>

                  <div className="bg-[#FB6F7A]/10 border-2 border-[#FB6F7A]/20 rounded-2xl p-6 my-6">
                    <h4 className="font-brand text-lg text-[#3f3e3d] mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#FB6F7A]" />
                      Remember
                    </h4>
                    <p className="font-body text-[#3f3e3d]/80">
                      Every person you meet at PACE ON has something valuable to offer. Approach each interaction with 
                      curiosity, kindness, and an open mind. You never know which conversation might lead to your next 
                      great friendship, collaboration, or opportunity.
                    </p>
                  </div>

                  <p>
                    By participating in our events, you&apos;re not just agreeing to follow these rules, you&apos;re joining a 
                    community committed to making every gathering a positive, inclusive, and enriching experience for everyone involved.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-8 pt-6 border-t-2 border-[#3f3e3d]/10">
                <h3 className="font-brand text-xl text-[#3f3e3d] mb-4">
                  Questions or Concerns?
                </h3>
                <p className="font-body text-[#3f3e3d]/80 leading-relaxed">
                  If you have any questions about these guidelines or want to report a concern during an event, 
                  please don&apos;t hesitate to reach out to our moderators or contact us directly. 
                  We&apos;re here to ensure everyone has an amazing experience.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-[#3f3e3d]/70 font-body text-sm">
            <Shield className="w-4 h-4" />
            <span>These rules apply to all PACE ON activities and online interactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseRulesPage;