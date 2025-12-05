'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, User, Sparkles } from 'lucide-react';

interface RegistrationData {
  full_name: string;
  role: string;
  company: string;
  company_industry: string;
  interests: string;
  id: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data?: RegistrationData;
}

export default function VerifyTicketPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [data, setData] = useState<RegistrationData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    verifyTicket();
  }, [uuid]);

  const verifyTicket = async () => {
    try {
      const response = await fetch(`/api/verify-ticket/${uuid}`);
      const result: VerifyResponse = await response.json();

      // Simulate loading untuk effect
      setTimeout(() => {
        if (result.success && result.data) {
          setStatus('valid');
          setData(result.data);
          setShowConfetti(true);
          
          // Hide confetti after 3 seconds
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setStatus('invalid');
        }
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      setTimeout(() => {
        setStatus('invalid');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f4ef] via-[#e8f5e9] to-[#f4f4ef] flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
                y: -20,
                rotate: 0 
              }}
              animate={{ 
                y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                rotate: 360 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                ease: "linear" 
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#21C36E', '#f0c946', '#764ba2', '#667eea'][Math.floor(Math.random() * 4)],
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-20 h-20 border-4 border-[#21C36E] border-t-transparent rounded-full" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Ticket...</h2>
              <p className="text-gray-600">Please wait a moment</p>
            </motion.div>
          )}

          {/* Valid Ticket State */}
          {status === 'valid' && data && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Success Header with Checkmark Animation */}
              <div className="bg-gradient-to-r from-[#2a6435] to-[#21C36E] p-8 text-center relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                  className="relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 12,
                      delay: 0.4 
                    }}
                    className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-14 h-14 text-[#21C36E]" strokeWidth={3} />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl font-black text-white mb-2"
                  >
                    TICKET VERIFIED
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/90 text-sm"
                  >
                    Talk n Tales - PACE ON
                  </motion.p>
                </motion.div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                </div>
              </div>

              {/* CONFIRMED Badge */}
              <div className="relative -mt-6 px-8">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 10,
                    delay: 0.7 
                  }}
                  className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-8 py-4 rounded-2xl shadow-xl text-center relative overflow-hidden"
                >
                  {/* Animated gradient background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  <span className="text-2xl font-black tracking-wider relative z-10">
                    CONFIRMED
                  </span>
                </motion.div>
              </div>

              {/* Participant Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="p-8 space-y-6"
              >
                {/* Name & Info Section */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center mb-2">
                    <User className="w-5 h-5 text-[#2a6435] mr-2" />
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Participant
                    </span>
                  </div>
                  
                  {/* Name */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {data.full_name}
                  </motion.h2>
                  
                  {/* Role, Company, Industry - Plain text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="text-gray-700 space-y-1"
                  >
                    <p className="text-lg font-semibold">
                      {data.role} <span className="text-gray-400">at</span> {data.company}
                    </p>
                    <p className="text-base text-gray-600">
                      {data.company_industry}
                    </p>
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Interest Pillars - Only Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200"
                >
                  <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
                        Interest Pillars
                      </p>
                      {(() => {
                        // Parse interests - handle different formats
                        const interestText = data.interests || '';
                        
                        // Split by common patterns
                        let interests: string[] = [];
                        
                        if (interestText.includes(',')) {
                          // Has comma separator
                          interests = interestText.split(',').map(i => i.trim());
                        } else {
                          // No comma, try to match against known interest options
                          const knownInterests = [
                            "Sustainability & Green Innovation",
                            "Social Impact & Inclusion",
                            "Tech for Change",
                            "Creative & Lifestyle Business",
                            "Funding & Collaboration",
                            "Founder Journey & Mental Health"
                          ];
                          
                          // Find which interests exist in the text
                          interests = knownInterests.filter(interest => 
                            interestText.includes(interest)
                          );
                          
                          // If no matches found, show as single text
                          if (interests.length === 0) {
                            interests = [interestText];
                          }
                        }
                        
                        // Remove empty strings
                        interests = interests.filter(i => i.length > 0);
                        
                        // Render
                        if (interests.length > 1) {
                          return (
                            <ul className="space-y-2">
                              {interests.map((interest, index) => (
                                <li key={index} className="text-sm font-bold text-gray-900 flex items-start">
                                  <span className="text-amber-600 mr-2 mt-0.5">•</span>
                                  <span>{interest}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        } else {
                          return (
                            <p className="text-base font-bold text-gray-900">
                              {interests[0] || interestText}
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Footer */}
              <div className="bg-[#3f3e3d] px-8 py-6 text-center">
                <p className="text-white text-sm">
                  © 2025 <span className="font-bold text-[#f0c946]">PACE ON</span> Community
                </p>
                <p className="text-gray-400 text-xs mt-1">Keep The Pace On</p>
              </div>
            </motion.div>
          )}

          {/* Invalid Ticket State */}
          {status === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <X className="w-14 h-14 text-red-600" strokeWidth={3} />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Invalid Ticket</h2>
              <p className="text-gray-600 mb-6">
                This ticket could not be verified. Please contact support.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 font-mono break-all">
                  ID: {uuid}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}