"use client"
import React, { useState, useEffect } from "react";
import {
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";

// Type definitions
interface FormData {
  userId: string;
  userEmail: string;
  userName: string;
  
  // LOOP Experience - Updated Questions
  overallSatisfaction: number;
  eventFormatEffectiveness: number;
  contentCreationUnderstanding: number;
  speakerInsightRelevance: number;
  moderatorPerformance: number;
  networkingSessionQuality: number;
  
  // Venue & Logistics
  venueCondition: number;
  foodAndBeverage: number;
  attendeeCount: string;
  practicalUnderstanding: string; // Updated from newConnections
  
  // Open feedback
  mostLiked: string;
  improvements: string;
  interestedNextEvent: string;
  
  // Metadata
  submittedAt: string | null;
  eventDate: string;
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label: string;
}

const LoopSatisfactionForm = () => {
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    userEmail: '',
    userName: '',
    
    // LOOP Experience ratings
    overallSatisfaction: 0,
    eventFormatEffectiveness: 0,
    contentCreationUnderstanding: 0,
    speakerInsightRelevance: 0,
    moderatorPerformance: 0,
    networkingSessionQuality: 0,
    
    // Venue
    venueCondition: 0,
    foodAndBeverage: 0,
    attendeeCount: '',
    practicalUnderstanding: '',
    mostLiked: '',
    improvements: '',
    interestedNextEvent: '',
    
    submittedAt: null,
    eventDate: new Date().toISOString().split('T')[0]
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Submit to API route
  const submitFeedback = async (data: FormData) => {
    try {
      const response = await fetch('/api/loop-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: data.userEmail,
          userName: data.userName,
          overallSatisfaction: data.overallSatisfaction,
          eventFormatEffectiveness: data.eventFormatEffectiveness,
          contentCreationUnderstanding: data.contentCreationUnderstanding,
          speakerInsightRelevance: data.speakerInsightRelevance,
          moderatorPerformance: data.moderatorPerformance,
          networkingSessionQuality: data.networkingSessionQuality,
          venueCondition: data.venueCondition,
          foodAndBeverage: data.foodAndBeverage,
          attendeeCount: data.attendeeCount,
          practicalUnderstanding: data.practicalUnderstanding,
          mostLiked: data.mostLiked,
          improvements: data.improvements,
          interestedNextEvent: data.interestedNextEvent,
          eventDate: data.eventDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim feedback');
      }

      return result;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  };

  const steps = [
    { id: "user", title: "User Info", icon: Users, color: "ef6d77" },
    { id: "experience1", title: "LOOP Experience", icon: Star, color: "37c35f" },
    { id: "experience2", title: "Feedback", icon: Sparkles, color: "fbd249" },
  ];

  const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label }) => (
    <div className="space-y-3 bg-[#f0f2eb] border-3 border-black p-4 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] transition-all">
      <div className="block text-sm font-black uppercase text-black">{label}</div>
      <div className="flex gap-2 justify-center sm:justify-start">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-all transform hover:scale-110 ${
              star <= value ? "text-[#fbd249]" : "text-gray-300"
            } hover:text-[#fbd249]`}
          >
            <Star
              size={28}
              className="sm:w-8 sm:h-8"
              fill={star <= value ? "currentColor" : "none"}
              strokeWidth={3}
            />
          </button>
        ))}
      </div>
      <div className="text-xs font-black text-center sm:text-left uppercase bg-black text-white px-3 py-1 inline-block">
        {value === 0 && "Pilih Rating"}
        {value === 1 && "Sangat Buruk"}
        {value === 2 && "Buruk"}
        {value === 3 && "Cukup"}
        {value === 4 && "Baik"}
        {value === 5 && "Sangat Baik"}
      </div>
    </div>
  );

  const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, onChange, options, label }) => (
    <div className="space-y-3 bg-[#f0f2eb] border-3 border-black p-4 shadow-[4px_4px_0px_black]">
      <div className="block text-sm font-black uppercase text-black">{label}</div>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 border-2 border-transparent hover:border-black transition-all"
            onClick={() => onChange(option.value)}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 accent-[#ef6d77] border-3 border-black focus:ring-4 focus:ring-[#fbd249]"
            />
            <span className="text-sm font-bold text-black">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(formData);

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            overallSatisfaction: 0,
            eventFormatEffectiveness: 0,
            contentCreationUnderstanding: 0,
            speakerInsightRelevance: 0,
            moderatorPerformance: 0,
            networkingSessionQuality: 0,
            venueCondition: 0,
            foodAndBeverage: 0,
            attendeeCount: '',
            practicalUnderstanding: '',
            mostLiked: '',
            improvements: '',
            interestedNextEvent: '',
            userId: "",
            userEmail: "",
            userName: "",
            submittedAt: null,
            eventDate: new Date().toISOString().split("T")[0],
          });
          setCurrentStep(0);
        }, 4000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Terjadi kesalahan saat mengirim feedback. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isStepComplete = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      return formData.userEmail.trim() !== "" && formData.userName.trim() !== "";
    } else if (stepIndex === 1) {
      return (
        formData.overallSatisfaction > 0 &&
        formData.eventFormatEffectiveness > 0 &&
        formData.contentCreationUnderstanding > 0 &&
        formData.speakerInsightRelevance > 0 &&
        formData.moderatorPerformance > 0 &&
        formData.networkingSessionQuality > 0
      );
    } else if (stepIndex === 2) {
      return (
        formData.venueCondition > 0 &&
        formData.foodAndBeverage > 0 &&
        formData.attendeeCount !== '' &&
        formData.practicalUnderstanding !== '' &&
        formData.interestedNextEvent !== ''
      );
    }
    return false;
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0f2eb] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Noise texture */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>
        
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_black] p-8 sm:p-12">
            <div className="bg-[#37c35f] p-6 border-4 border-black mb-6 inline-block">
              <Sparkles className="w-16 h-16 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-black mb-4 tracking-tight">
              Makasih chat!
            </h2>
            <p className="font-bold text-base sm:text-lg text-gray-700 mb-6">
              Feedback lo udah masuk! Kita bakal pake insight ini buat bikin LOOP berikutnya makin keren.
            </p>
            <div className="bg-[#fbd249] border-3 border-black p-4">
              <div className="h-3 bg-black/20 rounded-none overflow-hidden mb-2">
                <div className="h-full bg-black animate-pulse"></div>
              </div>
              <p className="text-sm font-black uppercase">
                Mengarahkan kembali...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2eb] py-8 px-4 relative overflow-x-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#ef6d77] via-[#37c35f] to-[#fbd249] p-1 border-4 border-black shadow-[6px_6px_0px_black]">
              <div className="bg-white p-3">
                <MessageSquare className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-black uppercase tracking-tighter">
              LOOP FEEDBACK
            </h1>
          </div>
          <div className="bg-black text-white p-4 border-4 border-black shadow-[6px_6px_0px_#ef6d77] inline-block rotate-[-1deg]">
            <p className="text-sm sm:text-base font-black uppercase tracking-wide">
              Kasih tau pengalaman lo di LOOP!
            </p>
          </div>
        </div>

        {/* Progress Steps - Brutal Style */}
        <div className="flex justify-center mb-8 px-2">
          <div className="flex items-center space-x-2 sm:space-x-4 max-w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = isStepComplete(index);
              const isPast = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`
                    flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 border-4 border-black transition-all duration-300
                    ${isActive 
                      ? `bg-[#${step.color}] shadow-[4px_4px_0px_black] scale-110` 
                      : isPast || isCompleted
                        ? `bg-[#${step.color}]`
                        : 'bg-white'
                    }
                  `}>
                    {isPast || isCompleted ? (
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-black" strokeWidth={3} />
                    ) : (
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-black" strokeWidth={3} />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-black uppercase ${
                      isActive ? 'text-black' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs font-bold text-gray-400">
                      Step {index + 1}/{steps.length}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <Zap className="w-6 h-6 text-black ml-4 rotate-90" fill="black" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden text-center mb-6 bg-white border-3 border-black p-3 shadow-[4px_4px_0px_black]">
          <div className="text-sm font-black uppercase text-black">
            {steps[currentStep].title}
          </div>
          <div className="text-xs font-bold text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_black]">
          {/* User Information Section */}
          {currentStep === 0 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black">
                <div className="bg-[#ef6d77] p-3 border-3 border-black">
                  <Users className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">Info Lo</h2>
                <div className="text-sm font-black uppercase ml-auto bg-black text-white px-3 py-1">
                  Step 1/3
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black uppercase text-black">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => updateFormData('userName', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f0f2eb] border-3 border-black font-bold text-black focus:outline-none focus:shadow-[6px_6px_0px_#37c35f] transition-all"
                    placeholder="NAMA LO"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-black uppercase text-black">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => updateFormData('userEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f0f2eb] border-3 border-black font-bold text-black focus:outline-none focus:shadow-[6px_6px_0px_#37c35f] transition-all"
                    placeholder="email@lo.com"
                  />
                  <p className="text-xs font-bold text-gray-600 bg-[#fbd249]/20 p-2 border-2 border-black">
                    📧 Email yang lo pake waktu daftar LOOP
                  </p>
                </div>
              </div>

              <div className="bg-[#ef6d77]/10 border-3 border-[#ef6d77] p-4 mt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#ef6d77] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <div className="text-xs sm:text-sm">
                    <p className="font-black text-black mb-1 uppercase">Data Aman!</p>
                    <p className="font-bold text-gray-700 leading-relaxed">
                      Feedback lo confidential dan cuma dipake buat bikin LOOP makin mantap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOOP Experience Section */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black">
                <div className="bg-[#37c35f] p-3 border-3 border-black">
                  <Star className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">Pengalaman LOOP</h2>
                <div className="text-sm font-black uppercase ml-auto bg-black text-white px-3 py-1">
                  Step 2/3
                </div>
              </div>

              <StarRating
                label="1. Seberapa puas kamu dengan keseluruhan pengalaman mengikuti LOOP (Learning on Our Pace)?"
                value={formData.overallSatisfaction}
                onChange={(value) => updateFormData('overallSatisfaction', value)}
              />

              <StarRating
                label="2. Apakah format acara LOOP mendukung interaksi dan diskusi yang efektif dengan peserta lain?"
                value={formData.eventFormatEffectiveness}
                onChange={(value) => updateFormData('eventFormatEffectiveness', value)}
              />

              <StarRating
                label="3. Sejauh mana LOOP membantu kamu menambah pemahaman dan pengetahuan tentang proses pembuatan konten?"
                value={formData.contentCreationUnderstanding}
                onChange={(value) => updateFormData('contentCreationUnderstanding', value)}
              />

              <StarRating
                label="4. Apakah materi dan insight yang disampaikan oleh speaker di LOOP relevan dan bermanfaat untuk kamu?"
                value={formData.speakerInsightRelevance}
                onChange={(value) => updateFormData('speakerInsightRelevance', value)}
              />

              <StarRating
                label="5. Bagaimana penilaian kamu terhadap cara speaker menyampaikan materi dan memandu diskusi?"
                value={formData.moderatorPerformance}
                onChange={(value) => updateFormData('moderatorPerformance', value)}
              />

              <StarRating
                label="6. Bagaimana penilaian kamu terhadap sesi networking di LOOP dalam membantu kamu membangun koneksi baru?"
                value={formData.networkingSessionQuality}
                onChange={(value) => updateFormData('networkingSessionQuality', value)}
              />
            </div>
          )}

          {/* Feedback Section */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black">
                <div className="bg-[#fbd249] p-3 border-3 border-black">
                  <Sparkles className="w-6 h-6 text-black" strokeWidth={3} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">Feedback Lo</h2>
                <div className="text-sm font-black uppercase ml-auto bg-black text-white px-3 py-1">
                  Step 3/3
                </div>
              </div>

              <StarRating
                label="7. Bagaimana penilaian kamu terhadap venue yang digunakan? (ruang, AC, kebersihan, dll)"
                value={formData.venueCondition}
                onChange={(value) => updateFormData('venueCondition', value)}
              />

              <StarRating
                label="8. Bagaimana pendapat kamu tentang konsumsi (makanan & minuman) yang disediakan?"
                value={formData.foodAndBeverage}
                onChange={(value) => updateFormData('foodAndBeverage', value)}
              />

              <RadioGroup
                label="9. Apakah jumlah peserta yang hadir menurut kamu ideal untuk format acara seperti ini?"
                name="attendeeCount"
                value={formData.attendeeCount}
                onChange={(value) => updateFormData('attendeeCount', value)}
                options={[
                  { value: 'sangat-ideal', label: 'Ya, sangat ideal' },
                  { value: 'cukup-ideal', label: 'Cukup ideal' },
                  { value: 'kurang', label: 'Tidak ideal, perlu lebih sedikit' },
                  { value: 'lebih', label: 'Tidak ideal, perlu lebih banyak' }
                ]}
              />

              <RadioGroup
                label="10. Apakah materi dan pelatihan di LOOP membantu kamu memahami dan mempraktikkan pembuatan konten secara lebih jelas?"
                name="practicalUnderstanding"
                value={formData.practicalUnderstanding}
                onChange={(value) => updateFormData('practicalUnderstanding', value)}
                options={[
                  { value: 'sangat-membantu', label: 'Ya, sangat membantu' },
                  { value: 'cukup-membantu', label: 'Cukup membantu' },
                  { value: 'sedikit-membantu', label: 'Sedikit membantu' },
                  { value: 'tidak-membantu', label: 'Tidak membantu' }
                ]}
              />

              <div className="space-y-2">
                <div className="block text-sm font-black uppercase text-black">
                  11. Apa yang paling lo suka dari LOOP?
                </div>
                <textarea
                  value={formData.mostLiked}
                  onChange={(e) => updateFormData('mostLiked', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f0f2eb] border-3 border-black font-bold text-black resize-none focus:outline-none focus:shadow-[6px_6px_0px_#37c35f] transition-all placeholder:text-gray-400"
                  placeholder="Ceritain apa yang paling berkesan..."
                />
              </div>

              <div className="space-y-2">
                <div className="block text-sm font-black uppercase text-black">
                  12. Apa yang menurut lo perlu diperbaiki untuk LOOP berikutnya?
                </div>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => updateFormData('improvements', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f0f2eb] border-3 border-black font-bold text-black resize-none focus:outline-none focus:shadow-[6px_6px_0px_#37c35f] transition-all placeholder:text-gray-400"
                  placeholder="Saran lo buat improvement..."
                />
              </div>

              <RadioGroup
                label="13. Apakah kamu tertarik untuk ikut event LOOP berikutnya?"
                name="interestedNextEvent"
                value={formData.interestedNextEvent}
                onChange={(value) => updateFormData('interestedNextEvent', value)}
                options={[
                  { value: 'sangat-tertarik', label: 'Ya, sangat tertarik' },
                  { value: 'tertarik', label: 'Tertarik' },
                  { value: 'mempertimbangkan', label: 'Masih mempertimbangkan' },
                  { value: 'tidak-tertarik', label: 'Tidak tertarik' }
                ]}
              />
            </div>
          )}

          {/* Navigation Buttons - Brutal Style */}
          <div className="px-6 sm:px-8 py-6 bg-[#f0f2eb] border-t-4 border-black">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-3 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-3 border-black font-black text-sm uppercase shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    <ArrowLeft size={18} strokeWidth={3} />
                    Kembali
                  </button>
                )}
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStep)}
                    className={`flex items-center gap-2 px-8 py-4 border-4 border-black font-black text-lg uppercase transition-all w-full sm:w-auto justify-center ${
                      isStepComplete(currentStep)
                        ? 'bg-[#37c35f] text-white shadow-[6px_6px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Lanjut
                    <ArrowRight size={20} strokeWidth={3} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepComplete(currentStep) || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-4 border-4 border-black font-black text-lg uppercase transition-all w-full sm:w-auto justify-center ${
                      isStepComplete(currentStep) && !isSubmitting
                        ? 'bg-gradient-to-r from-[#ef6d77] via-[#37c35f] to-[#fbd249] text-white shadow-[6px_6px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Ngirim...
                      </>
                    ) : (
                      <>
                        <Send size={20} strokeWidth={3} />
                        Kirim Feedback
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="bg-white border-3 border-black p-4 inline-block shadow-[6px_6px_0px_black] rotate-[1deg]">
            <p className="font-black text-xs sm:text-sm uppercase flex items-center gap-2">
              <Award size={16} strokeWidth={3} />
              Semua feedback lo bakal kami pake buat tingkatin LOOP!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopSatisfactionForm;