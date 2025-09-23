"use client"
import React, { useState } from "react";
import {
    Send,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Phone,
    Mail,
    MapPin,
    Clock,
} from "lucide-react";
import { db } from "@paceon/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string | null;
}

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    submittedAt: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Submit function to Firestore
  const submitToFirestore = async (data: ContactFormData) => {
    try {
      const docRef = await addDoc(collection(db, "contacts"), {
        ...data,
        submittedAt: serverTimestamp(),
      });
      console.log("Contact message sent with ID: ", docRef.id);
      return { success: true, id: docRef.id };
    } catch (e) {
      console.error("Error sending contact message: ", e);
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
      formData.subject.trim() !== '' &&
      formData.message.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Please fill all required fields!');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData: ContactFormData = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };

      const result = await submitToFirestore(submissionData);

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            submittedAt: null,
          });
        }, 4000);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("An error occurred while sending the message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Message Sent!
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
             Thank you for reaching out. The PACE ON team will respond to your message shortly.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Redirecting...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a6435] text-center">
              Contact Us
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl font-open-sans font-bold mx-auto px-4 sm:px-0">
           Have questions or want to join the PACE ON Community? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Infomation</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Email</h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-open-sans font-bold">hi@paceon.id</p>
                    <p className="text-gray-500 text-xs font-open-sans">Response within 24 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Telephone</h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-open-sans font-bold">+62 855-8451-534</p>
                    <p className="text-gray-500 text-xs font-open-sans">Monday - Friday, 09:00 - 17:00</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Location</h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-open-sans font-bold">Jakarta, Indonesia</p>
                    <p className="text-gray-500 text-xs font-open-sans">Event in Jakarta</p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Operating Hours</h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-open-sans font-bold">Weekdays: 09:00 - 17:00</p>
                    <p className="text-gray-500 text-xs font-open-sans">Weekend: Event Only</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-green-800 mb-1">Our costumer support will help you</p>
                    <p className="text-green-700 leading-relaxed">
                      Our customer support team is ready to help answer questions about events, membership, and other information about PACE ON.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Send Message</h2>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a6435] focus:border-[#2a6435] text-sm sm:text-base"
                  placeholder="Enter Your Full Name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a6435] focus:border-[#2a6435] text-sm sm:text-base"
                  placeholder="example@email.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a6435] focus:border-[#2a6435] text-sm sm:text-base"
                  placeholder="+62 xxx-xxxx-xxxx"
                />
                <p className="text-xs text-gray-500 font-open-sans font-bold">
                  Optional - for ease of follow-up communication
                </p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => updateFormData('subject', e.target.value)}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a6435] focus:border-[#2a6435] text-sm sm:text-base"
                >
                  <option value="">Select the message subject</option>
                  <option value="event-info">Event Information</option>
                  <option value="membership">Membership</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="technical">Website Technical Assistance</option>
                  <option value="technical">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Massage *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  rows={5}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a6435] focus:border-[#2a6435] resize-none text-sm sm:text-base"
                  placeholder="Write your message or question here..."
                />
                <p className="text-xs text-gray-500 font-open-sans font-bold">
                  Please describe your question or needs in detail so we can help you better.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-blue-800 mb-1">Your information is secure.</p>
                    <p className="text-blue-700 leading-relaxed">
                      The information you provide will be kept confidential and used only to respond to your inquiry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  isFormValid() && !isSubmitting
                    ? 'bg-gradient-to-br from-[#15b392] via-[#2a6435] to-[#15b392] text-white hover:from-[#2a6435] hover:via-[#15b392] hover:to-[#2a6435] focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Massage...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Massage
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-black font-open-sans font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <AlertCircle size={14} className="sm:w-4 sm:h-4" />
            <span>Tim kami akan merespons dalam 1x24 jam pada hari kerja</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;