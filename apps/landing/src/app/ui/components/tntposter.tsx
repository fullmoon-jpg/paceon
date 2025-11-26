"use client";
import React, { useState } from "react";
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

const TalkNTalesPosterAndDescription = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get border color - only show validation AFTER submit attempt
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

  // Validate LinkedIn URL - lebih flexible
  const isValidLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    const cleanUrl = url.trim();
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i;
    
    return linkedinPattern.test(cleanUrl);
  };

  // Normalize LinkedIn URL - auto add https://
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
    
    // Show validation on submit
    setShowValidation(true);
    
    if (!isFormValid()) {
      setError('Please fill in all required fields correctly. Make sure LinkedIn URL is valid and you selected exactly 3 interests.');
      // Scroll to first error
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
          
          {/* Left: Poster - Order 1 on mobile (shows first) */}
          <div className="w-full order-1">
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl lg:sticky lg:top-8">
              <Image
                src="/images/poster-tnt-2.png"
                alt="Talk n Tales Event Poster"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 110vw, 50vw"
              />
            </div>
          </div>

          {/* Right: Registration Form with Header - Order 2 on mobile (shows after poster) */}
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
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
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