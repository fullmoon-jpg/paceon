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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header Section with Background Image */}
      <div className="relative overflow-hidden min-h-[70vh] flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/house-rules-hero.webp')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#15b392]/80 via-[#2a6435]/75 to-[#15b392]/80"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-white z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl uppercase md:text-6xl font-bold mb-6 tracking-tight drop-shadow-lg">
            House Rules
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 font-medium drop-shadow-md">
            PACE.ON Community Guidelines
          </p>
          <p className="text-lg font-open-sans font-bold text-white/60 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Creating a safe, inclusive, and enjoyable environment for everyone to connect, play, and grow together
          </p>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 w-full h-16 z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M1200 120L0 16.48V120z" className="fill-current text-green-50"></path>
          </svg>
        </div>
      </div>

      {/* Rules Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1f4381] mb-4">
            Our Community Standards
          </h2>
          <p className="text-lg font-open-sans font-bold text-black max-w-2xl mx-auto">
            These guidelines ensure everyone has a positive and meaningful experience at PACE.ON events
          </p>
        </div>

        {/* Blog Content */}
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Blog Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="bg-[#2a6435] text-white px-3 py-1 rounded-full font-medium">Community Guidelines</span>
                <span>•</span>
                <span className='font-open-sans font-bold'>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Building a Better Community Together
              </h2>
              <p className="text-lg font-open-sans text-black leading-relaxed">
                At PACE ON, we believe that great connections happen when everyone feels welcome, respected, and valued. 
                These house rules aren&apos;t just guidelines—they&apos;re the foundation of our community culture that makes 
                every event memorable and meaningful for all participants.
              </p>
            </div>

            {/* Blog Content Static */}
            <div className="p-8 prose prose-lg max-w-none">
              <div className="space-y-8">
                {rules.map((rule) => (
                  <div 
                    key={rule.id} 
                    className="rule-item border-l-4 border-[#2a6435] pl-6 py-2"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 bg-[#e04d31] rounded-lg flex items-center justify-center text-white shadow-md">
                        <span className="text-sm font-bold">{rule.id}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-open-sans font-bold text-black mb-2">
                          {rule.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-black font-open-sans leading-relaxed text-lg ml-14">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Additional Context Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-4">Why These Rules Matter</h3>
                <div className="space-y-4 text-black font-open-sans leading-relaxed">
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

                  <div className="bg-green-50 border font-batangas border-green-200 rounded-lg p-6 my-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Remember
                    </h4>
                    <p className="text-green-700">
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
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4">Questions or Concerns?</h3>
                <p className="text-black font-open-sans leading-relaxed">
                  If you have any questions about these guidelines or want to report a concern during an event, 
                  please don&apos;t hesitate to reach out to our moderators or contact us directly. 
                  We&apos;re here to ensure everyone has an amazing experience.
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-black  font-open-sans font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>These rules apply to all PACE ON activities and online interactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseRulesPage;
