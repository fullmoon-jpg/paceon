"use client";
import React, { useState } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

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

interface FAQItem {
  question: string;
  answer: string;
}

const TalkNTalesRegistrationAndFAQ = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (interest: string) => {
    setFormData(prev => {
      const currentInterests = prev.interests;
      
      // If already selected, allow to uncheck
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter(i => i !== interest)
        };
      }
      
      // If not selected and limit not reached, allow to check
      if (currentInterests.length < 3) {
        return {
          ...prev,
          interests: [...currentInterests, interest]
        };
      }
      
      // If limit reached, don't allow more selections
      return prev;
    });
  };

  // Check if form is valid
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
    
    // Double check validation
    if (!isFormValid()) {
      setError('Please fill in all required fields and select exactly 3 interests.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/tntregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
      }

      setIsSuccess(true);
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

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="w-full py-16 sm:py-16 md:py-16 lg:py-20 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        
        {/* Skewed Header */}
        <div className="mb-12 lg:mb-16 text-center">
          <div className="inline-block mb-4 transform -skew-y-1">
            <div className="bg-[#F0C946] px-12 py-4">
              <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] transform skew-y-1">
                RESERVE YOUR SPOT
              </h2>
            </div>
          </div>
          <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80">
            60 Seats Available. Fill out the form below to join us!
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left: Registration Form */}
          <div className="w-full">
            {isSuccess ? (
              // Success Message
              <div className="border-2 border-green-200 rounded-3xl p-8 sm:p-10 text-center sticky top-8 bg-green-50/30">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h3 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-4">
                  Registration Successful!
                </h3>
                <p className="font-body text-sm sm:text-base text-[#3f3e3d]/80 mb-6 leading-relaxed">
                  Thank you for registering for <strong>Talk n Tales</strong>! A confirmation email has been sent to your inbox.
                </p>
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-6">
                  <p className="font-body text-sm text-[#15803d] leading-relaxed">
                    Announcement and investment fee details on your email at 8-11 November 2025.
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
                className="border-2 border-[#3f3e3d]/10 rounded-3xl p-6 sm:p-8 lg:p-10 sticky top-8 bg-white/30"
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      placeholder="Your Full Name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your Email? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      What is your phone number? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                      Your LinkedIn Profile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      required
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      placeholder="linkedin.com/in/yourname"
                    />
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none"
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
                              className={`mt-1 w-4 h-4 rounded border-2 border-gray-300 text-[#FB6F7A] focus:ring-[#FB6F7A] focus:ring-2 ${
                                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            />
                            <span className={`font-body text-sm text-[#3f3e3d] leading-relaxed ${
                              !isDisabled && 'group-hover:text-[#FB6F7A] transition-colors'
                            }`}>
                              {interest}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason (Required) */}
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
                      className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
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

          {/* Right: FAQ Section */}
          <div className="w-full">
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