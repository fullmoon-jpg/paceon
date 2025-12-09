"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  role: string;
  company: string;
  company_industry: string;
  domicile: string;
  source: string;
  interests: string[];
  reason: string;
}

interface Poster {
  id: number;
  image: string;
  alt: string;
}

const TalkNTalesPosterAndDescription = () => {
  const [activePoster, setActivePoster] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    role: '',
    company: '',
    company_industry: '',
    domicile: '',
    source: '',
    interests: [],
    reason: ''
  });

  // Array of posters - add your additional poster images here
  const posters: Poster[] = [
    { id: 1, image: "/images/new-poster-tnt.png", alt: "Talk n Tales Event Poster" },
    { id: 2, image: "/images/new-poster-tnt-2.png", alt: "Event Flow" },
    { id: 3, image: "/images/new-poster-tnt-3.png", alt: "Event Details" },
    // Add more posters as needed
  ];

  const sourceOptions = [
    "Instagram",
    "Website",
    "TikTok",
    "Teman",
    "LinkedIn",
    "Lainnya"
  ];

  const interestOptions = [
    "Sustainability & Green Innovation",
    "Social Impact & Inclusion",
    "Tech for Change",
    "Creative & Lifestyle Business",
    "Funding & Collaboration",
    "Founder Journey & Mental Health"
  ];

  // Auto-play carousel setiap 15 detik, pause on hover
  useEffect(() => {
    if (posters.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActivePoster((prev) => (prev + 1) % posters.length);
    }, 7000); // 15 detik, bisa ganti ke 10000 (10 detik) atau 20000 (20 detik)

    return () => clearInterval(interval);
  }, [posters.length, isHovered]);

  // Poster navigation handlers
  const handleNextPoster = () => {
    setActivePoster((prev) => (prev + 1) % posters.length);
  };

  const handlePrevPoster = () => {
    setActivePoster((prev) => (prev - 1 + posters.length) % posters.length);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getBorderColor = (value: string): string => {
    if (!showValidation) {
      return 'border-[#3f3e3d]/20 focus:border-[#21C36E]';
    }
    
    return value.trim() !== '' 
      ? 'border-green-500' 
      : 'border-red-500';
  };

  const handleCheckboxChange = (interest: string) => {
    setFormData(prev => {
      const currentInterests = prev.interests;
      
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter(i => i !== interest)
        };
      }
      
      if (currentInterests.length < 3) {
        return {
          ...prev,
          interests: [...currentInterests, interest]
        };
      }
      
      return prev;
    });
  };

  const isValidLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    const cleanUrl = url.trim();
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i;
    
    return linkedinPattern.test(cleanUrl);
  };

  const normalizeLinkedInUrl = (url: string): string => {
    const cleanUrl = url.trim();
    
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    
    if (cleanUrl.startsWith('linkedin.com') || cleanUrl.startsWith('www.linkedin.com')) {
      return `https://${cleanUrl}`;
    }
    
    return cleanUrl;
  };

  const isFormValid = () => {
    return (
      formData.full_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.linkedin_url.trim() !== '' &&
      formData.role.trim() !== '' &&
      formData.company.trim() !== '' &&
      formData.company_industry.trim() !== '' &&
      formData.domicile.trim() !== '' &&
      formData.source.trim() !== '' &&
      formData.interests.length === 3 &&
      formData.reason.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setShowValidation(true);
    
    if (!isFormValid()) {
      setError('Please fill in all required fields correctly. Make sure LinkedIn URL is valid and you selected exactly 3 interests.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedData = {
        ...formData,
        linkedin_url: normalizeLinkedInUrl(formData.linkedin_url)
      };

      const response = await fetch('/api/tntregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
      }

      setIsSuccess(true);
      setShowValidation(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        role: '',
        company: '',
        company_industry: '',
        domicile: '',
        source: '',
        interests: [],
        reason: ''
      });

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Terjadi kesalahan. Silakan coba lagi.';
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="poster-section" className="w-full pt-8 pb-16 sm:pb-16 md:pb-16 lg:pb-20 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">

        {/* Grid Layout - Poster Left, Form Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left: Poster Carousel with Navigation - Order 1 on mobile */}
          <div className="w-full order-1">
            <div className="relative lg:sticky lg:top-8">
              {/* Poster Container with AnimatePresence */}
              <div 
                className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={posters[activePoster].id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={posters[activePoster].image}
                      alt={posters[activePoster].alt}
                      fill
                      className="object-cover"
                      priority={activePoster === 0}
                      sizes="(max-width: 1024px) 115vw, 55vw"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows - Only show if more than 1 poster */}
              {posters.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPoster}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#3f3e3d] hover:bg-[#f4f4ef] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
                    aria-label="Previous poster"
                    type="button"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#f4f4ef] hover:text-[#3f3e3d] transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
                  </button>

                  <button
                    onClick={handleNextPoster}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#3f3e3d] hover:bg-[#f4f4ef] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
                    aria-label="Next poster"
                    type="button"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#f4f4ef] hover:text-[#3f3e3d] transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>

                  {/* Poster Indicators */}
                  <div 
                    className="flex justify-center gap-2 mt-6"
                    role="tablist"
                    aria-label="Poster navigation"
                  >
                    {posters.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePoster(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === activePoster ? 'bg-[#3f3e3d] w-8' : 'bg-gray-400 w-2 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to poster ${index + 1}`}
                        aria-current={index === activePoster ? 'true' : 'false'}
                        role="tab"
                        type="button"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Registration Form with Header - Order 2 on mobile */}
          <div className="w-full order-2">
            <div className="mb-8 lg:mb-10 text-center lg:text-left">
              <div className="inline-block mb-4 transform -skew-y-1">
                <div className="bg-[#F0C946] px-8 sm:px-10 md:px-12 py-3 sm:py-4">
                  <h2 id="registration-section" className="font-brand text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#3f3e3d] transform skew-y-1">
                    RESERVE YOUR SPOT
                  </h2>
                </div>
              </div>
              <p className="font-body text-sm sm:text-base lg:text-lg text-[#3f3e3d]/80">
                60 Seats Available. Fill out the form below to join us!
              </p>
            </div>

            {isSuccess ? (
              // Success Message
              <div className="border-2 border-green-200 rounded-3xl p-8 sm:p-10 text-center bg-green-50/30">
                <div className="w-20 h-20 text-green-500 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-4">
                  Registration Successful!
                </h3>
                <p className="font-body text-sm sm:text-base text-[#3f3e3d]/80 mb-6 leading-relaxed">
                  Thank you for registering for <strong>Talk n Tales</strong>! A confirmation email has been sent to your inbox.
                </p>
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-6">
                  <p className="font-body text-sm text-[#15803d] leading-relaxed">
                    Announcement and investment fee details on your email at 8-11 December 2025.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="w-full bg-[#FB6F7A] hover:bg-[#E55A65] text-white font-brand text-base px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Register Another Person
                </button>
              </div>
            ) : (
              // Registration Form
              <form
                onSubmit={handleSubmit}
                className="border-2 border-[#3f3e3d]/10 rounded-3xl p-6 sm:p-8 lg:p-10 bg-white/30"
              >
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="font-body text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your full name? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.full_name)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="Your Full Name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your Email? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.email)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your phone number? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.phone)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      Your LinkedIn Profile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.linkedin_url)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="linkedin.com/in/yourname"
                    />
                    <p className="mt-1 text-xs text-[#3f3e3d]/60 font-body">
                      Example: linkedin.com/in/yourname or linkedin.com/yourname
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your role in your company? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.role)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="CEO / CTO / Founder"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What company or organization are you part of? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.company)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="Your Company Name"
                    />
                  </div>

                  {/* Company Industry */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What industry are you in? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_industry"
                      value={formData.company_industry}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.company_industry)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="Tech / Creative / F&B"
                    />
                  </div>

                  {/* Domicile */}
                  <div>
                    <label className="font-brand block text-sm text-sm text-[#3f3e3d] mb-3">
                      Where do you currently live? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="domicile"
                      value={formData.domicile}
                      onChange={handleChange}
                      required
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.domicile)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="Jakarta / Bandung"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      How did you hear about this event? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      required
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none"
                    >
                      <option value="">Choose One</option>
                      {sourceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What topics are you interested in? <span className="text-red-500">* (Must Choose Exactly 3)</span>
                    </label>
                    <div className="mb-2">
                      <span className="font-body text-xs text-[#3f3e3d]/70">
                        Selected: {formData.interests.length} / 3
                      </span>
                    </div>
                    <div className="space-y-3 pl-1">
                      {interestOptions.map(interest => {
                        const isChecked = formData.interests.includes(interest);
                        const isDisabled = !isChecked && formData.interests.length >= 3;
                        
                        return (
                          <label 
                            key={interest} 
                            className={`flex items-start gap-3 group ${
                              isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(interest)}
                              disabled={isDisabled}
                              className={`mt-1 w-4 h-4 rounded border-2 border-gray-300 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 ${
                                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            />
                            <span className={`font-body text-sm text-[#3f3e3d] leading-relaxed ${
                              !isDisabled && 'group-hover:text-[#21C36E] transition-colors'
                            }`}>
                              {interest}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      Why do you want to join us? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows={4}
                      className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.reason)} resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                      placeholder="Tell us your reason..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid()}
                      className="w-full bg-[#21c36e] yellow-fill disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-brand text-base py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 uppercase tracking-wide"
                    >
                      {isSubmitting ? 'Sending...' : 'Register Now'}
                    </button>
                  </div>

                  <p className="text-center font-body text-xs text-[#3f3e3d]/60 pt-2">
                    Registration is successful once the email has been sent. Be sure to check your spam/inbox regularly!
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default TalkNTalesPosterAndDescription;