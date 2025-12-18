"use client"
import React, { useState } from "react";
import {
    Send,
    CheckCircle,
    Phone,
    Mail,
    MapPin,
    Clock,
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  messageType: string;
  message: string;
}

const MESSAGE_TYPES = [
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'event_inquiry', label: 'Event Inquiry' },
  { value: 'general', label: 'General Question' },
];

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    messageType: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitToSupabase = async (data: ContactFormData) => {
    try {
      const { data: result, error } = await supabase
        .from('contacts')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          message_type: data.messageType,
          message: data.message,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;

      console.log("Contact message sent successfully:", result);
      return { success: true, data: result };
    } catch (e) {
      console.error("Error sending contact message:", e);
      return { success: false, error: e };
    }
  };

  const updateFormData = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.company.trim() !== '' &&
      formData.messageType.trim() !== '' &&
      formData.message.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill all required fields!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitToSupabase(formData);

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            messageType: '',
            message: '',
          });
        }, 4000);
      } else {
        throw new Error('Failed to submit contact form');
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError("An error occurred while sending the message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f4f4ef] flex items-center justify-center px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            <CheckCircle className="mx-auto h-20 w-20 text-[#FB6F7A] mb-6" />
            <h2 className="font-brand text-3xl sm:text-4xl text-[#3f3e3d] mb-4">
              Message Sent!
            </h2>
            <p className="font-body text-[#3f3e3d]/80 mb-6 text-base leading-relaxed">
              Thank you for reaching out. The PACE ON team will respond to your message shortly.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-[#FB6F7A]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#FB6F7A] rounded-full w-3/4"></div>
              </div>
              <p className="font-body text-sm text-[#3f3e3d]/60 mt-3">
                Redirecting...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4ef] py-16 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Skewed Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-4 transform -skew-y-1">
            <div className="bg-[#F0C946] px-12 py-4">
              <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] transform skew-y-1">
                GET IN TOUCH
              </h1>
            </div>
          </div>
          <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80 max-w-2xl mx-auto leading-relaxed">
            Have questions, ask for collaboration, or want to join the PACE ON Community? We&apos;re here to help!
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Information */}
          <div>
            <div className="mb-8">
              <h2 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d]">
                Contact Information
              </h2>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 border-2 border-[#3f3e3d]/10 rounded-2xl hover:border-[#FB6F7A]/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#FB6F7A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-brand text-[#3f3e3d] text-lg mb-1">Email</h3>
                  <p className="font-body text-[#3f3e3d] text-base font-medium">hi@paceon.id</p>
                  <p className="font-body text-[#3f3e3d]/60 text-sm mt-1">Response within 24 hours</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 border-2 border-[#3f3e3d]/10 rounded-2xl hover:border-[#F0C946]/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F0C946] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#3f3e3d]" />
                </div>
                <div>
                  <h3 className="font-brand text-[#3f3e3d] text-lg mb-1">Telephone</h3>
                  <p className="font-body text-[#3f3e3d] text-base font-medium">+62 855-8451-534</p>
                  <p className="font-body text-[#3f3e3d]/60 text-sm mt-1">Monday - Friday, 09:00 - 17:00</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 border-2 border-[#3f3e3d]/10 rounded-2xl hover:border-[#FB6F7A]/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#FB6F7A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-brand text-[#3f3e3d] text-lg mb-1">Location</h3>
                  <p className="font-body text-[#3f3e3d] text-base font-medium">Jakarta, Indonesia</p>
                  <p className="font-body text-[#3f3e3d]/60 text-sm mt-1">Events in Jakarta</p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-4 p-4 border-2 border-[#3f3e3d]/10 rounded-2xl hover:border-[#F0C946]/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F0C946] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#3f3e3d]" />
                </div>
                <div>
                  <h3 className="font-brand text-[#3f3e3d] text-lg mb-1">Operating Hours</h3>
                  <p className="font-body text-[#3f3e3d] text-base font-medium">Weekdays: 09:00 - 17:00</p>
                  <p className="font-body text-[#3f3e3d]/60 text-sm mt-1">Weekend: Events Only</p>
                </div>
              </div>
            </div>

            {/* Customer Support Box */}
            <div className="mt-8 bg-[#FB6F7A]/10 border-2 border-[#FB6F7A]/20 rounded-2xl p-5">
              <p className="font-brand text-[#3f3e3d] mb-2 text-base">
                Our customer support will help you
              </p>
              <p className="font-body text-sm text-[#3f3e3d]/80 leading-relaxed">
                Our customer support team is ready to help answer questions about events, membership, and other information about PACE ON.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d]">
                Send Message
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* Name & Company - Grid 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                    Name <span className="text-[#FB6F7A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                    Company <span className="text-[#FB6F7A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateFormData('company', e.target.value)}
                    className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              {/* Email & Phone - Grid 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                    Your Email <span className="text-[#FB6F7A]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {/* Message Type - Full width */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  Message Type <span className="text-[#FB6F7A]">*</span>
                </label>
                <select
                  value={formData.messageType}
                  onChange={(e) => updateFormData('messageType', e.target.value)}
                  className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] font-body text-base transition-all bg-transparent outline-none"
                >
                  <option value="" disabled>Select message type</option>
                  {MESSAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message - Full width */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  Message <span className="text-[#FB6F7A]">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  rows={4}
                  className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#FB6F7A] resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                  placeholder="Write your message or question here..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#21c36e]/10 border-2 border-[#21c36e]/30 rounded-2xl p-4">
                <p className="font-body text-sm text-[#3f3e3d]/80 leading-relaxed">
                  <strong>Your information is secure.</strong> We keep all data confidential and use it only to respond to your inquiry.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full font-brand text-base transition-all ${
                    isFormValid() && !isSubmitting
                      ? 'bg-[#21c36e] text-white pink-fill hover:shadow-xl hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="font-body text-[#3f3e3d] text-sm">
            Our team will respond within <strong>1x24 hours</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;