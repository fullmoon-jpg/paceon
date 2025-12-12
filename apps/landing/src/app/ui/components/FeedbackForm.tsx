"use client"
import React, { useState } from "react";
import {
    Star,
    Send,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Users,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";
import { db } from "@paceon/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


// Type definitions
interface FormData {
  userId: string;
  userEmail: string;
  userName: string;
  networkingQuality: number;
  eventFormat: number;
  eventAtmosphere: number;
  talkshowInsight: number;
  moderatorPerformance: number;
  gameSession: number;
  networkingSession: number;
  connectorPerformance: number;
  venueCondition: number;
  foodAndBeverage: number;
  attendeeCount: string;
  newConnections: string;
  mostLiked: string;
  improvements: string;
  interestedNextEvent: string;
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


const FeedbackForm = () => {
  const [formData, setFormData] = useState<FormData>({
    // User Information
    userId: '',
    userEmail: '',
    userName: '',
    
    // Event Experience - Talk & Tales Specific
    networkingQuality: 0,
    eventFormat: 0,
    eventAtmosphere: 0,
    talkshowInsight: 0,
    moderatorPerformance: 0,
    gameSession: 0,
    networkingSession: 0,
    connectorPerformance: 0,
    venueCondition: 0,
    foodAndBeverage: 0,
    attendeeCount: '',
    newConnections: '',
    mostLiked: '',
    improvements: '',
    interestedNextEvent: '',
    
    // Metadata
    submittedAt: null,
    eventDate: new Date().toISOString().split('T')[0]
  });


  const [currentStep, setCurrentStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  // Submit function to Firestore
  const submitToFirestore = async (data: FormData) => {
    try {
      const docRef = await addDoc(collection(db, "talk_tales_feedback"), {
        ...data,
        submittedAt: serverTimestamp()
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  };


  const steps = [
    { id: "user", title: "User Info", icon: Users, color: "purple" },
    { id: "event1", title: "Event Experience 1", icon: Star, color: "green" },
    { id: "event2", title: "Event Experience 2", icon: Star, color: "blue" },
  ];


  const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <div className="block text-sm font-medium text-gray-700">{label}</div>
      <div className="flex gap-1 justify-center sm:justify-start">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-colors ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
          >
            <Star
              size={20}
              className="sm:w-6 sm:h-6"
              fill={star <= value ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 text-center sm:text-left">
        {value === 0 && "Pilih rating"}
        {value === 1 && "Sangat Buruk"}
        {value === 2 && "Buruk"}
        {value === 3 && "Cukup"}
        {value === 4 && "Baik"}
        {value === 5 && "Sangat Baik"}
      </div>
    </div>
  );


  const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, onChange, options, label }) => (
    <div className="space-y-3">
      <div className="block text-sm font-medium text-gray-700">{label}</div>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );


  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        submittedAt: null, // Will be replaced by serverTimestamp in Firestore
      };


      const result = await submitToFirestore(submissionData);


      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            networkingQuality: 0,
            eventFormat: 0,
            eventAtmosphere: 0,
            talkshowInsight: 0,
            moderatorPerformance: 0,
            gameSession: 0,
            networkingSession: 0,
            connectorPerformance: 0,
            venueCondition: 0,
            foodAndBeverage: 0,
            attendeeCount: '',
            newConnections: '',
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
        formData.networkingQuality > 0 &&
        formData.eventFormat > 0 &&
        formData.eventAtmosphere > 0 &&
        formData.talkshowInsight > 0 &&
        formData.moderatorPerformance > 0 &&
        formData.gameSession > 0 &&
        formData.networkingSession > 0 &&
        formData.connectorPerformance > 0
      );
    } else if (stepIndex === 2) {
      return (
        formData.venueCondition > 0 &&
        formData.foodAndBeverage > 0 &&
        formData.attendeeCount !== '' &&
        formData.newConnections !== '' &&
        formData.interestedNextEvent !== ''
      );
    }
    return false;
  };


  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Terima kasih telah mengisi feedback Talk & Tales! Masukan kamu sangat berharga untuk event kami selanjutnya.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Mengarahkan kembali...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a6435] text-center">
              TALK & TALES FEEDBACK
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl font-open-sans font-bold mx-auto px-4 sm:px-0">
            Bantu kami meningkatkan kualitas event dengan memberikan feedback yang jujur dan membangun.
          </p>
        </div>


        {/* Progress Steps */}
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="flex items-center space-x-2 sm:space-x-4 max-w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = isStepComplete(index);
              const isPast = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`
                    flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all duration-300
                    ${isActive 
                      ? `bg-${step.color}-500 text-black shadow-lg scale-110` 
                      : isPast || isCompleted
                        ? `bg-${step.color}-500 text-black`
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {isPast || isCompleted ? (
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 hidden sm:block">
                    <div className={`text-xs sm:text-sm font-medium ${
                      isActive ? `text-${step.color}-600` : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      Step {index + 1} of {steps.length}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 ml-2 sm:ml-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* Mobile Step Indicator */}
        <div className="sm:hidden text-center mb-6">
          <div className="text-sm font-medium text-gray-700">
            {steps[currentStep].title}
          </div>
          <div className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>


        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* User Information Section */}
          {currentStep === 0 && (
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#352a64]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Information</h2>
                <div className="text-xs sm:text-sm text-gray-700 sm:ml-auto">Step 1 of 3</div>
              </div>


              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => updateFormData('userName', e.target.value)}
                    className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                    placeholder="Masukan Nama Lengkap Anda"
                  />
                </div>


                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => updateFormData('userEmail', e.target.value)}
                    className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                    placeholder="example@email.com"
                  />
                  <p className="text-xs text-gray-500 font-bold font-open-sans">
                    Gunakan Email yang terdaftar atau yang akan didaftarkan pada Pace.on  
                  </p>
                </div>
              </div>


              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-purple-800 mb-1">Privasi Data</p>
                    <p className="text-purple-700 leading-relaxed">
                      Informasi Anda akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan 
                      analisis feedback serta komunikasi follow-up jika diperlukan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Event Experience 1 Section */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Event Experience 1</h2>
                <div className="text-xs sm:text-sm text-gray-700 sm:ml-auto">Step 2 of 3</div>
              </div>


              <StarRating
                label="1. Seberapa puas kamu dengan kualitas networking yang terjadi di Talk & Tales?"
                value={formData.networkingQuality}
                onChange={(value) => updateFormData('networkingQuality', value)}
              />


              <StarRating
                label="2. Apakah format acara mendukung interaksi yang efektif dengan peserta lain?"
                value={formData.eventFormat}
                onChange={(value) => updateFormData('eventFormat', value)}
              />


              <StarRating
                label="3. Bagaimana kenyamanan suasana event untuk memulai percakapan dan membangun koneksi?"
                value={formData.eventAtmosphere}
                onChange={(value) => updateFormData('eventAtmosphere', value)}
              />


              <StarRating
                label="4. Apakah sesi Talkshow memberikan insight yang relevan dan bermanfaat untuk kamu?"
                value={formData.talkshowInsight}
                onChange={(value) => updateFormData('talkshowInsight', value)}
              />


              <StarRating
                label="5. Apakah moderator membawakan diskusi dengan baik?"
                value={formData.moderatorPerformance}
                onChange={(value) => updateFormData('moderatorPerformance', value)}
              />


              <StarRating
                label="6. Bagaimana penilaian kamu terhadap game session?"
                value={formData.gameSession}
                onChange={(value) => updateFormData('gameSession', value)}
              />


              <StarRating
                label="7. Bagaimana penilaian kamu terhadap Sesi Networking?"
                value={formData.networkingSession}
                onChange={(value) => updateFormData('networkingSession', value)}
              />


              <StarRating
                label="8. Apakah connector membawakan permainan dan diskusi dengan baik?"
                value={formData.connectorPerformance}
                onChange={(value) => updateFormData('connectorPerformance', value)}
              />
            </div>
          )}


          {/* Event Experience 2 Section */}
          {currentStep === 2 && (
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Event Experience 2</h2>
                <div className="text-xs sm:text-sm text-gray-700 sm:ml-auto">Step 3 of 3</div>
              </div>


              <StarRating
                label="9. Bagaimana penilaian kamu terhadap venue yang digunakan? (ruang acara, AC, kebersihan, toilet, layout, dll)"
                value={formData.venueCondition}
                onChange={(value) => updateFormData('venueCondition', value)}
              />


              <StarRating
                label="10. Bagaimana pendapat kamu tentang konsumsi (makanan & minuman) yang disediakan?"
                value={formData.foodAndBeverage}
                onChange={(value) => updateFormData('foodAndBeverage', value)}
              />


              <RadioGroup
                label="11. Apakah jumlah peserta yang hadir menurut kamu ideal untuk format acara seperti ini?"
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
                label="12. Apakah kamu merasa mendapatkan koneksi baru yang bermanfaat dari event ini?"
                name="newConnections"
                value={formData.newConnections}
                onChange={(value) => updateFormData('newConnections', value)}
                options={[
                  { value: 'banyak', label: 'Ya, dapat banyak' },
                  { value: 'beberapa', label: 'Dapat beberapa' },
                  { value: 'sedikit', label: 'Dapat sedikit' },
                  { value: 'tidak', label: 'Tidak dapat sama sekali' }
                ]}
              />


              <div className="space-y-2">
                <div className="block text-sm font-medium text-gray-700">
                  13. Apa yang paling kamu sukai dari Talk & Tales?
                </div>
                <textarea
                  value={formData.mostLiked}
                  onChange={(e) => updateFormData('mostLiked', e.target.value)}
                  rows={3}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  placeholder="Ceritakan apa yang paling berkesan dari event ini..."
                />
              </div>


              <div className="space-y-2">
                <div className="block text-sm font-medium text-gray-700">
                  14. Apa yang menurut kamu perlu diperbaiki untuk event berikutnya?
                </div>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => updateFormData('improvements', e.target.value)}
                  rows={3}
                  className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  placeholder="Berikan saran untuk perbaikan event..."
                />
              </div>


              <RadioGroup
                label="15. Apakah kamu tertarik untuk ikut event Pace On berikutnya?"
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


          {/* Navigation Buttons */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                    Kembali
                  </button>
                )}
              </div>


              <div className="flex gap-2 w-full sm:w-auto">
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStep)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
                      isStepComplete(currentStep)
                        ? 'bg-[#2a6435] text-white hover:bg-green-950 focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Lanjut
                    <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepComplete(currentStep) || isSubmitting}
                    className={`flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
                      isStepComplete(currentStep) && !isSubmitting
                        ? 'bg-gradient-to-br from-[#15b392] via-[#2a6435] to-[#15b392] text-white hover:from-[#2a6435] hover:via-[#15b392] hover:to-[#2a6435] focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="sm:w-5 sm:h-5" />
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
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-black font-open-sans font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <AlertCircle size={14} className="sm:w-4 sm:h-4" />
            <span>Semua feedback akan dijaga kerahasiaannya dan digunakan untuk pengembangan event</span>
          </p>
        </div>
      </div>
    </div>
  );
};


export default FeedbackForm;